import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { nanoid } from 'nanoid'

export function useVendeurs() {
  const [vendeurs, setVendeurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchVendeurs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('vendeurs')
      .select(`
        *,
        vendeur_produits (
          pourcentage_commission,
          produits ( id, nom, photo_url, prix_conseille, stock )
        )
      `)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setVendeurs(data)
    setLoading(false)
  }

  useEffect(() => { fetchVendeurs() }, [])

  async function createVendeur(values, produitAssignations) {
    // Réessaie avec un nouveau nanoid en cas de conflit (409)
    let vendeur, error
    for (let i = 0; i < 3; i++) {
      const url_unique = nanoid(12)
      const res = await supabase
        .from('vendeurs')
        .insert([{ ...values, url_unique }])
        .select()
        .single()
      vendeur = res.data
      error = res.error
      if (!error || error.code !== '23505') break
    }
    if (error) throw new Error(error.message || JSON.stringify(error))

    if (produitAssignations.length > 0) {
      const liens = produitAssignations.map(a => ({
        vendeur_id: vendeur.id,
        produit_id: a.produit_id,
        pourcentage_commission: a.pourcentage_commission,
      }))
      const { error: lienError } = await supabase.from('vendeur_produits').insert(liens)
      if (lienError) throw lienError
    }

    await fetchVendeurs()
    return vendeur
  }

  async function updateVendeur(id, values, produitAssignations) {
    const { error } = await supabase.from('vendeurs').update(values).eq('id', id)
    if (error) throw error

    // Remplacer toutes les assignations
    await supabase.from('vendeur_produits').delete().eq('vendeur_id', id)

    if (produitAssignations.length > 0) {
      const liens = produitAssignations.map(a => ({
        vendeur_id: id,
        produit_id: a.produit_id,
        pourcentage_commission: a.pourcentage_commission,
      }))
      const { error: lienError } = await supabase.from('vendeur_produits').insert(liens)
      if (lienError) throw lienError
    }

    await fetchVendeurs()
  }

  async function toggleActif(id, actif) {
    const { error } = await supabase.from('vendeurs').update({ actif }).eq('id', id)
    if (error) throw error
    await fetchVendeurs()
  }

  async function deleteVendeur(id) {
    // Supprimer dans l'ordre : ventes → vendeur_produits → vendeur
    await supabase.from('ventes').delete().eq('vendeur_id', id)
    await supabase.from('vendeur_produits').delete().eq('vendeur_id', id)
    const { error } = await supabase.from('vendeurs').delete().eq('id', id)
    if (error) throw new Error(error.message || JSON.stringify(error))
    await fetchVendeurs()
  }

  return { vendeurs, loading, error, createVendeur, updateVendeur, toggleActif, deleteVendeur, refresh: fetchVendeurs }
}
