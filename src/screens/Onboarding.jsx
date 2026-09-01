import React, { useState } from 'react';
import { addDesigner, setRole, setCurrentDesignerId } from '../data/store.js';
import { PrimaryButton, PhotoBanner } from '../components/ui.jsx';
import { color, radius, shadow } from '../theme.js';
import interiorImg from '../assets/photos/interior.jpg';

export default function Onboarding({ designers, onDone }) {
  const [step, setStep] = useState('choose'); // choose | pickSelf | createSelf
  const [name, setName] = useState('');
  const [rate, setRate] = useState('45');

  const chooseOwner = async () => {
    await setRole('owner');
    onDone();
  };

  const chooseDesigner = () => {
    setStep(designers.length > 0 ? 'pickSelf' : 'createSelf');
  };

  const pickExisting = async (id) => {
    await setRole('designer');
    await setCurrentDesignerId(id);
    onDone();
  };

  const createSelf = async () => {
    if (!name.trim()) return;
    const d = await addDesigner(name.trim(), Math.min(90, Math.max(10, Number(rate) || 45)) / 100);
    await setRole('designer');
    await setCurrentDesignerId(d.id);
    onDone();
  };

  return (
    <div style={{
      minHeight: '100vh', background: color.pageGradient, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '24px 20px', fontFamily: '-apple-system, sans-serif',
      paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
      paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
    }}>
      {step === 'choose' && (
        <>
          <PhotoBanner src={interiorImg} height={190} style={{ marginBottom: 20 }} />
          <div style={{ fontSize: 13, color: color.textSecondary, textAlign: 'center' }}>歡迎使用</div>
          <div style={{ fontSize: 27, fontWeight: 700, color: color.textPrimary, textAlign: 'center', marginBottom: 28, letterSpacing: '-0.01em' }}>
            髮廊業績通
          </div>
          <div style={{ fontSize: 13, color: color.textSecondary, marginBottom: 14, textAlign: 'center' }}>
            你的身份是？
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={chooseDesigner} style={{
              padding: '18px', borderRadius: radius.lg, border: `1px solid ${color.hairline}`, background: color.surface,
              textAlign: 'left', cursor: 'pointer', boxShadow: shadow.soft,
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: color.textPrimary }}>💇 我是設計師</div>
              <div style={{ fontSize: 12.5, color: color.textSecondary, marginTop: 4 }}>查看自己的業績與趨勢</div>
            </button>
            <button onClick={chooseOwner} style={{
              padding: '18px', borderRadius: radius.lg, border: 'none',
              background: `linear-gradient(155deg, ${color.plum} 0%, ${color.plumDeep} 100%)`,
              textAlign: 'left', cursor: 'pointer', boxShadow: shadow.elevated,
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>🛡️ 我是店長 / 老闆</div>
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>查看團隊總覽與留才風險</div>
            </button>
          </div>
        </>
      )}

      {step === 'pickSelf' && (
        <>
          <div style={{ fontSize: 20, fontWeight: 700, color: color.textPrimary, marginBottom: 6 }}>你是哪一位？</div>
          <div style={{ fontSize: 12.5, color: color.textSecondary, marginBottom: 18 }}>選擇你的名字，或新增自己</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            {designers.map(d => (
              <button key={d.id} onClick={() => pickExisting(d.id)} style={{
                padding: '14px 16px', borderRadius: radius.md, border: `1px solid ${color.hairline}`, background: color.surface,
                textAlign: 'left', fontSize: 15, fontWeight: 600, color: color.textPrimary, boxShadow: shadow.soft,
              }}>
                {d.name}
              </button>
            ))}
          </div>
          <button onClick={() => setStep('createSelf')} style={{
            padding: '12px', borderRadius: radius.md, border: `1px dashed ${color.gold}`, background: color.goldTint,
            color: color.goldDeep, fontSize: 13, fontWeight: 600,
          }}>
            ＋ 名單裡沒有我，新增自己
          </button>
        </>
      )}

      {step === 'createSelf' && (
        <>
          <div style={{ fontSize: 20, fontWeight: 700, color: color.textPrimary, marginBottom: 18 }}>建立你的個人檔案</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: color.textSecondary, marginBottom: 8 }}>你的名字</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="例如：小雅" style={{
            width: '100%', boxSizing: 'border-box', fontSize: 16, border: `1px solid ${color.hairline}`,
            borderRadius: radius.md, padding: '12px 14px', marginBottom: 16, outline: 'none', background: color.surface,
          }} />
          <div style={{ fontSize: 12, fontWeight: 600, color: color.textSecondary, marginBottom: 8 }}>抽成比例（%）</div>
          <input type="number" value={rate} onChange={e => setRate(e.target.value)} style={{
            width: '100%', boxSizing: 'border-box', fontSize: 16, border: `1px solid ${color.hairline}`,
            borderRadius: radius.md, padding: '12px 14px', marginBottom: 20, outline: 'none', background: color.surface,
          }} />
          <PrimaryButton onClick={createSelf} disabled={!name.trim()}>完成，開始使用</PrimaryButton>
        </>
      )}
    </div>
  );
}
