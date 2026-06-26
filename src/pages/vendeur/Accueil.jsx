import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useVendeur } from '../../contexts/VendeurContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { formatMoney } from '../../lib/utils'
import { startOfDay, startOfMonth } from 'date-fns'

export default function VendeurAccueil() {
  const { vendeur } = useVendeur()
  const { urlUnique } = useParams()
  const navigate = useNavigate()
  const [produits, setProduits] = useState([])
  const [statsJour, setStatsJour] = useState({ ventes: 0, commissions: 0 })
  const [statsMois, setStatsMois] = useState({ ventes: 0, commissions: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (vendeur) {
      fetchProduits()
      fetchStats()
    }
  }, [vendeur])

  async function fetchProduits() {
    const { data } = await supabase
      .from('vendeur_produits')
      .select('pourcentage_commission, produits(id, nom, photo_url, prix_conseille, stock, seuil_alerte)')
      .eq('vendeur_id', vendeur.id)
    setProduits(data?.map(vp => ({ ...vp.produits, pourcentage_commission: vp.pourcentage_commission })) || [])
    setLoading(false)
  }

  async function fetchStats() {
    const debutJour = startOfDay(new Date()).toISOString()
    const debutMois = startOfMonth(new Date()).toISOString()

    const { data: ventesJour } = await supabase
      .from('ventes')
      .select('commission_calculee')
      .eq('vendeur_id', vendeur.id)
      .gte('date_vente', debutJour)

    const { data: ventesMois } = await supabase
      .from('ventes')
      .select('commission_calculee')
      .eq('vendeur_id', vendeur.id)
      .gte('date_vente', debutMois)

    if (ventesJour) setStatsJour({
      ventes: ventesJour.length,
      commissions: ventesJour.reduce((s, v) => s + Number(v.commission_calculee), 0)
    })
    if (ventesMois) setStatsMois({
      ventes: ventesMois.length,
      commissions: ventesMois.reduce((s, v) => s + Number(v.commission_calculee), 0)
    })
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Chargement...</div>
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Bonjour, {vendeur?.nom} 👋</h1>
        <p className="text-gray-400 text-sm mt-0.5">Vos produits à vendre</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Card className="bg-orange-50 border-orange-100">
          <p className="text-xs font-medium text-orange-600 mb-1">Aujourd'hui</p>
          <p className="text-xl font-bold text-orange-600">{formatMoney(statsJour.commissions)}</p>
          <p className="text-xs text-orange-400">{statsJour.ventes} vente{statsJour.ventes > 1 ? 's' : ''}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-gray-500 mb-1">Ce mois</p>
          <p className="text-xl font-bold text-gray-900">{formatMoney(statsMois.commissions)}</p>
          <p className="text-xs text-gray-400">{statsMois.ventes} vente{statsMois.ventes > 1 ? 's' : ''}</p>
        </Card>
      </div>

      {/* Produits */}
      {produits.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-500 font-medium">Aucun produit assigné</p>
            <p className="text-gray-400 text-sm mt-1">Contactez votre responsable</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {produits.map(produit => {
            const enAlerte = produit.stock <= produit.seuil_alerte
            const rupture = produit.stock === 0
            return (
              <Card key={produit.id} padding={false} className="overflow-hidden">
                <div className="flex gap-0">
                  {/* Photo */}
                  <div className="w-28 h-28 shrink-0 bg-gray-100 overflow-hidden">
                    {produit.photo_url
                      ? <img src={produit.photo_url} alt={produit.nom} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-base leading-tight">{produit.nom}</h3>
                      {rupture
                        ? <Badge variant="red">Rupture</Badge>
                        : enAlerte
                          ? <Badge variant="yellow">Stock bas</Badge>
                          : null
                      }
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Stock : <strong className={rupture ? 'text-red-500' : enAlerte ? 'text-yellow-600' : 'text-gray-700'}>{produit.stock}</strong>
                      <span className="mx-2 text-gray-200">·</span>
                      Commission : <strong className="text-orange-500">{produit.pourcentage_commission}%</strong>
                    </p>
                    <Button
                      size="sm"
                      disabled={rupture}
                      onClick={() => navigate(`/vendeur/${urlUnique}/vente`, { state: { produit } })}
                      className="w-full"
                    >
                      {rupture ? 'Rupture de stock' : '💰 Enregistrer une vente'}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
