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

const PAGES = { dashboard: Dashboard, properties: Properties, tenants: Tenants, contracts: Contracts, payments: Payments, expenses: Expenses };

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [page, setPage] = useState('dashboard');

  useEffect(() => onAuthChange(setUser), []);

  if (user === undefined) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text3)' }}>
      Cargando...
    </div>
  );

  if (!user) return <Login />;

  const PageComponent = PAGES[page] || Dashboard;
  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={setPage} onLogout={logout} />
      <main className="main-content"><PageComponent /></main>
    </div>
  );
}
