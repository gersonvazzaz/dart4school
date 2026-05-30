'use client'

import { useState } from 'react'
import { INFANZIA_CATALOG, PRIMARIA_CATALOG } from '../lib/catalog'

// ─── Progress ────────────────────────────────────────────────

function Progress({ step }) {
  return (
    <div className="progress">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className={`dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
        />
      ))}
    </div>
  )
}

// ─── Step 0: School Selection ─────────────────────────────────

function StepSchool({ onSelect }) {
  return (
    <div className="step">
      <Progress step={0} />
      <h1 className="step-title">Ciao! 👋</h1>
      <p className="step-sub">
        Benvenuto nel portale ordini divise scolastiche.<br />
        Scegli la scuola del tuo bambino per iniziare.
      </p>
      <div className="school-cards">
        <button className="school-card" onClick={() => onSelect('infanzia')}>
          <span className="school-card-icon">🌈</span>
          <div>
            <div className="school-card-name">Scuola dell'Infanzia</div>
            <div className="school-card-desc">Bambini da 3 a 6 anni</div>
          </div>
          <span className="card-arrow">→</span>
        </button>
        <button className="school-card" onClick={() => onSelect('primaria')}>
          <span className="school-card-icon">📚</span>
          <div>
            <div className="school-card-name">Scuola Primaria</div>
            <div className="school-card-desc">Bambini da 6 a 11 anni</div>
          </div>
          <span className="card-arrow">→</span>
        </button>
      </div>
    </div>
  )
}

// ─── Step 1: Student Info ─────────────────────────────────────

const SEZIONI_INFANZIA = ['GIALLI', 'VERDI', 'ARANCIONI', 'AZZURRI', 'NUOVO INGRESSO']
const CLASSI_PRIMARIA  = ['1ª', '2ª', '3ª', '4ª', '5ª']

function StepInfo({ school, info, setInfo, onBack, onNext }) {
  const options = school === 'infanzia' ? SEZIONI_INFANZIA : CLASSI_PRIMARIA
  const fieldLabel = school === 'infanzia' ? 'Sezione' : 'Classe'
  const canProceed = info.nome.trim().length >= 2 && info.sezione

  return (
    <div className="step">
      <Progress step={1} />
      <button className="btn-back" onClick={onBack}>← Torna indietro</button>
      <h1 className="step-title">Dati del bambino</h1>
      <p className="step-sub">
        Inserisci il nome dell'alunno e la {fieldLabel.toLowerCase()} di frequenza.
      </p>

      <div className="form-group">
        <label className="form-label">Nome e Cognome dell'alunno</label>
        <input
          className="form-input"
          type="text"
          placeholder="es. Mario Rossi"
          value={info.nome}
          onChange={e => setInfo({ ...info, nome: e.target.value })}
          autoComplete="off"
        />
      </div>

      <div className="form-group">
        <label className="form-label">{fieldLabel}</label>
        <div className="radio-group">
          {options.map(opt => (
            <button
              key={opt}
              className={`radio-btn ${info.sezione === opt ? 'sel' : ''}`}
              onClick={() => setInfo({ ...info, sezione: opt })}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={onNext} disabled={!canProceed}>
        Continua →
      </button>
    </div>
  )
}

// ─── Step 2: Item Selection ───────────────────────────────────

function QtyControl({ value, onInc, onDec }) {
  return (
    <div className="qty-control">
      <button
        className={`qty-btn ${value > 0 ? 'has-value' : ''}`}
        onClick={onDec}
        disabled={value === 0}
        aria-label="Diminuisci"
      >
        −
      </button>
      <span className="qty-value">{value}</span>
      <button className="qty-btn" onClick={onInc} aria-label="Aumenta">+</button>
    </div>
  )
}

function StepItems({ catalog, getQty, setQty, totalItems, total, onBack, onNext }) {
  return (
    <div className="step">
      <Progress step={2} />
      <button className="btn-back" onClick={onBack}>← Torna indietro</button>
      <h1 className="step-title">Seleziona gli articoli</h1>
      <p className="step-sub">
        Scegli la taglia e la quantità per ogni capo. Puoi ordinare più taglie dello stesso articolo.
      </p>

      <div className="items-list" style={{ paddingBottom: 100 }}>
        {catalog.map(item => (
          <div key={item.id} className="item-card">
            <div className="item-header">
              <span className="item-name">{item.label}</span>
              <span className="item-price-badge">€{item.price.toFixed(2)} / cad.</span>
            </div>
            {item.sizes.map(size => (
              <div key={size} className="size-row">
                <span className="size-label">{size}</span>
                <QtyControl
                  value={getQty(item.id, size)}
                  onInc={() => setQty(item.id, size, +1)}
                  onDec={() => setQty(item.id, size, -1)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="sticky-spacer" />

      <div className="sticky-bar">
        <div>
          <div className="sticky-info">
            {totalItems === 0
              ? 'Nessun articolo selezionato'
              : `${totalItems} ${totalItems === 1 ? 'articolo' : 'articoli'} selezionati`}
          </div>
          <div className="sticky-total">€{total.toFixed(2)}</div>
        </div>
        <button
          className="btn-primary"
          style={{ width: 'auto', padding: '13px 26px' }}
          onClick={onNext}
          disabled={totalItems === 0}
        >
          Riepilogo →
        </button>
      </div>
    </div>
  )
}

// ─── Step 3: Summary + Checkout ──────────────────────────────

const SCHOOL_NAME = {
  infanzia: "Scuola dell'Infanzia",
  primaria: 'Scuola Primaria',
}

function StepSummary({ school, info, items, total, loading, error, onBack, onCheckout }) {
  return (
    <div className="step">
      <Progress step={3} />
      <button className="btn-back" onClick={onBack}>← Torna indietro</button>
      <h1 className="step-title">Riepilogo ordine</h1>
      <p className="step-sub">Controlla tutto prima di procedere al pagamento.</p>

      <div className="summary-card">
        {/* Alunno */}
        <div className="summary-section">
          <div className="summary-section-label">Alunno</div>
          <div style={{ fontWeight: 700, fontSize: '0.975rem' }}>{info.nome}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            {SCHOOL_NAME[school]} — {info.sezione}
          </div>
        </div>

        {/* Articoli */}
        <div className="summary-section">
          <div className="summary-section-label">Articoli ordinati</div>
          {items.map((item, i) => (
            <div key={i} className="summary-row">
              <span className="summary-row-name">{item.label}</span>
              <span className="summary-row-meta">Taglia {item.size} × {item.qty}</span>
              <span className="summary-row-price">€{(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Totale */}
        <div className="summary-total-row">
          <span className="summary-total-label">Totale</span>
          <span className="summary-total-amount">€{total.toFixed(2)}</span>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <button className="btn-primary" onClick={onCheckout} disabled={loading}>
        {loading
          ? <><span className="spinner" /> Caricamento...</>
          : '🔒 Procedi al Pagamento'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 14 }}>
        Pagamento sicuro gestito da Stripe
      </p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function QuizFunnel() {
  const [step, setStep]           = useState(0)
  const [school, setSchool]       = useState(null)
  const [info, setInfo]           = useState({ nome: '', sezione: '' })
  const [quantities, setQuantities] = useState({})
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  const catalog = school === 'infanzia' ? INFANZIA_CATALOG : PRIMARIA_CATALOG

  const setQty = (itemId, size, delta) => {
    const key = `${itemId}__${size}`
    setQuantities(prev => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) + delta) }))
  }

  const getQty = (itemId, size) => quantities[`${itemId}__${size}`] || 0

  const selectedItems = (catalog || []).flatMap(item =>
    item.sizes
      .map(size => ({ ...item, size, qty: getQty(item.id, size) }))
      .filter(x => x.qty > 0)
  )

  const total      = selectedItems.reduce((s, i) => s + i.price * i.qty, 0)
  const totalItems = selectedItems.reduce((s, i) => s + i.qty, 0)

  const handleSchoolSelect = (s) => {
    setSchool(s)
    setInfo({ nome: '', sezione: '' })
    setQuantities({})
    setStep(1)
  }

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ school, studentInfo: info, items: selectedItems }),
      })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setError('Si è verificato un errore. Riprova tra qualche istante.')
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo">Istituto Adorazione Perpetua del Sacro Cuore</div>
        <div className="header-sub">Ordine Divise Scolastiche 2026/2027</div>
      </header>

      <main className="main">
        {step === 0 && (
          <StepSchool onSelect={handleSchoolSelect} />
        )}
        {step === 1 && (
          <StepInfo
            school={school}
            info={info}
            setInfo={setInfo}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepItems
            catalog={catalog}
            getQty={getQty}
            setQty={setQty}
            totalItems={totalItems}
            total={total}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <StepSummary
            school={school}
            info={info}
            items={selectedItems}
            total={total}
            loading={loading}
            error={error}
            onBack={() => setStep(2)}
            onCheckout={handleCheckout}
          />
        )}
      </main>

      <footer className="footer">
        Divise realizzate da <strong>Dart Production</strong>
      </footer>
    </div>
  )
}
