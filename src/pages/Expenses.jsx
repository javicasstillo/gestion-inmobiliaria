import { useState, useEffect } from 'react';
import { expensesApi, propertiesApi } from '../api';
import { Plus, Search, Wrench, Edit2, Trash2, X } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n || 0);
const CATEGORIES = ['Reparación','Mantenimiento','Impuesto','Servicios','Seguro','Comisión','Limpieza','Otros'];
const CAT_ICONS = { 'Reparación':'🔧','Mantenimiento':'🏗️','Impuesto':'📋','Servicios':'💡','Seguro':'🛡️','Comisión':'💼','Limpieza':'🧹','Otros':'📦' };
const EMPTY = { propertyId: '', category: 'Reparación', description: '', amount: '', currency: 'ARS', date: '', paidBy: 'propietario', notes: '' };

function Modal({ expense, properties, onClose, onSave, saving }) {
  const [form, setForm] = useState(expense || EMPTY);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header"><h3>{expense ? 'Editar Gasto' : 'Nuevo Gasto'}</h3><button className="btn btn-sm btn-secondary" onClick={onClose}><X size={14} /></button></div>
        <div className="modal-body">
          <div className="form-grid form-grid-2">
            <div className="form-group"><label className="form-label">Propiedad</label><select className="form-input" value={form.propertyId} onChange={e => set('propertyId', e.target.value)}><option value="">Seleccionar...</option>{properties.map(p => <option key={p.id} value={p.id}>{p.address?.split(',')[0]}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Categoría</label><select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div className="form-group"><label className="form-label">Descripción</label><input className="form-input" placeholder="Ej: Arreglo de cañería..." value={form.description} onChange={e => set('description', e.target.value)} autoFocus /></div>
          <div className="form-grid form-grid-2">
            <div className="form-group"><label className="form-label">Importe</label><input className="form-input" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Moneda</label><select className="form-input" value={form.currency} onChange={e => set('currency', e.target.value)}><option value="ARS">ARS</option><option value="USD">USD</option></select></div>
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group"><label className="form-label">Fecha</label><input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Pagado por</label><select className="form-input" value={form.paidBy} onChange={e => set('paidBy', e.target.value)}><option value="propietario">Propietario</option><option value="inquilino">Inquilino</option><option value="administración">Administración</option></select></div>
          </div>
          <div className="form-group"><label className="form-label">Notas</label><textarea className="form-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={saving} onClick={() => { if (form.description && form.amount) onSave(form); }}>{saving ? 'Guardando...' : expense ? 'Guardar' : 'Registrar gasto'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('todas');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u1 = expensesApi.subscribe(setExpenses);
    const u2 = propertiesApi.subscribe(setProperties);
    return () => { u1(); u2(); };
  }, []);

  const getProp = (id) => properties.find(p => p.id === id);
  const filtered = expenses.filter(e => {
    const q = search.toLowerCase();
    return (e.description?.toLowerCase().includes(q) || getProp(e.propertyId)?.address?.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q)) && (filterCat === 'todas' || e.category === filterCat);
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal === 'new') await expensesApi.add(form);
      else await expensesApi.update(modal.id, form);
      setModal(null);
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar?')) return;
    try { await expensesApi.remove(id); } catch (e) { alert(e.message); }
  };

  const byCat = CATEGORIES.map(cat => ({ cat, total: expenses.filter(e => e.category === cat).reduce((a,e) => a+Number(e.amount||0), 0), count: expenses.filter(e => e.category === cat).length })).filter(c => c.count > 0).sort((a,b) => b.total - a.total);

  return (
    <>
      <div className="page-header">
        <div><h2>Gastos y Mantenimiento</h2><p>Control de egresos por propiedad</p></div>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={15} /> Registrar gasto</button>
      </div>
      <div className="page-body fade-up">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          <div>
            <div className="toolbar">
              <div className="search-box"><Search className="search-icon" /><input className="form-input" placeholder="Buscar gasto..." value={search} onChange={e => setSearch(e.target.value)} /></div>
              <select className="form-input" style={{ width: 'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}><option value="todas">Todas</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
            </div>
            {filtered.length === 0 ? <div className="empty-state"><Wrench size={48} /><h4>No hay gastos</h4></div> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Cat.</th><th>Propiedad</th><th>Descripción</th><th>Importe</th><th>Fecha</th><th>Pagado por</th><th></th></tr></thead>
                  <tbody>
                    {filtered.map(e => { const prop = getProp(e.propertyId); return (
                      <tr key={e.id}>
                        <td><span style={{ fontSize: 16, marginRight: 6 }}>{CAT_ICONS[e.category]||'📦'}</span><span style={{ fontSize: 11, color: 'var(--text2)' }}>{e.category}</span></td>
                        <td style={{ fontSize: 13 }}>{prop?.address?.split(',')[0]||'—'}</td>
                        <td style={{ fontWeight: 500 }}>{e.description}</td>
                        <td style={{ fontFamily: 'Bebas Neue', color: 'var(--red)', fontSize: 15 }}>{fmt(e.amount)}</td>
                        <td style={{ fontSize: 12, color: 'var(--text2)' }}>{e.date}</td>
                        <td style={{ fontSize: 12, color: 'var(--text3)' }}>{e.paidBy}</td>
                        <td><div style={{ display: 'flex', gap: 6 }}><button className="btn btn-sm btn-secondary" onClick={() => setModal(e)}><Edit2 size={12} /></button><button className="btn btn-sm btn-danger" onClick={() => handleDelete(e.id)}><Trash2 size={12} /></button></div></td>
                      </tr>
                    ); })}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ textAlign: 'right', marginTop: 12, color: 'var(--text2)', fontSize: 13 }}>Total: <strong style={{ color: 'var(--red)', fontFamily: 'Bebas Neue', fontSize: 16 }}>{fmt(filtered.reduce((a,e)=>a+Number(e.amount||0),0))}</strong></div>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>Por categoría</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {byCat.map(c => (
                <div key={c.cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg3)', borderRadius: 8 }}>
                  <div><span style={{ marginRight: 6 }}>{CAT_ICONS[c.cat]}</span><span style={{ fontSize: 12 }}>{c.cat}</span><span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 5 }}>({c.count})</span></div>
                  <span style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'Bebas Neue' }}>{fmt(c.total)}</span>
                </div>
              ))}
              {byCat.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13 }}>Sin gastos aún</p>}
              {byCat.length > 0 && <div style={{ padding: '10px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>TOTAL</span>
                <span style={{ fontFamily: 'Bebas Neue', color: 'var(--red)', fontSize: 16 }}>{fmt(expenses.reduce((a,e)=>a+Number(e.amount||0),0))}</span>
              </div>}
            </div>
          </div>
        </div>
      </div>
      {modal && <Modal expense={modal==='new'?null:modal} properties={properties} onClose={() => setModal(null)} onSave={handleSave} saving={saving} />}
    </>
  );
}
