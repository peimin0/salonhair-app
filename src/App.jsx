import React, { useEffect, useState, useCallback } from 'react';
import Onboarding from './screens/Onboarding.jsx';
import DesignerScreen from './screens/DesignerScreen.jsx';
import OwnerScreen from './screens/OwnerScreen.jsx';
import EntryScreen from './screens/EntryScreen.jsx';
import HistoryScreen from './screens/HistoryScreen.jsx';
import SettingsScreen from './screens/SettingsScreen.jsx';
import { TabIcon } from './components/ui.jsx';
import { color } from './theme.js';
import { getDesigners, getEntries, getRole, getCurrentDesignerId, getServices, getCustomers } from './data/store.js';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [role, setRoleState] = useState(null);
  const [designers, setDesigners] = useState([]);
  const [entries, setEntries] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currentDesignerId, setCurrentDesignerIdState] = useState(null);
  const [tab, setTab] = useState('main');

  const loadAll = useCallback(async () => {
    const [r, ds, es, cid, sv, cu] = await Promise.all([
      getRole(), getDesigners(), getEntries(), getCurrentDesignerId(), getServices(), getCustomers(),
    ]);
    setRoleState(r);
    setDesigners(ds);
    setEntries(es);
    setCurrentDesignerIdState(cid);
    setServices(sv);
    setCustomers(cu);
    setLoading(false);
  }, []);

  const loadServices = useCallback(async () => {
    setServices(await getServices());
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF7F5' }} />
    );
  }

  if (!role) {
    return <Onboarding designers={designers} onDone={loadAll} />;
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
      minHeight: '100vh', background: color.bg, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, paddingTop: 'env(safe-area-inset-top)' }}>
        {tab === 'main' && role === 'owner' && (
          <OwnerScreen designers={designers} entries={entries} />
        )}
        {tab === 'main' && role === 'designer' && (
          <DesignerScreen designer={currentDesigner} entries={entries} />
        )}
        {tab === 'entry' && (
          <EntryScreen
            role={role}
            designers={designers}
            currentDesignerId={currentDesignerId}
            services={services}
            customers={customers}
            entries={entries}
            onSaved={loadAll}
          />
        )}
        {tab === 'history' && (
          <HistoryScreen
            role={role}
            designers={designers}
            entries={entries}
            services={services}
            customers={customers}
            currentDesignerId={currentDesignerId}
            onChanged={loadAll}
          />
        )}
        {tab === 'settings' && (
          <SettingsScreen
            role={role}
            designers={designers}
            services={services}
            customers={customers}
            onChanged={loadAll}
            onServicesChanged={loadServices}
            onRoleReset={loadAll}
          />
        )}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
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
