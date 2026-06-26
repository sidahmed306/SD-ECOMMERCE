import { useState } from 'react'
import { useProduits } from '../../hooks/useProduits'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'

export default function Alertes() {
  const { produits, produitsEnAlerte, loading, refresh } = useProduits()
  const [editingSeuil, setEditingSeuil] = useState({})
  const [saving, setSaving] = useState(null)

  async function saveSeuil(produitId, seuil) {
    setSaving(produitId)
    await supabase.from('produits').update({ seuil_alerte: parseInt(seuil) }).eq('id', produitId)
    await refresh()
    setSaving(null)
    setEditingSeuil(prev => { const n = {...prev}; delete n[produitId]; return n })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Alertes de stock</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {produitsEnAlerte.length} produit{produitsEnAlerte.length > 1 ? 's' : ''} en alerte
        </p>
      </div>

      {produitsEnAlerte.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⚠️</span>
            <p className="font-bold text-red-700">Produits nécessitant un réapprovisionnement</p>
          </div>
          <div className="space-y-2">
            {produitsEnAlerte.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-red-100">
                <div className="flex items-center gap-3">
                  {p.photo_url
                    ? <img src={p.photo_url} alt={p.nom} className="w-10 h-10 rounded-lg object-cover" />
                    : <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-xl">📦</div>
                  }
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{p.nom}</p>
                    <p className="text-xs text-red-500 font-medium">
                      {p.stock === 0 ? '🔴 Rupture de stock' : `🟡 Stock : ${p.stock} unité${p.stock > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">Seuil : {p.seuil_alerte}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tous les produits - configuration seuils */}
      <h2 className="text-lg font-bold text-gray-900 mb-3">Configurer les seuils d'alerte</h2>
      {loading ? (
        <div className="text-center py-8 text-gray-400">Chargement...</div>
      ) : (
        <Card padding={false}>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Produit</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Stock actuel</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Seuil d'alerte</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {produits.map(p => {
                const enAlerte = p.stock <= p.seuil_alerte
                const isEditing = editingSeuil[p.id] !== undefined
                return (
                  <tr key={p.id} className={`hover:bg-gray-50 ${enAlerte ? 'bg-red-50/50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {enAlerte && <span className="text-sm">⚠️</span>}
                        <span className="font-medium text-gray-900">{p.nom}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${enAlerte ? 'text-red-500' : 'text-gray-900'}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editingSeuil[p.id]}
                          onChange={e => setEditingSeuil(prev => ({ ...prev, [p.id]: e.target.value }))}
                          className="w-20 text-center rounded-lg border border-orange-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          autoFocus
                        />
                      ) : (
                        <span className="text-gray-600">{p.seuil_alerte}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            loading={saving === p.id}
                            onClick={() => saveSeuil(p.id, editingSeuil[p.id])}
                          >
                            Sauver
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingSeuil(prev => { const n = {...prev}; delete n[p.id]; return n })}
                          >
                            Annuler
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingSeuil(prev => ({ ...prev, [p.id]: p.seuil_alerte }))}
                        >
                          Modifier
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
