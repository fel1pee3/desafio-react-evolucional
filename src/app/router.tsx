import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProductPendingPage } from '../features/products/pages/ProductPendingPage'
import { ProductListPage } from '../features/products/pages/ProductListPage'
import { NotFoundPage } from '../shared/pages/NotFoundPage'
import { AppLayout } from './AppLayout'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/products" />,
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: <ProductListPage />,
          },
          {
            path: 'new',
            element: <ProductPendingPage title="Novo produto" />,
          },
          {
            path: ':productId',
            element: <ProductPendingPage title="Detalhes do produto" />,
          },
          {
            path: ':productId/edit',
            element: <ProductPendingPage title="Editar produto" />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
