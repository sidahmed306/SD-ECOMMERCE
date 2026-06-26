import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche — illustration (desktop seulement) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/2" />

        <div className="relative z-10 text-center text-white max-w-sm">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center text-4xl font-black mx-auto mb-8 shadow-2xl">
            V
          </div>
          <h1 className="text-4xl font-black mb-4 leading-tight">SD-ECOMMERCE</h1>
          <p className="text-orange-100 text-lg leading-relaxed mb-10">
            Gérez vos ventes, vos vendeurs et vos commissions depuis un seul endroit.
          </p>

          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: '📦', label: 'Produits' },
              { icon: '👥', label: 'Vendeurs' },
              { icon: '📊', label: 'Stats' },
            ].map(f => (
              <div key={f.label} className="bg-white/10 rounded-2xl p-4">
                <div className="text-3xl mb-2">{f.icon}</div>
                <p className="text-sm text-orange-100 font-medium">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-orange-50 to-white lg:bg-white lg:bg-none">
        <div className="w-full max-w-sm">
          {/* Logo mobile uniquement */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg shadow-orange-200">
              V
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SD-ECOMMERCE</h1>
            <p className="text-gray-500 text-sm mt-1">Espace administrateur</p>
          </div>

          {/* Titre desktop */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-black text-gray-900">Connexion</h2>
            <p className="text-gray-400 mt-2">Espace administrateur</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:shadow-none lg:border-0 lg:p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                label="Mot de passe"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}
              <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                Se connecter
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
