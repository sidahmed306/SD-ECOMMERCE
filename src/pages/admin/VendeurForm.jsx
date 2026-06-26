import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function VendeurForm({ vendeur, produits, onSave, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Construire les assignations initiales depuis le vendeur existant
  const initialAssignations = vendeur?.vendeur_produits?.reduce((acc, vp) => {
    acc[vp.produits.id] = { selected: true, commission: vp.pourcentage_commission }
    return acc
  }, {}) || {}

  const [assignations, setAssignations] = useState(initialAssignations)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      nom: vendeur?.nom || '',
      telephone: vendeur?.telephone || '',
    }
  })

  function toggleProduit(produitId) {
    setAssignations(prev => ({
      ...prev,
      [produitId]: prev[produitId]?.selected
        ? { selected: false, commission: prev[produitId]?.commission || 10 }
        : { selected: true, commission: prev[produitId]?.commission || 10 }
    }))
  }

  function setCommission(produitId, value) {
    setAssignations(prev => ({
      ...prev,
      [produitId]: { ...prev[produitId], commission: value }
    }))
  }

  async function onSubmit(values) {
    const produitAssignations = Object.entries(assignations)
      .filter(([, v]) => v.selected)
      .map(([produit_id, v]) => ({
        produit_id,
        pourcentage_commission: parseFloat(v.commission) || 10,
      }))

    setLoading(true)
    setError('')
    try {
      await onSave(values, produitAssignations)
    } catch (e) {
      setError(e.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Nom du vendeur"
          placeholder="Prénom Nom"
          required
          error={errors.nom?.message}
          {...register('nom', { required: 'Le nom est requis' })}
        />
        <Input
          label="Téléphone"
          type="tel"
          placeholder="06 00 00 00 00"
          required
          error={errors.telephone?.message}
          {...register('telephone', { required: 'Le téléphone est requis' })}
        />
      </div>

      {/* Assignation produits */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          Produits assignés & commissions
        </label>
        {produits.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun produit disponible. Créez d'abord des produits.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {produits.map(produit => {
              const isSelected = assignations[produit.id]?.selected
              const commission = assignations[produit.id]?.commission ?? 10
              return (
                <div
                  key={produit.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleProduit(produit.id)}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{produit.nom}</p>
                    <p className="text-xs text-gray-400">Stock : {produit.stock}</p>
                  </div>
                  {isSelected && (
                    <div
                      className="flex items-center gap-1.5 shrink-0"
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={commission}
                        onChange={e => setCommission(produit.id, e.target.value)}
                        className="w-16 text-center rounded-lg border border-orange-300 px-2 py-1 text-sm font-bold text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      <span className="text-sm text-orange-500 font-medium">%</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {vendeur ? 'Enregistrer' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
