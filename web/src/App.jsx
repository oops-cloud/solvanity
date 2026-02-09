import { useState, useEffect, useRef, useCallback } from "react";

const BASE58_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const TIP_ADDRESS = "uhoh2yhrL6EW5xCG7FNXVXa92ZCnyCzQCeGV3xPJKSq";

function generateRandomAddress() {
  let a = "";
  for (let i = 0; i < 44; i++) a += BASE58_CHARS[Math.floor(Math.random() * 58)];
  return a;
}

function estimateDifficulty(prefix, suffix, caseSensitive) {
  const len = (prefix?.length || 0) + (suffix?.length || 0);
  if (len === 0) return { time: "instant", tier: "easy", chars: 0 };
  if (caseSensitive) {
    if (len <= 2) return { time: "< 30s", tier: "easy", chars: len };
    if (len === 3) return { time: "~1-5 min", tier: "medium", chars: len };
    if (len === 4) return { time: "~5-30 min", tier: "medium", chars: len };
    if (len === 5) return { time: "~1-8 hrs", tier: "hard", chars: len };
    if (len === 6) return { time: "~1-7 days", tier: "hard", chars: len };
    if (len === 7) return { time: "~1-12 months", tier: "extreme", chars: len };
    return { time: "potentially years", tier: "extreme", chars: len };
  } else {
    if (len <= 2) return { time: "< 10s", tier: "easy", chars: len };
    if (len === 3) return { time: "< 30s", tier: "easy", chars: len };
    if (len === 4) return { time: "~1-5 min", tier: "medium", chars: len };
    if (len === 5) return { time: "~5-30 min", tier: "medium", chars: len };
    if (len === 6) return { time: "~1-8 hrs", tier: "hard", chars: len };
    if (len === 7) return { time: "~1-7 days", tier: "hard", chars: len };
    return { time: "~weeks+", tier: "extreme", chars: len };
  }
}
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 60; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.5 + 0.5 });
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = "rgba(148,252,198,0.5)"; ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x, dy = p.y - particles[j].y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = "rgba(148,252,198," + (0.12 * (1 - d / 120)) + ")"; ctx.stroke(); }
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

function Confetti({ active }) {
  const canvasRef = useRef(null);
  const hasRun = useRef(false);
  useEffect(() => {
    if (!active || hasRun.current) return;
    hasRun.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = [];
    const colors = ["#94FCC6", "#14F195", "#ffffff", "#5BFFA8", "#B4FFD8"];
    for (let i = 0; i < 150; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -(Math.random() * Math.random() * canvas.height),
        w: Math.random() * Math.random() * 12 + 3,
        h: Math.random() * Math.random() * 6 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * (Math.random() * 6 + 1),
        vy: Math.random() * Math.random() * 3 + 0.8,
        rot: Math.random() * 360,
        rotV: (Math.random() - 0.5) * (Math.random() * 15 + 2),
        opacity: 1,
      });
    }
    let frame = 0;
    let id;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx;
        p.vy += 0.05;
        p.vy = Math.min(p.vy, 5);
        p.y += p.vy;
        p.rot += p.rotV;
        if (frame > 80) p.opacity = Math.max(0, p.opacity - 0.006);
        if (p.opacity <= 0 || p.y > canvas.height + 20) return;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frame++;
      if (frame < 500) { id = requestAnimationFrame(draw); } else { ctx.clearRect(0, 0, canvas.width, canvas.height); }
    };
    id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [active]);
  useEffect(() => { if (!active) hasRun.current = false; }, [active]);
  
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 999, pointerEvents: "none" }} />;
}
const INVALID_BASE58_STRICT = /[0OIl]/;
const INVALID_BASE58_LOOSE = /[0]/;
function getInvalidChars(str, caseSensitive) {
  const re = caseSensitive ? INVALID_BASE58_STRICT : INVALID_BASE58_LOOSE;
  return [...str].filter(c => re.test(c)).filter((c, i, a) => a.indexOf(c) === i);
}function HighlightedAddress({ address, prefix, suffix, large }) {
  if (!address) return null;
  const pLen = prefix?.length || 0;
  const sLen = suffix?.length || 0;
  const p = address.slice(0, pLen);
  const m = address.slice(pLen, address.length - (sLen || 0));
  const s = sLen ? address.slice(-sLen) : "";
  const accent = { color: "#94FCC6", fontWeight: 700, textShadow: "0 0 18px rgba(148,252,198,0.35)" };
  return (
    <div style={{
      fontFamily: "var(--mono)", fontSize: large ? "1.05rem" : "0.8rem", letterSpacing: "0.4px",
      padding: large ? "14px 18px" : "8px 12px",
      background: large ? "linear-gradient(135deg,rgba(148,252,198,0.07),rgba(20,241,149,0.03))" : "rgba(255,255,255,0.015)",
      border: "1px solid " + (large ? "rgba(148,252,198,0.25)" : "rgba(255,255,255,0.04)"),
      borderRadius: "8px", wordBreak: "break-all",
    }}>
      <span style={accent}>{p}</span>
      <span style={{ color: "rgba(255,255,255,0.35)" }}>{m}</span>
      {s && <span style={accent}>{s}</span>}
    </div>
  );
}

function ScrollingKeys({ active }) {
  const [rows, setRows] = useState([]);
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    ref.current = setInterval(() => setRows(prev => [generateRandomAddress(), ...prev.slice(0, 6)]), 90);
    return () => clearInterval(ref.current);
  }, [active]);
  if (!active && rows.length === 0) return null;
  return (
    <div style={{
      marginTop: "14px", maxHeight: "180px", overflow: "hidden", borderRadius: "10px",
      background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.04)", padding: "8px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "6px", padding: "0 4px" }}>
        <div style={{
          width: 5, height: 5, borderRadius: "50%",
          background: active ? "#94FCC6" : "#555",
          boxShadow: active ? "0 0 8px rgba(148,252,198,0.5)" : "none",
          animation: active ? "pulse 1s infinite" : "none",
        }} />
        <span style={{
          fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "2px",
          color: active ? "rgba(148,252,198,0.5)" : "rgba(255,255,255,0.2)",
          fontFamily: "var(--mono)",
        }}>
          {active ? "Searching keypairs…" : "Paused"}
        </span>
      </div>
      {rows.map((a, i) => (
        <div key={i} style={{
          fontFamily: "var(--mono)", fontSize: "0.65rem",
          color: "rgba(255,255,255," + Math.max(0.05, 0.28 - i * 0.038) + ")",
          padding: "1.5px 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{a}</div>
      ))}
    </div>
  );
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
      padding: "5px 12px", fontSize: "0.6rem", fontFamily: "var(--mono)",
      background: copied ? "rgba(148,252,198,0.1)" : "rgba(255,255,255,0.04)",
      border: "1px solid " + (copied ? "rgba(148,252,198,0.25)" : "rgba(255,255,255,0.08)"),
      borderRadius: "6px", color: copied ? "#94FCC6" : "rgba(255,255,255,0.55)",
      cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase",
    }}>{copied ? "Copied ✓" : label || "Copy"}</button>
  );
}

const PHASE = { INPUT: 0, GRIND: 1, FOUND: 2, REVEALED: 3 };

export default function App() {
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [phase, setPhase] = useState(PHASE.INPUT);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [tipSent, setTipSent] = useState(false);
  const [tipAmount, setTipAmount] = useState("0.05");
  const [workerCount, setWorkerCount] = useState(0);
  const [globalCount, setGlobalCount] = useState(0);

  useEffect(() => {
    fetch("/api/counter").then(r => r.json()).then(d => setGlobalCount(d.count)).catch(() => {});
  }, []);
  const timerRef = useRef(null);
  const workersRef = useRef([]);

  const diff = estimateDifficulty(prefix, suffix, caseSensitive);
  const totalLen = (prefix?.length || 0) + (suffix?.length || 0);

  const startGrind = useCallback(() => {
    if (totalLen === 0) return;
    setPhase(PHASE.GRIND);
    setAttempts(0);
    setElapsed(0);
    setResult(null);
    setTipSent(false);

    const t0 = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000);

    const cores = navigator.hardwareConcurrency || 4;
    const numWorkers = Math.max(1, cores - 1);
    setWorkerCount(numWorkers);
    let totalAttempts = 0;
    let found = false;

    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
      worker.postMessage({ prefix, suffix, caseSensitive });
      worker.onmessage = (e) => {
        if (found) return;
        if (e.data.type === 'progress') {
          totalAttempts += e.data.attempts;
          setAttempts(totalAttempts);
        } else if (e.data.type === 'found') {
          found = true;
          clearInterval(timerRef.current);
          workersRef.current.forEach(w => w.terminate());
          workersRef.current = [];
          setAttempts(totalAttempts + e.data.attempts);
          setResult({
            address: e.data.address,
            privateKey: e.data.privateKey,
          });
          setPhase(PHASE.FOUND);
          fetch("/api/counter", { method: "POST" }).then(r => r.json()).then(d => setGlobalCount(d.count)).catch(() => {});
        }
      };
      workersRef.current.push(worker);
    }
  }, [prefix, suffix, caseSensitive, totalLen]);

  const stopGrind = () => {
    clearInterval(timerRef.current);
    workersRef.current.forEach(w => w.terminate());
    workersRef.current = [];
    setPhase(PHASE.INPUT);
  };

  useEffect(() => () => {
    clearInterval(timerRef.current);
    workersRef.current.forEach(w => w.terminate());
  }, []);

  const fmt = n => n.toLocaleString();

  const labelStyle = {
    display: "block", fontSize: "0.62rem", textTransform: "uppercase",
    letterSpacing: "2.5px", color: "rgba(255,255,255,0.85)", marginBottom: "7px",
    fontFamily: "var(--mono)",
  };

  const primaryBtn = disabled => ({
    width: "100%", padding: "15px",
    background: disabled ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg,#94FCC6,#14F195)",
    border: "none", borderRadius: "12px",
    color: disabled ? "rgba(255,255,255,0.15)" : "#080B0E",
    fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--body)",
    letterSpacing: "1.5px", textTransform: "uppercase",
    cursor: disabled ? "not-allowed" : "pointer",
  });

  return (
    <div style={{
      minHeight: "100vh", background: "#070A0D", color: "#fff",
      fontFamily: "var(--body)", position: "relative",
      "--body": "'Outfit','Sora',sans-serif",
      "--mono": "'JetBrains Mono','Fira Code',monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cFall{0%{opacity:1;transform:translateY(0) translateX(0) rotate(0deg)}30%{opacity:1}100%{opacity:0;transform:translateY(var(--ty)) translateX(var(--tx)) rotate(var(--rot))}}50%{opacity:1}100%{opacity:0;transform:translateY(var(--ty)) translateX(var(--tx)) rotate(var(--rot))}}60%{opacity:1}100%{opacity:0;transform:translate(var(--tx),var(--ty)) rotate(var(--rot))}} @keyframes fadeIn{from{opacity:0}to{opacity:1}} 70%{opacity:1}100%{opacity:0;transform:translateY(100vh) rotate(720deg)}} .github-link{color:rgba(148,252,198,.4);text-decoration:underline;transition:all .2s ease;display:inline-block} .github-link,.github-link:visited{color:rgba(148,252,198,.4);text-decoration:underline} .github-link:hover{color:#94FCC6;transform:scale(1.08);text-shadow:0 0 10px rgba(148,252,198,.3)}
        @keyframes spin{to{transform:rotate(360deg)}}
        input:focus{outline:none}
        ::selection{background:rgba(148,252,198,.25)}
        body{background:#070A0D}
      `}</style>

      <ParticleField />
      <Confetti active={phase === PHASE.FOUND || phase === PHASE.REVEALED} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "600px", margin: "0 auto", padding: "52px 20px 80px" }}>

        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: "44px", animation: "slideUp .55s ease-out" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "18px",
            padding: "5px 14px", background: "rgba(148,252,198,.05)",
            border: "1px solid rgba(148,252,198,.12)", borderRadius: "100px",
            fontSize: "0.6rem", letterSpacing: "3px", textTransform: "uppercase",
            color: "rgba(148,252,198,.6)", fontFamily: "var(--mono)",
          }}>
            <span style={{ width: 4, height: 4, background: "#94FCC6", borderRadius: "50%", display: "inline-block" }} />
            100% client-side · open source
          </div>
          <h1 style={{ fontSize: "clamp(2rem,6.5vw,3.4rem)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.05, marginBottom: "10px" }}>
            <span style={{ color: "#94FCC6" }}>sol</span>vanity
          </h1>
          <p style={{ color: "rgba(255,255,255,.9)", fontSize: "0.9rem", fontWeight: 300, maxWidth: "380px", margin: "0 auto", lineHeight: 1.6 }}>
            Custom Solana vanity addresses generated in your browser. Your keys never leave your device.
          </p>
          {globalCount > 0 && (
            <div style={{
              marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "6px 16px", background: "rgba(148,252,198,.04)",
              border: "1px solid rgba(148,252,198,.08)", borderRadius: "100px",
              fontFamily: "var(--mono)", fontSize: "0.7rem", color: "rgba(148,252,198,.6)",
            }}>
              <span style={{ fontSize: "0.85rem" }}>⚡</span>
              <span><strong style={{ color: "\#94FCC6" }}>{globalCount.toLocaleString()}</strong> addresses generated</span>
            </div>
          )}
        </header>

        {/* Card */}
        <div style={{
          background: "linear-gradient(180deg,rgba(255,255,255,.025) 0%,rgba(255,255,255,.008) 100%)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px",
          backdropFilter: "blur(16px)", animation: "slideUp .55s ease-out .08s both",
        }}>

          {/* INPUT / GRINDING */}
          {(phase === PHASE.INPUT || phase === PHASE.GRIND) && <>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Prefix</label>
              <input value={prefix} onChange={e => setPrefix(e.target.value.slice(0, 8))}
                placeholder="e.g. MOON" disabled={phase === PHASE.GRIND} maxLength={8}
                style={{
                  width: "100%", padding: "13px 16px", background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px",
                  color: prefix ? "#94FCC6" : "rgba(255,255,255,0.2)",
                  fontSize: "1.05rem", fontFamily: "var(--mono)", fontWeight: 600, letterSpacing: "2px",
                }}
              />
              {getInvalidChars(prefix, caseSensitive).length > 0 && <div style={{ color: "#ff6b6b", fontSize: "0.7rem", marginTop: "6px", fontFamily: "var(--mono)" }}>⚠️ Characters {getInvalidChars(prefix, caseSensitive).map(c => "\"" + c + "\"").join(", ")} not valid in Solana addresses (no 0, O, I, or l)</div>}
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Suffix</label>
              <input value={suffix} onChange={e => setSuffix(e.target.value.slice(0, 8))}
                placeholder="e.g. DEV" disabled={phase === PHASE.GRIND} maxLength={8}
                style={{
                  width: "100%", padding: "13px 16px", background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px",
                  color: suffix ? "#94FCC6" : "rgba(255,255,255,0.2)",
                  fontSize: "1.05rem", fontFamily: "var(--mono)", fontWeight: 600, letterSpacing: "2px",
                }}
              />
              {getInvalidChars(suffix, caseSensitive).length > 0 && <div style={{ color: "#ff6b6b", fontSize: "0.7rem", marginTop: "6px", fontFamily: "var(--mono)" }}>⚠️ Characters {getInvalidChars(suffix, caseSensitive).map(c => "\"" + c + "\"").join(", ")} not valid in Solana addresses (no 0, O, I, or l)</div>}
            </div>

            {/* Toggle */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "20px", padding: "11px 14px",
              background: "rgba(0,0,0,.18)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <div onClick={() => phase !== PHASE.GRIND && setCaseSensitive(!caseSensitive)}
                  style={{
                    width: 34, height: 19, borderRadius: 10, position: "relative",
                    background: caseSensitive ? "rgba(148,252,198,.28)" : "rgba(255,255,255,.08)",
                    cursor: phase === PHASE.GRIND ? "not-allowed" : "pointer",
                  }}>
                  <div style={{
                    width: 15, height: 15, borderRadius: "50%", position: "absolute", top: 2,
                    left: caseSensitive ? 17 : 2, transition: "all .2s",
                    background: caseSensitive ? "#94FCC6" : "rgba(255,255,255,.35)",
                  }} />
                </div>
                <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,.9)", fontFamily: "var(--mono)" }}>Case sensitive</span>
              </div>
              {totalLen > 0 && <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,.8)", fontFamily: "var(--mono)" }}>Est. {diff.time}</span>}
            </div>

            {/* Difficulty */}
            {totalLen > 0 && (
              <div style={{
                marginBottom: "22px", padding: "12px 14px",
                background: "rgba(0,0,0,.15)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "2px", color: "rgba(255,255,255,.8)", fontFamily: "var(--mono)" }}>Difficulty</span>
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", fontFamily: "var(--mono)",
                    color: totalLen <= 2 ? "#94FCC6" : totalLen <= 4 ? "#94FCC6" : totalLen <= 6 ? "#FFB432" : "#ff6060",
                  }}>{diff.tier}</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,.06)" }}>
                  <div style={{
                    height: "100%", borderRadius: 2, width: Math.min(100, totalLen * 14) + "%",
                    background: totalLen <= 4 ? "#94FCC6" : totalLen <= 6 ? "#FFB432" : "#ff6060",
                  }} />
                </div>
              </div>
            )}

            {phase === PHASE.INPUT ? (
              <button onClick={startGrind} disabled={totalLen === 0} style={primaryBtn(totalLen === 0)}>Start Grinding</button>
            ) : (
              <button onClick={stopGrind} style={{
                width: "100%", padding: "15px",
                background: "rgba(255,60,60,.08)", border: "1px solid rgba(255,60,60,.18)",
                borderRadius: "12px", color: "#ff5050",
                fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--body)",
                letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer",
              }}>Stop</button>
            )}

            {phase === PHASE.GRIND && (
              <div style={{
                display: "flex", justifyContent: "space-around", marginTop: "16px",
                padding: "14px", background: "rgba(0,0,0,.18)", borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                {[["Attempts", fmt(attempts), "#94FCC6"], ["Elapsed", elapsed + "s", "#fff"], ["Workers", workerCount + "×", "rgba(148,252,198,.6)"]].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "2px", color: "rgba(255,255,255,.9)", marginBottom: 3, fontFamily: "var(--mono)" }}>{l}</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600, fontFamily: "var(--mono)", color: c }}>{v}</div>
                  </div>
                ))}
              </div>
            )}

            <ScrollingKeys active={phase === PHASE.GRIND} />
          </>}

          {/* FOUND */}
          {phase === PHASE.FOUND && result && (
            <div style={{ animation: "slideUp .4s ease-out" }}>
              <div style={{ textAlign: "center", marginBottom: "22px" }}>
                <div style={{
                  width: 46, height: 46, borderRadius: "50%",
                  background: "rgba(148,252,198,.08)", border: "2px solid rgba(148,252,198,.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px", fontSize: "1.3rem",
                }}>✓</div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#94FCC6", marginBottom: 4 }}>Address Found</h2>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,.9)" }}>{fmt(attempts)} attempts · {elapsed}s · {workerCount} workers</p>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <div style={{ ...labelStyle, marginBottom: 6 }}>Your vanity address</div>
                <HighlightedAddress address={result.address} prefix={prefix} suffix={suffix} large />
              </div>

              <button onClick={() => setPhase(PHASE.REVEALED)} style={primaryBtn(false)}>Reveal Full Keypair</button>
              <a href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent("Just generated a custom Solana vanity address " + (prefix && suffix ? "starting with \"" + prefix + "\" and ending with \"" + suffix + "\"" : prefix ? "starting with \"" + prefix + "\"" : "ending with \"" + suffix + "\"") + " on solvanity.lol 🤪\n\n100% client-side, your keys never leave your browser.\n\nTry it free 👇\nhttps://solvanity.lol")} target="_blank" rel="noopener" style={{
                display: "block", width: "100%", padding: "12px", marginTop: "8px",
                background: "rgba(29,155,240,.08)", border: "1px solid rgba(29,155,240,.2)",
                borderRadius: "12px", color: "rgba(29,155,240,.9)",
                fontSize: "0.75rem", fontWeight: 600, fontFamily: "var(--body)",
                cursor: "pointer", textAlign: "center", textDecoration: "none",
                letterSpacing: "0.5px",
              }}>Share on 𝕏</a>
              <button onClick={() => { setPhase(PHASE.INPUT); setResult(null); }} style={{
                width: "100%", padding: "12px", marginTop: "8px",
                background: "transparent", border: "1px solid rgba(255,255,255,.06)",
                borderRadius: "12px", color: "rgba(255,255,255,.9)",
                fontSize: "0.75rem", fontFamily: "var(--body)", cursor: "pointer",
              }}>Try a different address</button>
            </div>
          )}

          {/* REVEALED */}
          {phase === PHASE.REVEALED && result && (
            <div style={{ animation: "slideUp .4s ease-out" }}>
              <div style={{ textAlign: "center", marginBottom: "22px" }}>
                <div style={{
                  width: 46, height: 46, borderRadius: "50%",
                  background: "rgba(148,252,198,.08)", border: "2px solid rgba(148,252,198,.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px", fontSize: "1.2rem",
                }}>🔓</div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 4 }}>Your Keypair</h2>
                <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,.8)" }}>Generated client-side — never sent to any server</p>
              </div>

              {/* Address */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={labelStyle}>Public Address</span>
                  <CopyButton text={result.address} label="Copy" />
                </div>
                <HighlightedAddress address={result.address} prefix={prefix} suffix={suffix} large />
              </div>

              {/* Private key */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={labelStyle}>Private Key (Solana CLI format)</span>
                  <CopyButton text={"[" + result.privateKey.join(",") + "]"} label="Copy" />
                </div>
                <div style={{
                  fontFamily: "var(--mono)", fontSize: "0.65rem", color: "rgba(255,255,255,.9)",
                  padding: "12px 14px", background: "rgba(0,0,0,.3)",
                  border: "1px solid rgba(255,255,255,.045)", borderRadius: "8px",
                  wordBreak: "break-all", lineHeight: 1.7,
                }}>
                  [{result.privateKey.join(", ")}]
                </div>
              </div>

              {/* How to import */}
              <div style={{
                padding: "12px 14px", background: "rgba(148,252,198,.03)",
                border: "1px solid rgba(148,252,198,.08)", borderRadius: "10px", marginBottom: "14px",
              }}>
                <p style={{ fontSize: "0.68rem", color: "rgba(148,252,198,.5)", fontFamily: "var(--mono)", lineHeight: 1.6 }}>
                  💡 To use: save the private key array to a .json file and import with<br />
                  <span style={{ color: "rgba(148,252,198,.7)" }}>solana-keygen recover -o keypair.json</span><br />
                  Or import the private key bytes into Phantom/Solflare.
                </p>
              </div>

              {/* Warning */}
              <div style={{
                padding: "11px 14px", background: "rgba(255,60,60,.04)",
                border: "1px solid rgba(255,60,60,.1)", borderRadius: "10px", marginBottom: "22px",
              }}>
                <p style={{ fontSize: "0.68rem", color: "rgba(255,80,80,.6)", fontFamily: "var(--mono)", lineHeight: 1.55 }}>
                  ⚠ Store your private key offline in a secure location. Anyone with this key controls the wallet. This data was never transmitted.
                </p>
              </div>

              {/* Tip Jar */}
              <div style={{
                padding: "20px", borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(148,252,198,.04), rgba(20,241,149,.02))",
                border: "1px solid rgba(148,252,198,.1)", marginBottom: "16px",
              }}>
                {!tipSent ? (
                  <>
                    <div style={{ textAlign: "center", marginBottom: "14px" }}>
                      <div style={{ fontSize: "1.1rem", marginBottom: "6px" }}>☕</div>
                      <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,.7)", marginBottom: "4px" }}>Enjoying solvanity?</p>
                      <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,.9)", lineHeight: 1.5 }}>
                        This tool is 100% free. If you generated a cool address, consider leaving a tip.
                      </p>
                    </div>
                    <div style={{ marginTop: "10px", textAlign: "center" }}>
                      <p style={{ fontSize: "0.55rem", color: "rgba(255,255,255,.7)", fontFamily: "var(--mono)", marginBottom: "8px" }}>Send any amount to:</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <span style={{
                          fontSize: "0.65rem", color: "#94FCC6", fontFamily: "var(--mono)",
                          background: "rgba(148,252,198,.06)", padding: "8px 14px", borderRadius: "8px",
                          border: "1px solid rgba(148,252,198,.15)",
                          textShadow: "0 0 12px rgba(148,252,198,0.3)",
                          letterSpacing: "0.5px",
                        }}>{TIP_ADDRESS.slice(0, 8)}...{TIP_ADDRESS.slice(-6)}</span>
                        <CopyButton text={TIP_ADDRESS} label="Copy" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "10px 0", animation: "fadeIn .3s" }}>
                    <div style={{ fontSize: "1.4rem", marginBottom: "8px" }}>💚</div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94FCC6", marginBottom: "4px" }}>Thank you!</p>
                    <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,.9)" }}>Your support keeps solvanity free for everyone.</p>
                  </div>
                )}
              </div>

              <button onClick={() => { setPhase(PHASE.INPUT); setResult(null); setPrefix(""); setSuffix(""); setTipSent(false); }} style={{
                width: "100%", padding: "14px",
                background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)",
                borderRadius: "12px", color: "rgba(255,255,255,.8)",
                fontSize: "0.78rem", fontWeight: 600, fontFamily: "var(--body)",
                cursor: "pointer", textTransform: "uppercase", letterSpacing: "1px",
              }}>Generate Another Address</button>
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap",
          marginTop: "28px", animation: "slideUp .55s ease-out .2s both",
        }}>
          {[["🔒", "Client-side"], ["👁", "Open source"], ["⚡", "Multi-threaded"], ["🚫", "No tracking"]].map(([icon, label]) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: "5px",
              fontSize: "0.62rem", color: "rgba(255,255,255,.9)", fontFamily: "var(--mono)",
            }}><span style={{ fontSize: "0.75rem" }}>{icon}</span>{label}</div>
          ))}
        </div>

        <footer style={{
          textAlign: "center", marginTop: "40px",
          fontSize: "0.58rem", color: "rgba(255,255,255,.6)", fontFamily: "var(--mono)",
          letterSpacing: "0.8px", lineHeight: 1.8,
        }}>
          Ed25519 keypair generation runs entirely in your browser via WebAssembly.
          <br />No data is transmitted. No keys are stored. No cookies. No accounts.
          <br /><span style={{ color: "rgba(148,252,198,.2)" }}>solvanity</span> — built with ☕ and <a href="https://github.com/oops-cloud/solvanity" target="_blank" rel="noopener" className="github-link">open sourced on GitHub</a> 💚
        </footer>
      </div>
    </div>
  );
}
