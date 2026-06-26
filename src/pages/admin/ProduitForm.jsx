import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ProduitForm({ produit, onSave, onCancel }) {
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(produit?.photo_url || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      nom: produit?.nom || '',
      description: produit?.description || '',
      prix_conseille: produit?.prix_conseille || '',
      stock: produit?.stock ?? 0,
      seuil_alerte: produit?.seuil_alerte ?? 5,
    }
  })

  function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function onSubmit(values) {
    setLoading(true)
    setError('')
    try {
      await onSave(
        {
          nom: values.nom,
          description: values.description || null,
          prix_conseille: parseFloat(values.prix_conseille),
          stock: parseInt(values.stock),
          seuil_alerte: parseInt(values.seuil_alerte),
        },
        photoFile
      )
    } catch (e) {
      setError(e.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Photo */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1.5">Photo</label>
        <div
          onClick={() => fileRef.current.click()}
          className="relative aspect-video rounded-xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-orange-400 transition-colors bg-gray-50"
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <span className="text-3xl mb-2">📷</span>
              <span className="text-sm">Cliquer pour ajouter une photo</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
      </div>

      <Input
        label="Nom du produit"
        placeholder="Ex: Montre connectée"
        required
        error={errors.nom?.message}
        {...register('nom', { required: 'Le nom est requis' })}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Description</label>
        <textarea
          placeholder="Description courte (optionnel)"
          rows={2}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
          {...register('description')}
        />
      </div>

      <Input
        label="Prix conseillé"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        suffix="€"
        required
        error={errors.prix_conseille?.message}
        {...register('prix_conseille', { required: 'Le prix est requis', min: { value: 0, message: 'Prix invalide' } })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Stock actuel"
          type="number"
          min="0"
          required
          error={errors.stock?.message}
          {...register('stock', { required: true, min: 0 })}
        />
        <Input
          label="Seuil d'alerte"
          type="number"
          min="0"
          hint="Notification si stock ≤"
          error={errors.seuil_alerte?.message}
          {...register('seuil_alerte', { min: 0 })}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {produit ? 'Enregistrer' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
