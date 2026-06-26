import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useVendeur } from '../../contexts/VendeurContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function VendeurLogin() {
  const { urlUnique } = useParams()
  const { login } = useVendeur()
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Vérifier que le vendeur correspond à l'URL unique + nom + téléphone
      const { data, error: dbError } = await supabase
        .from('vendeurs')
        .select('id, nom, telephone, url_unique, actif')
        .eq('url_unique', urlUnique)
        .eq('actif', true)
        .single()

      if (dbError || !data) {
        setError('Lien invalide ou vendeur désactivé.')
        setLoading(false)
        return
      }

      const nomMatch = data.nom.toLowerCase().trim() === nom.toLowerCase().trim()
      const telMatch = data.telephone.replace(/\s/g, '') === telephone.replace(/\s/g, '')

      if (!nomMatch || !telMatch) {
        setError('Nom ou numéro de téléphone incorrect.')
        setLoading(false)
        return
      }

      login({ id: data.id, nom: data.nom, telephone: data.telephone, url_unique: urlUnique })
    } catch (e) {
      setError('Une erreur est survenue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg shadow-orange-200">
            V
          </div>
          <h1 className="text-xl font-bold text-gray-900">Espace Vendeur</h1>
          <p className="text-gray-400 text-sm mt-1">Identifiez-vous pour continuer</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Votre nom"
              placeholder="Prénom Nom"
              value={nom}
              onChange={e => setNom(e.target.value)}
              required
              autoComplete="name"
            />
            <Input
              label="Votre numéro de téléphone"
              type="tel"
              placeholder="06 00 00 00 00"
              value={telephone}
              onChange={e => setTelephone(e.target.value)}
              required
              autoComplete="tel"
            />
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Accéder à mon espace
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
