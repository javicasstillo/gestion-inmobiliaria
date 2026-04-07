import { useState, useEffect } from 'react';
import { propertiesApi, tenantsApi, contractsApi, paymentsApi } from '../api';
import { Home, Users, TrendingUp, DollarSign, AlertTriangle, Clock } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n || 0);

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const u1 = propertiesApi.subscribe(setProperties);
    const u2 = tenantsApi.subscribe(setTenants);
    const u3 = contractsApi.subscribe(setContracts);
    const u4 = paymentsApi.subscribe(setPayments);
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  const vigentes = contracts.filter(c => c.status === 'vigente');
  const ingresosMes = vigentes.reduce((a, c) => a + Number(c.monthlyRent || 0), 0);
  const pagados = payments.filter(p => p.status === 'pagado').length;
  const pendientes = payments.filter(p => p.status === 'pendiente').length;
  const vencidos = payments.filter(p => p.status === 'vencido').length;

  const today = new Date();
  const expiring = contracts.filter(c => {
    if (c.status !== 'vigente' || !c.endDate) return false;
    const days = (new Date(c.endDate) - today) / 86400000;
    return days >= 0 && days <= 60;
  });
  const pendingPayments = payments.filter(p => p.status === 'pendiente' || p.status === 'vencido');

  const getProp = (id) => properties.find(p => p.id === id);
  const getTenant = (id) => tenants.find(t => t.id === id);

  return (
    <>
      <div className="page-header">
        <div><h2>Panel Principal</h2><p>Resumen general de tu cartera de propiedades</p></div>
      </div>
      <div className="page-body fade-up">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--accent-dim)' }}><Home size={18} color="var(--accent)" /></div>
            <div className="stat-label">Propiedades</div>
            <div className="stat-value">{properties.length}</div>
            <div className="stat-sub">{properties.filter(p => p.status === 'alquilada').length} alquiladas · {properties.filter(p => p.status === 'disponible').length} disponibles</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--accent-dim)' }}><Users size={18} color="var(--accent)" /></div>
            <div className="stat-label">Inquilinos</div>
            <div className="stat-value">{tenants.length}</div>
            <div className="stat-sub">{vigentes.length} contratos vigentes</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--green-dim)' }}><TrendingUp size={18} color="var(--accent)" /></div>
            <div className="stat-label">Ingreso mensual</div>
            <div className="stat-value" style={{ fontSize: 20 }}>{fmt(ingresosMes)}</div>
            <div className="stat-sub">Contratos vigentes</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--accent-dim)' }}>
              <DollarSign size={18} color="var(--accent)" />
            </div>
            <div className="stat-label">Cobros</div>
            <div className="stat-value">{pagados}</div>
            <div className="stat-sub">{pendientes} pendientes · {vencidos} vencidos</div>
          </div>
        </div>

        {(expiring.length > 0 || pendingPayments.length > 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {expiring.map(c => {
              const prop = getProp(c.propertyId);
              const days = Math.ceil((new Date(c.endDate) - today) / 86400000);
              return (
                <div key={c.id} className="alert alert-warning">
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Contrato de <strong>{prop?.address}</strong> vence en {days} días ({c.endDate})</span>
                </div>
              );
            })}
            {pendingPayments.map(p => {
              const prop = getProp(p.propertyId);
              const tenant = getTenant(p.tenantId);
              return (
                <div key={p.id} className="alert alert-danger">
                  <Clock size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Pago pendiente: <strong>{prop?.address}</strong> — {tenant?.name} — {p.month}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 20 }}>Últimos Cobros</h3>
            <p style={{ color: 'var(--text3)', fontSize: 12 }}>Estado de pagos recientes</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {payments.slice(0, 8).map(p => {
              const prop = getProp(p.propertyId);
              const tenant = getTenant(p.tenantId);
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{prop?.address?.split(',')[0]}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{tenant?.name} · {p.month}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, color: 'var(--accent)', fontFamily: 'Bebas Neue' }}>{fmt(p.amount)}</div>
                    <span className={`badge badge-${p.status === 'pagado' ? 'green' : p.status === 'pendiente' ? 'yellow' : 'red'}`} style={{ fontSize: 10 }}>{p.status}</span>
                  </div>
                </div>
              );
            })}
            {payments.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13 }}>Sin cobros registrados</p>}
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 20 }}>Estado de Propiedades</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {properties.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {p.photo
                    ? <img src={p.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 20 }}>{p.type === 'Casa' ? '🏠' : p.type === 'Departamento' ? '🏢' : '🏪'}</span>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.address}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.type} · {p.rooms} amb. · {p.area}m²</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, color: 'var(--accent)', fontFamily: 'Bebas Neue' }}>{fmt(p.price)}/mes</div>
                  <span className={`badge badge-${p.status === 'alquilada' ? 'green' : 'blue'}`} style={{ fontSize: 10 }}>{p.status}</span>
                </div>
              </div>
            ))}
            {properties.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13 }}>Sin propiedades cargadas</p>}
          </div>
        </div>
      </div>
    </>
  );
}