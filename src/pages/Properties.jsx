import { useState, useEffect, useRef } from 'react';
import { propertiesApi } from '../api';
import { Plus, Search, Home, Edit2, Trash2, X, Camera, ImageOff } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n || 0);
const EMPTY = { type: 'Casa', address: '', neighborhood: '', rooms: '', bathrooms: '', area: '', price: '', currency: 'ARS', status: 'disponible', description: '', photo: null };
const EMOJIS = { Casa: '🏠', Departamento: '🏢', Local: '🏪', Cochera: '🚗', Terreno: '🌿' };

function PhotoUploader({ value, onChange }) {
  const ref = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('Máximo 3MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label className="form-label">Foto de portada</label>
      <div onClick={() => ref.current.click()} style={{ height: 160, borderRadius: 10, border: '2px dashed var(--border2)', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}>
        {value ? <img src={value} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
          <div style={{ textAlign: 'center', color: 'var(--text3)' }}><Camera size={28} style={{ marginBottom: 8, opacity: 0.5 }} /><div style={{ fontSize: 13 }}>Clic para subir foto</div><div style={{ fontSize: 11 }}>JPG, PNG · máx 3MB</div></div>}
      </div>
      {value && <button type="button" className="btn btn-sm btn-danger" style={{ alignSelf: 'flex-start' }} onClick={() => onChange(null)}><ImageOff size={12} /> Quitar foto</button>}
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

function Modal({ prop, onClose, onSave, saving }) {
  const [form, setForm] = useState(prop || EMPTY);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header"><h3>{prop ? 'Editar Propiedad' : 'Nueva Propiedad'}</h3><button className="btn btn-sm btn-secondary" onClick={onClose}><X size={14} /></button></div>
        <div className="modal-body">
          <PhotoUploader value={form.photo} onChange={v => set('photo', v)} />
          <div className="form-grid form-grid-2">
            <div className="form-group"><label className="form-label">Tipo</label><select className="form-input" value={form.type} onChange={e => set('type', e.target.value)}>{Object.keys(EMOJIS).map(t => <option key={t}>{t}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Estado</label><select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}><option value="disponible">Disponible</option><option value="alquilada">Alquilada</option><option value="en mantenimiento">En mantenimiento</option><option value="reservada">Reservada</option></select></div>
          </div>
          <div className="form-group"><label className="form-label">Dirección</label><input className="form-input" placeholder="Av. San Martín 450, Mendoza" value={form.address} onChange={e => set('address', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Barrio / Zona</label><input className="form-input" placeholder="Centro, Godoy Cruz..." value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} /></div>
          <div className="form-grid form-grid-3">
            <div className="form-group"><label className="form-label">Ambientes</label><input className="form-input" type="number" min="1" placeholder="3" value={form.rooms} onChange={e => set('rooms', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Baños</label><input className="form-input" type="number" min="1" placeholder="1" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Superficie m²</label><input className="form-input" type="number" placeholder="85" value={form.area} onChange={e => set('area', e.target.value)} /></div>
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group"><label className="form-label">Alquiler mensual</label><input className="form-input" type="number" placeholder="320000" value={form.price} onChange={e => set('price', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Moneda</label><select className="form-input" value={form.currency} onChange={e => set('currency', e.target.value)}><option value="ARS">ARS – Pesos</option><option value="USD">USD – Dólares</option></select></div>
          </div>
          <div className="form-group"><label className="form-label">Descripción / Notas</label><textarea className="form-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={saving} onClick={() => { if (form.address) onSave(form); }}>{saving ? 'Guardando...' : prop ? 'Guardar cambios' : 'Crear propiedad'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todas');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => propertiesApi.subscribe(setProperties), []);

  const filtered = properties.filter(p => {
    const q = search.toLowerCase();
    return (p.address?.toLowerCase().includes(q) || p.neighborhood?.toLowerCase().includes(q)) && (filter === 'todas' || p.status === filter);
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal === 'new') await propertiesApi.add(form);
      else await propertiesApi.update(modal.id, form);
      setModal(null);
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta propiedad?')) return;
    try { await propertiesApi.remove(id); } catch (e) { alert(e.message); }
  };

  const badgeClass = (s) => ({ alquilada: 'green', disponible: 'blue', 'en mantenimiento': 'yellow', reservada: 'gray' }[s] || 'gray');

  return (
    <>
      <div className="page-header">
        <div><h2>Propiedades</h2><p>{properties.length} propiedades en cartera</p></div>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={15} /> Nueva propiedad</button>
      </div>
      <div className="page-body fade-up">
        <div className="toolbar">
          <div className="search-box"><Search className="search-icon" /><input className="form-input" placeholder="Buscar por dirección o zona..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          {['todas','disponible','alquilada','en mantenimiento'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        {filtered.length === 0 ? <div className="empty-state"><Home size={48} /><h4>No hay propiedades</h4><p>Agregá tu primera propiedad</p></div> : (
          <div className="prop-grid">
            {filtered.map(p => (
              <div key={p.id} className="prop-card">
                <div className="prop-card-img" style={{ position: 'relative' }}>
                  {p.photo ? <img src={p.photo} alt={p.address} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 40 }}>{EMOJIS[p.type] || '🏠'}</span>}
                  <div style={{ position: 'absolute', top: 10, right: 10 }}><span className={`badge badge-${badgeClass(p.status)}`}>{p.status}</span></div>
                </div>
                <div className="prop-card-body">
                  <div className="prop-card-title">{p.type}</div>
                  <div className="prop-card-addr">{p.address}</div>
                  <div className="chip-row">
                    {p.rooms && <span className="chip">{p.rooms} amb.</span>}
                    {p.bathrooms && <span className="chip">{p.bathrooms} baños</span>}
                    {p.area && <span className="chip">{p.area}m²</span>}
                    {p.neighborhood && <span className="chip">{p.neighborhood}</span>}
                  </div>
                  <div className="prop-card-footer">
                    <div className="prop-price">{fmt(p.price)}<span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Sans' }}>/mes</span></div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => setModal(p)}><Edit2 size={12} /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {modal && <Modal prop={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} saving={saving} />}
    </>
  );
}
