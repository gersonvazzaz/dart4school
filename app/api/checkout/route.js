import Stripe from 'stripe'
import { INFANZIA_CATALOG, PRIMARIA_CATALOG } from '../../../lib/catalog'

// Creiamo il client Stripe solo quando serve (non al caricamento del file):
// così il sito si costruisce e funziona anche se la chiave non è ancora configurata.
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key)
}

// Indirizzo del sito per i ritorni dopo il pagamento.
// Lo ricaviamo dalla richiesta stessa: così funziona in automatico sia in locale,
// sia sui preview, sia in produzione, senza dover configurare nulla.
function getBaseUrl(req) {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  const origin = req.headers.get('origin')
  if (origin) return origin
  const host = req.headers.get('host')
  if (host) {
    const proto = req.headers.get('x-forwarded-proto') || 'https'
    return `${proto}://${host}`
  }
  return 'http://localhost:3000'
}

const CATALOGS = {
  infanzia: INFANZIA_CATALOG,
  primaria: PRIMARIA_CATALOG,
}

const SCHOOL_NAME = {
  infanzia: "Scuola dell'Infanzia",
  primaria: 'Scuola Primaria',
}

export async function POST(req) {
  const stripe = getStripe()
  if (!stripe) {
    return Response.json(
      { error: 'Pagamenti non ancora configurati. Riprova più tardi.' },
      { status: 503 }
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Richiesta non valida' }, { status: 400 })
  }

  const { school, studentInfo, items } = body || {}

  // Validazione scuola
  const catalog = CATALOGS[school]
  if (!catalog) {
    return Response.json({ error: 'Scuola non valida' }, { status: 400 })
  }

  // Validazione dati alunno
  const nome = (studentInfo?.nome || '').trim()
  const sezione = (studentInfo?.sezione || '').trim()
  if (nome.length < 2 || !sezione) {
    return Response.json({ error: 'Dati alunno mancanti' }, { status: 400 })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'Nessun articolo selezionato' }, { status: 400 })
  }

  // Ricostruiamo gli articoli SEMPRE dal catalogo del server.
  // Il prezzo non viene mai preso dal browser: così nessuno può modificarlo.
  const line_items = []
  const riepilogo = []

  for (const sent of items) {
    const product = catalog.find(p => p.id === sent?.id)
    if (!product) {
      return Response.json({ error: 'Articolo non valido' }, { status: 400 })
    }
    const size = sent?.size
    if (!product.sizes.includes(size)) {
      return Response.json({ error: `Taglia non valida per ${product.label}` }, { status: 400 })
    }
    const qty = Number(sent?.qty)
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      return Response.json({ error: `Quantità non valida per ${product.label}` }, { status: 400 })
    }

    line_items.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${product.label} — Taglia ${size}`,
          description: `Alunno: ${nome} | ${SCHOOL_NAME[school]} — ${sezione}`,
        },
        unit_amount: Math.round(product.price * 100), // prezzo dal catalogo del server
      },
      quantity: qty,
    })

    riepilogo.push(`${qty}× ${product.label} (Tg ${size})`)
  }

  // Riepilogo testuale per vedere l'ordine al volo nella dashboard Stripe
  // (i metadata accettano max ~500 caratteri per valore).
  const riepilogoStr = riepilogo.join(' · ').slice(0, 480)

  const baseUrl = getBaseUrl(req)
  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/`,
    metadata: {
      scuola: SCHOOL_NAME[school],
      alunno: nome,
      sezione,
      articoli: riepilogoStr,
    },
    payment_intent_data: {
      description: `Divise ${SCHOOL_NAME[school]} — ${nome} (${sezione})`,
      metadata: {
        alunno: nome,
        sezione,
        articoli: riepilogoStr,
      },
    },
  })

  return Response.json({ url: session.url })
}
