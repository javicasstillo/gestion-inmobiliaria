import { LayoutDashboard, Home, Users, FileText, DollarSign, Wrench, LogOut } from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
  { id: 'properties', label: 'Propiedades', icon: Home },
  { id: 'tenants', label: 'Inquilinos', icon: Users },
  { id: 'contracts', label: 'Contratos', icon: FileText },
  { id: 'payments', label: 'Cobros', icon: DollarSign },
  { id: 'expenses', label: 'Gastos', icon: Wrench },
];

export default function Sidebar({ page, onNavigate, onLogout, className = '' }) {
  return (
    <div className={`sidebar ${className}`}>
      <div className="sidebar-logo">
        <h1>Inmuebles</h1>
        <span>Gestión de propiedades</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menú</div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${page === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={onLogout} style={{ color: 'var(--red)', width: '100%' }}>
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}