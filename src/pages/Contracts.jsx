import { useState, useEffect, useRef } from 'react';
import { contractsApi, propertiesApi, tenantsApi } from '../api';
import { Plus, Search, FileText, Edit2, Trash2, X, AlertTriangle, Paperclip, Eye, Trash, Download } from 'lucide-react';
import firmaPropietario from '../assets/firma.png';

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n || 0);
const INDICES = ['ICL','IPC','CasaPropia','CAC','CER','IS','IPIM','UVA','Otro'];
const EMPTY = { propertyId: '', tenantId: '', startDate: '', endDate: '', monthlyRent: '', currency: 'ARS', depositMonths: '1', adjustIndex: 'ICL', adjustPeriod: 'trimestral', status: 'vigente', notes: '', docs: [] };

function exportToPDF(contract, prop, tenant) {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Contrato — ${prop?.address || ''}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a2e; padding: 40px; }
        .header { text-align: center; margin-bottom: 36px; border-bottom: 2px solid #3d1f8a; padding-bottom: 20px; }
        .header h1 { font-size: 26px; color: #3d1f8a; letter-spacing: 2px; margin-bottom: 4px; }
        .header p { color: #666; font-size: 12px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #3d1f8a; border-bottom: 1px solid #e0d9f5; padding-bottom: 6px; margin-bottom: 14px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
        .item label { font-size: 10px; font-weight: 600; text-transform: uppercase; color: #888; display: block; margin-bottom: 2px; }
        .item span { font-size: 13px; color: #1a1a2e; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #ede8fc; color: #3d1f8a; }
        .notes { background: #f5f3fa; border-radius: 8px; padding: 14px; font-size: 13px; color: #444; line-height: 1.6; }
        .footer { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .firma { border-top: 1px solid #ccc; padding-top: 8px; text-align: center; font-size: 11px; color: #888; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CONTRATO DE ALQUILER</h1>
        <p>Generado el ${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>

      <div class="section">
        <div class="section-title">Propiedad</div>
        <div class="grid">
          <div class="item"><label>Dirección</label><span>${prop?.address || '—'}</span></div>
          <div class="item"><label>Tipo</label><span>${prop?.type || '—'}</span></div>
          <div class="item"><label>Barrio / Zona</label><span>${prop?.neighborhood || '—'}</span></div>
          <div class="item"><label>Superficie</label><span>${prop?.area ? prop.area + ' m²' : '—'}</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Inquilino</div>
        <div class="grid">
          <div class="item"><label>Nombre</label><span>${tenant?.name || '—'}</span></div>
          <div class="item"><label>DNI / CUIT</label><span>${tenant?.dni || '—'}</span></div>
          <div class="item"><label>Teléfono</label><span>${tenant?.phone || '—'}</span></div>
          <div class="item"><label>Email</label><span>${tenant?.email || '—'}</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Condiciones del contrato</div>
        <div class="grid">
          <div class="item"><label>Fecha inicio</label><span>${contract.startDate || '—'}</span></div>
          <div class="item"><label>Fecha fin</label><span>${contract.endDate || '—'}</span></div>
          <div class="item"><label>Alquiler mensual</label><span>${fmt(contract.monthlyRent)} ${contract.currency}</span></div>
          <div class="item"><label>Depósito</label><span>${contract.depositMonths} ${contract.depositMonths == 1 ? 'mes' : 'meses'}</span></div>
          <div class="item"><label>Índice de ajuste</label><span>${contract.adjustIndex || '—'}</span></div>
          <div class="item"><label>Periodicidad</label><span>${contract.adjustPeriod || '—'}</span></div>
          <div class="item"><label>Estado</label><span class="badge">${contract.status}</span></div>
        </div>
      </div>

      ${contract.notes ? `
      <div class="section">
        <div class="section-title">Notas y observaciones</div>
        <div class="notes">${contract.notes}</div>
      </div>` : ''}

      <div class="footer">
        <div class="firma">
          <img src="${firmaPropietario}" style="height: 60px; object-fit: contain; margin-bottom: 8px;" /><br/>
          Firma del propietario
        </div>
        <div class="firma" style="padding-top: 68px;">
          Firma del inquilino — ${tenant?.name || ''}
        </div>
      </div>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
}

function DocUploader({ docs = [], onChange }) {
  const ref = useRef();
  const handleFiles = (e) => {
    const files = Array.from(e.target.files); let pending = files.length; const newDocs = [];
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} supera 5MB`); pending--; return; }
      const reader = new FileReader();
      reader.onload = (ev) => { newDocs.push({ name: file.name, type: file.type, data: ev.target.result }); if (--pending === 0) onChange([...docs, ...newDocs]); };
      reader.readAsDataURL(file);
    }); e.target.value = '';
  };
  const viewDoc = (doc) => { const w = window.open(); w.document.write(`<img src="${doc.data}" style="max-width:100%" />`); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label className="form-label" style={{ margin: 0 }}>Papelería ({docs.length})</label>
        <button type="button" className="btn btn-sm btn-secondary" onClick={() => ref.current.click()}><Paperclip size={12} /> Agregar</button>
      </div>
      {docs.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
          {docs.map((doc, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border2)', background: 'var(--bg3)', aspectRatio: '3/4' }}>
              {doc.type?.startsWith('image/') ? <img src={doc.data} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><FileText size={24} color="var(--text3)" /></div>}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '3px 5px' }}><div style={{ fontSize: 9, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div></div>
              <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 3 }}>
                <button type="button" onClick={() => viewDoc(doc)} style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 4, padding: '3px 5px', cursor: 'pointer' }}><Eye size={10} /></button>
                <button type="button" onClick={() => onChange(docs.filter((_,j)=>j!==i))} style={{ background: 'rgba(192,57,43,0.9)', border: 'none', borderRadius: 4, padding: '3px 5px', cursor: 'pointer', color: '#fff' }}><Trash size={10} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div onClick={() => ref.current.click()} style={{ border: '2px dashed var(--border2)', borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer', color: 'var(--text3)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}>
          <Paperclip size={22} style={{ marginBottom: 6, opacity: 0.4 }} /><div style={{ fontSize: 13 }}>Subir fotos del contrato</div><div style={{ fontSize: 11 }}>JPG, PNG · máx 5MB</div>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />
    </div>
  );
}

function Modal({ contract, properties, tenants, onClose, onSave, saving }) {
  const [form, setForm] = useState(contract ? { ...EMPTY, ...contract, docs: contract.docs || [] } : EMPTY);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header"><h3>{contract ? 'Editar Contrato' : 'Nuevo Contrato'}</h3><button className="btn btn-sm btn-secondary" onClick={onClose}><X size={14} /></button></div>
        <div className="modal-body">
          <div className="form-grid form-grid-2">
            <div className="form-group"><label className="form-label">Propiedad</label><select className="form-input" value={form.propertyId} onChange={e => set('propertyId', e.target.value)}><option value="">Seleccionar...</option>{properties.map(p => <option key={p.id} value={p.id}>{p.address?.split(',')[0]}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Inquilino</label><select className="form-input" value={form.tenantId} onChange={e => set('tenantId', e.target.value)}><option value="">Seleccionar...</option>{tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group"><label className="form-label">Fecha inicio</label><input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Fecha fin</label><input className="form-input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group"><label className="form-label">Alquiler mensual</label><input className="form-input" type="number" placeholder="320000" value={form.monthlyRent} onChange={e => set('monthlyRent', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Moneda</label><select className="form-input" value={form.currency} onChange={e => set('currency', e.target.value)}><option value="ARS">ARS – Pesos</option><option value="USD">USD – Dólares</option></select></div>
          </div>
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text3)' }}>Cláusula de ajuste</div>
            <div className="form-grid form-grid-2">
              <div className="form-group"><label className="form-label">Índice</label><select className="form-input" value={form.adjustIndex} onChange={e => set('adjustIndex', e.target.value)}>{INDICES.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Periodicidad</label><select className="form-input" value={form.adjustPeriod} onChange={e => set('adjustPeriod', e.target.value)}>{['mensual','bimestral','trimestral','cuatrimestral','semestral','anual'].map(p => <option key={p}>{p}</option>)}</select></div>
            </div>
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group"><label className="form-label">Meses de depósito</label><input className="form-input" type="number" min="0" max="6" value={form.depositMonths} onChange={e => set('depositMonths', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Estado</label><select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}><option value="vigente">Vigente</option><option value="vencido">Vencido</option><option value="rescindido">Rescindido</option></select></div>
          </div>
          <div className="form-group"><label className="form-label">Notas</label><textarea className="form-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} /></div>
          <DocUploader docs={form.docs} onChange={v => set('docs', v)} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={saving} onClick={() => { if (form.propertyId && form.tenantId && form.monthlyRent) onSave(form); }}>{saving ? 'Guardando...' : contract ? 'Guardar cambios' : 'Crear contrato'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u1 = contractsApi.subscribe(setContracts);
    const u2 = propertiesApi.subscribe(setProperties);
    const u3 = tenantsApi.subscribe(setTenants);
    return () => { u1(); u2(); u3(); };
  }, []);

  const getProp = (id) => properties.find(p => p.id === id);
  const getTenant = (id) => tenants.find(t => t.id === id);
  const today = new Date();
  const daysLeft = (d) => d ? Math.ceil((new Date(d) - today) / 86400000) : null;

  const filtered = contracts.filter(c => {
    const q = search.toLowerCase();
    return getProp(c.propertyId)?.address?.toLowerCase().includes(q) || getTenant(c.tenantId)?.name?.toLowerCase().includes(q);
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal === 'new') await contractsApi.add(form);
      else await contractsApi.update(modal.id, form);
      setModal(null);
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este contrato?')) return;
    try { await contractsApi.remove(id); } catch (e) { alert(e.message); }
  };

  const statusBadge = (s) => ({ vigente: 'green', vencido: 'red', rescindido: 'gray' }[s] || 'gray');

  return (
    <>
      <div className="page-header">
        <div><h2>Contratos</h2><p>{contracts.filter(c => c.status === 'vigente').length} vigentes de {contracts.length} total</p></div>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={15} /> Nuevo contrato</button>
      </div>
      <div className="page-body fade-up">
        <div className="toolbar"><div className="search-box"><Search className="search-icon" /><input className="form-input" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
        {filtered.length === 0 ? <div className="empty-state"><FileText size={48} /><h4>No hay contratos</h4></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Propiedad</th><th>Inquilino</th><th>Vigencia</th><th>Alquiler</th><th>Ajuste</th><th>Estado</th><th>Vto.</th><th>Docs</th><th></th></tr></thead>
              <tbody>
                {filtered.map(c => {
                  const prop = getProp(c.propertyId); const tenant = getTenant(c.tenantId);
                  const days = daysLeft(c.endDate); const expiring = c.status === 'vigente' && days !== null && days >= 0 && days <= 60;
                  return (
                    <tr key={c.id}>
                      <td><div style={{ fontWeight: 500 }}>{prop?.address?.split(',')[0] || '—'}</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>{prop?.type}</div></td>
                      <td>{tenant?.name || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text2)' }}>{c.startDate} → {c.endDate}</td>
                      <td style={{ fontFamily: 'Bebas Neue', color: 'var(--accent)', fontSize: 15 }}>{fmt(c.monthlyRent)}</td>
                      <td><div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="badge badge-blue" style={{ fontSize: 10 }}>{c.adjustIndex || '—'}</span><span style={{ fontSize: 10, color: 'var(--text3)' }}>{c.adjustPeriod}</span></div></td>
                      <td><span className={`badge badge-${statusBadge(c.status)}`}>{c.status}</span></td>
                      <td>{expiring ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--accent)', fontSize: 12 }}><AlertTriangle size={12} /> {days}d</span> : <span style={{ color: 'var(--text3)', fontSize: 12 }}>{days !== null ? (days > 0 ? `${days}d` : 'Vencido') : '—'}</span>}</td>
                      <td>{(c.docs?.length || 0) > 0 ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent)' }}><Paperclip size={12} />{c.docs.length}</span> : <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm btn-secondary" title="Exportar PDF" onClick={() => exportToPDF(c, getProp(c.propertyId), getTenant(c.tenantId))}><Download size={12} /></button>
                          <button className="btn btn-sm btn-secondary" onClick={() => setModal(c)}><Edit2 size={12} /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && <Modal contract={modal === 'new' ? null : modal} properties={properties} tenants={tenants} onClose={() => setModal(null)} onSave={handleSave} saving={saving} />}
    </>
  );
}