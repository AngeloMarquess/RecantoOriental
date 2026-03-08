import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with the secret key if it exists (using dummy otherwise to avoid build crashe)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, orderId, email } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!orderId) {
      return NextResponse.json({ error: 'No order ID provided' }, { status: 400 })
    }

    // Format items to Stripe Line Items
    const lineItems = items.map((item: any) => {
      // Stripe expects amounts in cents
      const unitAmountCents = Math.round(item.price * 100)

      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.name,
            // Optionally add image URL here if products had images
            // images: [item.image_url],
          },
          unit_amount: unitAmountCents,
        },
        quantity: item.quantity,
      }
    })

    // We also need to get the absolute URL of the site to return users back to
    // When using localhost, we hardcode. In production, we'd use process.env.NEXT_PUBLIC_SITE_URL
    const origin = req.headers.get('origin') || 'http://localhost:3000'

    // Create the Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${origin}/pedidos`, // If user cancels, send them to their orders list (order already exists as pending)
      customer_email: email || undefined,
      metadata: {
        orderId: orderId.toString(),
      },
      locale: 'pt-BR'
    })

    if (!session.url) {
      throw new Error('Failed to create checkout session URL')
    }

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error with Stripe' },
      { status: 500 }
    )
  }
}
