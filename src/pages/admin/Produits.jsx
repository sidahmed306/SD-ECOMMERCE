import { useState } from 'react'
import { useProduits } from '../../hooks/useProduits'
import Card, { CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ProduitForm from './ProduitForm'
import { formatMoney } from '../../lib/utils'

export default function Produits() {
  const { produits, loading, deleteProduit, createProduit, updateProduit } = useProduits()
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = produits.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  )

  function openEdit(produit) {
    setSelected(produit)
    setModalOpen(true)
  }

  function openNew() {
    setSelected(null)
    setModalOpen(true)
  }

  async function handleDelete(id) {
    await deleteProduit(id)
    setConfirmDelete(null)
  }

  function getStockBadge(produit) {
    if (produit.stock === 0) return <Badge variant="red">Rupture</Badge>
    if (produit.stock <= produit.seuil_alerte) return <Badge variant="yellow">Stock bas</Badge>
    return <Badge variant="green">En stock</Badge>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-500 text-sm mt-0.5">{produits.length} produit{produits.length > 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openNew} size="md">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau produit
        </Button>
      </div>

      {/* Recherche */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher un produit..."
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
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-500 font-medium">Aucun produit trouvé</p>
            <p className="text-gray-400 text-sm mt-1">Commencez par ajouter votre premier produit</p>
            <Button onClick={openNew} className="mt-4">Ajouter un produit</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(produit => (
            <Card key={produit.id} padding={false} className="overflow-hidden">
              {/* Photo */}
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {produit.photo_url ? (
                  <img src={produit.photo_url} alt={produit.nom} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}
                <div className="absolute top-2 right-2">
                  {getStockBadge(produit)}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 truncate">{produit.nom}</h3>
                  <span className="font-bold text-orange-500 shrink-0">{formatMoney(produit.prix_conseille)}</span>
                </div>
                {produit.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{produit.description}</p>
                )}
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-gray-500">
                    Stock : <strong className={produit.stock <= produit.seuil_alerte ? 'text-red-500' : 'text-gray-900'}>{produit.stock}</strong>
                  </span>
                  <span className="text-gray-400 text-xs">Seuil alerte : {produit.seuil_alerte}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(produit)}>
                    Modifier
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setConfirmDelete(produit)}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selected ? 'Modifier le produit' : 'Nouveau produit'}
        size="md"
      >
        <ProduitForm
          produit={selected}
          onSave={async (values, photoFile) => {
            if (selected) await updateProduit(selected.id, values, photoFile)
            else await createProduit(values, photoFile)
            setModalOpen(false)
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Modal confirmation suppression */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Supprimer le produit"
        size="sm"
      >
        <p className="text-gray-600 mb-5">
          Supprimer <strong>{confirmDelete?.nom}</strong> ? Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(null)}>Annuler</Button>
          <Button variant="danger" className="flex-1" onClick={() => handleDelete(confirmDelete.id)}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  )
}
