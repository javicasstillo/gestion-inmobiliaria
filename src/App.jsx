import { useState, useEffect } from 'react';
import './index.css';
import { auth, onAuthChange, logout } from './firebase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Contracts from './pages/Contracts';
import Payments from './pages/Payments';
import Expenses from './pages/Expenses';
import Sidebar from './components/Sidebar';
import { Menu } from 'lucide-react';

const PAGES = { dashboard: Dashboard, properties: Properties, tenants: Tenants, contracts: Contracts, payments: Payments, expenses: Expenses };

export default function App() {
  const [user, setUser] = useState(undefined);
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => onAuthChange(setUser), []);

  if (user === undefined) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text3)' }}>
      Cargando...
    </div>
  );

  if (!user) return <Login />;

  const PageComponent = PAGES[page] || Dashboard;

  const handleNavigate = (p) => {
    setPage(p);
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
        <Menu size={20} />
      </button>

      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        page={page}
        onNavigate={handleNavigate}
        onLogout={logout}
        className={sidebarOpen ? 'open' : ''}
      />

      <main className="main-content">
        <PageComponent />
      </main>
    </div>
  );
}