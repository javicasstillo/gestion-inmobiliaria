import { useState, useEffect } from 'react';
import { paymentsApi, contractsApi, propertiesApi, tenantsApi } from '../api';
import { Plus, Search, DollarSign, Edit2, Trash2, X, CheckCircle } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n || 0);
const EMPTY = { contractId: '', propertyId: '', tenantId: '', month: '', dueDate: '', paidDate: '', amount: '', currency: 'ARS', status: 'pendiente', notes: '' };

function Modal({ payment, contracts, properties, tenants, onClose, onSave, saving }) {
  const [form, setForm] = useState(payment || EMPTY);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleContract = (id) => {
    const c = contracts.find(c => c.id === id);
    if (c) setForm(f => ({ ...f, contractId: id, propertyId: c.propertyId, tenantId: c.tenantId, amount: c.monthlyRent, currency: c.currency }));
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><h3>{payment ? 'Editar Pago' : 'Registrar Pago'}</h3><button className="btn btn-sm btn-secondary" onClick={onClose}><X size={14} /></button></div>
        <div className="modal-body">
          <div className="form-group"><label className="form-label">Contrato</label>
            <select className="form-input" value={form.contractId} onChange={e => handleContract(e.target.value)}>
              <option value="">Seleccionar...</option>
              {contracts.filter(c => c.status === 'vigente').map(c => { const p = properties.find(p=>p.id===c.propertyId); const t = tenants.find(t=>t.id===c.tenantId); return <option key={c.id} value={c.id}>{p?.address?.split(',')[0]} — {t?.name}</option>; })}
            </select>
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group"><label className="form-label">Mes / Período</label><input className="form-input" placeholder="Abril 2025" value={form.month} onChange={e => set('month', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Estado</label><select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}><option value="pendiente">Pendiente</option><option value="pagado">Pagado</option><option value="vencido">Vencido</option></select></div>
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group"><label className="form-label">Importe</label><input className="form-input" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Moneda</label><select className="form-input" value={form.currency} onChange={e => set('currency', e.target.value)}><option value="ARS">ARS</option><option value="USD">USD</option></select></div>
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group"><label className="form-label">Fecha vencimiento</label><input className="form-input" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Fecha de pago</label><input className="form-input" type="date" value={form.paidDate || ''} onChange={e => set('paidDate', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Notas</label><textarea className="form-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={saving} onClick={() => { if (form.amount) onSave(form); }}>{saving ? 'Guardando...' : payment ? 'Guardar' : 'Registrar'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u1 = paymentsApi.subscribe(setPayments);
    const u2 = contractsApi.subscribe(setContracts);
    const u3 = propertiesApi.subscribe(setProperties);
    const u4 = tenantsApi.subscribe(setTenants);
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  const getProp = (id) => properties.find(p => p.id === id);
  const getTenant = (id) => tenants.find(t => t.id === id);

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    return (getProp(p.propertyId)?.address?.toLowerCase().includes(q) || getTenant(p.tenantId)?.name?.toLowerCase().includes(q) || p.month?.toLowerCase().includes(q)) && (filterStatus === 'todos' || p.status === filterStatus);
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal === 'new') await paymentsApi.add(form);
      else await paymentsApi.update(modal.id, form);
      setModal(null);
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar?')) return;
    try { await paymentsApi.remove(id); } catch (e) { alert(e.message); }
  };

  const markPaid = async (p) => {
    try { await paymentsApi.update(p.id, { ...p, status: 'pagado', paidDate: new Date().toISOString().split('T')[0] }); } catch (e) { alert(e.message); }
  };

  const totalPagado = payments.filter(p => p.status === 'pagado').reduce((a, p) => a + Number(p.amount || 0), 0);
  const totalPendiente = payments.filter(p => p.status !== 'pagado').reduce((a, p) => a + Number(p.amount || 0), 0);
  const statusBadge = (s) => ({ pagado: 'green', pendiente: 'yellow', vencido: 'red' }[s] || 'gray');

  return (
    <>
      <div className="page-header">
        <div><h2>Cobros y Pagos</h2><p>Historial de alquileres</p></div>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={15} /> Registrar pago</button>
      </div>
      <div className="page-body fade-up">
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
          <div className="stat-card"><div className="stat-label">Total cobrado</div><div className="stat-value" style={{ fontSize: 20, color: 'var(--green)' }}>{fmt(totalPagado)}</div></div>
          <div className="stat-card"><div className="stat-label">Pendiente</div><div className="stat-value" style={{ fontSize: 20, color: 'var(--accent)' }}>{fmt(totalPendiente)}</div></div>
          <div className="stat-card"><div className="stat-label">Registros</div><div className="stat-value">{payments.length}</div></div>
        </div>
        <div className="toolbar">
          <div className="search-box"><Search className="search-icon" /><input className="form-input" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          {['todos','pagado','pendiente','vencido'].map(f => <button key={f} className={`btn btn-sm ${filterStatus===f?'btn-primary':'btn-secondary'}`} onClick={() => setFilterStatus(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>)}
        </div>
        {filtered.length === 0 ? <div className="empty-state"><DollarSign size={48} /><h4>No hay pagos</h4></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Propiedad</th><th>Inquilino</th><th>Período</th><th>Importe</th><th>Vence</th><th>Cobrado</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {filtered.map(p => {
                  const prop = getProp(p.propertyId); const tenant = getTenant(p.tenantId);
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{prop?.address?.split(',')[0] || '—'}</td>
                      <td>{tenant?.name || '—'}</td>
                      <td style={{ color: 'var(--text2)', fontSize: 12 }}>{p.month}</td>
                      <td style={{ fontFamily: 'Bebas Neue', color: 'var(--accent)', fontSize: 15 }}>{fmt(p.amount)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text2)' }}>{p.dueDate}</td>
                      <td style={{ fontSize: 12, color: p.paidDate ? 'var(--green)' : 'var(--text3)' }}>{p.paidDate || '—'}</td>
                      <td><span className={`badge badge-${statusBadge(p.status)}`}>{p.status}</span></td>
                      <td><div style={{ display: 'flex', gap: 6 }}>
                        {p.status !== 'pagado' && <button className="btn btn-sm" style={{ background: 'var(--green-dim)', color: 'var(--green)', border: 'none' }} onClick={() => markPaid(p)}><CheckCircle size={12} /></button>}
                        <button className="btn btn-sm btn-secondary" onClick={() => setModal(p)}><Edit2 size={12} /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}><Trash2 size={12} /></button>
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && <Modal payment={modal==='new'?null:modal} contracts={contracts} properties={properties} tenants={tenants} onClose={() => setModal(null)} onSave={handleSave} saving={saving} />}
    </>
  );
}
