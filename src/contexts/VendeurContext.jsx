import { createContext, useContext, useState } from 'react'

const VendeurContext = createContext(null)

export function VendeurProvider({ children }) {
  const [vendeur, setVendeur] = useState(() => {
    try {
      const saved = sessionStorage.getItem('vendeur_session')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  function login(vendeurData) {
    sessionStorage.setItem('vendeur_session', JSON.stringify(vendeurData))
    setVendeur(vendeurData)
  }

  function logout() {
    sessionStorage.removeItem('vendeur_session')
    setVendeur(null)
  }

  return (
    <VendeurContext.Provider value={{ vendeur, login, logout }}>
      {children}
    </VendeurContext.Provider>
  )
}

export function useVendeur() {
  const ctx = useContext(VendeurContext)
  if (!ctx) throw new Error('useVendeur doit être utilisé dans VendeurProvider')
  return ctx
}
