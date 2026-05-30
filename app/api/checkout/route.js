import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const SCHOOL_NAME = {
  infanzia: "Scuola dell'Infanzia",
  primaria: 'Scuola Primaria',
}

export async function POST(req) {
  const { school, studentInfo, items } = await req.json()

  if (!items?.length) {
    return Response.json({ error: 'Nessun articolo selezionato' }, { status: 400 })
  }

  const schoolLabel = SCHOOL_NAME[school] || school

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${item.label} — Taglia ${item.size}`,
          description: `Alunno: ${studentInfo.nome} | ${schoolLabel} — ${studentInfo.sezione}`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    })),
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    metadata: {
      school: schoolLabel,
      student: studentInfo.nome,
      sezione: studentInfo.sezione,
    },
  })

  return Response.json({ url: session.url })
}
