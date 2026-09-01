import React, { useState } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Chip, fmt, CustomerAutocomplete, PageBackground } from '../components/ui.jsx';
import { updateEntry, deleteEntry, addCustomer } from '../data/store.js';
import framesImg from '../assets/photos/frames.jpg';

function dateStrOf(iso) {
  const d = new Date(iso);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
}

function timeStrOf(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

async function exportCSV(entries, designers, customersById) {
  const nameById = Object.fromEntries(designers.map(d => [d.id, d.name]));
  const rateById = Object.fromEntries(designers.map(d => [d.id, d.commissionRate]));
  const header = '日期,時間,設計師,客人,服務項目,金額,抽成金額,回頭客\n';
  const rows = entries
    .slice()
    .sort((a, b) => new Date(a.dateISO) - new Date(b.dateISO))
    .map(e => {
      const rate = rateById[e.designerId] ?? 0;
      const customerName = e.customerId ? (customersById[e.customerId]?.name || '') : '';
      return [
        dateStrOf(e.dateISO),
        timeStrOf(e.dateISO),
        (nameById[e.designerId] || '未知').replace(/,/g, '，'),
        customerName.replace(/,/g, '，'),
        e.service.replace(/,/g, '，'),
        e.amount,
        Math.round(e.amount * rate),
        e.isRepeat ? '是' : '否',
      ].join(',');
    });
  const csv = '\uFEFF' + header + rows.join('\n');
  const fileName = `髮廊業績通_匯出_${dateStrOf(new Date().toISOString())}.csv`;

  await Filesystem.writeFile({
    path: fileName,
    data: csv,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });
  const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
  await Share.share({ title: '髮廊業績通資料匯出', url: uri });
}

export default function HistoryScreen({ role, designers, entries, services, customers, currentDesignerId, onChanged }) {
  const [openId, setOpenId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editService, setEditService] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCustomerQuery, setEditCustomerQuery] = useState('');
  const [editCustomerId, setEditCustomerId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  const nameById = Object.fromEntries(designers.map(d => [d.id, d.name]));
  const rateById = Object.fromEntries(designers.map(d => [d.id, d.commissionRate]));
  const customersById = Object.fromEntries(customers.map(c => [c.id, c]));

  const visibleEntries = (role === 'designer'
    ? entries.filter(e => e.designerId === currentDesignerId)
    : entries
  ).slice().sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));

  const openEdit = (e) => {
    setOpenId(e.id);
    setEditDate(dateStrOf(e.dateISO));
    setEditTime(timeStrOf(e.dateISO));
    setEditService(e.service);
    setEditAmount(String(e.amount));
    setEditCustomerId(e.customerId || null);
    setEditCustomerQuery(e.customerId ? (customersById[e.customerId]?.name || '') : '');
  };

  const saveEdit = async (id, designerId) => {
    const name = editCustomerQuery.trim();
    const matchedByName = customers.find(c => c.name === name);
    let finalCustomerId = editCustomerId || (matchedByName ? matchedByName.id : null);
    if (!finalCustomerId && name) {
      const created = await addCustomer(name);
      finalCustomerId = created.id;
    }
    // 重新判斷回頭客：這位客人在這位設計師底下，除了這筆以外還有沒有別的記錄
    const isRepeat = finalCustomerId
      ? entries.some(e => e.id !== id && e.customerId === finalCustomerId && e.designerId === designerId)
      : false;

    await updateEntry(id, {
      dateISO: new Date(`${editDate}T${editTime || '12:00'}:00`).toISOString(),
      service: editService,
      amount: Number(editAmount) || 0,
      customerId: finalCustomerId || null,
      isRepeat,
    });
    setOpenId(null);
    onChanged();
  };

  const removeEntry = async (id) => {
    await deleteEntry(id);
    setOpenId(null);
    onChanged();
  };

  const handleExport = async () => {
    if (visibleEntries.length === 0) return;
    setExporting(true);
    setExportMsg('');
    try {
      await exportCSV(visibleEntries, designers, customersById);
    } catch (err) {
      setExportMsg('匯出失敗，請確認裝置權限後再試一次');
    }
    setExporting(false);
  };

  return (
    <>
      <PageBackground src={framesImg} />
      <div style={{ padding: '20px 16px 100px', position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: 13, color: '#6E5B68' }}>歷史記錄</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#2B1E2A', marginTop: 2, marginBottom: 16 }}>
        全部服務記錄（{visibleEntries.length}）
      </div>

      <button
        onClick={handleExport}
        disabled={exporting || visibleEntries.length === 0}
        style={{
          width: '100%', padding: '13px', borderRadius: 14, border: '1px solid #EBE2E6',
          background: '#fff', color: '#2B1E2A', fontSize: 13, fontWeight: 600, marginBottom: 8,
          opacity: visibleEntries.length === 0 ? 0.5 : 1,
        }}
      >
        {exporting ? '匯出中…' : '⬆ 匯出 CSV'}
      </button>
      {exportMsg && (
        <div style={{ fontSize: 12, color: '#8A4A40', marginBottom: 8, textAlign: 'center' }}>{exportMsg}</div>
      )}

      {visibleEntries.length === 0 ? (
        <div style={{
          background: '#FFFFFF', borderRadius: 16, padding: 24, border: '1px solid #EBE2E6',
          textAlign: 'center', color: '#6E5B68', fontSize: 13, marginTop: 10,
        }}>
          還沒有任何記錄
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          {visibleEntries.map(e => (
            <div key={e.id} style={{
              background: '#FFFFFF', borderRadius: 14, border: '1px solid #EBE2E6', overflow: 'hidden',
            }}>
              <button onClick={() => (openId === e.id ? setOpenId(null) : openEdit(e))} style={{
                width: '100%', padding: '13px 16px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', background: 'none', border: 'none', textAlign: 'left',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#2B1E2A' }}>
                    {e.customerId ? (customersById[e.customerId]?.name || '未命名客人') : '未填客人'}
                    {e.isRepeat && (
                      <span style={{
                        marginLeft: 6, fontSize: 10.5, fontWeight: 700, color: '#6F8B6E',
                        background: '#E8EEE6', padding: '2px 6px', borderRadius: 999,
                      }}>回頭客</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#6E5B68', marginTop: 2 }}>
                    {dateStrOf(e.dateISO)} {timeStrOf(e.dateISO)} · {e.service} · ${fmt(e.amount)}
                    <span style={{ color: '#8A6B2A', fontWeight: 600 }}> ・抽 ${fmt(e.amount * (rateById[e.designerId] ?? 0))}</span>
                    {role === 'owner' ? ` · ${nameById[e.designerId] || '未知'}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#9C8B97', flexShrink: 0 }}>{openId === e.id ? '收合 ▲' : '編輯 ▼'}</div>
              </button>

              {openId === e.id && (
                <div style={{ padding: '0 16px 16px' }}>
                  <div style={{ marginBottom: 8 }}>
                    <CustomerAutocomplete
                      customers={customers}
                      queryText={editCustomerQuery}
                      onQueryChange={setEditCustomerQuery}
                      selectedId={editCustomerId}
                      onSelect={(c) => { setEditCustomerId(c ? c.id : null); if (c) setEditCustomerQuery(c.name); }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input type="date" value={editDate} max={dateStrOf(new Date().toISOString())} onChange={ev => setEditDate(ev.target.value)} style={{
                      flex: 1, boxSizing: 'border-box', fontSize: 13, border: '1px solid #EBE2E6',
                      borderRadius: 10, padding: '9px 12px', outline: 'none',
                    }} />
                    <input type="time" value={editTime} onChange={ev => setEditTime(ev.target.value)} style={{
                      flex: 1, boxSizing: 'border-box', fontSize: 13, border: '1px solid #EBE2E6',
                      borderRadius: 10, padding: '9px 12px', outline: 'none',
                    }} />
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    {services.map(s => (
                      <Chip key={s} active={editService === s} onClick={() => setEditService(s)}>{s}</Chip>
                    ))}
                  </div>
                  <input type="number" value={editAmount} onChange={ev => setEditAmount(ev.target.value)} placeholder="金額" style={{
                    width: '100%', boxSizing: 'border-box', fontSize: 13, border: '1px solid #EBE2E6',
                    borderRadius: 10, padding: '9px 12px', marginBottom: 10, outline: 'none',
                  }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => saveEdit(e.id, e.designerId)} style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                      background: '#4A2545', color: '#fff', fontSize: 13, fontWeight: 600,
                    }}>儲存</button>
                    <button onClick={() => removeEntry(e.id)} style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #E6C7C1',
                      background: '#F5E6E3', color: '#8A4A40', fontSize: 13, fontWeight: 600,
                    }}>刪除</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  );
}
