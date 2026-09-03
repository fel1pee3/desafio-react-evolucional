import { Link } from 'react-router-dom'

type ProductPendingPageProps = {
  title: string
}

export function ProductPendingPage({ title }: ProductPendingPageProps) {
  return (
    <section className="page" aria-labelledby="pending-page-title">
      <Link className="back-link" to="/products">
        Voltar para produtos
      </Link>
      <h1 id="pending-page-title">{title}</h1>
      <p className="page__description">
        Esta rota está preparada e será implementada no checkpoint de CRUD.
      </p>
    </section>
  )
}
