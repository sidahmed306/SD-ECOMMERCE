import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { VendeurProvider } from './contexts/VendeurContext'

import AdminLayout from './components/layout/AdminLayout'
import VendeurLayout from './components/layout/VendeurLayout'

import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import Produits from './pages/admin/Produits'
import Vendeurs from './pages/admin/Vendeurs'
import Historique from './pages/admin/Historique'
import Alertes from './pages/admin/Alertes'

import VendeurRouter from './pages/vendeur/VendeurRouter'
import NouvelleVente from './pages/vendeur/NouvelleVente'
import HistoriqueVendeur from './pages/vendeur/HistoriqueVendeur'

function RequireAuth() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/admin/login" replace />
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VendeurProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/login" replace />} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<RequireAuth />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/produits" element={<Produits />} />
              <Route path="/admin/vendeurs" element={<Vendeurs />} />
              <Route path="/admin/historique" element={<Historique />} />
              <Route path="/admin/alertes" element={<Alertes />} />
            </Route>

            {/* Vendeur */}
            <Route path="/vendeur/:urlUnique" element={<VendeurLayout />}>
              <Route index element={<VendeurRouter />} />
              <Route path="vente" element={<NouvelleVente />} />
              <Route path="historique" element={<HistoriqueVendeur />} />
            </Route>
          </Routes>
        </VendeurProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
