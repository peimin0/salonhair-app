import React, { useState } from 'react';
import {
  addDesigner, setRole, setCurrentDesignerId, setSalonCode,
  createSalon, salonExists, verifySalonPin, getDesignersOnce,
} from '../data/store.js';
import { PrimaryButton, PageBackground } from '../components/ui.jsx';
import { color, radius, shadow } from '../theme.js';
import interiorImg from '../assets/photos/interior.jpg';

export default function Onboarding({ cachedSalonCode, onDone }) {
  // choose → (老闆) ownerEntry → ownerCreatePin → ownerCodeReveal | ownerJoinCode
  //        → (設計師) designerJoinCode → pickSelf | createSelf
  //        （如果這支裝置已經連過某間店，老闆走 ownerPinOnly、設計師直接跳過代碼輸入）
  const [step, setStep] = useState('choose');
  const [name, setName] = useState('');
  const [rate, setRate] = useState('45');
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [joinedCode, setJoinedCode] = useState(cachedSalonCode || '');
  const [foundDesigners, setFoundDesigners] = useState([]);

  const resetTransient = () => { setPinInput(''); setPinConfirm(''); setCodeInput(''); setError(''); };

  // ---------- 老闆 ----------
  const chooseOwner = () => {
    resetTransient();
    setStep(cachedSalonCode ? 'ownerPinOnly' : 'ownerEntry');
  };

  const confirmOwnerPinOnly = async () => {
    setLoading(true); setError('');
    const res = await verifySalonPin(cachedSalonCode, pinInput);
    setLoading(false);
    if (!res.ok) { setError('密碼不對，再試一次'); setPinInput(''); return; }
    await setRole('owner');
    onDone();
  };

  const confirmCreateSalon = async () => {
    if (pinInput.length !== 4) { setError('請輸入 4 位數密碼'); return; }
    if (pinInput !== pinConfirm) { setError('兩次輸入的密碼不一樣'); return; }
    setLoading(true); setError('');
    const code = await createSalon(pinInput);
    setLoading(false);
    setNewCode(code);
    await setSalonCode(code);
    await setRole('owner');
    setStep('ownerCodeReveal');
  };

  const finishAfterReveal = () => onDone();

  const confirmJoinAsOwner = async () => {
    const code = codeInput.trim().toUpperCase();
    if (code.length !== 6) { setError('店家代碼是 6 個字'); return; }
    if (pinInput.length !== 4) { setError('請輸入 4 位數密碼'); return; }
    setLoading(true); setError('');
    const res = await verifySalonPin(code, pinInput);
    setLoading(false);
    if (!res.ok) {
      setError(res.reason === 'not_found' ? '找不到這個店家代碼' : '密碼不對');
      return;
    }
    await setSalonCode(code);
    await setRole('owner');
    onDone();
  };

  // ---------- 設計師 ----------
  const chooseDesigner = async () => {
    resetTransient();
    if (cachedSalonCode) {
      setLoading(true);
      const ds = await getDesignersOnce(cachedSalonCode);
      setLoading(false);
      setFoundDesigners(ds);
      setStep(ds.length > 0 ? 'pickSelf' : 'createSelf');
    } else {
      setStep('designerJoinCode');
    }
  };

  const confirmJoinAsDesigner = async () => {
    const code = codeInput.trim().toUpperCase();
    if (code.length !== 6) { setError('店家代碼是 6 個字'); return; }
    setLoading(true); setError('');
    const exists = await salonExists(code);
    if (!exists) { setLoading(false); setError('找不到這個店家代碼，跟店長確認一下'); return; }
    const ds = await getDesignersOnce(code);
    setLoading(false);
    setJoinedCode(code);
    await setSalonCode(code);
    setFoundDesigners(ds);
    setStep(ds.length > 0 ? 'pickSelf' : 'createSelf');
  };

  const pickExisting = async (id) => {
    await setRole('designer');
    await setCurrentDesignerId(id);
    onDone();
  };

  const createSelf = async () => {
    if (!name.trim()) return;
    const code = cachedSalonCode || joinedCode;
    setLoading(true);
    const d = await addDesigner(code, name.trim(), Math.min(90, Math.max(10, Number(rate) || 45)) / 100);
    setLoading(false);
    await setRole('designer');
    await setCurrentDesignerId(d.id);
    onDone();
  };

  const pinInputStyle = {
    width: '100%', boxSizing: 'border-box', fontSize: 24, letterSpacing: 10, textAlign: 'center',
    border: `1px solid ${color.hairline}`, borderRadius: radius.md, padding: '14px', marginBottom: 12,
    outline: 'none', background: color.surface, fontWeight: 700, color: color.textPrimary,
  };
  const codeInputStyle = {
    ...pinInputStyle, letterSpacing: 6, fontSize: 20, textTransform: 'uppercase',
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: color.textSecondary, marginBottom: 8 };
  const backBtnStyle = {
    width: '100%', padding: '12px', marginTop: 10, borderRadius: radius.md, border: 'none',
    background: 'none', color: color.textSecondary, fontSize: 12.5, fontWeight: 600,
  };

  return (
    <>
      <PageBackground src={interiorImg} />
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '24px 20px', fontFamily: '-apple-system, sans-serif',
        paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
        position: 'relative', zIndex: 1,
      }}>

        {step === 'choose' && (
          <>
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

        {step === 'ownerEntry' && (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, color: color.textPrimary, marginBottom: 6 }}>店長 / 老闆</div>
            <div style={{ fontSize: 12.5, color: color.textSecondary, marginBottom: 18 }}>這支裝置第一次使用，選一個開始的方式</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => { resetTransient(); setStep('ownerCreatePin'); }} style={{
                padding: '16px', borderRadius: radius.md, border: `1px solid ${color.hairline}`, background: color.surface,
                textAlign: 'left', boxShadow: shadow.soft,
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: color.textPrimary }}>✦ 建立新店家</div>
                <div style={{ fontSize: 12, color: color.textSecondary, marginTop: 4 }}>第一次用這個 App，還沒有店家代碼</div>
              </button>
              <button onClick={() => { resetTransient(); setStep('ownerJoinCode'); }} style={{
                padding: '16px', borderRadius: radius.md, border: `1px solid ${color.hairline}`, background: color.surface,
                textAlign: 'left', boxShadow: shadow.soft,
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: color.textPrimary }}>🔑 已經有店家代碼</div>
                <div style={{ fontSize: 12, color: color.textSecondary, marginTop: 4 }}>這間店已經在別的裝置上設定過了</div>
              </button>
            </div>
            <button onClick={() => setStep('choose')} style={backBtnStyle}>返回</button>
          </>
        )}

        {step === 'ownerCreatePin' && (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, color: color.textPrimary, marginBottom: 6 }}>設定管理密碼</div>
            <div style={{ fontSize: 12.5, color: color.textSecondary, marginBottom: 18, lineHeight: 1.6 }}>
              這組密碼用來保護老闆視角，之後在任何裝置切換成老闆身份都需要它。
            </div>
            <div style={labelStyle}>設定 4 位數密碼</div>
            <input type="tel" inputMode="numeric" maxLength={4} value={pinInput}
              onChange={e => { setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
              style={pinInputStyle} />
            <div style={labelStyle}>再輸入一次確認</div>
            <input type="tel" inputMode="numeric" maxLength={4} value={pinConfirm}
              onChange={e => { setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
              style={pinInputStyle} />
            {error && <div style={{ fontSize: 12, color: color.roseDeep, marginBottom: 12 }}>{error}</div>}
            <PrimaryButton onClick={confirmCreateSalon} disabled={loading || pinInput.length !== 4 || pinConfirm.length !== 4}>
              {loading ? '建立中…' : '建立店家'}
            </PrimaryButton>
            <button onClick={() => setStep('ownerEntry')} style={backBtnStyle}>返回</button>
          </>
        )}

        {step === 'ownerCodeReveal' && (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, color: color.textPrimary, marginBottom: 6 }}>店家建立完成 🎉</div>
            <div style={{ fontSize: 12.5, color: color.textSecondary, marginBottom: 18, lineHeight: 1.6 }}>
              把這組代碼給你的設計師，他們選「我是設計師」時輸入這組代碼，就會連到同一份資料。
            </div>
            <div style={{
              background: color.surface, border: `1px solid ${color.hairline}`, borderRadius: radius.lg,
              padding: '22px', textAlign: 'center', marginBottom: 18, boxShadow: shadow.soft,
            }}>
              <div style={{ fontSize: 11, color: color.textSecondary, fontWeight: 600, marginBottom: 8 }}>店家代碼</div>
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 6, color: color.plum }}>{newCode}</div>
            </div>
            <PrimaryButton onClick={finishAfterReveal}>我記下來了，開始使用</PrimaryButton>
          </>
        )}

        {step === 'ownerJoinCode' && (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, color: color.textPrimary, marginBottom: 6 }}>連到已有的店家</div>
            <div style={labelStyle}>店家代碼（6 個字）</div>
            <input value={codeInput} maxLength={6}
              onChange={e => { setCodeInput(e.target.value.toUpperCase()); setError(''); }}
              style={codeInputStyle} />
            <div style={labelStyle}>管理密碼</div>
            <input type="tel" inputMode="numeric" maxLength={4} value={pinInput}
              onChange={e => { setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
              style={pinInputStyle} />
            {error && <div style={{ fontSize: 12, color: color.roseDeep, marginBottom: 12 }}>{error}</div>}
            <PrimaryButton onClick={confirmJoinAsOwner} disabled={loading}>{loading ? '確認中…' : '進入老闆視角'}</PrimaryButton>
            <button onClick={() => setStep('ownerEntry')} style={backBtnStyle}>返回</button>
          </>
        )}

        {step === 'ownerPinOnly' && (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, color: color.textPrimary, marginBottom: 6 }}>輸入管理密碼</div>
            <div style={{ fontSize: 12.5, color: color.textSecondary, marginBottom: 18 }}>這支裝置已經連到店家了，輸入密碼即可切換成老闆視角。</div>
            <input type="tel" inputMode="numeric" maxLength={4} value={pinInput}
              onChange={e => { setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
              style={pinInputStyle} />
            {error && <div style={{ fontSize: 12, color: color.roseDeep, marginBottom: 12 }}>{error}</div>}
            <PrimaryButton onClick={confirmOwnerPinOnly} disabled={loading || pinInput.length !== 4}>
              {loading ? '確認中…' : '確認'}
            </PrimaryButton>
            <button onClick={() => setStep('choose')} style={backBtnStyle}>返回</button>
          </>
        )}

        {step === 'designerJoinCode' && (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, color: color.textPrimary, marginBottom: 6 }}>加入你的店家</div>
            <div style={{ fontSize: 12.5, color: color.textSecondary, marginBottom: 18 }}>跟店長要這組 6 個字的店家代碼。</div>
            <div style={labelStyle}>店家代碼</div>
            <input value={codeInput} maxLength={6}
              onChange={e => { setCodeInput(e.target.value.toUpperCase()); setError(''); }}
              style={codeInputStyle} />
            {error && <div style={{ fontSize: 12, color: color.roseDeep, marginBottom: 12 }}>{error}</div>}
            <PrimaryButton onClick={confirmJoinAsDesigner} disabled={loading}>{loading ? '確認中…' : '加入'}</PrimaryButton>
            <button onClick={() => setStep('choose')} style={backBtnStyle}>返回</button>
          </>
        )}

        {step === 'pickSelf' && (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, color: color.textPrimary, marginBottom: 6 }}>你是哪一位？</div>
            <div style={{ fontSize: 12.5, color: color.textSecondary, marginBottom: 18 }}>選擇你的名字，或新增自己</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              {foundDesigners.map(d => (
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
            <div style={labelStyle}>你的名字</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="例如：小雅" style={{
              width: '100%', boxSizing: 'border-box', fontSize: 16, border: `1px solid ${color.hairline}`,
              borderRadius: radius.md, padding: '12px 14px', marginBottom: 16, outline: 'none', background: color.surface,
            }} />
            <div style={labelStyle}>抽成比例（%）</div>
            <input type="number" value={rate} onChange={e => setRate(e.target.value)} style={{
              width: '100%', boxSizing: 'border-box', fontSize: 16, border: `1px solid ${color.hairline}`,
              borderRadius: radius.md, padding: '12px 14px', marginBottom: 20, outline: 'none', background: color.surface,
            }} />
            <PrimaryButton onClick={createSelf} disabled={loading || !name.trim()}>
              {loading ? '建立中…' : '完成，開始使用'}
            </PrimaryButton>
          </>
        )}

      </div>
    </>
  );
}
