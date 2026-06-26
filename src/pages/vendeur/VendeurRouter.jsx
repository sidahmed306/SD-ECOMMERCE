import { useVendeur } from '../../contexts/VendeurContext'
import VendeurLogin from './Login'
import VendeurAccueil from './Accueil'

export default function VendeurRouter() {
  const { vendeur } = useVendeur()
  return vendeur ? <VendeurAccueil /> : <VendeurLogin />
}
