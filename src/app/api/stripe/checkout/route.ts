import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with the secret key if it exists
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
    apiVersion: '2026-02-25.clover',
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
            const unitAmountCents = Math.round(item.price * 100)

            return {
                price_data: {
                    currency: 'brl',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: unitAmountCents,
                },
                quantity: item.quantity,
            }
        })

        const origin = req.headers.get('origin') || 'http://localhost:3000'

        // Create the Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // Removed 'pix' to prevent dashboard error
            line_items: lineItems,
            mode: 'payment',
            success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
            cancel_url: `${origin}/pedidos`,
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
