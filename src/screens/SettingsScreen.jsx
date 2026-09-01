import React, { useState } from 'react';
import { PrimaryButton, PageBackground } from '../components/ui.jsx';
import { addDesigner, updateDesigner, deleteDesigner, setRole, resetAll, addService, deleteService, updateCustomer, deleteCustomer } from '../data/store.js';
import shelfImg from '../assets/photos/shelf.jpg';

export default function SettingsScreen({ role, designers, services, customers, onChanged, onServicesChanged, onRoleReset }) {
  const [openId, setOpenId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRate, setEditRate] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRate, setNewRate] = useState('45');
  const [newService, setNewService] = useState('');
  const [openCustomerId, setOpenCustomerId] = useState(null);
  const [editCustomerName, setEditCustomerName] = useState('');

  const handleAddService = async () => {
    const name = newService.trim();
    if (!name) return;
    await addService(name);
    setNewService('');
    onServicesChanged();
  };

  const handleDeleteService = async (name) => {
    await deleteService(name);
    onServicesChanged();
  };

  const openCustomerEdit = (c) => {
    setOpenCustomerId(c.id);
    setEditCustomerName(c.name);
  };

  const saveCustomerEdit = async (id) => {
    await updateCustomer(id, { name: editCustomerName.trim() || '未命名' });
    setOpenCustomerId(null);
    onChanged();
  };

  const removeCustomer = async (id) => {
    await deleteCustomer(id);
    setOpenCustomerId(null);
    onChanged();
  };

  const openEdit = (d) => {
    setOpenId(d.id);
    setEditName(d.name);
    setEditRate(String(Math.round(d.commissionRate * 100)));
  };

  const saveEdit = async (id) => {
    await updateDesigner(id, {
      name: editName.trim() || '未命名',
      commissionRate: Math.min(90, Math.max(10, Number(editRate) || 45)) / 100,
    });
    setOpenId(null);
    onChanged();
  };

  const remove = async (id) => {
    await deleteDesigner(id);
    setOpenId(null);
    onChanged();
  };

  const createDesigner = async () => {
    if (!newName.trim()) return;
    await addDesigner(newName.trim(), Math.min(90, Math.max(10, Number(newRate) || 45)) / 100);
    setNewName('');
    setNewRate('45');
    setAddingNew(false);
    onChanged();
  };

  const switchRole = async () => {
    await setRole(null);
    onRoleReset();
  };

  const clearEverything = async () => {
    if (!window.confirm('確定要清除所有資料嗎？這無法復原。')) return;
    await resetAll();
    onRoleReset();
  };

  return (
    <>
      <PageBackground src={shelfImg} />
      <div style={{ padding: '20px 16px 100px', position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: 13, color: '#6E5B68' }}>設定</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#2B1E2A', marginTop: 2, marginBottom: 20 }}>
        管理團隊與帳號
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: '#2B1E2A', marginBottom: 10 }}>
        設計師名單（{designers.length}）
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        {designers.map(d => (
          <div key={d.id} style={{
            background: '#FFFFFF', borderRadius: 14, border: '1px solid #EBE2E6', overflow: 'hidden',
          }}>
            <button onClick={() => (openId === d.id ? setOpenId(null) : openEdit(d))} style={{
              width: '100%', padding: '13px 16px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', background: 'none', border: 'none', textAlign: 'left',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#2B1E2A' }}>{d.name}</div>
                <div style={{ fontSize: 11.5, color: '#6E5B68' }}>抽成 {Math.round(d.commissionRate * 100)}%</div>
              </div>
              <div style={{ fontSize: 12, color: '#9C8B97' }}>{openId === d.id ? '收合 ▲' : '編輯 ▼'}</div>
            </button>

            {openId === d.id && (
              <div style={{ padding: '0 16px 16px' }}>
                <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="姓名" style={{
                  width: '100%', boxSizing: 'border-box', fontSize: 14, border: '1px solid #EBE2E6',
                  borderRadius: 10, padding: '10px 12px', marginBottom: 8, outline: 'none',
                }} />
                <input type="number" value={editRate} onChange={e => setEditRate(e.target.value)} placeholder="抽成 %" style={{
                  width: '100%', boxSizing: 'border-box', fontSize: 14, border: '1px solid #EBE2E6',
                  borderRadius: 10, padding: '10px 12px', marginBottom: 10, outline: 'none',
                }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => saveEdit(d.id)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                    background: '#4A2545', color: '#fff', fontSize: 13, fontWeight: 600,
                  }}>儲存</button>
                  <button onClick={() => remove(d.id)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #E6C7C1',
                    background: '#F5E6E3', color: '#8A4A40', fontSize: 13, fontWeight: 600,
                  }}>刪除</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {addingNew ? (
        <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #EBE2E6', padding: 16, marginBottom: 20 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="設計師姓名" style={{
            width: '100%', boxSizing: 'border-box', fontSize: 14, border: '1px solid #EBE2E6',
            borderRadius: 10, padding: '10px 12px', marginBottom: 8, outline: 'none',
          }} />
          <input type="number" value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="抽成 %" style={{
            width: '100%', boxSizing: 'border-box', fontSize: 14, border: '1px solid #EBE2E6',
            borderRadius: 10, padding: '10px 12px', marginBottom: 10, outline: 'none',
          }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={createDesigner} style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
              background: '#4A2545', color: '#fff', fontSize: 13, fontWeight: 600,
            }}>新增</button>
            <button onClick={() => setAddingNew(false)} style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #EBE2E6',
              background: '#fff', color: '#6E5B68', fontSize: 13, fontWeight: 600,
            }}>取消</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAddingNew(true)} style={{
          width: '100%', padding: '12px', borderRadius: 14, border: '1px dashed #B8934A',
          background: '#F6EEDD', color: '#8A6B2A', fontSize: 13, fontWeight: 600, marginBottom: 24,
        }}>
          ＋ 新增設計師
        </button>
      )}

      <div style={{ fontSize: 13, fontWeight: 600, color: '#2B1E2A', marginBottom: 10 }}>
        服務項目（{services.length}）
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {services.map(s => (
          <div key={s} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 8px 8px 14px',
            borderRadius: 999, background: '#fff', border: '1px solid #EBE2E6',
            fontSize: 13, fontWeight: 600, color: '#2B1E2A',
          }}>
            {s}
            <button onClick={() => handleDeleteService(s)} style={{
              width: 20, height: 20, borderRadius: 10, border: 'none', background: '#F5E6E3',
              color: '#8A4A40', fontSize: 12, lineHeight: '20px', padding: 0,
            }}>×</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={newService}
          onChange={e => setNewService(e.target.value)}
          placeholder="新增服務項目，例如：頭皮護理"
          style={{
            flex: 1, minWidth: 0, boxSizing: 'border-box', fontSize: 13, border: '1px solid #EBE2E6',
            borderRadius: 10, padding: '10px 12px', outline: 'none',
          }}
        />
        <button onClick={handleAddService} style={{
          padding: '0 16px', borderRadius: 10, border: 'none', background: '#4A2545',
          color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0,
        }}>新增</button>
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: '#2B1E2A', marginBottom: 10 }}>
        客人名單（{customers.length}）
      </div>
      {customers.length === 0 ? (
        <div style={{ fontSize: 12, color: '#9C8B97', marginBottom: 24 }}>
          還沒有客人資料，在「記錄」分頁輸入客人姓名時會自動建立。
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {customers.map(c => (
            <div key={c.id} style={{
              background: '#FFFFFF', borderRadius: 14, border: '1px solid #EBE2E6', overflow: 'hidden',
            }}>
              <button onClick={() => (openCustomerId === c.id ? setOpenCustomerId(null) : openCustomerEdit(c))} style={{
                width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', background: 'none', border: 'none', textAlign: 'left',
              }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#2B1E2A' }}>{c.name}</div>
                <div style={{ fontSize: 12, color: '#9C8B97' }}>{openCustomerId === c.id ? '收合 ▲' : '編輯 ▼'}</div>
              </button>
              {openCustomerId === c.id && (
                <div style={{ padding: '0 16px 14px' }}>
                  <input value={editCustomerName} onChange={e => setEditCustomerName(e.target.value)} style={{
                    width: '100%', boxSizing: 'border-box', fontSize: 13, border: '1px solid #EBE2E6',
                    borderRadius: 10, padding: '9px 12px', marginBottom: 10, outline: 'none',
                  }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => saveCustomerEdit(c.id)} style={{
                      flex: 1, padding: '9px 0', borderRadius: 10, border: 'none',
                      background: '#4A2545', color: '#fff', fontSize: 13, fontWeight: 600,
                    }}>儲存</button>
                    <button onClick={() => removeCustomer(c.id)} style={{
                      flex: 1, padding: '9px 0', borderRadius: 10, border: '1px solid #E6C7C1',
                      background: '#F5E6E3', color: '#8A4A40', fontSize: 13, fontWeight: 600,
                    }}>刪除</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 13, fontWeight: 600, color: '#2B1E2A', marginBottom: 10 }}>帳號</div>
      <div style={{ fontSize: 12, color: '#6E5B68', marginBottom: 10 }}>目前身份：{role === 'owner' ? '店長 / 老闆' : '設計師'}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={switchRole} style={{
          padding: '13px', borderRadius: 14, border: '1px solid #EBE2E6', background: '#fff',
          color: '#2B1E2A', fontSize: 13, fontWeight: 600,
        }}>
          切換身份
        </button>
        <button onClick={clearEverything} style={{
          padding: '13px', borderRadius: 14, border: '1px solid #E6C7C1', background: '#F5E6E3',
          color: '#8A4A40', fontSize: 13, fontWeight: 600,
        }}>
          清除所有資料
        </button>
      </div>
      </div>
    </>
  );
}
