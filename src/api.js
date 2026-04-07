import {
  collection, doc,
  addDoc, updateDoc, deleteDoc,
  onSnapshot,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Generic realtime collection ─────────────────────────────────────
function makeCollection(name, orderField = 'createdAt', orderDir = 'desc') {
  const col = () => collection(db, name);

  return {
    add: async (data) => {
      const ref = await addDoc(col(), { ...data, createdAt: serverTimestamp() });
      return { id: ref.id, ...data };
    },
    update: async (id, data) => {
      await updateDoc(doc(db, name, id), data);
    },
    remove: async (id) => {
      await deleteDoc(doc(db, name, id));
    },
    // Returns unsubscribe function. Calls cb(items) on every change.
    subscribe: (cb) => {
      const q = query(col(), orderBy(orderField, orderDir));
      return onSnapshot(q, (snap) => {
        cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    },
  };
}

export const propertiesApi = makeCollection('properties', 'createdAt', 'desc');
export const tenantsApi    = makeCollection('tenants', 'name', 'asc');
export const contractsApi  = makeCollection('contracts', 'createdAt', 'desc');
export const paymentsApi   = makeCollection('payments', 'dueDate', 'desc');
export const expensesApi   = makeCollection('expenses', 'date', 'desc');
