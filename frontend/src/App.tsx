import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useEffect } from 'react'
import { setLogoutHandler } from './utils/api'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductListPage from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import OrderListPage from './pages/OrderListPage'
import AdminProductPage from './pages/admin/AdminProductPage'
import AdminOrderPage from './pages/admin/AdminOrderPage'

function AppRoutes() {
  const { logout } = useAuth()
  useEffect(() => { setLogoutHandler(logout) }, [logout])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><OrderListPage /></PrivateRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProductPage /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrderPage /></AdminRoute>} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
