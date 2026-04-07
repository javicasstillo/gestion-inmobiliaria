// Simple persistent store using localStorage
const KEYS = {
  auth: 'inmo_auth',
  properties: 'inmo_properties',
  tenants: 'inmo_tenants',
  contracts: 'inmo_contracts',
  payments: 'inmo_payments',
  expenses: 'inmo_expenses',
};

const seed = () => {
  const props = [
    { id: '1', type: 'Casa', address: 'Av. Mitre 1240, Mendoza', neighborhood: 'Centro', rooms: 3, bathrooms: 2, area: 85, price: 320000, currency: 'ARS', status: 'alquilada', description: 'Casa céntrica con jardín', createdAt: '2024-01-10' },
    { id: '2', type: 'Departamento', address: 'Av. San Martín 450 3°B, Mendoza', neighborhood: 'Centro', rooms: 2, bathrooms: 1, area: 58, price: 195000, currency: 'ARS', status: 'disponible', description: 'Dpto luminoso piso alto', createdAt: '2024-02-05' },
    { id: '3', type: 'Casa', address: 'Los Olmos 520, Godoy Cruz', neighborhood: 'Godoy Cruz', rooms: 4, bathrooms: 2, area: 120, price: 420000, currency: 'ARS', status: 'alquilada', description: 'Casa amplia con garage', createdAt: '2024-03-01' },
    { id: '4', type: 'Local', address: 'Gral. Paz 810, Mendoza', neighborhood: 'Centro', rooms: 1, bathrooms: 1, area: 40, price: 280000, currency: 'ARS', status: 'disponible', description: 'Local comercial céntrico', createdAt: '2024-03-20' },
  ];
  const tenants = [
    { id: '1', name: 'Carlos Rodríguez', dni: '28.456.789', phone: '261-555-1234', email: 'carlos.rodriguez@mail.com', createdAt: '2024-01-15' },
    { id: '2', name: 'María González', dni: '31.123.456', phone: '261-555-5678', email: 'mariagonzalez@gmail.com', createdAt: '2024-02-20' },
    { id: '3', name: 'Empresa SRL', dni: '30-71234567-9', phone: '261-444-9876', email: 'admin@empresasrl.com.ar', createdAt: '2024-03-05' },
  ];
  const contracts = [
    { id: '1', propertyId: '1', tenantId: '1', startDate: '2024-02-01', endDate: '2025-01-31', monthlyRent: 320000, currency: 'ARS', depositMonths: 2, status: 'vigente', notes: 'Ajuste trimestral por IPC', createdAt: '2024-01-28' },
    { id: '2', propertyId: '3', tenantId: '2', startDate: '2024-03-15', endDate: '2025-03-14', monthlyRent: 420000, currency: 'ARS', depositMonths: 1, status: 'vigente', notes: '', createdAt: '2024-03-10' },
  ];
  const payments = [
    { id: '1', contractId: '1', propertyId: '1', tenantId: '1', amount: 320000, currency: 'ARS', dueDate: '2025-01-05', paidDate: '2025-01-04', status: 'pagado', month: 'Enero 2025', notes: '' },
    { id: '2', contractId: '1', propertyId: '1', tenantId: '1', amount: 320000, currency: 'ARS', dueDate: '2025-02-05', paidDate: '2025-02-08', status: 'pagado', month: 'Febrero 2025', notes: 'Pagó 3 días tarde' },
    { id: '3', contractId: '1', propertyId: '1', tenantId: '1', amount: 320000, currency: 'ARS', dueDate: '2025-03-05', paidDate: null, status: 'pendiente', month: 'Marzo 2025', notes: '' },
    { id: '4', contractId: '2', propertyId: '3', tenantId: '2', amount: 420000, currency: 'ARS', dueDate: '2025-03-15', paidDate: '2025-03-15', status: 'pagado', month: 'Marzo 2025', notes: '' },
  ];
  const expenses = [
    { id: '1', propertyId: '1', category: 'Reparación', description: 'Arreglo de cañería', amount: 45000, currency: 'ARS', date: '2025-02-10', paidBy: 'propietario', notes: '' },
    { id: '2', propertyId: '3', category: 'Mantenimiento', description: 'Pintura exterior', amount: 120000, currency: 'ARS', date: '2025-01-20', paidBy: 'propietario', notes: 'Contratista García' },
    { id: '3', propertyId: '2', category: 'Impuesto', description: 'ABL primer trimestre', amount: 28000, currency: 'ARS', date: '2025-03-01', paidBy: 'propietario', notes: '' },
  ];

  if (!localStorage.getItem(KEYS.properties)) localStorage.setItem(KEYS.properties, JSON.stringify(props));
  if (!localStorage.getItem(KEYS.tenants)) localStorage.setItem(KEYS.tenants, JSON.stringify(tenants));
  if (!localStorage.getItem(KEYS.contracts)) localStorage.setItem(KEYS.contracts, JSON.stringify(contracts));
  if (!localStorage.getItem(KEYS.payments)) localStorage.setItem(KEYS.payments, JSON.stringify(payments));
  if (!localStorage.getItem(KEYS.expenses)) localStorage.setItem(KEYS.expenses, JSON.stringify(expenses));
};

seed();

const get = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

export const store = {
  // AUTH
  login: (user, pass) => {
    if (user === 'admin' && pass === 'admin123') {
      localStorage.setItem(KEYS.auth, JSON.stringify({ user, loggedAt: new Date().toISOString() }));
      return true;
    }
    return false;
  },
  logout: () => localStorage.removeItem(KEYS.auth),
  isLoggedIn: () => !!localStorage.getItem(KEYS.auth),

  // PROPERTIES
  getProperties: () => get(KEYS.properties),
  addProperty: (data) => {
    const props = get(KEYS.properties);
    const newProp = { ...data, id: uid(), createdAt: new Date().toISOString().split('T')[0] };
    set(KEYS.properties, [...props, newProp]);
    return newProp;
  },
  updateProperty: (id, data) => {
    const props = get(KEYS.properties).map(p => p.id === id ? { ...p, ...data } : p);
    set(KEYS.properties, props);
  },
  deleteProperty: (id) => set(KEYS.properties, get(KEYS.properties).filter(p => p.id !== id)),

  // TENANTS
  getTenants: () => get(KEYS.tenants),
  addTenant: (data) => {
    const list = get(KEYS.tenants);
    const item = { ...data, id: uid(), createdAt: new Date().toISOString().split('T')[0] };
    set(KEYS.tenants, [...list, item]);
    return item;
  },
  updateTenant: (id, data) => set(KEYS.tenants, get(KEYS.tenants).map(t => t.id === id ? { ...t, ...data } : t)),
  deleteTenant: (id) => set(KEYS.tenants, get(KEYS.tenants).filter(t => t.id !== id)),

  // CONTRACTS
  getContracts: () => get(KEYS.contracts),
  addContract: (data) => {
    const list = get(KEYS.contracts);
    const item = { ...data, id: uid(), createdAt: new Date().toISOString().split('T')[0] };
    set(KEYS.contracts, [...list, item]);
    return item;
  },
  updateContract: (id, data) => set(KEYS.contracts, get(KEYS.contracts).map(c => c.id === id ? { ...c, ...data } : c)),
  deleteContract: (id) => set(KEYS.contracts, get(KEYS.contracts).filter(c => c.id !== id)),

  // PAYMENTS
  getPayments: () => get(KEYS.payments),
  addPayment: (data) => {
    const list = get(KEYS.payments);
    const item = { ...data, id: uid() };
    set(KEYS.payments, [...list, item]);
    return item;
  },
  updatePayment: (id, data) => set(KEYS.payments, get(KEYS.payments).map(p => p.id === id ? { ...p, ...data } : p)),
  deletePayment: (id) => set(KEYS.payments, get(KEYS.payments).filter(p => p.id !== id)),

  // EXPENSES
  getExpenses: () => get(KEYS.expenses),
  addExpense: (data) => {
    const list = get(KEYS.expenses);
    const item = { ...data, id: uid() };
    set(KEYS.expenses, [...list, item]);
    return item;
  },
  updateExpense: (id, data) => set(KEYS.expenses, get(KEYS.expenses).map(e => e.id === id ? { ...e, ...data } : e)),
  deleteExpense: (id) => set(KEYS.expenses, get(KEYS.expenses).filter(e => e.id !== id)),
};
