import ProductDetailPage from './pages/ProductDetailPage'
import ProductListPage from './pages/ProductListPage'
import CartPage from './pages/CartPage'
import OrderListPage from './pages/OrderListPage'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import AdminProductPage from "./pages/admin/AdminProductPage";
import AdminOrderPage from "./pages/admin/AdminOrderPage";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/admin/products" element={<AdminProductPage />} />
        <Route path="/admin/orders" element={<AdminOrderPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
