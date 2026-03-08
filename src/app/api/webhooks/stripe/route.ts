import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/utils/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
    apiVersion: '2026-02-25.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy'

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

            // Strict verify in production
            if (process.env.NODE_ENV === 'production' || process.env.STRIPE_WEBHOOK_SECRET) {
                return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
            } else {
                // Fallback for local dev testing via basic POST without signature mapping
                event = JSON.parse(bodyText) as Stripe.Event
            }
        }

        // 2. Handle specific events
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session
            const orderId = session.metadata?.orderId

            if (!orderId) {
                console.error('Webhook Error: No orderId in metadata')
                return NextResponse.json({ error: 'Webhook Error: Missing orderId' }, { status: 400 })
            }

            // 3. Update the Supabase Order
            const supabase = createAdminClient()
            const { error } = await supabase
                .from('orders')
                .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
                .eq('id', orderId)

            if (error) {
                console.error(`Error updating order ${orderId} status:`, error)
                return NextResponse.json({ error: 'Failed to update order database' }, { status: 500 })
            }

            console.log(`Order ${orderId} successfully marked as paid via Stripe!`)
        }

        return NextResponse.json({ received: true })

    } catch (err: any) {
        console.error('Webhook Error:', err)
        return NextResponse.json(
            { error: 'Internal Server Webhook Error' },
            { status: 500 }
        )
    }
}
