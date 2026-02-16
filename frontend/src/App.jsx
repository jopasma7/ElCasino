import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Gallery from './pages/Gallery'
import DailyMenu from './pages/DailyMenu'
import Order from './pages/Order'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import TPV from './pages/TPV'
import Account from './pages/Account'
import Members from './pages/Members'
import GestionReservas from './pages/admin/GestionReservas'
import Reservas from './pages/Reservas'

import { useEffect } from 'react';
function AppLayout() {
  const location = useLocation();
  const hideFooter = location.pathname === '/tpv' || location.pathname === '/menu-del-dia';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/galeria" element={<Gallery />} />
          <Route path="/menu-del-dia" element={<DailyMenu />} />
          <Route path="/pedido" element={<Order />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/cuenta" element={<Account />} />
          <Route path="/login" element={<Account />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/tpv" element={<TPV />} />
          <Route path="/miembros" element={<Members />} />
          <Route path="/admin/reservas" element={<GestionReservas />} />
          <Route path="/reservas" element={<Reservas />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;