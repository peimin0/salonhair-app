// firebase.js — Firebase 專案設定與初始化

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, inMemoryPersistence, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCiKV1xKFgh8APCEySAB63OiEqtmLtMAhU',
  authDomain: 'salon-app-aaaf4.firebaseapp.com',
  projectId: 'salon-app-aaaf4',
  storageBucket: 'salon-app-aaaf4.firebasestorage.app',
  messagingSenderId: '62288862169',
  appId: '1:62288862169:web:7542db4fc80fe52ad657c8',
};

export const app = initializeApp(firebaseConfig);

// 用最單純的線上模式，不開離線快取——Capacitor 的 WebView 對 IndexedDB
// 支援不穩定，之前卡在「建立中」就是因為 SDK 想用 IndexedDB 做持久化，
// 初始化階段就卡住了，連網路請求都還沒送出。等連線確認正常後，
// 未來如果要重新加離線支援，需要另外測試 IndexedDB 在這個環境是否可靠。
export const db = getFirestore(app);

// Auth 同理：明確指定「不持久化」（每次開 App 重新匿名登入即可，
// 反正裝置身份是我們自己用 Preferences 管理的，不靠 Firebase Auth 的 session）
export const auth = initializeAuth(app, { persistence: inMemoryPersistence });

// 每支裝置用匿名帳號連線（不用註冊帳密），真正的存取範圍靠「店家代碼」控制。
// authReady 讓其他程式碼可以 await，確保呼叫 Firestore 前一定已經登入完成。
// 如果登入失敗或 10 秒內連不上網路，改成明確丟出錯誤，不要讓呼叫端永遠卡住等待。
let resolveReady, rejectReady, settled = false;
export const authReady = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });

onAuthStateChanged(auth, (user) => {
  if (user) {
    settled = true;
    resolveReady(user);
  } else {
    signInAnonymously(auth).catch(err => {
      console.error('匿名登入失敗', err);
      if (!settled) { settled = true; rejectReady(err); }
    });
  }
});

setTimeout(() => {
  if (!settled) {
    settled = true;
    rejectReady(new Error('連線逾時，請檢查網路連線'));
  }
}, 10000);

