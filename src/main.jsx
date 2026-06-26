import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { isConfigured } from './lib/supabase.js'

function SetupScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #FFF8F0 0%, #fff 100%)', fontFamily: '-apple-system, sans-serif', padding: '20px'
    }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, background: '#FF6B00', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 28, fontWeight: 'bold', margin: '0 auto 16px'
          }}>V</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: '0 0 8px' }}>SD-ECOMMERCE — Configuration</h1>
          <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Connectez votre projet Supabase pour commencer</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0', padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 16px' }}>Étapes de configuration</h2>

          {[
            { n: 1, title: 'Créer un projet Supabase', desc: 'Rendez-vous sur supabase.com et créez un nouveau projet (gratuit).' },
            { n: 2, title: 'Exécuter le schéma SQL', desc: 'Dans votre projet Supabase → SQL Editor, collez le contenu du fichier supabase-schema.sql fourni.' },
            { n: 3, title: 'Créer le bucket Storage', desc: 'Supabase → Storage → New bucket → Nom : "produits-photos" → Public : OUI' },
            { n: 4, title: 'Configurer le fichier .env', desc: 'Copiez vos clés Supabase dans le fichier .env à la racine du projet :' },
            { n: 5, title: 'Créer un compte admin', desc: 'Supabase → Authentication → Users → Add user → entrez votre email et mot de passe.' },
          ].map(step => (
            <div key={step.n} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, background: '#FF6B00', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 1
              }}>{step.n}</div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: '#111' }}>{step.title}</p>
                <p style={{ margin: 0, fontSize: 13, color: '#666', lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            </div>
          ))}

          <div style={{ background: '#1a1a2e', borderRadius: 10, padding: '12px 16px', marginTop: 8, fontFamily: 'monospace', fontSize: 12, lineHeight: 2 }}>
            <span style={{ color: '#888' }}># fichier .env</span><br/>
            <span style={{ color: '#7dd3fc' }}>VITE_SUPABASE_URL</span>
            <span style={{ color: '#fff' }}>=https://xxxx.supabase.co</span><br/>
            <span style={{ color: '#7dd3fc' }}>VITE_SUPABASE_ANON_KEY</span>
            <span style={{ color: '#fff' }}>=eyJ...</span>
          </div>

          <div style={{ marginTop: 16, padding: '10px 14px', background: '#FFF8F0', borderRadius: 10, border: '1px solid #FFD9A8', fontSize: 13, color: '#994400' }}>
            💡 Après avoir rempli le <strong>.env</strong>, relancez le serveur dev avec <code style={{ background: '#FFE8CC', padding: '1px 6px', borderRadius: 4 }}>npm run dev</code>
          </div>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isConfigured ? <App /> : <SetupScreen />}
  </StrictMode>,
)
