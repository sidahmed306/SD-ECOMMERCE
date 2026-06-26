import { useState } from 'react'
import { useVendeurs } from '../../hooks/useVendeurs'
import { useProduits } from '../../hooks/useProduits'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import VendeurForm from './VendeurForm'

export default function Vendeurs() {
  const { vendeurs, loading, createVendeur, updateVendeur, toggleActif, deleteVendeur } = useVendeurs()
  const { produits } = useProduits()
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const filtered = vendeurs.filter(v =>
    v.nom.toLowerCase().includes(search.toLowerCase()) ||
    v.telephone.includes(search)
  )

  function openEdit(vendeur) {
    setSelected(vendeur)
    setModalOpen(true)
  }

  function openNew() {
    setSelected(null)
    setModalOpen(true)
  }

  function getVendeurUrl(urlUnique) {
    return `${window.location.origin}/vendeur/${urlUnique}`
  }

  async function copyUrl(vendeur) {
    await navigator.clipboard.writeText(getVendeurUrl(vendeur.url_unique))
    setCopiedId(vendeur.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleDelete(id) {
    await deleteVendeur(id)
    setConfirmDelete(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendeurs</h1>
          <p className="text-gray-500 text-sm mt-0.5">{vendeurs.length} vendeur{vendeurs.length > 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openNew}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau vendeur
        </Button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou téléphone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-gray-500 font-medium">Aucun vendeur trouvé</p>
            <Button onClick={openNew} className="mt-4">Ajouter un vendeur</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(vendeur => (
            <Card key={vendeur.id}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar & info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg shrink-0">
                    {vendeur.nom.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 truncate">{vendeur.nom}</p>
                      <Badge variant={vendeur.actif ? 'green' : 'default'}>
                        {vendeur.actif ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{vendeur.telephone}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vendeur.vendeur_produits?.map(vp => (
                        <span key={vp.produits?.id} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                          {vp.produits?.nom} ({vp.pourcentage_commission}%)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyUrl(vendeur)}
                    className="text-xs"
                  >
                    {copiedId === vendeur.id ? '✅ Copié !' : '🔗 Copier lien'}
                  </Button>
                  <Button
                    variant={vendeur.actif ? 'ghost' : 'secondary'}
                    size="sm"
                    onClick={() => toggleActif(vendeur.id, !vendeur.actif)}
                  >
                    {vendeur.actif ? 'Désactiver' : 'Activer'}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(vendeur)}>
                    Modifier
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setConfirmDelete(vendeur)}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>

              {/* URL vendeur */}
              <div className="mt-3 pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-400 truncate">
                  🔗 <span className="font-mono">{getVendeurUrl(vendeur.url_unique)}</span>
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selected ? 'Modifier le vendeur' : 'Nouveau vendeur'}
        size="lg"
      >
        <VendeurForm
          vendeur={selected}
          produits={produits}
          onSave={async (values, assignations) => {
            if (selected) await updateVendeur(selected.id, values, assignations)
            else await createVendeur(values, assignations)
            setModalOpen(false)
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Supprimer le vendeur"
        size="sm"
      >
        <p className="text-gray-600 mb-5">
          Supprimer <strong>{confirmDelete?.nom}</strong> ? Ses ventes seront conservées.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(null)}>Annuler</Button>
          <Button variant="danger" className="flex-1" onClick={() => handleDelete(confirmDelete.id)}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  )
}
