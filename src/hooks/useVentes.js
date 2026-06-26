import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useVentes({ vendeurId = null, produitId = null, debut = null, fin = null } = {}) {
  const [ventes, setVentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchVentes() {
    setLoading(true)
    let query = supabase
      .from('ventes')
      .select(`
        *,
        vendeurs ( id, nom, telephone ),
        produits ( id, nom, photo_url )
      `)
      .order('date_vente', { ascending: false })

    if (vendeurId) query = query.eq('vendeur_id', vendeurId)
    if (produitId) query = query.eq('produit_id', produitId)
    if (debut) query = query.gte('date_vente', debut)
    if (fin) query = query.lte('date_vente', fin)

    const { data, error } = await query
    if (error) setError(error.message)
    else setVentes(data)
    setLoading(false)
  }

  useEffect(() => { fetchVentes() }, [vendeurId, produitId, debut, fin])

  async function enregistrerVente({ vendeur_id, produit_id, prix_vente, pourcentage_commission }) {
    const commission_calculee = parseFloat((prix_vente * pourcentage_commission / 100).toFixed(2))

    const { data: vente, error: venteError } = await supabase
      .from('ventes')
      .insert([{
        vendeur_id,
        produit_id,
        prix_vente,
        commission_calculee,
        pourcentage_applique: pourcentage_commission,
      }])
      .select()
      .single()
    if (venteError) throw venteError

    // Décrémenter le stock
    const { error: stockError } = await supabase.rpc('decrement_stock', { produit_id_param: produit_id })
    if (stockError) throw stockError

    await fetchVentes()
    return { ...vente, commission_calculee }
  }

  return { ventes, loading, error, enregistrerVente, refresh: fetchVentes }
}
