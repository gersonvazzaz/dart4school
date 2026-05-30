export default function SuccessPage() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-logo">Istituto Adorazione Perpetua del Sacro Cuore</div>
        <div className="header-sub">Ordine Divise Scolastiche 2026/2027</div>
      </header>

      <main className="main" style={{ alignItems: 'center' }}>
        <div className="success-wrap">
          <div className="success-icon">✅</div>
          <h1 className="success-title">Ordine completato!</h1>
          <p className="success-text">
            Grazie per il tuo ordine. Riceverai una conferma via email con tutti i dettagli.
            Le divise saranno disponibili nei tempi comunicati dalla scuola.
          </p>
          <a href="/" className="success-link">← Torna all'inizio</a>
        </div>
      </main>

      <footer className="footer">
        Divise realizzate da <strong>Dart Production</strong>
      </footer>
    </div>
  )
}
