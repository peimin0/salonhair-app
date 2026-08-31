import { Preferences } from '@capacitor/preferences';

const KEYS = {
  designers: 'salon_designers',
  entries: 'salon_entries',
  role: 'salon_role',
  currentDesignerId: 'salon_current_designer_id',
  services: 'salon_services',
  customers: 'salon_customers',
};

const DEFAULT_SERVICES = ['剪髮', '染髮', '燙髮', '護髮'];

async function getJSON(key, fallback) {
  const { value } = await Preferences.get({ key });
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function setJSON(key, data) {
  await Preferences.set({ key, value: JSON.stringify(data) });
}

// ---------- 設計師 ----------
export async function getDesigners() {
  return getJSON(KEYS.designers, []);
}

export async function saveDesigners(designers) {
  await setJSON(KEYS.designers, designers);
}

export async function addDesigner(name, commissionRate) {
  const designers = await getDesigners();
  const newDesigner = {
    id: 'd_' + Date.now(),
    name,
    commissionRate,
  };
  const updated = [...designers, newDesigner];
  await saveDesigners(updated);
  return newDesigner;
}

export async function updateDesigner(id, patch) {
  const designers = await getDesigners();
  const updated = designers.map(d => (d.id === id ? { ...d, ...patch } : d));
  await saveDesigners(updated);
}

export async function deleteDesigner(id) {
  const designers = await getDesigners();
  await saveDesigners(designers.filter(d => d.id !== id));
}

// ---------- 服務記錄 ----------
export async function getEntries() {
  return getJSON(KEYS.entries, []);
}

export async function addEntry(entry) {
  const entries = await getEntries();
  const newEntry = {
    id: 'e_' + Date.now(),
    dateISO: new Date().toISOString(),
    ...entry,
  };
  const updated = [newEntry, ...entries];
  await setJSON(KEYS.entries, updated);
  return newEntry;
}

export async function deleteEntry(id) {
  const entries = await getEntries();
  await setJSON(KEYS.entries, entries.filter(e => e.id !== id));
}

export async function updateEntry(id, patch) {
  const entries = await getEntries();
  const updated = entries.map(e => (e.id === id ? { ...e, ...patch } : e));
  await setJSON(KEYS.entries, updated);
}

// ---------- 服務項目 ----------
export async function getServices() {
  return getJSON(KEYS.services, DEFAULT_SERVICES);
}

export async function saveServices(services) {
  await setJSON(KEYS.services, services);
}

export async function addService(name) {
  const services = await getServices();
  if (services.includes(name)) return services;
  const updated = [...services, name];
  await saveServices(updated);
  return updated;
}

export async function deleteService(name) {
  const services = await getServices();
  const updated = services.filter(s => s !== name);
  await saveServices(updated);
  return updated;
}

// ---------- 角色與目前使用者 ----------
export async function getRole() {
  const { value } = await Preferences.get({ key: KEYS.role });
  return value || null; // 'owner' | 'designer' | null
}

export async function setRole(role) {
  await Preferences.set({ key: KEYS.role, value: role });
}

export async function getCurrentDesignerId() {
  const { value } = await Preferences.get({ key: KEYS.currentDesignerId });
  return value || null;
}

export async function setCurrentDesignerId(id) {
  await Preferences.set({ key: KEYS.currentDesignerId, value: id });
}

export async function resetAll() {
  await Preferences.clear();
}

// ---------- 客人 ----------
export async function getCustomers() {
  return getJSON(KEYS.customers, []);
}

export async function saveCustomers(customers) {
  await setJSON(KEYS.customers, customers);
}

export async function addCustomer(name, phone = '') {
  const customers = await getCustomers();
  const newCustomer = { id: 'c_' + Date.now(), name, phone };
  await saveCustomers([...customers, newCustomer]);
  return newCustomer;
}

export async function updateCustomer(id, patch) {
  const customers = await getCustomers();
  const updated = customers.map(c => (c.id === id ? { ...c, ...patch } : c));
  await saveCustomers(updated);
}

export async function deleteCustomer(id) {
  const customers = await getCustomers();
  await saveCustomers(customers.filter(c => c.id !== id));
}
