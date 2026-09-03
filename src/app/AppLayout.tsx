import { NavLink, Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo
      </a>

      <header className="app-header">
        <div className="app-header__content">
          <span className="app-header__title">Painel de produtos</span>
          <nav aria-label="Navegação principal">
            <NavLink
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link--active' : 'nav-link'
              }
              to="/products"
            >
              Produtos
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="app-main" id="main-content">
        <Outlet />
      </main>
    </div>
  )
}
