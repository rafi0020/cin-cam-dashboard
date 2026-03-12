import { useState, useEffect, useRef, useCallback } from "react";

// ── Data ─────────────────────────────────────────────────────────────────────
const BRANCHES = {
  gulshan: {
    name: "Gulshan Branch",
    short: "GUL",
    color: "#00C2A8",
    cameras: 24,
    dvrs: 6,
  },
  tejgaon: {
    name: "Tejgaon Branch",
    short: "TEJ",
    color: "#F59E0B",
    cameras: 24,
    dvrs: 6,
  },
};

const generateCameras = () => {
  const cams = [];
  const zones = ["Entrance", "Lobby", "Teller", "Vault", "ATM", "Parking", "Manager", "Server Room"];
  const issues = ["Network Issue", "Camera Failure", "Power Issue", "Lens Obstruction", null];

  for (const [branchKey, branch] of Object.entries(BRANCHES)) {
    for (let i = 1; i <= branch.cameras; i++) {
      const issueIdx = Math.random() > 0.85 ? Math.floor(Math.random() * 4) : 4;
      const offlineDays = issueIdx < 4 ? Math.floor(Math.random() * 35) + 1 : 0;
      const offlineSince = offlineDays > 0
        ? new Date(Date.now() - offlineDays * 86400000).toISOString().split("T")[0]
        : null;

      cams.push({
        id: `${branch.short}-CAM-${String(i).padStart(3, "0")}`,
        branch: branchKey,
        branchName: branch.name,
        zone: zones[Math.floor(Math.random() * zones.length)],
        dvr: `${branch.short}-DVR-${String(Math.ceil(i / 4)).padStart(2, "0")}`,
        status: issueIdx < 4 ? "offline" : "online",
        issue: issues[issueIdx],
        offlineDays,
        offlineSince,
        fps: issueIdx < 4 ? 0 : Math.floor(Math.random() * 10) + 20,
        resolution: "1080p",
        aiEnabled: Math.random() > 0.3,
      });
    }
  }
  return cams;
};

const generateDVRs = (cameras) => {
  const dvrs = [];
  const issues = ["Network Issue", "Power Failure", "Hardware Problem"];

  for (const [branchKey, branch] of Object.entries(BRANCHES)) {
    for (let i = 1; i <= branch.dvrs; i++) {
      const id = `${branch.short}-DVR-${String(i).padStart(2, "0")}`;
      const branchCams = cameras.filter((c) => c.dvr === id);
      const offline = Math.random() > 0.88;
      const offlineDays = offline ? Math.floor(Math.random() * 35) + 1 : 0;

      dvrs.push({
        id,
        branch: branchKey,
        branchName: branch.name,
        status: offline ? "offline" : "online",
        issue: offline ? issues[Math.floor(Math.random() * 3)] : null,
        offlineDays,
        offlineSince: offlineDays > 0
          ? new Date(Date.now() - offlineDays * 86400000).toISOString().split("T")[0]
          : null,
        channels: 4,
        connectedCams: branchCams.length,
        storage: `${Math.floor(Math.random() * 30) + 60}%`,
      });
    }
  }
  return dvrs;
};


// ── Animated Counter ──────────────────────────────────────────────────────────
function useCounter(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent, icon, sub }) {
  const count = useCounter(value);
  return (
    <div style={{
      background: `linear-gradient(135deg, #0d1b2a 0%, #112240 100%)`,
      border: `1px solid ${accent}33`,
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: `0 0 24px ${accent}18`,
      position: "relative",
      overflow: "hidden",
      transition: "transform .2s, box-shadow .2s",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${accent}38`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 0 24px ${accent}18`; }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: `${accent}22`, display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
        border: `1px solid ${accent}44`,
      }}>{icon}</div>
      <div>
        <div style={{ color: "#8899aa", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
        <div style={{ color: "#e8f4f8", fontSize: 32, fontWeight: 700, fontFamily: "'IBM Plex Sans', sans-serif", lineHeight: 1, color: accent }}>{count.toLocaleString()}</div>
        {sub && <div style={{ color: "#6677aa", fontSize: 11, marginTop: 3 }}>{sub}</div>}
      </div>
      <div style={{ position: "absolute", right: -8, bottom: -8, width: 80, height: 80, borderRadius: "50%", background: `${accent}0a` }} />
    </div>
  );
}

// ── Branch Badge ──────────────────────────────────────────────────────────────
function BranchFilter({ selected, onChange }) {
  const options = [
    { key: "all", label: "All Branches" },
    { key: "gulshan", label: "Gulshan" },
    { key: "tejgaon", label: "Tejgaon" },
  ];
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {options.map(o => (
        <button key={o.key} onClick={() => onChange(o.key)} style={{
          padding: "7px 18px", borderRadius: 40,
          border: selected === o.key ? "1.5px solid #00C2A8" : "1.5px solid #223355",
          background: selected === o.key ? "#00C2A820" : "transparent",
          color: selected === o.key ? "#00C2A8" : "#6677aa",
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, cursor: "pointer",
          letterSpacing: 1, transition: "all .2s",
        }}>{o.label}</button>
      ))}
    </div>
  );
}

// ── Status Dot ────────────────────────────────────────────────────────────────
function StatusDot({ status, size = 8 }) {
  const color = status === "online" ? "#22c55e" : status === "warning" ? "#f59e0b" : "#ef4444";
  return (
    <span style={{
      display: "inline-block", width: size, height: size, borderRadius: "50%",
      background: color, marginRight: 6,
      boxShadow: status === "online" ? `0 0 6px ${color}88` : "none",
    }} />
  );
}

// ── Offline Badge ─────────────────────────────────────────────────────────────
function DaysBadge({ days }) {
  const color = days >= 30 ? "#ef4444" : days >= 20 ? "#f97316" : days >= 10 ? "#f59e0b" : "#6b7280";
  return (
    <span style={{
      background: `${color}22`, border: `1px solid ${color}66`, color,
      borderRadius: 6, padding: "2px 10px", fontSize: 11,
      fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700,
    }}>{days}d</span>
  );
}

// ── Camera Grid Card ──────────────────────────────────────────────────────────
function CameraCard({ cam }) {
  const [hovered, setHovered] = useState(false);
  const branchColor = BRANCHES[cam.branch].color;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#0a1628",
        border: `1px solid ${cam.status === "online" ? "#1a3a5c" : "#3a1a1a"}`,
        borderRadius: 12,
        padding: 14,
        cursor: "pointer",
        transition: "all .2s",
        transform: hovered ? "scale(1.02)" : "scale(1)",
        boxShadow: hovered ? `0 4px 20px ${cam.status === "online" ? "#00C2A822" : "#ef444422"}` : "none",
      }}
    >
      {/* Camera preview area */}
      <div style={{
        width: "100%", aspectRatio: "16/9", borderRadius: 8,
        background: cam.status === "online"
          ? `linear-gradient(135deg, #0d2137 0%, #0a1e32 100%)`
          : "#1a0808",
        marginBottom: 10, position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {cam.status === "online" ? (
          <>
            <div style={{ fontSize: 24, opacity: 0.3 }}>📹</div>
            <div style={{
              position: "absolute", top: 6, left: 6,
              background: "#ef444499", borderRadius: 4, padding: "1px 6px",
              fontSize: 9, color: "#fff", fontFamily: "'IBM Plex Mono', monospace",
            }}>● REC</div>
            <div style={{
              position: "absolute", bottom: 6, right: 6,
              fontSize: 9, color: "#ffffff88", fontFamily: "'IBM Plex Mono', monospace",
            }}>{cam.fps} FPS</div>
            {cam.aiEnabled && (
              <div style={{
                position: "absolute", top: 6, right: 6,
                background: "#00C2A833", border: "1px solid #00C2A8",
                borderRadius: 4, padding: "1px 5px",
                fontSize: 8, color: "#00C2A8", fontFamily: "'IBM Plex Mono', monospace",
              }}>AI</div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 20, opacity: 0.5 }}>⚠️</div>
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "#ef44441a", padding: "3px 6px",
              fontSize: 9, color: "#ef444499", fontFamily: "'IBM Plex Mono', monospace", textAlign: "center",
            }}>NO SIGNAL</div>
          </>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#c8dae8", fontWeight: 700 }}>{cam.id}</span>
        <StatusDot status={cam.status} />
      </div>
      <div style={{ fontSize: 10, color: "#556677", marginBottom: 2 }}>{cam.zone}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 9, color: branchColor, fontFamily: "'IBM Plex Mono', monospace" }}>
          {BRANCHES[cam.branch].short}
        </span>
        {cam.offlineDays > 0 && <DaysBadge days={cam.offlineDays} />}
      </div>
      {cam.issue && (
        <div style={{ fontSize: 9, color: "#ef4444aa", marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
          ⚠ {cam.issue}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function BRACDashboard() {
  const [cameras] = useState(generateCameras);
  const [dvrs] = useState(() => generateDVRs(generateCameras()));
  const [branch, setBranch] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [time, setTime] = useState(new Date());
  const [selectedCam, setSelectedCam] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Filtered data
  const filteredCams = cameras.filter(c => branch === "all" || c.branch === branch)
    .filter(c => !searchTerm || c.id.toLowerCase().includes(searchTerm.toLowerCase()) || c.zone.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredDVRs = dvrs.filter(d => branch === "all" || d.branch === branch);

  const totalCams = cameras.length;
  const onlineCams = cameras.filter(c => c.status === "online").length;
  const offlineCams = totalCams - onlineCams;
  const totalDVRs = dvrs.length;
  const onlineDVRs = dvrs.filter(d => d.status === "online").length;
  const offlineDVRs = totalDVRs - onlineDVRs;

  const camOfflineReasons = cameras.filter(c => c.issue).reduce((acc, c) => {
    acc[c.issue] = (acc[c.issue] || 0) + 1; return acc;
  }, {});

  const dvrOfflineReasons = dvrs.filter(d => d.issue).reduce((acc, d) => {
    acc[d.issue] = (acc[d.issue] || 0) + 1; return acc;
  }, {});

  const offlineDurationReport = [...cameras.filter(c => c.offlineDays > 0), ...dvrs.filter(d => d.offlineDays > 0)]
    .sort((a, b) => b.offlineDays - a.offlineDays).slice(0, 8);

  const days30plus = cameras.filter(c => c.offlineDays >= 30).length + dvrs.filter(d => d.offlineDays >= 30).length;
  const days20plus = cameras.filter(c => c.offlineDays >= 20 && c.offlineDays < 30).length + dvrs.filter(d => d.offlineDays >= 20 && d.offlineDays < 30).length;
  const days10plus = cameras.filter(c => c.offlineDays >= 10 && c.offlineDays < 20).length + dvrs.filter(d => d.offlineDays >= 10 && d.offlineDays < 20).length;

  const uptime = ((onlineCams / totalCams) * 100).toFixed(1);

  const tabs = ["overview", "cameras", "dvrs"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #050e1f 0%, #071428 50%, #060f1e 100%)",
      fontFamily: "'IBM Plex Sans', sans-serif",
      color: "#c8dae8",
      paddingBottom: 40,
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #050e1f; }
        ::-webkit-scrollbar-thumb { background: #223355; border-radius: 3px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid #0f2040; }
        tr:hover td { background: #0a1e35; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes slide-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .card { animation: slide-in .4s ease both; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(90deg, #071428 0%, #091a30 100%)",
        borderBottom: "1px solid #0f2a45",
        padding: "0 32px",
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* BRAC Bank Logo — inline SVG reconstruction of official mark */}
            <svg height="38" viewBox="0 0 220 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Sun / horizon emblem */}
              <g>
                {/* Bottom half dark blue base */}
                <path d="M4 34 Q26 18 48 34 Z" fill="#1a3a6b"/>
                {/* Horizon line */}
                <rect x="4" y="33" width="44" height="3" rx="1.5" fill="#1a3a6b"/>
                {/* Sun rays arc */}
                <path d="M26 33 A14 14 0 0 1 12 26" stroke="#4a90d9" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M26 33 A14 14 0 0 0 40 26" stroke="#4a90d9" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                {/* White crescent / sun */}
                <circle cx="26" cy="22" r="7" fill="white"/>
                <circle cx="29.5" cy="20" r="5.5" fill="#1a3a6b"/>
                {/* Bottom fill */}
                <path d="M6 36 Q26 44 46 36 L46 44 Q26 50 6 44 Z" fill="#1a3a6b" opacity="0.5"/>
              </g>
              {/* BRAC BANK text */}
              <text x="56" y="24" fontFamily="'IBM Plex Sans', Arial, sans-serif" fontWeight="700" fontSize="17" fill="white" letterSpacing="1">BRAC BANK</text>
              {/* Bengali tagline */}
              <text x="56" y="40" fontFamily="'IBM Plex Sans', Arial, sans-serif" fontWeight="400" fontSize="9.5" fill="#7aaee8" letterSpacing="0.5">ব্র্যাক ব্যাংক পিএলসি</text>
            </svg>
            <div>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 800, fontSize: 15, color: "#e8f4f8", letterSpacing: .5 }}>
                BRAC Bank Limited
              </div>
              <div style={{ fontSize: 10, color: "#556677", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1.5 }}>
                CCTV AI SURVEILLANCE PLATFORM
              </div>
            </div>
          </div>

          {/* Nav tabs */}
          <div style={{ display: "flex", gap: 2, background: "#040d1a", borderRadius: 40, padding: "4px" }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                padding: "6px 16px", borderRadius: 36, border: "none",
                background: activeTab === t ? "#00C2A8" : "transparent",
                color: activeTab === t ? "#050e1f" : "#556677",
                fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: .5, cursor: "pointer", fontWeight: activeTab === t ? 700 : 400,
                textTransform: "capitalize", transition: "all .2s",
              }}>{t.replace("-", " ")}</button>
            ))}
          </div>

          {/* Clock */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: "#00C2A8", letterSpacing: 2 }}>
              {time.toLocaleTimeString("en-GB")}
            </div>
            <div style={{ fontSize: 10, color: "#556677" }}>
              {time.toLocaleDateString("en-GB", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 32px" }}>

        {/* Branch Filter + Uptime */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "#e8f4f8", marginBottom: 4 }}>
              System Status Dashboard
            </h1>
            <div style={{ fontSize: 12, color: "#556677" }}>
              Gulshan & Tejgaon Branches · {totalCams} cameras · {totalDVRs} DVRs
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Uptime pill */}
            <div style={{
              background: "#0a1e2e", border: "1px solid #0f3a2a",
              borderRadius: 40, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#22c55e" }}>
                {uptime}% Uptime
              </span>
            </div>
            <BranchFilter selected={branch} onChange={setBranch} />
          </div>
        </div>

        {/* ═══════════════════════════ OVERVIEW TAB ═══════════════════════════ */}
        {activeTab === "overview" && (
          <div className="card">
            {/* ── Stat Cards Row 1 ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
              <StatCard label="Online DVRs" value={onlineDVRs} accent="#22c55e" icon="🖥️" sub="NVR units active" />
              <StatCard label="Offline DVRs" value={offlineDVRs} accent="#ef4444" icon="⚠️" sub="Requires attention" />
              <StatCard label="Total DVRs" value={totalDVRs} accent="#3b82f6" icon="💾" sub="Across all branches" />
              <StatCard label="Total Cameras" value={totalCams} accent="#8b5cf6" icon="📹" sub="48 per deployment" />
            </div>

            {/* ── Stat Cards Row 2 ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
              <StatCard label="Online Cameras" value={onlineCams} accent="#00C2A8" icon="✅" sub="Streaming live" />
              <StatCard label="Offline Cameras" value={offlineCams} accent="#f97316" icon="🔴" sub="Signal lost" />
              <div style={{
                background: "linear-gradient(135deg, #0d1b2a 0%, #112240 100%)",
                border: "1px solid #1a3355", borderRadius: 16, padding: "20px 24px",
              }}>
                <div style={{ fontSize: 12, color: "#8899aa", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
                  Days Offline Status
                </div>
                {[
                  { label: "30+ Days", count: days30plus, color: "#ef4444" },
                  { label: "20+ Days", count: days20plus, color: "#f97316" },
                  { label: "10+ Days", count: days10plus, color: "#f59e0b" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#8899aa", flex: 1 }}>{row.label}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 16, color: row.color }}>{row.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Tables Row ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* DVR Offline Reasons */}
              <div style={{ background: "#0a1628", border: "1px solid #0f2a45", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #0f2a45", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>🖥️</span>
                  <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 13, color: "#c8dae8" }}>DVR Offline Reasons</span>
                </div>
                <table>
                  <thead>
                    <tr style={{ background: "#060e1c" }}>
                      <th style={{ color: "#556677", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>Reason</th>
                      <th style={{ color: "#556677", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>Count</th>
                      <th style={{ color: "#556677", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(dvrOfflineReasons).sort((a, b) => b[1] - a[1]).map(([reason, count]) => (
                      <tr key={reason}>
                        <td style={{ color: "#c8dae8", fontSize: 12 }}>{reason}</td>
                        <td style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#ef4444", fontSize: 13, fontWeight: 700 }}>{count}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ flex: 1, height: 4, background: "#0f2040", borderRadius: 2 }}>
                              <div style={{ width: `${(count / offlineDVRs) * 100}%`, height: "100%", background: "#ef4444", borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 10, color: "#556677", width: 32 }}>{Math.round((count / offlineDVRs) * 100)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {Object.keys(dvrOfflineReasons).length === 0 && (
                      <tr><td colSpan={3} style={{ textAlign: "center", color: "#22c55e", fontSize: 12 }}>✓ All DVRs Online</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Camera Offline Reasons */}
              <div style={{ background: "#0a1628", border: "1px solid #0f2a45", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #0f2a45", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>📹</span>
                  <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 13, color: "#c8dae8" }}>Camera Offline Reasons</span>
                </div>
                <table>
                  <thead>
                    <tr style={{ background: "#060e1c" }}>
                      <th style={{ color: "#556677", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>Reason</th>
                      <th style={{ color: "#556677", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>Count</th>
                      <th style={{ color: "#556677", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(camOfflineReasons).sort((a, b) => b[1] - a[1]).map(([reason, count]) => (
                      <tr key={reason}>
                        <td style={{ color: "#c8dae8", fontSize: 12 }}>{reason}</td>
                        <td style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#f97316", fontSize: 13, fontWeight: 700 }}>{count}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ flex: 1, height: 4, background: "#0f2040", borderRadius: 2 }}>
                              <div style={{ width: `${(count / offlineCams) * 100}%`, height: "100%", background: "#f97316", borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 10, color: "#556677", width: 32 }}>{Math.round((count / offlineCams) * 100)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {Object.keys(camOfflineReasons).length === 0 && (
                      <tr><td colSpan={3} style={{ textAlign: "center", color: "#22c55e", fontSize: 12 }}>✓ All Cameras Online</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Offline Duration Report ── */}
            <div style={{ background: "#0a1628", border: "1px solid #0f2a45", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #0f2a45", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>⏱️</span>
                  <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 13, color: "#c8dae8" }}>Offline Duration Report</span>
                </div>
                <span style={{ fontSize: 11, color: "#556677", fontFamily: "'IBM Plex Mono', monospace" }}>Sorted by duration ↓</span>
              </div>
              <table>
                <thead>
                  <tr style={{ background: "#060e1c" }}>
                    {["Device", "Branch", "Status", "Offline Since", "Issue", "Duration"].map(h => (
                      <th key={h} style={{ color: "#556677", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {offlineDurationReport.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#c8dae8", fontSize: 12, fontWeight: 700 }}>{d.id}</td>
                      <td>
                        <span style={{
                          color: BRANCHES[d.branch].color, fontSize: 11,
                          fontFamily: "'IBM Plex Mono', monospace",
                        }}>{BRANCHES[d.branch].short}</span>
                      </td>
                      <td><span style={{ color: "#ef4444", fontSize: 11 }}>● Offline</span></td>
                      <td style={{ fontSize: 11, color: "#8899aa", fontFamily: "'IBM Plex Mono', monospace" }}>{d.offlineSince}</td>
                      <td style={{ fontSize: 11, color: "#f97316" }}>{d.issue || "Unknown"}</td>
                      <td><DaysBadge days={d.offlineDays} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Branch Summary ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              {Object.entries(BRANCHES).map(([key, br]) => {
                const bCams = cameras.filter(c => c.branch === key);
                const bOnline = bCams.filter(c => c.status === "online").length;
                const bDVRs = dvrs.filter(d => d.branch === key);
                const bDVROnline = bDVRs.filter(d => d.status === "online").length;
                const pct = ((bOnline / bCams.length) * 100).toFixed(0);
                return (
                  <div key={key} style={{
                    background: "#0a1628", border: `1px solid ${br.color}33`,
                    borderRadius: 16, padding: 20,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 14, color: "#e8f4f8" }}>{br.name}</div>
                        <div style={{ fontSize: 10, color: "#556677", fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>
                          {bCams.length} cameras · {bDVRs.length} DVRs
                        </div>
                      </div>
                      <div style={{
                        fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 28, fontWeight: 800, color: br.color,
                      }}>{pct}%</div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 6, background: "#0f2040", borderRadius: 3, marginBottom: 10 }}>
                      <div style={{
                        width: `${pct}%`, height: "100%",
                        background: `linear-gradient(90deg, ${br.color}88, ${br.color})`,
                        borderRadius: 3, transition: "width 1s ease",
                      }} />
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#556677" }}>Cams Online</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#22c55e", fontWeight: 700 }}>{bOnline}/{bCams.length}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#556677" }}>DVRs Online</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#22c55e", fontWeight: 700 }}>{bDVROnline}/{bDVRs.length}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#556677" }}>AI Enabled</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: br.color, fontWeight: 700 }}>
                          {bCams.filter(c => c.aiEnabled).length}/{bCams.length}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════ CAMERAS TAB ═══════════════════════════ */}
        {activeTab === "cameras" && (
          <div className="card">
            {/* Search + Stats bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <input
                placeholder="Search by camera ID or zone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  flex: 1, background: "#0a1628", border: "1px solid #1a3355",
                  borderRadius: 10, padding: "10px 16px", color: "#c8dae8",
                  fontSize: 12, fontFamily: "'IBM Plex Sans', sans-serif", outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                {["all", "online", "offline"].map(f => (
                  <button key={f} onClick={() => setSearchTerm(f === "all" ? "" : f)} style={{
                    padding: "8px 14px", borderRadius: 8,
                    border: "1px solid #1a3355", background: "#0a1628",
                    color: f === "online" ? "#22c55e" : f === "offline" ? "#ef4444" : "#8899aa",
                    fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer",
                  }}>
                    {f === "all" ? `All (${filteredCams.length})` : f === "online" ? `✓ ${filteredCams.filter(c => c.status === "online").length}` : `⚠ ${filteredCams.filter(c => c.status === "offline").length}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
            }}>
              {filteredCams.map(cam => (
                <CameraCard key={cam.id} cam={cam} />
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════ DVRS TAB ═══════════════════════════ */}
        {activeTab === "dvrs" && (
          <div className="card">
            <div style={{ background: "#0a1628", border: "1px solid #0f2a45", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #0f2a45" }}>
                <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 14, color: "#c8dae8" }}>DVR Units — All Branches</span>
              </div>
              <table>
                <thead>
                  <tr style={{ background: "#060e1c" }}>
                    {["DVR ID", "Branch", "Status", "Issue", "Channels", "Storage", "Offline Since", "Duration"].map(h => (
                      <th key={h} style={{ color: "#556677", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDVRs.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#c8dae8", fontWeight: 700, fontSize: 12 }}>{d.id}</td>
                      <td>
                        <span style={{ color: BRANCHES[d.branch].color, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>
                          {BRANCHES[d.branch].name}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: "inline-flex", alignItems: "center",
                          color: d.status === "online" ? "#22c55e" : "#ef4444",
                          fontSize: 11,
                        }}>
                          <StatusDot status={d.status} />
                          {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ fontSize: 11, color: d.issue ? "#f97316" : "#22c55e" }}>{d.issue || "—"}</td>
                      <td style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8899aa", fontSize: 11 }}>{d.channels}ch</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 48, height: 4, background: "#0f2040", borderRadius: 2 }}>
                            <div style={{ width: d.storage, height: "100%", background: parseInt(d.storage) > 85 ? "#ef4444" : "#00C2A8", borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: 10, color: "#556677" }}>{d.storage}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 11, color: "#8899aa", fontFamily: "'IBM Plex Mono', monospace" }}>{d.offlineSince || "—"}</td>
                      <td>{d.offlineDays > 0 ? <DaysBadge days={d.offlineDays} /> : <span style={{ color: "#22c55e", fontSize: 11 }}>Active</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


      </div>

      {/* ── Footer ── */}
      <div style={{
        borderTop: "1px solid #0f2040", marginTop: 20,
        padding: "16px 32px", textAlign: "center",
      }}>
        <span style={{ fontSize: 11, color: "#334466", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>
          BRAC BANK LIMITED · AI SURVEILLANCE SYSTEM · PHASE 2 · {time.getFullYear()} ·
          <span style={{ color: "#00C2A866" }}> POWERED BY YOLO + BOT-SORT + FASTAPI</span>
        </span>
      </div>
    </div>
  );
}
