-- ============================================================
-- VENTEAPP — Schéma Supabase complet
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- 1. TABLE PRODUITS
CREATE TABLE IF NOT EXISTS produits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom             text NOT NULL,
  description     text,
  photo_url       text,
  prix_conseille  numeric(10,2) NOT NULL,
  stock           integer NOT NULL DEFAULT 0,
  seuil_alerte    integer NOT NULL DEFAULT 5,
  actif           boolean NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- 2. TABLE VENDEURS
CREATE TABLE IF NOT EXISTS vendeurs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         text NOT NULL,
  telephone   text NOT NULL,
  url_unique  text NOT NULL UNIQUE,
  actif       boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- 3. TABLE VENDEUR_PRODUITS (liaison many-to-many)
CREATE TABLE IF NOT EXISTS vendeur_produits (
  vendeur_id              uuid NOT NULL REFERENCES vendeurs(id) ON DELETE CASCADE,
  produit_id              uuid NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
  pourcentage_commission  numeric(5,2) NOT NULL DEFAULT 10,
  created_at              timestamptz DEFAULT now(),
  PRIMARY KEY (vendeur_id, produit_id)
);

-- 4. TABLE VENTES
CREATE TABLE IF NOT EXISTS ventes (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendeur_id           uuid NOT NULL REFERENCES vendeurs(id),
  produit_id           uuid NOT NULL REFERENCES produits(id),
  prix_vente           numeric(10,2) NOT NULL,
  commission_calculee  numeric(10,2) NOT NULL,
  pourcentage_applique numeric(5,2) NOT NULL,
  notes                text,
  date_vente           timestamptz DEFAULT now()
);

-- 5. INDEX utiles pour les performances
CREATE INDEX IF NOT EXISTS idx_ventes_vendeur_id ON ventes(vendeur_id);
CREATE INDEX IF NOT EXISTS idx_ventes_produit_id ON ventes(produit_id);
CREATE INDEX IF NOT EXISTS idx_ventes_date      ON ventes(date_vente DESC);
CREATE INDEX IF NOT EXISTS idx_vendeurs_url     ON vendeurs(url_unique);

-- 6. FONCTION pour décrémenter le stock (atomique, évite les race conditions)
CREATE OR REPLACE FUNCTION decrement_stock(produit_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE produits
  SET stock = GREATEST(stock - 1, 0)
  WHERE id = produit_id_param;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE produits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendeurs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendeur_produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventes          ENABLE ROW LEVEL SECURITY;

-- ADMIN : accès complet pour les utilisateurs authentifiés (Supabase Auth)
CREATE POLICY "admin_produits_all"        ON produits        FOR ALL  USING (auth.role() = 'authenticated');
CREATE POLICY "admin_vendeurs_all"        ON vendeurs        FOR ALL  USING (auth.role() = 'authenticated');
CREATE POLICY "admin_vendeur_produits_all" ON vendeur_produits FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_ventes_all"          ON ventes          FOR ALL  USING (auth.role() = 'authenticated');

-- VENDEUR (rôle anon) : lecture des produits publics via url_unique
-- Les opérations vendeur (INSERT ventes, lecture) passent par le client Supabase
-- avec service_role côté serveur OU via des policies anon permissives (voir note ci-dessous)

-- NOTE : Pour que les vendeurs puissent lire leurs données sans être auth,
-- ajoutez ces policies permissives (le contrôle se fait côté applicatif via url_unique + nom + tel) :

CREATE POLICY "vendeur_read_vendeurs"
  ON vendeurs FOR SELECT
  USING (actif = true);

CREATE POLICY "vendeur_read_vendeur_produits"
  ON vendeur_produits FOR SELECT
  USING (true);

CREATE POLICY "vendeur_read_produits"
  ON produits FOR SELECT
  USING (actif = true);

CREATE POLICY "vendeur_insert_vente"
  ON ventes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "vendeur_read_own_ventes"
  ON ventes FOR SELECT
  USING (true);

-- ============================================================
-- STORAGE — Bucket pour les photos produits
-- À créer dans Supabase Dashboard > Storage > New bucket
-- Nom : "produits-photos", Public : OUI
-- ============================================================

-- ============================================================
-- DONNÉES DE TEST (optionnel, à supprimer en production)
-- ============================================================

-- INSERT INTO produits (nom, description, prix_conseille, stock, seuil_alerte)
-- VALUES
--   ('Montre connectée', 'Montre sport bluetooth', 89.99, 50, 5),
--   ('Écouteurs sans fil', 'Qualité audio premium', 49.99, 30, 3),
--   ('Coque iPhone', 'Protection renforcée', 19.99, 100, 10);
