import { Preferences } from '@capacitor/preferences';

const KEYS = {
  designers: 'salon_designers',
  entries: 'salon_entries',
  role: 'salon_role',
  currentDesignerId: 'salon_current_designer_id',
};

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
