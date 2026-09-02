// firebase.js — Firebase 專案設定與初始化

import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCiKV1xKFgh8APCEySAB63OiEqtmLtMAhU',
  authDomain: 'salon-app-aaaf4.firebaseapp.com',
  projectId: 'salon-app-aaaf4',
  storageBucket: 'salon-app-aaaf4.firebasestorage.app',
  messagingSenderId: '62288862169',
  appId: '1:62288862169:web:7542db4fc80fe52ad657c8',
};

export const app = initializeApp(firebaseConfig);

// 開啟本機持久化快取，離線的時候還是能讀到最後一次同步的資料，
// 恢復網路後 Firestore SDK 會自動補上這段時間的變化
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({}),
});

export const auth = getAuth(app);

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

