import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Beranda from './pages/Beranda'
import LiveScore from './pages/LiveScore'
import Hasil from './pages/Hasil'
import PesertaMasuk from './pages/PesertaMasuk'
import PesertaLomba from './pages/PesertaLomba'
import Admin from './pages/admin/Admin'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Beranda />} />
        <Route path="live" element={<Navigate to="/live/SD" replace />} />
        <Route path="live/:jenjang" element={<LiveScore />} />
        <Route path="hasil" element={<Hasil />} />
        <Route path="peserta" element={<PesertaMasuk />} />
        <Route path="peserta/lomba" element={<PesertaLomba />} />
        <Route path="admin/*" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
