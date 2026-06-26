import { useState } from 'react'
import { useVendeur } from '../../contexts/VendeurContext'
import { useVentes } from '../../hooks/useVentes'
import Card from '../../components/ui/Card'
import { formatDate, formatMoney, getPeriodStart } from '../../lib/utils'

export default function HistoriqueVendeur() {
  const { vendeur } = useVendeur()
  const [periode, setPeriode] = useState('mois')
  const debut = getPeriodStart(periode)
  const { ventes, loading } = useVentes({
    vendeurId: vendeur?.id,
    debut: debut?.toISOString() || null,
  })

  const totalCommissions = ventes.reduce((s, v) => s + Number(v.commission_calculee), 0)
  const totalVentes = ventes.reduce((s, v) => s + Number(v.prix_vente), 0)

  const periodes = [
    { value: 'jour', label: "Aujourd'hui" },
    { value: 'semaine', label: 'Cette semaine' },
    { value: 'mois', label: 'Ce mois' },
    { value: 'tout', label: 'Tout' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Mon historique</h1>

      {/* Filtre période */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4 overflow-x-auto">
        {periodes.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriode(p.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-1 ${
              periode === p.value ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Totaux */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="bg-orange-50 border-orange-100">
          <p className="text-xs font-medium text-orange-600 mb-1">Mes commissions</p>
          <p className="text-xl font-bold text-orange-500">{formatMoney(totalCommissions)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-gray-500 mb-1">Chiffre d'affaires</p>
          <p className="text-xl font-bold text-gray-900">{formatMoney(totalVentes)}</p>
          <p className="text-xs text-gray-400">{ventes.length} vente{ventes.length > 1 ? 's' : ''}</p>
        </Card>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Chargement...</div>
      ) : ventes.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500 font-medium">Aucune vente sur cette période</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {ventes.map(vente => (
            <Card key={vente.id}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl shrink-0">
                  💰
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{vente.produits?.nom}</p>
                  <p className="text-xs text-gray-400">{formatDate(vente.date_vente)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-orange-500 text-sm">{formatMoney(vente.commission_calculee)}</p>
                  <p className="text-xs text-gray-400">{formatMoney(vente.prix_vente)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
