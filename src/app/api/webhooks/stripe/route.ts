import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/utils/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-02-24.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy'

// Next.js config to tell it to not parse the body as JSON, as Stripe needs the raw body to verify signature
export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: Request) {
  try {
    const bodyText = await req.text()
    const signature = req.headers.get('stripe-signature') as string

    // 1. Verify Event Signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      // Return 400 if it's not a valid event or missing keys to prevent unauthorized changes
      // In local dev without correct keys, this will fail.
      if (process.env.NODE_ENV === 'production' || process.env.STRIPE_WEBHOOK_SECRET) {
         return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
      } else {
         // Fallback for rough local dev without proper webhook forwarding and keys (e.g blindly processing)
         event = JSON.parse(bodyText) as Stripe.Event
      }
    }

    // 2. Handle specific events we care about
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      const orderId = session.metadata?.orderId
      
      if (!orderId) {
        console.error('Webhook Error: No orderId in metadata')
        return NextResponse.json({ error: 'Webhook Error: Missing orderId' }, { status: 400 })
      }

      // 3. Update the Supabase Order 'payment_status'
      const supabase = createAdminClient()
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) {
        console.error(`Error updating order ${orderId} status:`, error)
        return NextResponse.json({ error: 'Failed to update order database' }, { status: 500 })
      }

      console.log(`Order ${orderId} successfully marked as paid!`)
    }

    // Return a 200 to acknowledge receipt of the event
    return NextResponse.json({ received: true })

  } catch (err: any) {
    console.error('Webhook Error:', err)
    return NextResponse.json(
      { error: 'Internal Server Webhook Error' },
      { status: 500 }
    )
  }
}
