import React, { useState } from 'react';
import { Chip, PrimaryButton } from '../components/ui.jsx';
import { addEntry } from '../data/store.js';

const services = ['剪髮', '染髮', '燙髮', '護髮'];

export default function EntryScreen({ role, designers, currentDesignerId, onSaved }) {
  const fixedDesigner = role === 'designer'
    ? designers.find(d => d.id === currentDesignerId)
    : null;

  const [targetId, setTargetId] = useState(fixedDesigner ? fixedDesigner.id : (designers[0]?.id || ''));
  const [service, setService] = useState(services[0]);
  const [amount, setAmount] = useState('');
  const [isRepeat, setIsRepeat] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!amount || !targetId) return;
    await addEntry({
      designerId: targetId,
      service,
      amount: Number(amount),
      isRepeat,
    });
    setSaved(true);
    setAmount('');
    setIsRepeat(false);
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

      <div style={{ fontSize: 12, fontWeight: 600, color: '#6E5B68', marginBottom: 8 }}>服務項目</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {services.map(s => (
          <Chip key={s} active={service === s} onClick={() => setService(s)}>{s}</Chip>
        ))}
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
          border: '1px solid #EBE2E6', borderRadius: 14, padding: '14px 16px', marginBottom: 16,
          background: '#fff', outline: 'none',
        }}
      />

      <button onClick={() => setIsRepeat(v => !v)} style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 16px',
        borderRadius: 14, border: '1px solid #EBE2E6', background: '#fff', marginBottom: 20,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          background: isRepeat ? '#4A2545' : '#fff', border: isRepeat ? 'none' : '1px solid #C9BAC5',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13,
        }}>
          {isRepeat ? '✓' : ''}
        </div>
        <div style={{ fontSize: 14, color: '#2B1E2A', fontWeight: 600 }}>這是回頭客</div>
      </button>

      <PrimaryButton onClick={handleSave} disabled={!amount} tone={saved ? 'sage' : 'plum'}>
        {saved ? '已記錄 ✓' : '儲存記錄'}
      </PrimaryButton>
    </div>
  );
}
