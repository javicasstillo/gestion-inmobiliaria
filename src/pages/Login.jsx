import { useState } from 'react';
import { login } from '../firebase';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', pass: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.pass);
      // onAuthChange en App.jsx detecta el login automáticamente
    } catch (err) {
      setError('Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card fade-up">
        <div className="login-logo">
          <h1>Inmuebles</h1>
          <p>Gestión de propiedades</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="admin@tudominio.com" value={form.email}
              onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setError(''); }} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={show ? 'text' : 'password'} placeholder="••••••••"
                value={form.pass} onChange={e => { setForm(f => ({ ...f, pass: e.target.value })); setError(''); }}
                style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShow(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', padding: 0 }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" disabled={loading} className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4, fontSize: 15 }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
