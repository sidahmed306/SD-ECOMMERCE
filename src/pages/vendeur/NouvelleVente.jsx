import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useVendeur } from '../../contexts/VendeurContext'
import { useVentes } from '../../hooks/useVentes'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { formatMoney } from '../../lib/utils'

export default function NouvelleVente() {
  const { state } = useLocation()
  const { urlUnique } = useParams()
  const { vendeur } = useVendeur()
  const navigate = useNavigate()
  const { enregistrerVente } = useVentes()

  const produit = state?.produit
  const [prixVente, setPrixVente] = useState(produit?.prix_conseille?.toString() || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  if (!produit) {
    navigate(`/vendeur/${urlUnique}`)
    return null
  }

  const prix = parseFloat(prixVente) || 0
  const commissionCalculee = prix * produit.pourcentage_commission / 100

  async function handleConfirm() {
    if (prix <= 0) { setError('Le prix doit être supérieur à 0'); return }
    setLoading(true)
    setError('')
    try {
      const result = await enregistrerVente({
        vendeur_id: vendeur.id,
        produit_id: produit.id,
        prix_vente: prix,
        pourcentage_commission: produit.pourcentage_commission,
      })
      setSuccess(result)
    } catch (e) {
      setError(e.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mb-5">
          ✅
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vente enregistrée !</h2>
        <p className="text-gray-500 mb-1">{produit.nom}</p>
        <p className="text-gray-500 mb-4">Prix de vente : <strong>{formatMoney(success.prix_vente)}</strong></p>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6 w-full max-w-xs">
          <p className="text-sm text-orange-600 font-medium mb-1">Votre commission</p>
          <p className="text-3xl font-bold text-orange-500">{formatMoney(success.commission_calculee)}</p>
          <p className="text-xs text-orange-400 mt-1">({produit.pourcentage_commission}% de {formatMoney(success.prix_vente)})</p>
        </div>
        <div className="flex gap-3 w-full max-w-xs">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate(`/vendeur/${urlUnique}/historique`)}
          >
            Voir l'historique
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigate(`/vendeur/${urlUnique}`)}
          >
            Retour
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => navigate(`/vendeur/${urlUnique}`)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-5 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-5">Nouvelle vente</h1>

      {/* Produit sélectionné */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-5">
        {produit.photo_url
          ? <img src={produit.photo_url} alt={produit.nom} className="w-16 h-16 rounded-xl object-cover shrink-0" />
          : <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-3xl shrink-0">📦</div>
        }
        <div>
          <h2 className="font-bold text-gray-900">{produit.nom}</h2>
          <p className="text-sm text-gray-400">Prix conseillé : {formatMoney(produit.prix_conseille)}</p>
          <p className="text-sm text-orange-500 font-medium">Commission : {produit.pourcentage_commission}%</p>
        </div>
      </div>

      {/* Prix de vente */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <Input
          label="Prix de vente réel"
          type="number"
          step="0.01"
          min="0"
          suffix="€"
          value={prixVente}
          onChange={e => setPrixVente(e.target.value)}
          placeholder="0.00"
          required
        />

        {/* Calcul en temps réel */}
        {prix > 0 && (
          <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-medium">Votre commission</p>
                <p className="text-2xl font-bold text-orange-500">{formatMoney(commissionCalculee)}</p>
                <p className="text-xs text-orange-400">= {formatMoney(prix)} × {produit.pourcentage_commission}%</p>
              </div>
              <div className="text-4xl">🎉</div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button
        onClick={handleConfirm}
        loading={loading}
        disabled={prix <= 0}
        size="xl"
        className="w-full"
      >
        ✅ Confirmer la vente
      </Button>
      <p className="text-xs text-center text-gray-400 mt-2">
        Le stock sera automatiquement mis à jour
      </p>
    </div>
  )
}
