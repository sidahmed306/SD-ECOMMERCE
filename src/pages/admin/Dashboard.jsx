import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { supabase } from '../../lib/supabase'
import { useProduits } from '../../hooks/useProduits'
import Card, { CardHeader } from '../../components/ui/Card'
import { formatMoney, formatDateShort } from '../../lib/utils'
import { subDays, format, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'

const ORANGE = '#FF6B00'
const COLORS = ['#FF6B00', '#FF9940', '#FFB870', '#FDD5A8', '#FFE8CC', '#FFF3E0']

export default function Dashboard() {
  const [periode, setPeriode] = useState('30')
  const [stats, setStats] = useState(null)
  const [ventesParJour, setVentesParJour] = useState([])
  const [topVendeurs, setTopVendeurs] = useState([])
  const [topProduits, setTopProduits] = useState([])
  const [commissionsVendeurs, setCommissionsVendeurs] = useState([])
  const [loading, setLoading] = useState(true)
  const { produits, produitsEnAlerte } = useProduits()

  useEffect(() => { fetchAll() }, [periode])

  async function fetchAll() {
    setLoading(true)
    const debut = subDays(new Date(), parseInt(periode)).toISOString()

    const { data: ventes } = await supabase
      .from('ventes')
      .select('*, vendeurs(nom), produits(nom)')
      .gte('date_vente', debut)
      .order('date_vente')

    if (!ventes) { setLoading(false); return }

    // Stats globales
    const totalVentes = ventes.reduce((s, v) => s + Number(v.prix_vente), 0)
    const totalCommissions = ventes.reduce((s, v) => s + Number(v.commission_calculee), 0)
    setStats({ totalVentes, totalCommissions, nbVentes: ventes.length })

    // Ventes par jour
    const parJourMap = {}
    for (let i = parseInt(periode) - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'dd MMM', { locale: fr })
      parJourMap[d] = { date: d, ventes: 0, montant: 0 }
    }
    ventes.forEach(v => {
      const d = format(new Date(v.date_vente), 'dd MMM', { locale: fr })
      if (parJourMap[d]) {
        parJourMap[d].ventes += 1
        parJourMap[d].montant += Number(v.prix_vente)
      }
    })
    setVentesParJour(Object.values(parJourMap))

    // Top vendeurs
    const vendeurMap = {}
    ventes.forEach(v => {
      if (!vendeurMap[v.vendeur_id]) vendeurMap[v.vendeur_id] = { nom: v.vendeurs?.nom, ventes: 0, montant: 0, commission: 0 }
      vendeurMap[v.vendeur_id].ventes += 1
      vendeurMap[v.vendeur_id].montant += Number(v.prix_vente)
      vendeurMap[v.vendeur_id].commission += Number(v.commission_calculee)
    })
    const tv = Object.values(vendeurMap).sort((a, b) => b.montant - a.montant)
    setTopVendeurs(tv)
    setCommissionsVendeurs(tv.map(v => ({ name: v.nom, commission: v.commission })))

    // Top produits
    const produitMap = {}
    ventes.forEach(v => {
      if (!produitMap[v.produit_id]) produitMap[v.produit_id] = { nom: v.produits?.nom, quantite: 0, montant: 0 }
      produitMap[v.produit_id].quantite += 1
      produitMap[v.produit_id].montant += Number(v.prix_vente)
    })
    setTopProduits(Object.values(produitMap).sort((a, b) => b.quantite - a.quantite))

    setLoading(false)
  }

  const periodeOptions = [
    { value: '7', label: '7 jours' },
    { value: '30', label: '30 jours' },
    { value: '90', label: '3 mois' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Vue d'ensemble de votre activité</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {periodeOptions.map(o => (
            <button
              key={o.value}
              onClick={() => setPeriode(o.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                periode === o.value ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alertes stock */}
      {produitsEnAlerte.length > 0 && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold text-red-700 text-sm">
              {produitsEnAlerte.length} produit{produitsEnAlerte.length > 1 ? 's' : ''} en rupture ou stock bas
            </p>
            <p className="text-xs text-red-500">
              {produitsEnAlerte.map(p => p.nom).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Chiffre d\'affaires', value: formatMoney(stats?.totalVentes || 0), icon: '💰', color: 'text-orange-500' },
          { label: 'Commissions dues', value: formatMoney(stats?.totalCommissions || 0), icon: '💸', color: 'text-orange-400' },
          { label: 'Nombre de ventes', value: stats?.nbVentes || 0, icon: '🛒', color: 'text-gray-900' },
          { label: 'Produits en alerte', value: produitsEnAlerte.length, icon: '⚠️', color: produitsEnAlerte.length > 0 ? 'text-red-500' : 'text-gray-400' },
        ].map(kpi => (
          <Card key={kpi.label}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">{kpi.label}</p>
              <span className="text-xl">{kpi.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Graphique ventes par jour */}
      <Card className="mb-4">
        <CardHeader title="Évolution des ventes" subtitle={`Sur les ${periode} derniers jours`} />
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={ventesParJour} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ORANGE} stopOpacity={0.15} />
                <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}€`} />
            <Tooltip
              formatter={(value) => [formatMoney(value), 'Montant']}
              contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
            />
            <Area type="monotone" dataKey="montant" stroke={ORANGE} strokeWidth={2.5} fill="url(#colorMontant)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Top vendeurs */}
        <Card>
          <CardHeader title="Classement vendeurs" subtitle="Par montant des ventes" />
          {topVendeurs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucune vente sur la période</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topVendeurs} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${v}€`} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="nom" tick={{ fontSize: 12, fill: '#374151' }} tickLine={false} width={80} />
                <Tooltip formatter={(v) => [formatMoney(v), 'CA']} contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0' }} />
                <Bar dataKey="montant" fill={ORANGE} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Top produits */}
        <Card>
          <CardHeader title="Produits les plus vendus" subtitle="Par quantité vendue" />
          {topProduits.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucune vente sur la période</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={topProduits}
                  dataKey="quantite"
                  nameKey="nom"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={35}
                  paddingAngle={3}
                >
                  {topProduits.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v + ' ventes', n]} contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0' }} />
                <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#374151' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Commissions par vendeur */}
      <Card>
        <CardHeader title="Commissions dues par vendeur" subtitle={`Période : ${periode} jours`} />
        {commissionsVendeurs.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Aucune commission sur la période</p>
        ) : (
          <div className="space-y-2">
            {topVendeurs.map((v, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{v.nom}</p>
                    <p className="text-sm font-bold text-orange-500">{formatMoney(v.commission)}</p>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full transition-all"
                      style={{ width: `${topVendeurs[0]?.commission ? (v.commission / topVendeurs[0].commission) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{v.ventes} vente{v.ventes > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
