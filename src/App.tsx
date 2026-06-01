import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import DashboardVendedor from './pages/DashboardVendedor'
import DashboardGerente from './pages/DashboardGerente'

function PrivateRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const { perfil, loading } = useAuth()


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  if (!perfil) return <Navigate to="/login" replace />

  if (role && perfil.role !== role) return <Navigate to="/" replace />

  return <>{children}</>
}

function RootRedirect() {
  const { perfil, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  if (!perfil) return <Navigate to="/login" replace />
  if (perfil.role === 'gerente') return <Navigate to="/gerente" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RootRedirect />} />
        <Route path="/dashboard" element={
          <PrivateRoute role="vendedor">
            <DashboardVendedor />
          </PrivateRoute>
        } />
        <Route path="/gerente" element={
          <PrivateRoute role="gerente">
            <DashboardGerente />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
