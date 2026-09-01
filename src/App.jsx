import React, { useEffect, useState, useCallback, useRef } from 'react';
import Onboarding from './screens/Onboarding.jsx';
import DesignerScreen from './screens/DesignerScreen.jsx';
import OwnerScreen from './screens/OwnerScreen.jsx';
import EntryScreen from './screens/EntryScreen.jsx';
import HistoryScreen from './screens/HistoryScreen.jsx';
import SettingsScreen from './screens/SettingsScreen.jsx';
import { TabIcon } from './components/ui.jsx';
import { color } from './theme.js';
import {
  getRole, getCurrentDesignerId, getSalonCode,
  subscribeDesigners, subscribeEntries, subscribeCustomers, subscribeServices,
} from './data/store.js';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [role, setRoleState] = useState(null);
  const [salonCode, setSalonCodeState] = useState(null);
  const [currentDesignerId, setCurrentDesignerIdState] = useState(null);

  const [designers, setDesigners] = useState([]);
  const [entries, setEntries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [cloudReady, setCloudReady] = useState(false);

  const [tab, setTab] = useState('main');
  const unsubsRef = useRef([]);

  // 讀取這支裝置的身份（角色 / 目前登入哪家店）
  const loadIdentity = useCallback(async () => {
    const [r, cid, sc] = await Promise.all([getRole(), getCurrentDesignerId(), getSalonCode()]);
    setRoleState(r);
    setCurrentDesignerIdState(cid);
    setSalonCodeState(sc);
    setLoading(false);
  }, []);

  useEffect(() => { loadIdentity(); }, [loadIdentity]);

  // 一旦知道角色 + 店家代碼，就訂閱這間店的雲端資料（即時同步）
  useEffect(() => {
    unsubsRef.current.forEach(fn => fn());
    unsubsRef.current = [];
    setCloudReady(false);

    if (!role || !salonCode) return;

    let flags = { d: false, e: false, c: false, s: false };
    const checkReady = () => {
      if (flags.d && flags.e && flags.c && flags.s) setCloudReady(true);
    };

    const u1 = subscribeDesigners(salonCode, list => { setDesigners(list); flags.d = true; checkReady(); });
    const u2 = subscribeEntries(salonCode, list => { setEntries(list); flags.e = true; checkReady(); });
    const u3 = subscribeCustomers(salonCode, list => { setCustomers(list); flags.c = true; checkReady(); });
    const u4 = subscribeServices(salonCode, list => { setServices(list); flags.s = true; checkReady(); });
    unsubsRef.current = [u1, u2, u3, u4];

    return () => { unsubsRef.current.forEach(fn => fn()); unsubsRef.current = []; };
  }, [role, salonCode]);

  if (loading) {
    return <div style={{ minHeight: '100vh', background: color.pageGradient }} />;
  }

  if (!role || !salonCode) {
    return <Onboarding cachedSalonCode={salonCode} onDone={loadIdentity} />;
  }

  if (!cloudReady) {
    return (
      <div style={{
        minHeight: '100vh', background: color.pageGradient, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ fontSize: 13, color: color.textSecondary, fontWeight: 600 }}>同步中…</div>
      </div>
    );
  }

  const currentDesigner = designers.find(d => d.id === currentDesignerId) || null;

  const tabs = role === 'owner'
    ? [
        { key: 'main', label: '團隊總覽', icon: 'shield' },
        { key: 'entry', label: '記錄', icon: 'plus' },
        { key: 'history', label: '歷史', icon: 'list' },
        { key: 'settings', label: '設定', icon: 'gear' },
      ]
    : [
        { key: 'main', label: '我的業績', icon: 'chart' },
        { key: 'entry', label: '記錄', icon: 'plus' },
        { key: 'history', label: '歷史', icon: 'list' },
        { key: 'settings', label: '設定', icon: 'gear' },
      ];

  return (
    <div style={{
      minHeight: '100vh', background: color.pageGradient, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, paddingTop: 'env(safe-area-inset-top)', position: 'relative', zIndex: 1 }}>
        {tab === 'main' && role === 'owner' && (
          <OwnerScreen designers={designers} entries={entries} />
        )}
        {tab === 'main' && role === 'designer' && (
          <DesignerScreen designer={currentDesigner} entries={entries} />
        )}
        {tab === 'entry' && (
          <EntryScreen
            salonCode={salonCode}
            role={role}
            designers={designers}
            currentDesignerId={currentDesignerId}
            services={services}
            customers={customers}
            entries={entries}
          />
        )}
        {tab === 'history' && (
          <HistoryScreen
            salonCode={salonCode}
            role={role}
            designers={designers}
            entries={entries}
            services={services}
            customers={customers}
            currentDesignerId={currentDesignerId}
          />
        )}
        {tab === 'settings' && (
          <SettingsScreen
            salonCode={salonCode}
            role={role}
            designers={designers}
            services={services}
            customers={customers}
            onRoleReset={loadIdentity}
          />
        )}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 2,
        background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(10px)',
        borderTop: `1px solid ${color.hairline}`, boxShadow: '0 -6px 20px rgba(43,30,42,0.06)',
        display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, border: 'none', background: 'none', padding: '11px 0 8px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <TabIcon name={t.icon} active={tab === t.key} />
            <span style={{
              fontSize: 10.5, fontWeight: 600,
              color: tab === t.key ? color.plum : color.textFaint,
            }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
