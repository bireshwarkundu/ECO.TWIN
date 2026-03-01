import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, AreaChart, Area
} from "recharts";

const API = "http://localhost:8000";

// ── Bidhannagar major roads (OSM-accurate lat/lng polylines) ──────────────
const BIDHANNAGAR_ROADS = [
  {
    id: "vip_road", name: "VIP Road (Bypass)",
    coords: [[22.5820,88.4310],[22.5780,88.4290],[22.5740,88.4265],[22.5700,88.4242]],
    type: "arterial", traffic_pct: 35
  },
  {
    id: "sector_v_main", name: "Sector V Main Avenue",
    coords: [[22.5790,88.4313],[22.5760,88.4295],[22.5730,88.4280]],
    type: "arterial", traffic_pct: 28
  },
  {
    id: "eastern_metro", name: "Eastern Metropolitan Bypass",
    coords: [[22.5650,88.4180],[22.5700,88.4220],[22.5750,88.4255]],
    type: "highway", traffic_pct: 42
  },
  {
    id: "baguiati_road", name: "Baguiati Road",
    coords: [[22.5830,88.4250],[22.5800,88.4240],[22.5760,88.4230]],
    type: "secondary", traffic_pct: 18
  },
  {
    id: "kestopur_connector", name: "Kestopur Connector",
    coords: [[22.5840,88.4320],[22.5820,88.4350],[22.5800,88.4370]],
    type: "secondary", traffic_pct: 15
  },
  {
    id: "avenue_central", name: "Central Avenue",
    coords: [[22.5700,88.4200],[22.5720,88.4225],[22.5740,88.4248]],
    type: "arterial", traffic_pct: 22
  },
];

const ZONE_CENTERS = [
  { name: "Sector I",   lat: 22.5770, lng: 88.4245, pop: 42000 },
  { name: "Sector II",  lat: 22.5720, lng: 88.4290, pop: 58000 },
  { name: "Sector III", lat: 22.5670, lng: 88.4210, pop: 67000 },
  { name: "Sector V",   lat: 22.5790, lng: 88.4330, pop: 120000 },
  { name: "Kestopur",   lat: 22.5840, lng: 88.4340, pop: 89000 },
];

const POLLUTANT_COLORS = {
  pm25: "#ff2d55", pm10: "#ff9500", no2: "#af52de",
  co: "#5ac8fa", o3: "#34c759", aqi: "#ffcc00"
};

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Neo-Brutalist colour palette ──────────────────────────────────────────
const NB = {
  bg: "#f5f0e8",
  black: "#0a0a0a",
  yellow: "#ffe135",
  pink: "#ff2d8d",
  cyan: "#00e5ff",
  green: "#00ff88",
  red: "#ff2222",
  border: "3px solid #0a0a0a",
  shadow: "4px 4px 0px #0a0a0a",
  shadowLg: "6px 6px 0px #0a0a0a",
};

// ── Custom tooltip ─────────────────────────────────────────────────────────
const NbTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: NB.black, color: "#fff", border: `2px solid ${NB.yellow}`,
      padding: "10px 14px", fontFamily: "monospace", fontSize: 12,
      boxShadow: NB.shadow
    }}>
      <div style={{ color: NB.yellow, fontWeight: 900, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: POLLUTANT_COLORS[p.dataKey] || "#fff" }}>
          {p.dataKey.toUpperCase()}: {p.value}
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function TrafficDivergence() {
  const mapRef     = useRef(null);
  const leafletMap = useRef(null);
  const layerGroup = useRef(null);

  const [selectedRoads, setSelectedRoads]   = useState([]);
  const [diversionPct, setDiversionPct]     = useState(20);
  const [selectedZones, setSelectedZones]   = useState([]);
  const [result, setResult]                 = useState(null);
  const [loading, setLoading]               = useState(false);
  const [activePollutant, setActivePollutant] = useState("aqi");
  const [activeMonth, setActiveMonth]       = useState(null); // highlight month
  const [viewMonth, setViewMonth]           = useState(6);    // 1 / 3 / 6
  const [error, setError]                   = useState(null);

  // ── Init Leaflet ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (leafletMap.current) return;

    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [22.575, 88.428],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { attribution: "© CartoDB", maxZoom: 19 }
    ).addTo(map);

    layerGroup.current = L.layerGroup().addTo(map);
    leafletMap.current = map;

    return () => { map.remove(); leafletMap.current = null; };
  }, []);

  // ── Draw roads on map ─────────────────────────────────────────────────────
  useEffect(() => {
    const L = window.L;
    if (!L || !layerGroup.current) return;
    layerGroup.current.clearLayers();

    BIDHANNAGAR_ROADS.forEach(road => {
      const isSelected = selectedRoads.includes(road.id);
      const color = isSelected
        ? NB.red
        : road.type === "highway" ? "#ff8800"
        : road.type === "arterial" ? "#0066cc"
        : "#666";

      const weight = isSelected ? 7 : road.type === "highway" ? 5 : 3;
      const dashArray = isSelected ? "10, 6" : null;

      const poly = L.polyline(road.coords, {
        color, weight, dashArray, opacity: isSelected ? 1 : 0.7
      }).addTo(layerGroup.current);

      poly.on("click", () => {
        setSelectedRoads(prev =>
          prev.includes(road.id)
            ? prev.filter(r => r !== road.id)
            : [...prev, road.id]
        );
      });

      // Label popup on hover
      poly.bindTooltip(
        `<b style="font-family:monospace">${road.name}</b><br/>` +
        `Traffic share: ${road.traffic_pct}%` +
        (isSelected ? `<br/><span style="color:red">✗ CLOSED</span>` : ""),
        { sticky: true, className: "nb-tooltip" }
      );
    });

    // Zone markers
    ZONE_CENTERS.forEach(z => {
      const isActive = selectedZones.includes(z.name);
      const marker = L.circleMarker([z.lat, z.lng], {
        radius: 10, color: NB.black, fillColor: isActive ? NB.yellow : "#fff",
        fillOpacity: 0.9, weight: 2
      }).addTo(layerGroup.current);

      marker.bindTooltip(
        `<b style="font-family:monospace">${z.name}</b><br/>Pop: ${z.pop.toLocaleString()}`,
        { sticky: true }
      );

      marker.on("click", () => {
        setSelectedZones(prev =>
          prev.includes(z.name) ? prev.filter(n => n !== z.name) : [...prev, z.name]
        );
      });
    });

    // If result, paint congestion heatmap overlay on selected roads
    if (result) {
      result.zone_impact.forEach(zi => {
        const zone = ZONE_CENTERS.find(z => z.name === zi.zone);
        if (!zone) return;
        const radius = Math.max(20, zi.aqi_improvement * 15);
        L.circle([zone.lat, zone.lng], {
          radius, color: NB.green, fillColor: NB.green,
          fillOpacity: 0.15, weight: 2, dashArray: "4,4"
        }).addTo(layerGroup.current)
          .bindTooltip(
            `<b>${zi.zone}</b><br/>AQI ↓ ${zi.aqi_improvement.toFixed(1)}<br/>` +
            `PM2.5 ↓ ${zi.pm25_reduction} µg/m³`,
            { sticky: true }
          );
      });
    }
  }, [selectedRoads, selectedZones, result]);

  // ── Run simulation ─────────────────────────────────────────────────────────
  const runSimulation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const body = {
        roads_closed: selectedRoads,
        diversion_percent: diversionPct,
        affected_zones: selectedZones.length ? selectedZones : ZONE_CENTERS.map(z => z.name),
      };
      const res  = await fetch(`${API}/traffic-divergence`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedRoads, diversionPct, selectedZones]);

  // ── Filtered projection data ───────────────────────────────────────────────
  const chartData = result
    ? result.projections.filter(p => p.month <= viewMonth)
    : [];

  const summarySnap = result?.summary;

  return (
    <div style={{
      background: NB.bg, minHeight: "100vh", fontFamily: "'Space Mono', monospace",
      color: NB.black, padding: 0
    }}>
      {/* ── HEADER ── */}
      <div style={{
        background: NB.pink, padding: "18px 28px", borderBottom: NB.border,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 4px 0 #0a0a0a"
      }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 3, color: "#fff" }}>
            🚦 TRAFFIC DIVERGENCE ENGINE
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", letterSpacing: 2, marginTop: 3 }}>
            BIDHANNAGAR · REAL-TIME DIVERSION MODELLING · AQI TEMPORAL PROJECTION
          </div>
        </div>
        <div style={{
          background: NB.yellow, border: NB.border, padding: "8px 18px",
          fontWeight: 900, fontSize: 13, boxShadow: NB.shadow, cursor: "pointer"
        }} onClick={() => { setSelectedRoads([]); setSelectedZones([]); setResult(null); }}>
          ↺ RESET
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 0, height: "calc(100vh - 70px)" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          background: "#fff", borderRight: NB.border, overflowY: "auto",
          display: "flex", flexDirection: "column"
        }}>
          {/* Instructions */}
          <div style={{ padding: "14px 16px", borderBottom: NB.border, background: NB.yellow }}>
            <div style={{ fontWeight: 900, fontSize: 12, letterSpacing: 2 }}>HOW TO USE</div>
            <div style={{ fontSize: 11, marginTop: 6, lineHeight: 1.7 }}>
              <span style={{ color: NB.red }}>①</span> Click roads on map to close them<br />
              <span style={{ color: NB.pink }}>②</span> Click zones to mark affected areas<br />
              <span style={{ color: "#0066cc" }}>③</span> Set diversion % below<br />
              <span style={{ color: NB.green }}>④</span> Run simulation
            </div>
          </div>

          {/* Selected roads */}
          <div style={{ padding: "12px 16px", borderBottom: NB.border }}>
            <div style={{ fontWeight: 900, fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>
              ROADS CLOSED ({selectedRoads.length})
            </div>
            {BIDHANNAGAR_ROADS.map(road => (
              <div key={road.id} style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 5,
                cursor: "pointer", padding: "4px 6px",
                background: selectedRoads.includes(road.id) ? "#ffe0e0" : "transparent",
                border: selectedRoads.includes(road.id) ? "2px solid #ff2222" : "2px solid transparent",
              }} onClick={() => setSelectedRoads(prev =>
                prev.includes(road.id) ? prev.filter(r => r !== road.id) : [...prev, road.id]
              )}>
                <div style={{
                  width: 12, height: 12, border: "2px solid #0a0a0a",
                  background: selectedRoads.includes(road.id) ? NB.red : "#fff",
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{road.name}</div>
                  <div style={{ fontSize: 10, color: "#666" }}>
                    {road.type} · {road.traffic_pct}% volume
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Zone selector */}
          <div style={{ padding: "12px 16px", borderBottom: NB.border }}>
            <div style={{ fontWeight: 900, fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>
              AFFECTED ZONES
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ZONE_CENTERS.map(z => (
                <div key={z.name} style={{
                  padding: "4px 10px", border: NB.border, fontSize: 11, cursor: "pointer",
                  background: selectedZones.includes(z.name) ? NB.yellow : "#fff",
                  boxShadow: selectedZones.includes(z.name) ? NB.shadow : "none",
                  fontWeight: 700, transition: "all 0.1s"
                }} onClick={() => setSelectedZones(prev =>
                  prev.includes(z.name) ? prev.filter(n => n !== z.name) : [...prev, z.name]
                )}>
                  {z.name}
                </div>
              ))}
            </div>
          </div>

          {/* Diversion slider */}
          <div style={{ padding: "12px 16px", borderBottom: NB.border }}>
            <div style={{ fontWeight: 900, fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>
              DIVERSION INTENSITY
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="range" min="5" max="80" value={diversionPct}
                onChange={e => setDiversionPct(Number(e.target.value))}
                style={{ flex: 1, accentColor: NB.pink }} />
              <div style={{
                background: NB.pink, color: "#fff", padding: "4px 10px",
                fontWeight: 900, fontSize: 16, border: NB.border, minWidth: 56, textAlign: "center"
              }}>
                {diversionPct}%
              </div>
            </div>
            <div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>
              % of traffic rerouted away from closed roads
            </div>
          </div>

          {/* Run button */}
          <div style={{ padding: "16px" }}>
            <div style={{
              background: loading ? "#aaa" : NB.black,
              color: loading ? "#666" : NB.yellow,
              padding: "14px", textAlign: "center", fontWeight: 900,
              fontSize: 14, letterSpacing: 3, border: NB.border,
              boxShadow: loading ? "none" : NB.shadowLg,
              cursor: loading ? "default" : "pointer",
              transition: "all 0.15s"
            }} onClick={!loading ? runSimulation : undefined}>
              {loading ? "▶ COMPUTING..." : "▶ RUN SIMULATION"}
            </div>
            {error && (
              <div style={{ color: NB.red, fontSize: 11, marginTop: 8, fontWeight: 700 }}>
                ⚠ {error}
              </div>
            )}
          </div>

          {/* Summary box */}
          {summarySnap && (
            <div style={{ padding: "0 16px 16px", flex: 1 }}>
              <div style={{
                background: NB.black, color: "#fff", padding: 14,
                border: `2px solid ${NB.green}`, boxShadow: NB.shadow
              }}>
                <div style={{ color: NB.green, fontWeight: 900, fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>
                  SIMULATION RESULT
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", fontSize: 11 }}>
                  {[
                    ["AQI NOW",   summarySnap.aqi_now,  NB.yellow],
                    ["AQI 1M",    summarySnap.aqi_1m,   NB.cyan],
                    ["AQI 3M",    summarySnap.aqi_3m,   NB.green],
                    ["AQI 6M",    summarySnap.aqi_6m,   NB.green],
                  ].map(([label, val, col]) => (
                    <div key={label}>
                      <div style={{ color: "#aaa", fontSize: 10 }}>{label}</div>
                      <div style={{ color: col, fontWeight: 900, fontSize: 20 }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, borderTop: "1px solid #333", paddingTop: 10, fontSize: 10, color: "#ccc", lineHeight: 1.7 }}>
                  {summarySnap.recommendation}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{
                    padding: "2px 8px", fontSize: 10, fontWeight: 900,
                    background: summarySnap.displaced_congestion_risk === "HIGH" ? NB.red
                               : summarySnap.displaced_congestion_risk === "MEDIUM" ? "#ff8800"
                               : NB.green,
                    color: "#fff"
                  }}>
                    CONGESTION RISK: {summarySnap.displaced_congestion_risk}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: MAP + CHARTS ── */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Map */}
          <div style={{ flex: "0 0 55%", position: "relative", borderBottom: NB.border }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

            {/* Map legend overlay */}
            <div style={{
              position: "absolute", bottom: 12, left: 12, zIndex: 1000,
              background: "rgba(255,255,255,0.95)", border: NB.border,
              padding: "10px 14px", boxShadow: NB.shadow, fontFamily: "monospace"
            }}>
              <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>MAP LEGEND</div>
              {[
                { color: "#ff2222", dash: true, label: "Closed Road" },
                { color: "#ff8800", dash: false, label: "Highway" },
                { color: "#0066cc", dash: false, label: "Arterial" },
                { color: NB.green, dash: true, label: "AQI Relief Zone" },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, marginBottom: 3 }}>
                  <div style={{
                    width: 24, height: 3,
                    background: l.color,
                    borderTop: l.dash ? `2px dashed ${l.color}` : "none",
                    opacity: 0.9
                  }} />
                  {l.label}
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: NB.yellow, border: "2px solid #0a0a0a" }} />
                Selected Zone
              </div>
            </div>

            {selectedRoads.length === 0 && (
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                background: "rgba(0,0,0,0.78)", color: NB.yellow, padding: "14px 22px",
                fontWeight: 900, fontSize: 13, letterSpacing: 2, pointerEvents: "none",
                border: `2px solid ${NB.yellow}`, zIndex: 999
              }}>
                CLICK ROADS TO CLOSE THEM
              </div>
            )}
          </div>

          {/* Charts */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16, background: "#fafafa" }}>
            {!result ? (
              <div style={{
                height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#aaa", fontWeight: 900, fontSize: 13, letterSpacing: 2
              }}>
                SELECT ROADS & RUN SIMULATION TO SEE PROJECTIONS
              </div>
            ) : (
              <>
                {/* Projection controls */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: 2 }}>
                    TEMPORAL AQI PROJECTION
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1, 3, 6].map(m => (
                      <div key={m} style={{
                        padding: "4px 14px", border: NB.border, fontSize: 11, cursor: "pointer",
                        fontWeight: 900, background: viewMonth === m ? NB.pink : "#fff",
                        color: viewMonth === m ? "#fff" : NB.black,
                        boxShadow: viewMonth === m ? NB.shadow : "none"
                      }} onClick={() => setViewMonth(m)}>
                        {m}M
                      </div>
                    ))}
                    {/* Pollutant selector */}
                    {["aqi", "pm25", "pm10", "no2", "co", "o3"].map(p => (
                      <div key={p} style={{
                        padding: "4px 10px", border: NB.border, fontSize: 10, cursor: "pointer",
                        fontWeight: 900,
                        background: activePollutant === p ? POLLUTANT_COLORS[p] : "#fff",
                        color: activePollutant === p ? "#fff" : NB.black,
                      }} onClick={() => setActivePollutant(p)}>
                        {p.toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Line chart */}
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={POLLUTANT_COLORS[activePollutant]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={POLLUTANT_COLORS[activePollutant]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                    <XAxis dataKey="month_label" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                    <YAxis tick={{ fontSize: 10, fontFamily: "monospace" }} />
                    <Tooltip content={<NbTooltip />} />
                    <ReferenceLine x="Now" stroke={NB.pink} strokeDasharray="4 2" label={{ value: "NOW", fill: NB.pink, fontSize: 10, fontFamily: "monospace" }} />
                    <Area
                      type="monotone" dataKey={activePollutant}
                      stroke={POLLUTANT_COLORS[activePollutant]} strokeWidth={3}
                      fill="url(#projGrad)" dot={{ r: 4, fill: POLLUTANT_COLORS[activePollutant] }}
                      activeDot={{ r: 6, stroke: NB.black, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Season labels */}
                <div style={{ display: "flex", gap: 6, marginTop: 8, marginBottom: 14 }}>
                  {chartData.map(d => (
                    <div key={d.month} style={{
                      flex: 1, textAlign: "center", fontSize: 9, padding: "2px 0",
                      background: d.season === "Monsoon" ? "#e0f4ff"
                               : d.season === "Winter" ? "#e8f0ff"
                               : d.season === "Pre-Monsoon" ? "#fff8e0"
                               : "#f0ffe8",
                      border: "1px solid #ddd", fontFamily: "monospace", fontWeight: 700
                    }}>
                      {d.season.split(" ")[0].toUpperCase().slice(0, 3)}
                    </div>
                  ))}
                </div>

                {/* Zone impact grid */}
                <div style={{ fontWeight: 900, fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>
                  ZONE-BY-ZONE IMPACT
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                  {result.zone_impact.map(zi => (
                    <div key={zi.zone} style={{
                      border: NB.border, padding: "10px 12px",
                      background: "#fff", boxShadow: "3px 3px 0 #0a0a0a"
                    }}>
                      <div style={{ fontWeight: 900, fontSize: 11 }}>{zi.zone}</div>
                      <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>
                        {zi.beneficiaries_est.toLocaleString()} residents
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                          <span>Traffic ↓</span>
                          <span style={{ color: NB.green, fontWeight: 900 }}>{zi.traffic_reduction_pct}%</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                          <span>PM2.5 ↓</span>
                          <span style={{ color: NB.pink, fontWeight: 900 }}>{zi.pm25_reduction} µg/m³</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                          <span>AQI ↓</span>
                          <span style={{ color: NB.cyan, fontWeight: 900 }}>{zi.aqi_improvement}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        .nb-tooltip { font-family: monospace !important; font-size: 11px !important; }
        input[type=range] { height: 6px; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #0a0a0a; }
      `}</style>
    </div>
  );
}