import { Preferences } from '@capacitor/preferences';
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  onSnapshot, arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { db, authReady } from './firebase.js';

const DEFAULT_SERVICES = ['剪髮', '染髮', '燙髮', '護髮'];
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除容易看錯的 0/O、1/I

// 密碼不存明文，存雜湊值——這樣就算有人繞過 App 直接讀到 Firestore 文件，
// 看到的也只是一串雜湊，不是密碼本身
async function hashPin(pin) {
  const data = new TextEncoder().encode(pin + ':salon-app-v1');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function genSalonCode() {
  let code = '';
  for (let i = 0; i < 6; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return code;
}

// ============ 裝置本機身份（只存在這支手機上，不同步） ============
const LOCAL_KEYS = {
  role: 'salon_role',
  currentDesignerId: 'salon_current_designer_id',
  salonCode: 'salon_code',
};

export async function getRole() {
  const { value } = await Preferences.get({ key: LOCAL_KEYS.role });
  return value || null;
}
export async function setRole(role) {
  if (role === null) await Preferences.remove({ key: LOCAL_KEYS.role });
  else await Preferences.set({ key: LOCAL_KEYS.role, value: role });
}

export async function getCurrentDesignerId() {
  const { value } = await Preferences.get({ key: LOCAL_KEYS.currentDesignerId });
  return value || null;
}
export async function setCurrentDesignerId(id) {
  await Preferences.set({ key: LOCAL_KEYS.currentDesignerId, value: id || '' });
}

export async function getSalonCode() {
  const { value } = await Preferences.get({ key: LOCAL_KEYS.salonCode });
  return value || null;
}
export async function setSalonCode(code) {
  await Preferences.set({ key: LOCAL_KEYS.salonCode, value: code });
}

// 只切換角色：清掉「這支手機現在扮演誰」，但保留已連線的店家代碼，
// 同一支裝置在同一間店裡切換身份不用重打代碼
export async function signOutRole() {
  await Preferences.remove({ key: LOCAL_KEYS.role });
  await Preferences.remove({ key: LOCAL_KEYS.currentDesignerId });
}

// 登出這支裝置：只清掉「這支手機是誰」的設定，雲端店家資料完全不受影響
export async function signOutDevice() {
  await Preferences.remove({ key: LOCAL_KEYS.role });
  await Preferences.remove({ key: LOCAL_KEYS.currentDesignerId });
  await Preferences.remove({ key: LOCAL_KEYS.salonCode });
}

// ============ 店家（雲端，Firestore） ============
export async function createSalon(pin) {
  const user = await authReady;
  let code, exists = true;
  while (exists) {
    code = genSalonCode();
    const snap = await getDoc(doc(db, 'salons', code));
    exists = snap.exists();
  }
  await setDoc(doc(db, 'salons', code), {
    pin: await hashPin(pin), services: DEFAULT_SERVICES, createdAt: Date.now(), ownerUid: user.uid,
  });
  return code;
}

export async function salonExists(code) {
  await authReady;
  const snap = await getDoc(doc(db, 'salons', code));
  return snap.exists();
}

export async function verifySalonPin(code, pin) {
  await authReady;
  const snap = await getDoc(doc(db, 'salons', code));
  if (!snap.exists()) return { ok: false, reason: 'not_found' };
  if (snap.data().pin !== await hashPin(pin)) return { ok: false, reason: 'wrong_pin' };
  return { ok: true };
}

export async function updateSalonPin(code, newPin) {
  await authReady;
  await updateDoc(doc(db, 'salons', code), { pin: await hashPin(newPin) });
}

// 這支裝置現在的登入身份是不是這間店的老闆（用來做免密碼救援：只要還是
// 當初建立店家的那支裝置、沒清過 App 資料，就能直接改密碼不用先輸入舊密碼）
export async function isThisDeviceTheOwner(code) {
  const user = await authReady;
  const snap = await getDoc(doc(db, 'salons', code));
  return snap.exists() && snap.data().ownerUid === user.uid;
}

// 把某個設計師檔案「認領」給目前這支裝置的登入身份，之後雲端規則才能判斷
// 「這支裝置只能動自己名下的記錄」
export async function claimDesigner(code, designerId) {
  const user = await authReady;
  await updateDoc(doc(db, 'salons', code, 'designers', designerId), { uid: user.uid });
}

// ============ 服務項目（存在店家文件的欄位裡） ============
export function subscribeServices(code, cb, onError) {
  return onSnapshot(doc(db, 'salons', code), snap => {
    cb(snap.exists() ? (snap.data().services || []) : []);
  }, onError);
}
export async function addService(code, name) {
  await authReady;
  await updateDoc(doc(db, 'salons', code), { services: arrayUnion(name) });
}
export async function deleteService(code, name) {
  await authReady;
  await updateDoc(doc(db, 'salons', code), { services: arrayRemove(name) });
}

// ============ 設計師 ============
export function subscribeDesigners(code, cb, onError) {
  return onSnapshot(collection(db, 'salons', code, 'designers'), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, onError);
}
export async function getDesignersOnce(code) {
  await authReady;
  const snap = await getDocs(collection(db, 'salons', code, 'designers'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function addDesigner(code, name, commissionRate) {
  await authReady;
  const ref = await addDoc(collection(db, 'salons', code, 'designers'), { name, commissionRate });
  return { id: ref.id, name, commissionRate };
}
export async function updateDesigner(code, id, patch) {
  await authReady;
  await updateDoc(doc(db, 'salons', code, 'designers', id), patch);
}
export async function deleteDesigner(code, id) {
  await authReady;
  await deleteDoc(doc(db, 'salons', code, 'designers', id));
}

// ============ 服務記錄 ============
export function subscribeEntries(code, cb, onError) {
  return onSnapshot(collection(db, 'salons', code, 'entries'), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, onError);
}
export async function addEntry(code, entry) {
  await authReady;
  const payload = { dateISO: new Date().toISOString(), ...entry };
  const ref = await addDoc(collection(db, 'salons', code, 'entries'), payload);
  return { id: ref.id, ...payload };
}
export async function updateEntry(code, id, patch) {
  await authReady;
  await updateDoc(doc(db, 'salons', code, 'entries', id), patch);
}
export async function deleteEntry(code, id) {
  await authReady;
  await deleteDoc(doc(db, 'salons', code, 'entries', id));
}

// ============ 客人 ============
export function subscribeCustomers(code, cb, onError) {
  return onSnapshot(collection(db, 'salons', code, 'customers'), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, onError);
}
export async function addCustomer(code, name, phone = '') {
  await authReady;
  const ref = await addDoc(collection(db, 'salons', code, 'customers'), { name, phone });
  return { id: ref.id, name, phone };
}
export async function updateCustomer(code, id, patch) {
  await authReady;
  await updateDoc(doc(db, 'salons', code, 'customers', id), patch);
}
export async function deleteCustomer(code, id) {
  await authReady;
  await deleteDoc(doc(db, 'salons', code, 'customers', id));
}
