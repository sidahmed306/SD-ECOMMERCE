import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useProduits() {
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchProduits() {
    setLoading(true)
    const { data, error } = await supabase
      .from('produits')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setProduits(data)
    setLoading(false)
  }

  useEffect(() => { fetchProduits() }, [])

  async function createProduit(values, photoFile) {
    let photo_url = null

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('produits-photos')
        .upload(fileName, photoFile)
      if (uploadError) {
        // Si le bucket n'existe pas encore, on continue sans photo
        if (!uploadError.message?.includes('Bucket not found')) throw uploadError
        console.warn('Bucket produits-photos manquant — produit créé sans photo')
      } else {
        const { data: urlData } = supabase.storage.from('produits-photos').getPublicUrl(fileName)
        photo_url = urlData.publicUrl
      }
    }

    const { data, error } = await supabase
      .from('produits')
      .insert([{ ...values, photo_url }])
      .select()
      .single()
    if (error) throw error
    await fetchProduits()
    return data
  }

  async function updateProduit(id, values, photoFile) {
    let updates = { ...values }

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('produits-photos')
        .upload(fileName, photoFile)
      if (uploadError) {
        if (!uploadError.message?.includes('Bucket not found')) throw uploadError
        console.warn('Bucket produits-photos manquant — photo non mise à jour')
      } else {
        const { data: urlData } = supabase.storage.from('produits-photos').getPublicUrl(fileName)
        updates.photo_url = urlData.publicUrl
      }
    }

    const { data, error } = await supabase
      .from('produits')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    await fetchProduits()
    return data
  }

  async function deleteProduit(id) {
    const { error } = await supabase.from('produits').delete().eq('id', id)
    if (error) throw error
    await fetchProduits()
  }

  const produitsEnAlerte = produits.filter(p => p.stock <= p.seuil_alerte)

  return { produits, loading, error, createProduit, updateProduit, deleteProduit, refresh: fetchProduits, produitsEnAlerte }
}
