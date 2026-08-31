import React, { useState } from 'react';
import { Chip, PrimaryButton, CustomerAutocomplete } from '../components/ui.jsx';
import { addEntry, addCustomer } from '../data/store.js';

function todayStr() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
}

function nowTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function EntryScreen({ role, designers, currentDesignerId, services, customers, entries, onSaved }) {
  const fixedDesigner = role === 'designer'
    ? designers.find(d => d.id === currentDesignerId)
    : null;

  const [targetId, setTargetId] = useState(fixedDesigner ? fixedDesigner.id : (designers[0]?.id || ''));
  const [service, setService] = useState(services[0] || '');
  const [amount, setAmount] = useState('');
  const [dateStr, setDateStr] = useState(todayStr());
  const [timeStr, setTimeStr] = useState(nowTimeStr());
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [saved, setSaved] = useState(false);

  const targetDesigner = designers.find(d => d.id === targetId) || null;
  const commissionPreview = targetDesigner && amount
    ? Math.round(Number(amount) * targetDesigner.commissionRate)
    : null;

  // 判斷這位客人在這位設計師底下是不是回頭客：只要名字對上既有客人，
  // 且該客人在這位設計師底下已經有記錄，就算回頭客
  const matchedByName = customers.find(c => c.name === customerQuery.trim());
  const effectiveCustomerId = customerId || (matchedByName ? matchedByName.id : null);
  const priorVisits = effectiveCustomerId
    ? entries.filter(e => e.customerId === effectiveCustomerId && e.designerId === targetId).length
    : 0;
  const willBeRepeat = priorVisits > 0;

  const handleSave = async () => {
    if (!amount || !targetId || !dateStr) return;
    const name = customerQuery.trim();
    let finalCustomerId = effectiveCustomerId;
    if (!finalCustomerId && name) {
      const created = await addCustomer(name);
      finalCustomerId = created.id;
    }
    // 補登過去日期時，用選擇的時間；沒特別選就是現在的時間
    const dateISO = new Date(`${dateStr}T${timeStr || '12:00'}:00`).toISOString();
    await addEntry({
      designerId: targetId,
      service,
      amount: Number(amount),
      isRepeat: willBeRepeat,
      customerId: finalCustomerId || null,
      dateISO,
    });
    setSaved(true);
    setAmount('');
    setCustomerQuery('');
    setCustomerId(null);
    setDateStr(todayStr());
    setTimeStr(nowTimeStr());
    onSaved();
    setTimeout(() => setSaved(false), 1600);
  };

  if (designers.length === 0) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#2B1E2A', marginBottom: 8 }}>
          還沒有設計師資料
        </div>
        <div style={{ fontSize: 13, color: '#6E5B68' }}>
          先去「設定」分頁新增設計師，才能開始記錄服務。
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <div style={{ fontSize: 13, color: '#6E5B68' }}>今天</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#2B1E2A', marginTop: 2, marginBottom: 16 }}>
        新增一筆服務記錄
      </div>

      {!fixedDesigner && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6E5B68', marginBottom: 8 }}>設計師</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {designers.map(d => (
              <Chip key={d.id} active={targetId === d.id} onClick={() => setTargetId(d.id)}>
                {d.name}
              </Chip>
            ))}
          </div>
        </>
      )}

      <div style={{ fontSize: 12, fontWeight: 600, color: '#6E5B68', marginBottom: 8 }}>客人</div>
      <div style={{ marginBottom: 8 }}>
        <CustomerAutocomplete
          customers={customers}
          queryText={customerQuery}
          onQueryChange={setCustomerQuery}
          selectedId={customerId}
          onSelect={(c) => { setCustomerId(c ? c.id : null); if (c) setCustomerQuery(c.name); }}
        />
      </div>
      {customerQuery.trim() && (
        <div style={{
          fontSize: 12, marginBottom: 18, paddingLeft: 4, fontWeight: 600,
          color: willBeRepeat ? '#6F8B6E' : '#B8934A',
        }}>
          {willBeRepeat ? `↻ 回頭客（已服務過 ${priorVisits} 次）` : '✦ 新客人'}
        </div>
      )}
      {!customerQuery.trim() && <div style={{ marginBottom: 18 }} />}

      <div style={{ fontSize: 12, fontWeight: 600, color: '#6E5B68', marginBottom: 8 }}>服務項目</div>
      {services.length === 0 ? (
        <div style={{ fontSize: 12.5, color: '#9C8B97', marginBottom: 18 }}>
          尚未設定服務項目，去「設定」分頁新增。
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {services.map(s => (
            <Chip key={s} active={service === s} onClick={() => setService(s)}>{s}</Chip>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6E5B68', marginBottom: 8 }}>日期</div>
          <input
            type="date"
            value={dateStr}
            max={todayStr()}
            onChange={e => setDateStr(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box', fontSize: 15, color: '#2B1E2A',
              border: '1px solid #EBE2E6', borderRadius: 14, padding: '13px 16px',
              background: '#fff', outline: 'none',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6E5B68', marginBottom: 8 }}>時間</div>
          <input
            type="time"
            value={timeStr}
            onChange={e => setTimeStr(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box', fontSize: 15, color: '#2B1E2A',
              border: '1px solid #EBE2E6', borderRadius: 14, padding: '13px 16px',
              background: '#fff', outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: '#6E5B68', marginBottom: 8 }}>消費金額</div>
      <input
        type="number"
        inputMode="numeric"
        placeholder="輸入金額"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box', fontSize: 22, fontWeight: 700, color: '#2B1E2A',
          border: '1px solid #EBE2E6', borderRadius: 14, padding: '14px 16px', marginBottom: 8,
          background: '#fff', outline: 'none',
        }}
      />
      {targetDesigner && (
        <div style={{ fontSize: 12.5, color: '#6E5B68', marginBottom: 20, paddingLeft: 4 }}>
          抽成 {Math.round(targetDesigner.commissionRate * 100)}%
          {commissionPreview !== null && (
            <span style={{ fontWeight: 700, color: '#4A2545' }}>　→　抽成金額 ${commissionPreview.toLocaleString('zh-TW')}</span>
          )}
        </div>
      )}

      <PrimaryButton onClick={handleSave} disabled={!amount || !service} tone={saved ? 'sage' : 'plum'}>
        {saved ? '已記錄 ✓' : '儲存記錄'}
      </PrimaryButton>
    </div>
  );
}
