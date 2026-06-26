import { NavLink, Outlet, useParams } from 'react-router-dom'
import { useVendeur } from '../../contexts/VendeurContext'

export default function VendeurLayout() {
  const { vendeur, logout } = useVendeur()
  const { urlUnique } = useParams()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">V</div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-none">SD-ECOMMERCE</p>
              {vendeur && <p className="text-xs text-gray-400 mt-0.5">{vendeur.nom}</p>}
            </div>
          </div>
          {vendeur && (
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              Quitter
            </button>
          )}
        </div>
      </header>

      {/* Contenu principal */}
      <main className={`flex-1 max-w-lg mx-auto w-full px-4 py-5 ${vendeur ? 'pb-24' : ''}`}>
        <Outlet />
      </main>

      {/* Barre de navigation BOTTOM (si connecté) — style app mobile */}
      {vendeur && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 shadow-lg safe-area-bottom">
          <div className="max-w-lg mx-auto flex">
            <NavLink
              to={`/vendeur/${urlUnique}`}
              end
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors ${
                  isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all ${isActive ? 'bg-orange-100' : ''}`}>
                    <svg className="w-5 h-5" fill={isActive ? '#FF6B00' : 'none'} viewBox="0 0 24 24" stroke={isActive ? '#FF6B00' : 'currentColor'} strokeWidth={isActive ? 0 : 2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span>Accueil</span>
                </>
              )}
            </NavLink>

            {/* Bouton central — Nouvelle vente */}
            <div className="flex-1 flex items-center justify-center">
              <NavLink
                to={`/vendeur/${urlUnique}`}
                end
                className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 -mt-4 hover:bg-orange-600 transition-colors"
                onClick={e => {
                  // Redirige vers accueil pour choisir le produit
                }}
              >
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </NavLink>
            </div>

            <NavLink
              to={`/vendeur/${urlUnique}/historique`}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors ${
                  isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all ${isActive ? 'bg-orange-100' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={isActive ? '#FF6B00' : 'currentColor'} strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span>Historique</span>
                </>
              )}
            </NavLink>
          </div>
        </nav>
      )}
    </div>
  )
}
