import { useState } from 'react'
import { useVentes } from '../../hooks/useVentes'
import { useVendeurs } from '../../hooks/useVendeurs'
import { useProduits } from '../../hooks/useProduits'
import Card from '../../components/ui/Card'
import { formatDate, formatMoney } from '../../lib/utils'

export default function Historique() {
  const [filtreVendeur, setFiltreVendeur] = useState('')
  const [filtreProduit, setFiltreProduit] = useState('')
  const [debut, setDebut] = useState('')
  const [fin, setFin] = useState('')

  const { ventes, loading } = useVentes({
    vendeurId: filtreVendeur || null,
    produitId: filtreProduit || null,
    debut: debut ? new Date(debut).toISOString() : null,
    fin: fin ? new Date(fin + 'T23:59:59').toISOString() : null,
  })
  const { vendeurs } = useVendeurs()
  const { produits } = useProduits()

  const totalVentes = ventes.reduce((s, v) => s + Number(v.prix_vente), 0)
  const totalCommissions = ventes.reduce((s, v) => s + Number(v.commission_calculee), 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Historique des ventes</h1>
        <p className="text-gray-500 text-sm mt-0.5">{ventes.length} vente{ventes.length > 1 ? 's' : ''}</p>
      </div>

      {/* Filtres */}
      <Card className="mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Vendeur</label>
            <select
              value={filtreVendeur}
              onChange={e => setFiltreVendeur(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Tous</option>
              {vendeurs.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Produit</label>
            <select
              value={filtreProduit}
              onChange={e => setFiltreProduit(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Tous</option>
              {produits.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Du</label>
            <input
              type="date"
              value={debut}
              onChange={e => setDebut(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Au</label>
            <input
              type="date"
              value={fin}
              onChange={e => setFin(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
      </Card>

      {/* Totaux */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <Card>
          <p className="text-xs text-gray-500 font-medium mb-1">Chiffre d'affaires</p>
          <p className="text-2xl font-bold text-gray-900">{formatMoney(totalVentes)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 font-medium mb-1">Total commissions dues</p>
          <p className="text-2xl font-bold text-orange-500">{formatMoney(totalCommissions)}</p>
        </Card>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : ventes.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500">Aucune vente pour ces critères</p>
          </div>
        </Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Vendeur</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Produit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Prix vente</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ventes.map(vente => (
                  <tr key={vente.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(vente.date_vente)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{vente.vendeurs?.nom}</td>
                    <td className="px-4 py-3 text-gray-600">{vente.produits?.nom}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{formatMoney(vente.prix_vente)}</td>
                    <td className="px-4 py-3 text-right font-bold text-orange-500">
                      {formatMoney(vente.commission_calculee)}
                      <span className="text-xs text-gray-400 font-normal ml-1">({vente.pourcentage_applique}%)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
