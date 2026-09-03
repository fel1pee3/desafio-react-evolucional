import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page" aria-labelledby="not-found-title">
      <p className="page__eyebrow">Erro 404</p>
      <h1 id="not-found-title">Página não encontrada</h1>
      <p className="page__description">
        O endereço informado não corresponde a uma página da aplicação.
      </p>
      <Link className="back-link" to="/products">
        Ir para produtos
      </Link>
    </section>
  )
}
