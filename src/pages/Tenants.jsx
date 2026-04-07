import { useState, useEffect } from 'react';
import { tenantsApi, contractsApi, propertiesApi } from '../api';
import { Plus, Search, Users, Edit2, Trash2, X, Phone, Mail } from 'lucide-react';

const EMPTY = { name: '', dni: '', phone: '', email: '', notes: '' };

function Modal({ tenant, onClose, onSave, saving }) {
  const [form, setForm] = useState(tenant || EMPTY);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><h3>{tenant ? 'Editar Inquilino' : 'Nuevo Inquilino'}</h3><button className="btn btn-sm btn-secondary" onClick={onClose}><X size={14} /></button></div>
        <div className="modal-body">
          <div className="form-group"><label className="form-label">Nombre / Razón social</label><input className="form-input" placeholder="Carlos Rodríguez" value={form.name} onChange={e => set('name', e.target.value)} autoFocus /></div>
          <div className="form-grid form-grid-2">
            <div className="form-group"><label className="form-label">DNI / CUIT</label><input className="form-input" placeholder="28.456.789" value={form.dni} onChange={e => set('dni', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Teléfono</label><input className="form-input" placeholder="261-555-1234" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="correo@mail.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Notas</label><textarea className="form-input" rows={3} value={form.notes || ''} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={saving} onClick={() => { if (form.name) onSave(form); }}>{saving ? 'Guardando...' : tenant ? 'Guardar cambios' : 'Crear inquilino'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u1 = tenantsApi.subscribe(setTenants);
    const u2 = contractsApi.subscribe(setContracts);
    const u3 = propertiesApi.subscribe(setProperties);
    return () => { u1(); u2(); u3(); };
  }, []);

  const filtered = tenants.filter(t => {
    const q = search.toLowerCase();
    return t.name?.toLowerCase().includes(q) || t.dni?.includes(q) || t.email?.toLowerCase().includes(q);
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal === 'new') await tenantsApi.add(form);
      else await tenantsApi.update(modal.id, form);
      setModal(null);
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este inquilino?')) return;
    try { await tenantsApi.remove(id); } catch (e) { alert(e.message); }
  };

  const getActiveProp = (tenantId) => {
    const c = contracts.find(c => c.tenantId === tenantId && c.status === 'vigente');
    return c ? properties.find(p => p.id === c.propertyId) : null;
  };

  const initials = (name) => name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const colors = ['#2e86c1', '#2d8a5e', '#9b7fc8', '#e05c5c', '#2e86c1'];

  return (
    <>
      <div className="page-header">
        <div><h2>Inquilinos</h2><p>{tenants.length} contactos registrados</p></div>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={15} /> Nuevo inquilino</button>
      </div>
      <div className="page-body fade-up">
        <div className="toolbar"><div className="search-box"><Search className="search-icon" /><input className="form-input" placeholder="Buscar por nombre, DNI o email..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
        {filtered.length === 0 ? <div className="empty-state"><Users size={48} /><h4>No hay inquilinos</h4></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Inquilino</th><th>DNI / CUIT</th><th>Contacto</th><th>Propiedad activa</th><th></th></tr></thead>
              <tbody>
                {filtered.map((t, i) => {
                  const prop = getActiveProp(t.id);
                  return (
                    <tr key={t.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: colors[i % colors.length] + '22', border: `1px solid ${colors[i % colors.length]}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: colors[i % colors.length], flexShrink: 0 }}>{initials(t.name)}</div>
                          <span style={{ fontWeight: 500 }}>{t.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text2)' }}>{t.dni || '—'}</td>
                      <td><div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {t.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)' }}><Phone size={11} />{t.phone}</span>}
                        {t.email && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)' }}><Mail size={11} />{t.email}</span>}
                      </div></td>
                      <td>{prop ? <span style={{ fontSize: 12 }}>{prop.address?.split(',')[0]}</span> : <span style={{ color: 'var(--text3)', fontSize: 12 }}>Sin contrato vigente</span>}</td>
                      <td><div style={{ display: 'flex', gap: 6 }}><button className="btn btn-sm btn-secondary" onClick={() => setModal(t)}><Edit2 size={12} /></button><button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.id)}><Trash2 size={12} /></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && <Modal tenant={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} saving={saving} />}
    </>
  );
}
