import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProductListPage } from '../features/products/pages/ProductListPage'
import {
  ProductCreateRoute,
  ProductDetailsRoute,
  ProductEditRoute,
} from '../features/products/pages/ProductRoutePages'
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
            element: <ProductCreateRoute />,
          },
          {
            path: ':productId',
            element: <ProductDetailsRoute />,
          },
          {
            path: ':productId/edit',
            element: <ProductEditRoute />,
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
