import { useState, useEffect, useRef, useCallback } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  BarChart, Bar, Cell, Legend
} from "recharts";

const API = "http://localhost:8000";

// ── Bidhannagar existing infrastructure (real locations) ─────────────────────
const EXISTING_INFRA = [
  { name: "BN Hospital",         lat: 22.5728, lng: 88.4185, type: "hospital", existing: true },
  { name: "AMRI (Salt Lake)",    lat: 22.5740, lng: 88.4290, type: "hospital", existing: true },
  { name: "Bidhannagar College", lat: 22.5720, lng: 88.4202, type: "school",   existing: true },
  { name: "Salt Lake School",    lat: 22.5690, lng: 88.4160, type: "school",   existing: true },
  { name: "Don Bosco (SL)",      lat: 22.5695, lng: 88.4210, type: "school",   existing: true },
];

// Bidhannagar reference zones for context
const POLLUTION_ZONES = [
  { name: "Kestopur Canal",  lat: 22.5840, lng: 88.4320, risk: "HIGH",   pm25: 68, note: "Canal pollution" },
  { name: "Sector V IT Hub", lat: 22.5790, lng: 88.4313, risk: "MEDIUM", pm25: 52, note: "Traffic congestion" },
  { name: "Central Park",    lat: 22.5715, lng: 88.4250, risk: "LOW",    pm25: 31, note: "Green buffer" },
  { name: "Eastern Bypass",  lat: 22.5650, lng: 88.4180, risk: "HIGH",   pm25: 71, note: "Highway proximity" },
];

const NB = {
  bg: "#0a0a0a", card: "#111",
  yellow: "#ffe135", pink: "#ff2d8d",
  cyan: "#00e5ff", green: "#00ff88",
  red: "#ff4444", orange: "#ff8800",
  white: "#f5f0e8",
  border: "2px solid #f5f0e8",
  borderAcc: "2px solid #ffe135",
  shadow: "4px 4px 0px #ffe135",
  shadowPink: "4px 4px 0px #ff2d8d",
};

const TIER_CONFIG = {
  EXCELLENT:  { bg: "#00ff88", color: "#0a0a0a", icon: "✓✓" },
  SUITABLE:   { bg: "#ffe135", color: "#0a0a0a", icon: "✓"  },
  MARGINAL:   { bg: "#ff8800", color: "#fff",    icon: "⚠"  },
  UNSUITABLE: { bg: "#ff4444", color: "#fff",    icon: "✗"  },
};

const RISK_COLOR = { CRITICAL: "#ff2222", HIGH: "#ff8800", MEDIUM: "#ffe135", LOW: "#00ff88" };

const NbTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1a1a1a", border: `2px solid ${NB.yellow}`,
      padding: "10px 14px", fontFamily: "monospace", fontSize: 12
    }}>
      <div style={{ color: NB.yellow, fontWeight: 900, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color || NB.cyan }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

// ── Score gauge ring ───────────────────────────────────────────────────────
function ScoreRing({ score, tier }) {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.MARGINAL;
  const r = 54, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
      <svg width="140" height="140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a2a" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={cfg.bg} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ fontSize: 30, fontWeight: 900, color: cfg.bg, fontFamily: "monospace" }}>
          {score}
        </div>
        <div style={{ fontSize: 11, color: cfg.bg, fontWeight: 700, letterSpacing: 1 }}>
          {tier}
        </div>
      </div>
    </div>
  );
}

// ── Factor bar ─────────────────────────────────────────────────────────────
function FactorBar({ label, value, max = 100 }) {
  const pct = (value / max) * 100;
  const color = value >= 70 ? NB.green : value >= 45 ? NB.yellow : NB.red;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "monospace", marginBottom: 3 }}>
        <span style={{ color: NB.white }}>{label}</span>
        <span style={{ color, fontWeight: 900 }}>{value.toFixed(0)}</span>
      </div>
      <div style={{ background: "#2a2a2a", height: 8, border: "1px solid #444" }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: color,
          transition: "width 0.6s ease"
        }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function InfrastructurePlanner() {
  const mapRef     = useRef(null);
  const leafletMap = useRef(null);
  const layerGroup = useRef(null);
  const markerRef  = useRef(null);

  const [infraType, setInfraType] = useState("hospital");
  const [clickedPos, setClickedPos] = useState(null);
  const [formData, setFormData] = useState({
    green_cover_radius_500m: 15,
    distance_to_major_road_m: 200,
    distance_to_industry_m: 1000,
    current_pm25: 45, current_pm10: 78,
    current_no2: 34,  current_co: 0.9,
    current_o3: 28,   current_aqi: 75,
  });

  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [activeTab, setActiveTab] = useState("scores"); // scores | risks | projection | refs

  // ── Init Leaflet ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (leafletMap.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [22.573, 88.424], zoom: 14
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { attribution: "© CartoDB", maxZoom: 19 }
    ).addTo(map);

    layerGroup.current = L.layerGroup().addTo(map);

    // Draw existing infrastructure
    EXISTING_INFRA.forEach(inf => {
      const icon = L.divIcon({
        html: `<div style="
          background:${inf.type === "hospital" ? "#ff2d8d" : "#00e5ff"};
          color:#000; width:28px; height:28px; border-radius:50%;
          border:2px solid #fff; display:flex; align-items:center;
          justify-content:center; font-size:14px; font-weight:900;
          box-shadow: 2px 2px 0 rgba(0,0,0,0.8)
        ">${inf.type === "hospital" ? "🏥" : "🏫"}</div>`,
        iconSize: [28, 28], iconAnchor: [14, 14], className: ""
      });
      L.marker([inf.lat, inf.lng], { icon })
        .addTo(layerGroup.current)
        .bindTooltip(
          `<b style="font-family:monospace">${inf.name}</b><br/><span style="font-size:10px">EXISTING ${inf.type.toUpperCase()}</span>`,
          { sticky: true }
        );
    });

    // Draw pollution zones
    POLLUTION_ZONES.forEach(z => {
      const col = z.risk === "HIGH" ? "#ff4444" : z.risk === "MEDIUM" ? "#ff8800" : "#00ff88";
      L.circle([z.lat, z.lng], {
        radius: 300, color: col, fillColor: col, fillOpacity: 0.12, weight: 2, dashArray: "5,5"
      }).addTo(layerGroup.current)
        .bindTooltip(
          `<b style="font-family:monospace">${z.name}</b><br/>
           PM2.5: ${z.pm25} µg/m³ · Risk: <span style="color:${col}">${z.risk}</span><br/>
           ${z.note}`,
          { sticky: true }
        );
    });

    // Click handler
    map.on("click", e => {
      setClickedPos({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    leafletMap.current = map;
    return () => { map.remove(); leafletMap.current = null; };
  }, []);

  // ── Update placement marker ───────────────────────────────────────────────
  useEffect(() => {
    const L = window.L;
    if (!L || !layerGroup.current) return;

    if (markerRef.current) {
      layerGroup.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    if (!clickedPos) return;

    const icon = L.divIcon({
      html: `<div style="
        background:${NB.yellow}; color:#000; width:36px; height:36px;
        border-radius:4px; border: 3px solid #0a0a0a;
        display:flex; align-items:center; justify-content:center;
        font-size:18px; font-weight:900; box-shadow: 3px 3px 0 #0a0a0a;
        animation: pulse 1s infinite
      ">${infraType === "hospital" ? "🏥" : "🏫"}</div>`,
      iconSize: [36, 36], iconAnchor: [18, 18], className: ""
    });

    const m = L.marker([clickedPos.lat, clickedPos.lng], { icon })
      .addTo(layerGroup.current)
      .bindTooltip(
        `<b style="font-family:monospace">PROPOSED SITE</b><br/>
         Lat: ${clickedPos.lat.toFixed(4)}, Lng: ${clickedPos.lng.toFixed(4)}`,
        { permanent: false }
      );

    markerRef.current = m;

    // Draw result-based suitability circle if we have result
    if (result) {
      const col = TIER_CONFIG[result.tier]?.bg || "#ffe135";
      L.circle([clickedPos.lat, clickedPos.lng], {
        radius: 500, color: col, fillColor: col, fillOpacity: 0.08,
        weight: 3, dashArray: "8,4"
      }).addTo(layerGroup.current);
    }
  }, [clickedPos, infraType, result]);

  // ── Draw reference site markers ───────────────────────────────────────────
  useEffect(() => {
    if (!result || !layerGroup.current) return;
    const L = window.L;
    result.reference_sites?.forEach(site => {
      const cfg = TIER_CONFIG[site.tier] || TIER_CONFIG.MARGINAL;
      const icon = L.divIcon({
        html: `<div style="
          background:${cfg.bg}; color:${cfg.color};
          width:24px; height:24px; border-radius:50%;
          border:2px solid #fff; display:flex; align-items:center;
          justify-content:center; font-size:12px; font-weight:900;
          box-shadow:2px 2px 0 rgba(0,0,0,0.6)
        ">${cfg.icon}</div>`,
        iconSize: [24, 24], iconAnchor: [12, 12], className: ""
      });
      L.marker([site.lat, site.lng], { icon })
        .addTo(layerGroup.current)
        .bindTooltip(
          `<b style="font-family:monospace">${site.name}</b><br/>
           Score: ${site.score} · ${site.tier}<br/>${site.note}`,
          { sticky: true }
        );
    });
  }, [result]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const analyse = useCallback(async () => {
    if (!clickedPos) { setError("Click a location on the map first."); return; }
    setLoading(true); setError(null);
    try {
      const body = {
        lat: clickedPos.lat, lng: clickedPos.lng, infra_type: infraType, ...formData
      };
      const res  = await fetch(`${API}/infrastructure-suitability`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setResult(data);
      setActiveTab("scores");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [clickedPos, infraType, formData]);

  // ── Radar data ─────────────────────────────────────────────────────────────
  const radarData = result ? [
    { factor: "PM2.5",    score: result.factor_scores.pm25 },
    { factor: "PM10",     score: result.factor_scores.pm10 },
    { factor: "NO2",      score: result.factor_scores.no2  },
    { factor: "O3",       score: result.factor_scores.o3   },
    { factor: "CO",       score: result.factor_scores.co   },
    { factor: "Green",    score: result.factor_scores.green_cover },
    { factor: "Road Dist",score: result.factor_scores.road_distance },
  ] : [];

  const inp = (key, label, min, max, step, unit) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: "#aaa", marginBottom: 3, fontFamily: "monospace", letterSpacing: 1 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="range" min={min} max={max} step={step}
          value={formData[key]}
          onChange={e => setFormData(p => ({ ...p, [key]: Number(e.target.value) }))}
          style={{ flex: 1, accentColor: NB.cyan }} />
        <div style={{
          background: "#222", color: NB.cyan, padding: "3px 8px",
          fontSize: 12, fontWeight: 900, fontFamily: "monospace",
          border: "1px solid #444", minWidth: 64, textAlign: "right"
        }}>
          {formData[key]}{unit}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      background: NB.bg, minHeight: "100vh",
      fontFamily: "'Space Mono', monospace", color: NB.white
    }}>
      {/* HEADER */}
      <div style={{
        background: "#0a0a0a", padding: "16px 24px",
        borderBottom: `3px solid ${NB.cyan}`, display: "flex",
        alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 3, color: NB.cyan }}>
            🏗 INFRASTRUCTURE SUITABILITY ANALYSER
          </div>
          <div style={{ fontSize: 10, color: "#666", letterSpacing: 2, marginTop: 2 }}>
            BIDHANNAGAR · WHO/CPCB STANDARDS · 5-YEAR SUSTAINABILITY MODEL
          </div>
        </div>
        {/* Type switcher */}
        <div style={{ display: "flex", gap: 0, border: `3px solid ${NB.white}` }}>
          {["hospital", "school"].map(t => (
            <div key={t} style={{
              padding: "10px 22px", fontWeight: 900, fontSize: 13,
              background: infraType === t ? NB.yellow : "#1a1a1a",
              color: infraType === t ? NB.bg : NB.white,
              cursor: "pointer", letterSpacing: 2,
              borderRight: t === "hospital" ? `2px solid ${NB.white}` : "none"
            }} onClick={() => { setInfraType(t); setResult(null); }}>
              {t === "hospital" ? "🏥 HOSPITAL" : "🏫 SCHOOL"}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 380px", height: "calc(100vh - 68px)" }}>

        {/* ── LEFT: inputs ── */}
        <div style={{
          borderRight: `2px solid #222`, overflowY: "auto",
          background: "#111", padding: "16px"
        }}>
          <div style={{
            background: "#1e1e1e", border: `2px solid ${NB.cyan}`,
            padding: "10px 12px", marginBottom: 16
          }}>
            <div style={{ color: NB.cyan, fontWeight: 900, fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>
              SITE LOCATION
            </div>
            {clickedPos ? (
              <div style={{ fontSize: 12, color: NB.green }}>
                📍 {clickedPos.lat.toFixed(4)}°N, {clickedPos.lng.toFixed(4)}°E
              </div>
            ) : (
              <div style={{ fontSize: 11, color: "#666" }}>
                Click map to place proposed site
              </div>
            )}
          </div>

          <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 2, color: "#aaa", marginBottom: 12 }}>
            SITE CONDITIONS
          </div>

          {inp("current_pm25",  "PM2.5 µg/m³",          0,  150, 0.5, " µg/m³")}
          {inp("current_pm10",  "PM10 µg/m³",            0,  300, 1,   " µg/m³")}
          {inp("current_no2",   "NO2 ppb",               0,  200, 0.5, " ppb")}
          {inp("current_o3",    "O3 ppb",                0,  120, 0.5, " ppb")}
          {inp("current_co",    "CO ppm",                0,   10, 0.1, " ppm")}
          {inp("current_aqi",   "Current AQI",           0,  300, 1,   "")}

          <div style={{
            borderTop: "1px solid #333", marginTop: 12, marginBottom: 12, paddingTop: 12,
            fontWeight: 900, fontSize: 10, letterSpacing: 2, color: "#aaa"
          }}>
            SITE GEOGRAPHY
          </div>

          {inp("green_cover_radius_500m",    "Green Cover 500m radius (%)", 0,   60, 1, "%")}
          {inp("distance_to_major_road_m",   "Distance to Major Road",       0, 2000, 10, "m")}
          {inp("distance_to_industry_m",     "Distance to Industry",         0, 5000, 50, "m")}

          <div style={{ marginTop: 16 }}>
            <div style={{
              background: loading ? "#333" : NB.cyan,
              color: loading ? "#666" : NB.bg,
              padding: "13px", textAlign: "center", fontWeight: 900,
              fontSize: 13, letterSpacing: 2, cursor: loading ? "default" : "pointer",
              border: loading ? "2px solid #444" : NB.border,
              boxShadow: loading ? "none" : NB.shadow
            }} onClick={!loading ? analyse : undefined}>
              {loading ? "ANALYSING..." : "▶ ANALYSE SITE"}
            </div>
            {error && (
              <div style={{ color: NB.red, fontSize: 11, marginTop: 8 }}>⚠ {error}</div>
            )}
          </div>
        </div>

        {/* ── CENTRE: Map ── */}
        <div style={{ position: "relative", borderRight: `2px solid #222` }}>
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

          {/* Overlay legend */}
          <div style={{
            position: "absolute", top: 12, right: 12, zIndex: 1000,
            background: "rgba(10,10,10,0.92)", border: `2px solid ${NB.cyan}`,
            padding: "10px 14px", fontFamily: "monospace"
          }}>
            <div style={{ color: NB.cyan, fontWeight: 900, fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>
              LEGEND
            </div>
            {[
              { color: NB.pink, label: "Existing Hospital" },
              { color: NB.cyan, label: "Existing School"   },
              { color: NB.red,  label: "High Pollution Zone" },
              { color: NB.orange, label: "Medium Pollution"  },
              { color: NB.green,  label: "Low Pollution"     },
              { color: NB.yellow, label: "Proposed Site"     },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, marginBottom: 3 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: l.color, border: "1px solid #fff" }} />
                <span style={{ color: "#ccc" }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* WHO threshold reminder */}
          {result && (
            <div style={{
              position: "absolute", bottom: 12, left: 12, zIndex: 1000,
              background: "rgba(10,10,10,0.92)", border: `2px solid ${NB.yellow}`,
              padding: "10px 14px", fontFamily: "monospace", maxWidth: 240
            }}>
              <div style={{ color: NB.yellow, fontWeight: 900, fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>
                STANDARDS ({result.metadata?.standards})
              </div>
              {Object.entries(result.metadata?.thresholds_used || {}).map(([k, v]) => (
                <div key={k} style={{ fontSize: 10, color: "#aaa", display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span>{k.toUpperCase()}</span><span style={{ color: NB.white }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {!clickedPos && (
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              background: "rgba(0,0,0,0.85)", color: NB.yellow,
              padding: "14px 22px", fontWeight: 900, fontSize: 13,
              letterSpacing: 2, border: `2px solid ${NB.yellow}`, zIndex: 999,
              pointerEvents: "none"
            }}>
              CLICK MAP TO PLACE PROPOSED SITE
            </div>
          )}
        </div>

        {/* ── RIGHT: Results ── */}
        <div style={{ background: "#111", overflowY: "auto" }}>
          {!result ? (
            <div style={{
              height: "100%", display: "flex", alignItems: "center",
              justifyContent: "center", flexDirection: "column", gap: 12,
              color: "#333", padding: 24
            }}>
              <div style={{ fontSize: 48 }}>{infraType === "hospital" ? "🏥" : "🏫"}</div>
              <div style={{ fontWeight: 900, fontSize: 12, letterSpacing: 2, textAlign: "center" }}>
                PLACE A SITE ON THE MAP<br />AND RUN ANALYSIS
              </div>
            </div>
          ) : (
            <>
              {/* Score header */}
              <div style={{
                background: "#1a1a1a", borderBottom: `2px solid #333`,
                padding: "16px 20px", display: "flex", alignItems: "center", gap: 20
              }}>
                <ScoreRing score={result.suitability_score} tier={result.tier} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#666", letterSpacing: 2, marginBottom: 4 }}>
                    SUITABILITY SCORE
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: TIER_CONFIG[result.tier]?.bg }}>
                    {result.tier}
                  </div>
                  <div style={{ fontSize: 10, color: "#aaa", marginTop: 4 }}>
                    {result.metadata?.lat?.toFixed(4)}°N {result.metadata?.lng?.toFixed(4)}°E
                  </div>
                  <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
                    {result.metadata?.standards}
                  </div>
                </div>
              </div>

              {/* Tab nav */}
              <div style={{ display: "flex", borderBottom: `2px solid #333` }}>
                {[
                  { key: "scores", label: "SCORES" },
                  { key: "risks",  label: `RISKS (${result.risks?.length || 0})` },
                  { key: "projection", label: "5-YEAR" },
                  { key: "refs",   label: "COMPARE" },
                ].map(tab => (
                  <div key={tab.key} style={{
                    flex: 1, padding: "10px 0", textAlign: "center",
                    fontSize: 10, fontWeight: 900, letterSpacing: 1, cursor: "pointer",
                    borderBottom: activeTab === tab.key ? `3px solid ${NB.cyan}` : "3px solid transparent",
                    color: activeTab === tab.key ? NB.cyan : "#555",
                    background: activeTab === tab.key ? "#1a1a1a" : "transparent"
                  }} onClick={() => setActiveTab(tab.key)}>
                    {tab.label}
                  </div>
                ))}
              </div>

              <div style={{ padding: "16px 20px" }}>

                {/* ── SCORES tab ── */}
                {activeTab === "scores" && (
                  <>
                    {/* Radar */}
                    <div style={{ marginBottom: 16 }}>
                      <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#333" />
                          <PolarAngleAxis dataKey="factor"
                            tick={{ fill: "#aaa", fontSize: 10, fontFamily: "monospace" }} />
                          <Radar name="Score" dataKey="score" stroke={NB.cyan}
                            fill={NB.cyan} fillOpacity={0.2} dot={{ r: 3, fill: NB.cyan }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Factor bars */}
                    {Object.entries(result.factor_scores).map(([k, v]) => (
                      <FactorBar key={k}
                        label={k.replace(/_/g," ").toUpperCase()} value={v} />
                    ))}

                    {/* Mitigations */}
                    {result.mitigations?.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ color: NB.yellow, fontWeight: 900, fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>
                          RECOMMENDED MITIGATIONS
                        </div>
                        {result.mitigations.map((m, i) => (
                          <div key={i} style={{
                            fontSize: 11, color: "#ccc", marginBottom: 7,
                            paddingLeft: 14, position: "relative", lineHeight: 1.6
                          }}>
                            <span style={{ position: "absolute", left: 0, color: NB.green }}>›</span>
                            {m}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ── RISKS tab ── */}
                {activeTab === "risks" && (
                  <>
                    {result.risks?.length === 0 ? (
                      <div style={{ color: NB.green, fontWeight: 900, fontSize: 13, textAlign: "center", marginTop: 32 }}>
                        ✓ NO CRITICAL RISKS DETECTED
                      </div>
                    ) : (
                      result.risks.map((r, i) => (
                        <div key={i} style={{
                          background: "#1a1a1a", border: `2px solid ${RISK_COLOR[r.level]}`,
                          padding: "12px 14px", marginBottom: 10,
                          boxShadow: `3px 3px 0 ${RISK_COLOR[r.level]}`
                        }}>
                          <div style={{
                            display: "inline-block",
                            background: RISK_COLOR[r.level],
                            color: r.level === "MEDIUM" ? NB.bg : "#fff",
                            padding: "2px 8px", fontSize: 10, fontWeight: 900,
                            letterSpacing: 1, marginBottom: 6
                          }}>
                            {r.level}
                          </div>
                          <div style={{ fontSize: 12, color: "#ddd", lineHeight: 1.6 }}>
                            {r.issue}
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {/* ── 5-YEAR PROJECTION tab ── */}
                {activeTab === "projection" && (
                  <>
                    <div style={{ marginBottom: 12, fontSize: 10, color: "#666" }}>
                      Assumes 2.5%/yr AQI improvement + natural green cover growth
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={result.yearly_projection}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#888", fontFamily: "monospace" }} />
                        <YAxis yAxisId="left"  tick={{ fontSize: 10, fill: NB.cyan, fontFamily: "monospace" }} />
                        <YAxis yAxisId="right" orientation="right"
                          tick={{ fontSize: 10, fill: NB.green, fontFamily: "monospace" }} />
                        <Tooltip content={<NbTooltip />} />
                        <Line yAxisId="left"  type="monotone" dataKey="projected_aqi"
                          stroke={NB.pink} strokeWidth={2} dot={{ r: 3 }} name="AQI" />
                        <Line yAxisId="right" type="monotone" dataKey="sustainability_score"
                          stroke={NB.green} strokeWidth={2} dot={{ r: 3 }} name="Sust. Score" />
                        <Line yAxisId="left"  type="monotone" dataKey="projected_pm25"
                          stroke={NB.yellow} strokeWidth={2} dot={{ r: 3 }} name="PM2.5" strokeDasharray="4 2" />
                      </LineChart>
                    </ResponsiveContainer>

                    <div style={{ marginTop: 12 }}>
                      {result.yearly_projection.map(y => (
                        <div key={y.year} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "6px 0", borderBottom: "1px solid #1e1e1e", fontSize: 11
                        }}>
                          <span style={{ color: NB.yellow, fontWeight: 900, minWidth: 46 }}>{y.year}</span>
                          <span style={{ color: "#aaa" }}>AQI <span style={{ color: NB.pink }}>{y.projected_aqi}</span></span>
                          <span style={{ color: "#aaa" }}>PM2.5 <span style={{ color: NB.cyan }}>{y.projected_pm25.toFixed(1)}</span></span>
                          <span style={{ color: "#aaa" }}>Green <span style={{ color: NB.green }}>{y.green_cover}%</span></span>
                          <span style={{
                            padding: "2px 8px", fontSize: 10, fontWeight: 900,
                            background: y.sustainability_score >= 70 ? NB.green
                                      : y.sustainability_score >= 50 ? NB.yellow : NB.red,
                            color: NB.bg
                          }}>
                            {y.sustainability_score.toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ── COMPARE tab ── */}
                {activeTab === "refs" && (
                  <>
                    <div style={{ marginBottom: 12, fontSize: 10, color: "#666" }}>
                      Comparable sites in Bidhannagar assessed under same criteria
                    </div>
                    {result.reference_sites?.map((site, i) => {
                      const cfg = TIER_CONFIG[site.tier] || TIER_CONFIG.MARGINAL;
                      return (
                        <div key={i} style={{
                          background: "#1a1a1a", border: `2px solid ${cfg.bg}`,
                          padding: "12px 14px", marginBottom: 10,
                          display: "flex", alignItems: "center", gap: 14
                        }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: "50%",
                            background: cfg.bg, color: cfg.color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 900, fontSize: 18, flexShrink: 0
                          }}>
                            {site.score}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 900, fontSize: 12 }}>{site.name}</div>
                            <div style={{ fontSize: 10, color: cfg.bg, marginTop: 2 }}>{site.tier}</div>
                            <div style={{ fontSize: 10, color: "#777", marginTop: 3 }}>{site.note}</div>
                          </div>
                          <div style={{ fontSize: 10, color: "#555" }}>
                            {site.lat.toFixed(3)}°N<br/>{site.lng.toFixed(3)}°E
                          </div>
                        </div>
                      );
                    })}

                    {/* Comparison bar chart */}
                    <div style={{ marginTop: 16 }}>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={[
                          { name: "This Site", score: result.suitability_score },
                          ...(result.reference_sites || []).map(s => ({ name: s.name.split(" ")[0], score: s.score }))
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#888", fontFamily: "monospace" }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#888" }} />
                          <Tooltip content={<NbTooltip />} />
                          <Bar dataKey="score" radius={[2,2,0,0]}>
                            {[
                              { name: "This Site", score: result.suitability_score },
                              ...(result.reference_sites || [])
                            ].map((entry, idx) => (
                              <Cell key={idx} fill={
                                idx === 0 ? NB.cyan
                                : (entry.score >= 75 ? NB.green : entry.score >= 55 ? NB.yellow : NB.red)
                              } />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        ::-webkit-scrollbar { width: 4px; background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
      `}</style>
    </div>
  );
}