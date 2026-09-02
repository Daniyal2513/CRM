import { useState, useRef, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, FunnelChart, Funnel
} from "recharts";

// ─── Data ───────────────────────────────────────────────────────────────────

const revenueData = [
  { d: "Jan", v: 412000, f: 390000 }, { d: "Feb", v: 528000, f: 480000 },
  { d: "Mar", v: 491000, f: 510000 }, { d: "Apr", v: 634000, f: 580000 },
  { d: "May", v: 712000, f: 650000 }, { d: "Jun", v: 689000, f: 700000 },
  { d: "Jul", v: 843000, f: 760000 }, { d: "Aug", v: 921000, f: 860000 },
  { d: "Sep", v: 876000, f: 900000 }, { d: "Oct", v: 1020000, f: 950000 },
  { d: "Nov", v: 1145000, f: 1050000 }, { d: "Dec", v: 1320000, f: 1200000 },
];

const sparkData = (base: number, noise: number) =>
  Array.from({ length: 12 }, (_, i) => ({ v: base + Math.sin(i * 0.8) * noise + Math.random() * noise * 0.5 }));

const teamData = [
  { name: "Aria Chen", closed: 94, target: 100, deals: 31, revenue: "$1.2M" },
  { name: "James Okafor", closed: 87, target: 100, deals: 28, revenue: "$1.08M" },
  { name: "Sofia Reyes", closed: 76, target: 100, deals: 24, revenue: "$940K" },
  { name: "Luca Bianchi", closed: 68, target: 100, deals: 19, revenue: "$820K" },
  { name: "Priya Sharma", closed: 59, target: 100, deals: 17, revenue: "$710K" },
];

const funnelData = [
  { name: "Leads", value: 2400, fill: "#00D9FF" },
  { name: "Qualified", value: 1480, fill: "#22d3ee" },
  { name: "Proposal", value: 820, fill: "#818cf8" },
  { name: "Negotiation", value: 460, fill: "#a78bfa" },
  { name: "Closed Won", value: 290, fill: "#8B5CF6" },
];

const velocityData = [
  { stage: "Prospect", days: 4.2 }, { stage: "Discovery", days: 7.8 },
  { stage: "Proposal", days: 11.3 }, { stage: "Negotiation", days: 9.1 },
  { stage: "Close", days: 3.4 },
];

const kanbanDeals: Record<string, Deal[]> = {
  prospecting: [
    { id: "d1", company: "Vertex AI Labs", contact: "Mariana Tost", budget: "$48K", prob: 20, days: 3, owner: "AC", tag: "Enterprise" },
    { id: "d2", company: "Luminary Media", contact: "Dev Patel", budget: "$22K", prob: 35, days: 7, owner: "JO", tag: "Growth" },
    { id: "d3", company: "Obsidian Systems", contact: "Cleo Park", budget: "$130K", prob: 15, days: 1, owner: "SR", tag: "Enterprise" },
  ],
  discovery: [
    { id: "d4", company: "Nova Fintech", contact: "Ethan Blake", budget: "$67K", prob: 45, days: 12, owner: "LB", tag: "Growth" },
    { id: "d5", company: "Solace Health", contact: "Nadia Ali", budget: "$89K", prob: 55, days: 9, owner: "PS", tag: "Mid-Market" },
  ],
  proposal: [
    { id: "d6", company: "Zephyr Cloud", contact: "Omar Hassan", budget: "$210K", prob: 65, days: 18, owner: "AC", tag: "Enterprise" },
    { id: "d7", company: "Citrine Labs", contact: "Yuki Tanaka", budget: "$34K", prob: 70, days: 14, owner: "JO", tag: "SMB" },
  ],
  negotiation: [
    { id: "d8", company: "Helix Robotics", contact: "Ines Moreau", budget: "$340K", prob: 80, days: 22, owner: "SR", tag: "Enterprise" },
  ],
  won: [
    { id: "d9", company: "Arcanum Capital", contact: "Felix Adler", budget: "$115K", prob: 100, days: 31, owner: "AC", tag: "Growth" },
    { id: "d10", company: "Phaedra Studios", contact: "Camille Roy", budget: "$56K", prob: 100, days: 28, owner: "LB", tag: "Mid-Market" },
  ],
};

const contacts = [
  { id: 1, company: "Vertex AI Labs", name: "Mariana Tost", email: "m.tost@vertexai.io", phone: "+1 415 882 4401", stage: "Prospecting", last: "2h ago", avatar: "MT" },
  { id: 2, company: "Nova Fintech", name: "Ethan Blake", email: "e.blake@novafintech.com", phone: "+1 628 553 1920", stage: "Discovery", last: "Yesterday", avatar: "EB" },
  { id: 3, company: "Zephyr Cloud", name: "Omar Hassan", email: "o.hassan@zephyrcloud.io", phone: "+1 212 774 3305", stage: "Proposal", last: "3d ago", avatar: "OH" },
  { id: 4, company: "Helix Robotics", name: "Ines Moreau", email: "i.moreau@helixrobotics.fr", phone: "+33 1 84 74 21 09", stage: "Negotiation", last: "1h ago", avatar: "IM" },
  { id: 5, company: "Arcanum Capital", name: "Felix Adler", email: "f.adler@arcanum.vc", phone: "+44 20 7946 0320", stage: "Won", last: "5d ago", avatar: "FA" },
  { id: 6, company: "Solace Health", name: "Nadia Ali", email: "n.ali@solacehealth.co", phone: "+1 510 222 8840", stage: "Discovery", last: "4h ago", avatar: "NA" },
  { id: 7, company: "Citrine Labs", name: "Yuki Tanaka", email: "y.tanaka@citrine.jp", phone: "+81 3 1234 5678", stage: "Proposal", last: "2d ago", avatar: "YT" },
  { id: 8, company: "Obsidian Systems", name: "Cleo Park", email: "c.park@obsidian.io", phone: "+1 347 901 4452", stage: "Prospecting", last: "6h ago", avatar: "CP" },
];

const activities = [
  { id: 1, type: "email", icon: "✉", title: "Email sent to Ines Moreau", sub: "Re: Helix Robotics — Contract terms", time: "2 min ago", color: "#00D9FF" },
  { id: 2, type: "call", icon: "📞", title: "Call with Omar Hassan", sub: "30 min — Zephyr Cloud proposal walkthrough", time: "1h ago", color: "#a78bfa" },
  { id: 3, type: "deal", icon: "🏆", title: "Deal closed — Arcanum Capital", sub: "Felix Adler · $115,000 · Growth", time: "3h ago", color: "#34d399" },
  { id: 4, type: "task", icon: "✓", title: "Follow-up scheduled", sub: "Ethan Blake · Nova Fintech · Tomorrow 10am", time: "5h ago", color: "#fbbf24" },
  { id: 5, type: "email", icon: "✉", title: "Email from Nadia Ali", sub: "Solace Health — RFP documents attached", time: "Yesterday", color: "#00D9FF" },
  { id: 6, type: "note", icon: "📝", title: "Meeting notes added", sub: "Mariana Tost · Vertex AI Labs discovery call", time: "Yesterday", color: "#818cf8" },
  { id: 7, type: "call", icon: "📞", title: "Missed call from Dev Patel", sub: "Luminary Media", time: "2d ago", color: "#f87171" },
  { id: 8, type: "task", icon: "✓", title: "Contract sent", sub: "Cleo Park · Obsidian Systems · $130K", time: "2d ago", color: "#fbbf24" },
];

const notifications = [
  { id: 1, text: "Helix Robotics moved to Negotiation", time: "5m" },
  { id: 2, text: "New lead: Obsidian Systems via website", time: "32m" },
  { id: 3, text: "Nadia Ali replied to your email", time: "1h" },
  { id: 4, text: "Q3 report is ready for review", time: "3h" },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface Deal {
  id: string; company: string; contact: string; budget: string;
  prob: number; days: number; owner: string; tag: string;
}

type NavView = "dashboard" | "contacts" | "kanban" | "activity" | "automation" | "analytics" | "settings";

// ─── Components ──────────────────────────────────────────────────────────────

function Avatar({ initials, size = 28, gradient = false }: { initials: string; size?: number; gradient?: boolean }) {
  const colors = ["#00D9FF", "#8B5CF6", "#34d399", "#fbbf24", "#f472b6", "#818cf8"];
  const hash = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
  const c = colors[hash % colors.length];
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: gradient ? "linear-gradient(135deg,#00D9FF,#8B5CF6)" : `${c}22`,
        border: `1.5px solid ${c}44`, fontSize: size * 0.38, fontWeight: 700, color: c,
        fontFamily: "JetBrains Mono, monospace", flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function SparkLine({ data, color = "#00D9FF" }: { data: { v: number }[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#sg-${color.slice(1)})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function KpiCard({ label, value, change, color, sparkColor }: {
  label: string; value: string; change: string; color: string; sparkColor: string;
}) {
  const positive = change.startsWith("+");
  const sp = sparkData(50, 20);
  return (
    <div className="glass glow-card rounded-2xl p-5 fade-up" style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 4, fontFamily: "JetBrains Mono, monospace" }}>
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: positive ? "#34d399" : "#f87171" }}>
          {change}
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>vs last month</span>
      </div>
      <SparkLine data={sp} color={sparkColor} />
    </div>
  );
}

function StageTag({ stage }: { stage: string }) {
  const map: Record<string, string> = {
    "Prospecting": "badge-cyan", "Discovery": "badge-violet",
    "Proposal": "badge-amber", "Negotiation": "badge-red", "Won": "badge-green",
  };
  return <span className={map[stage] || "badge-cyan"}>{stage}</span>;
}

// ─── Views ───────────────────────────────────────────────────────────────────

function DashboardView() {
  const [range, setRange] = useState("YTD");
  const ranges = ["7D", "30D", "QTD", "YTD"];
  const slice = range === "7D" ? revenueData.slice(-2) : range === "30D" ? revenueData.slice(-4) : range === "QTD" ? revenueData.slice(-3) : revenueData;

  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%" }} className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Executive Overview</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Revenue intelligence & pipeline health · Q4 2025</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <KpiCard label="Total Revenue" value="$9.2M" change="+18.4%" color="#00D9FF" sparkColor="#00D9FF" />
        <KpiCard label="Conversion Rate" value="12.1%" change="+2.3%" color="#8B5CF6" sparkColor="#8B5CF6" />
        <KpiCard label="Active Deals" value="147" change="+31" color="#34d399" sparkColor="#34d399" />
        <KpiCard label="Avg CLV" value="$84K" change="+$7.2K" color="#fbbf24" sparkColor="#fbbf24" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, marginBottom: 16 }}>
        {/* Revenue Chart */}
        <div className="glass glow-card rounded-2xl p-5">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Revenue Forecast</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Actual vs Forecast</div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {ranges.map(r => (
                <button key={r} className={`tab-btn${range === r ? " active" : ""}`} onClick={() => setRange(r)}>{r}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={slice} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fore-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="d" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0D0E12", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: "#fff" }}
                formatter={(v) => [`$${(Number(v) / 1000).toFixed(0)}K`]}
              />
              <Area type="monotone" dataKey="v" stroke="#00D9FF" strokeWidth={2} fill="url(#rev-grad)" dot={false} name="Actual" />
              <Area type="monotone" dataKey="f" stroke="#8B5CF6" strokeWidth={1.5} fill="url(#fore-grad)" dot={false} strokeDasharray="4 3" name="Forecast" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="glass glow-card rounded-2xl p-5">
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Recent Activity</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: 260 }}>
            {activities.slice(0, 5).map(a => (
              <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", background: `${a.color}18`,
                  border: `1px solid ${a.color}33`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 12, flexShrink: 0
                }}>{a.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#e8eaf0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.sub}</div>
                </div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Follow-up Tasks */}
      <div className="glass glow-card rounded-2xl p-5">
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Priority Follow-ups</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { contact: "Ines Moreau", company: "Helix Robotics", task: "Send revised contract terms", due: "Today 3PM", priority: "High" },
            { contact: "Omar Hassan", company: "Zephyr Cloud", task: "Follow up on proposal feedback", due: "Today 5PM", priority: "High" },
            { contact: "Ethan Blake", company: "Nova Fintech", task: "Schedule discovery call II", due: "Tomorrow", priority: "Med" },
            { contact: "Dev Patel", company: "Luminary Media", task: "Return missed call", due: "Tomorrow", priority: "Med" },
          ].map((t, i) => (
            <div key={i} className="table-row" style={{ display: "flex", alignItems: "center", gap: 16, padding: "8px 0" }}>
              <input type="checkbox" style={{ accentColor: "#00D9FF", width: 14, height: 14, flexShrink: 0 }} />
              <Avatar initials={t.contact.split(" ").map(x => x[0]).join("")} size={26} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{t.task}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{t.contact} · {t.company}</div>
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)" }}>{t.due}</div>
              <span className={t.priority === "High" ? "badge-red" : "badge-amber"}>{t.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KanbanView() {
  const [deals, setDeals] = useState(kanbanDeals);
  const [dragging, setDragging] = useState<{ deal: Deal; from: string } | null>(null);
  const stages = [
    { key: "prospecting", label: "Prospecting", color: "#00D9FF" },
    { key: "discovery", label: "Discovery Call", color: "#818cf8" },
    { key: "proposal", label: "Proposal Sent", color: "#fbbf24" },
    { key: "negotiation", label: "Negotiation", color: "#f97316" },
    { key: "won", label: "Won / Closed", color: "#34d399" },
  ];

  const handleDrop = (toKey: string) => {
    if (!dragging) return;
    if (dragging.from === toKey) { setDragging(null); return; }
    setDeals(prev => {
      const next = { ...prev };
      next[dragging.from] = prev[dragging.from].filter(d => d.id !== dragging.deal.id);
      next[toKey] = [...prev[toKey], dragging.deal];
      return next;
    });
    setDragging(null);
  };

  return (
    <div style={{ padding: "28px 32px", height: "100%", display: "flex", flexDirection: "column" }} className="fade-up">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Deal Pipeline</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Drag cards to update stage · 147 active deals</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Owner", "Budget", "Tag"].map(f => (
            <select key={f} className="input-field" style={{ width: "auto", fontSize: 12, padding: "6px 10px" }}>
              <option>{f}: All</option>
            </select>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, flex: 1, overflowX: "auto", paddingBottom: 8 }}>
        {stages.map(stage => {
          const col = deals[stage.key] || [];
          const total = col.reduce((s, d) => s + parseInt(d.budget.replace(/[$K,]/g, "")) * (d.budget.includes("K") ? 1000 : 1), 0);
          return (
            <div
              key={stage.key}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(stage.key)}
              style={{ flex: "0 0 240px", display: "flex", flexDirection: "column", gap: 0 }}
            >
              {/* Column header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: stage.color }} />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{stage.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>
                    ${(total / 1000).toFixed(0)}K
                  </span>
                  <span className="badge-cyan" style={{ background: `${stage.color}18`, color: stage.color, borderColor: `${stage.color}33` }}>
                    {col.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
                {col.map(deal => (
                  <div
                    key={deal.id}
                    className="glass kanban-card glow-card rounded-xl"
                    draggable
                    onDragStart={() => setDragging({ deal, from: stage.key })}
                    style={{ padding: "14px", opacity: dragging?.deal.id === deal.id ? 0.4 : 1 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{deal.company}</span>
                      <span className="badge-cyan" style={{ fontSize: 10, background: `${stage.color}14`, color: stage.color, borderColor: `${stage.color}28` }}>
                        {deal.tag}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>{deal.contact}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "JetBrains Mono", color: "#e8eaf0" }}>{deal.budget}</span>
                      <Avatar initials={deal.owner} size={22} />
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${deal.prob}%`, background: `linear-gradient(90deg, ${stage.color}, ${stage.color}88)` }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>{deal.prob}% probability</span>
                      <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>{deal.days}d in stage</span>
                    </div>
                  </div>
                ))}
                <button style={{
                  background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)",
                  borderRadius: 10, padding: "10px", color: "rgba(255,255,255,0.2)",
                  fontSize: 12, cursor: "pointer", width: "100%", transition: "all 0.15s"
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                >
                  + Add Deal
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContactsView() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof contacts[0] | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: number) => {
    setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div style={{ padding: "28px 32px", height: "100%", display: "flex", flexDirection: "column" }} className="fade-up">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Contacts & Accounts</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{contacts.length} total contacts</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input className="input-field" style={{ width: 220 }} placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="gradient-btn" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", border: "none", cursor: "pointer" }}>
            <span>+ Add Contact</span>
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flex: 1, overflow: "hidden" }}>
        {/* Table */}
        <div className="glass glow-card rounded-2xl" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Sticky header */}
          <div style={{
            display: "grid", gridTemplateColumns: "32px 36px 1fr 1fr 1fr 1fr 100px 90px",
            padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            gap: 8, flexShrink: 0
          }}>
            {["", "", "Company", "Contact", "Email", "Stage", "Last Touch", "Actions"].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
            ))}
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.map(c => (
              <div key={c.id} className="table-row" style={{
                display: "grid", gridTemplateColumns: "32px 36px 1fr 1fr 1fr 1fr 100px 90px",
                padding: "10px 16px", gap: 8, alignItems: "center", cursor: "pointer"
              }} onClick={() => setSelected(c)}>
                <input type="checkbox" checked={checked.has(c.id)} onChange={() => toggle(c.id)}
                  onClick={e => e.stopPropagation()} style={{ accentColor: "#00D9FF" }} />
                <Avatar initials={c.avatar} size={28} />
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#e8eaf0" }}>{c.company}</div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)" }}>{c.name}</div>
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", fontFamily: "JetBrains Mono" }}>{c.email}</div>
                <StageTag stage={c.stage} />
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)" }}>{c.last}</div>
                <div style={{ display: "flex", gap: 4 }}>
                  {["✉", "📞"].map((ic, i) => (
                    <button key={i} onClick={e => e.stopPropagation()} style={{
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontSize: 11,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>{ic}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide-over drawer */}
        {selected && (
          <div className="glass-strong glow-card rounded-2xl slide-in" style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Contact Profile</span>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: "20px 16px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
                <Avatar initials={selected.avatar} size={56} gradient />
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginTop: 10 }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{selected.company}</div>
                <StageTag stage={selected.stage} />
              </div>
              {[
                { label: "Email", value: selected.email },
                { label: "Phone", value: selected.phone },
                { label: "Last Touch", value: selected.last },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", fontFamily: "JetBrains Mono" }}>{f.value}</div>
                </div>
              ))}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, marginTop: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Interaction Log</div>
                {activities.slice(0, 4).map(a => (
                  <div key={a.id} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 3, background: `${a.color}66`, borderRadius: 2, alignSelf: "stretch", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{a.title}</div>
                      <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="gradient-btn" style={{ flex: 1, padding: "9px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: "#fff", border: "none", cursor: "pointer" }}>
                  <span>Send Email</span>
                </button>
                <button style={{ flex: 1, padding: "9px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
                  Log Call
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityView() {
  const [compose, setCompose] = useState(false);

  return (
    <div style={{ padding: "28px 32px", height: "100%", display: "flex", flexDirection: "column" }} className="fade-up">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Activity Feed</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Communication hub & task timeline</p>
        </div>
        <button className="gradient-btn" onClick={() => setCompose(!compose)} style={{ padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", border: "none", cursor: "pointer" }}>
          <span>+ Compose</span>
        </button>
      </div>

      <div style={{ display: "flex", gap: 16, flex: 1, overflow: "hidden" }}>
        {/* Timeline */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
          {activities.map(a => (
            <div key={a.id} className="glass glass-hover glow-card rounded-xl" style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "flex-start", cursor: "pointer" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", background: `${a.color}18`,
                border: `1px solid ${a.color}33`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 15, flexShrink: 0
              }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#e8eaf0", marginBottom: 2 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{a.sub}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{a.time}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "3px 8px", fontSize: 11, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>Reply</button>
                  <button style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "3px 8px", fontSize: 11, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>Assign</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        {compose && (
          <div className="glass-strong glow-card rounded-2xl slide-in" style={{ width: 320, flexShrink: 0, padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Quick Compose</div>
            <select className="input-field" style={{ fontSize: 12 }}>
              <option>Email</option>
              <option>Task Assignment</option>
              <option>Call Note</option>
            </select>
            <input className="input-field" placeholder="To: contact or team member" style={{ fontSize: 12 }} />
            <input className="input-field" placeholder="Subject" style={{ fontSize: 12 }} />
            <textarea className="input-field" placeholder="Message..." rows={5} style={{ resize: "none", fontSize: 12 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="gradient-btn" style={{ flex: 1, padding: "9px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: "#fff", border: "none", cursor: "pointer" }}>
                <span>Send</span>
              </button>
              <button onClick={() => setCompose(false)} style={{ padding: "9px 14px", borderRadius: 8, fontSize: 12.5, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const NODES = [
  { id: "n1", type: "trigger", label: "Website Lead Webhook", sub: "POST /api/leads", x: 40, y: 140, color: "#00D9FF" },
  { id: "n2", type: "condition", label: "Lead Score Check", sub: "Score ≥ 70", x: 260, y: 80, color: "#818cf8" },
  { id: "n3", type: "condition", label: "Deal Size Filter", sub: "Budget ≥ $20K", x: 260, y: 220, color: "#818cf8" },
  { id: "n4", type: "action", label: "Assign to AE", sub: "Round-robin routing", x: 480, y: 60, color: "#fbbf24" },
  { id: "n5", type: "action", label: "Start Drip Sequence", sub: "5-email nurture flow", x: 480, y: 180, color: "#fbbf24" },
  { id: "n6", type: "action", label: "Slack Notification", sub: "#new-leads channel", x: 700, y: 60, color: "#34d399" },
  { id: "n7", type: "action", label: "WhatsApp Alert", sub: "Deal stage changed", x: 700, y: 200, color: "#34d399" },
];

const EDGES = [
  { from: "n1", to: "n2" }, { from: "n1", to: "n3" },
  { from: "n2", to: "n4" }, { from: "n3", to: "n5" },
  { from: "n4", to: "n6" }, { from: "n5", to: "n7" },
];

function AutomationView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  const typeIcon: Record<string, string> = { trigger: "⚡", condition: "◆", action: "▶" };
  const typeLabel: Record<string, string> = { trigger: "Trigger", condition: "Condition", action: "Action" };

  return (
    <div style={{ padding: "28px 32px", height: "100%", display: "flex", flexDirection: "column" }} className="fade-up">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Workflow Automation</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Visual logic builder · Lead routing & drip campaigns</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12.5, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>+ Add Node</button>
          <button className="gradient-btn" style={{ padding: "8px 18px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: "#fff", border: "none", cursor: "pointer" }}>
            <span>Publish</span>
          </button>
        </div>
      </div>

      <div className="glass glow-card rounded-2xl" style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Grid pattern */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.3 }}>
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Edge lines */}
        <svg ref={svgRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {EDGES.map((e, i) => {
            const from = nodeMap[e.from];
            const to = nodeMap[e.to];
            const x1 = from.x + 175, y1 = from.y + 36;
            const x2 = to.x + 12, y2 = to.y + 36;
            const mx = (x1 + x2) / 2;
            return (
              <g key={i}>
                <path d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                  fill="none" stroke="rgba(0,217,255,0.2)" strokeWidth="1.5" strokeDasharray="5,4" />
                <circle cx={x2} cy={y2} r={3} fill="#00D9FF" opacity={0.5} />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {NODES.map(n => (
          <div key={n.id} className="glass-strong node-block glow-card"
            style={{ left: n.x, top: n.y, width: 175, border: `1px solid ${n.color}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 13 }}>{typeIcon[n.type]}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: n.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {typeLabel[n.type]}
              </span>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#e8eaf0", marginBottom: 3 }}>{n.label}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{n.sub}</div>
            <div className="node-connector" style={{ background: n.color }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsView() {
  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%" }} className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Revenue Intelligence</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Pipeline analytics, team performance & funnel diagnostics</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Sales Velocity */}
        <div className="glass glow-card rounded-2xl p-5">
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Sales Velocity by Stage</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>Average days per pipeline stage</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={velocityData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="stage" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} unit="d" />
              <Tooltip contentStyle={{ background: "#0D0E12", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#fff" }} formatter={(v) => [`${Number(v)}d`]} />
              <Bar dataKey="days" fill="url(#bar-grad)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D9FF" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel */}
        <div className="glass glow-card rounded-2xl p-5">
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Conversion Funnel</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>Drop-off diagnostics Q4 2025</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {funnelData.map((f, i) => {
              const pct = Math.round((f.value / funnelData[0].value) * 100);
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{f.name}</span>
                    <span style={{ fontSize: 11.5, fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.5)" }}>
                      {f.value.toLocaleString()} · {pct}%
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: f.fill }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Leaderboard */}
      <div className="glass glow-card rounded-2xl p-5">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Team Closing Rate Leaderboard</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Q4 2025 · Target: 100 deals</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ padding: "6px 12px", borderRadius: 6, fontSize: 11.5, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>Export CSV</button>
            <button style={{ padding: "6px 12px", borderRadius: 6, fontSize: 11.5, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>Export PDF</button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {teamData.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: i === 0 ? "#fbbf24" : "rgba(255,255,255,0.3)", width: 20, textAlign: "center", fontFamily: "JetBrains Mono" }}>
                {i + 1}
              </div>
              <Avatar initials={m.name.split(" ").map(x => x[0]).join("")} size={32} />
              <div style={{ width: 130, flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{m.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{m.deals} deals · {m.revenue}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${m.closed}%`, background: i === 0 ? "linear-gradient(90deg, #fbbf24, #f97316)" : "linear-gradient(90deg, #00D9FF, #8B5CF6)" }} />
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "JetBrains Mono", color: "#e8eaf0", width: 40, textAlign: "right" }}>
                {m.closed}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  const [notifications2, setNotifications2] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [slack, setSlack] = useState(true);
  const [whatsapp, setWhatsapp] = useState(false);

  const Toggle = ({ on, setOn }: { on: boolean; setOn: (v: boolean) => void }) => (
    <div onClick={() => setOn(!on)} style={{
      width: 38, height: 20, borderRadius: 10, background: on ? "linear-gradient(90deg, #00D9FF, #8B5CF6)" : "rgba(255,255,255,0.1)",
      cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
      border: `1px solid ${on ? "rgba(0,217,255,0.3)" : "rgba(255,255,255,0.12)"}`,
    }}>
      <div style={{
        position: "absolute", top: 2, left: on ? 19 : 2, width: 14, height: 14, borderRadius: "50%",
        background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.4)"
      }} />
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%" }} className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Workspace preferences & integrations</p>
      </div>
      <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Profile */}
        <div className="glass glow-card rounded-2xl p-5">
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Profile</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
            <Avatar initials="AW" size={52} gradient />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Alex Wright</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Account Executive · Divout CRM</div>
            </div>
            <button style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: 7, fontSize: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>Edit Photo</button>
          </div>
          {[{ label: "Full Name", value: "Alex Wright" }, { label: "Email", value: "alex@divout.io" }, { label: "Role", value: "Account Executive" }].map(f => (
            <div key={f.label} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</label>
              <input className="input-field" defaultValue={f.value} />
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="glass glow-card rounded-2xl p-5">
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Notifications & Integrations</div>
          {[
            { label: "Email notifications", sub: "Daily digest & deal alerts", on: notifications2, set: setNotifications2 },
            { label: "Two-factor authentication", sub: "TOTP app required on login", on: twoFA, set: setTwoFA },
            { label: "Slack integration", sub: "Deal stage change alerts", on: slack, set: setSlack },
            { label: "WhatsApp notifications", sub: "High-priority lead alerts", on: whatsapp, set: setWhatsapp },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{item.label}</div>
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)" }}>{item.sub}</div>
              </div>
              <Toggle on={item.on} setOn={item.set} />
            </div>
          ))}
        </div>

        <button className="gradient-btn" style={{ padding: "11px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, color: "#fff", border: "none", cursor: "pointer" }}>
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}

// ─── App Shell ───────────────────────────────────────────────────────────────

const NAV_ITEMS: { key: NavView; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "◈" },
  { key: "contacts", label: "Contacts", icon: "◉" },
  { key: "kanban", label: "Deal Pipeline", icon: "⊟" },
  { key: "activity", label: "Activity Feed", icon: "◎" },
  { key: "automation", label: "Automation", icon: "⊕" },
  { key: "analytics", label: "Analytics", icon: "◇" },
  { key: "settings", label: "Settings", icon: "◌" },
];

export default function App() {
  const [view, setView] = useState<NavView>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newDealOpen, setNewDealOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(v => !v); }
      if (e.key === "Escape") { setSearchOpen(false); setNotifOpen(false); setNewDealOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const renderView = () => {
    switch (view) {
      case "dashboard": return <DashboardView />;
      case "contacts": return <ContactsView />;
      case "kanban": return <KanbanView />;
      case "activity": return <ActivityView />;
      case "automation": return <AutomationView />;
      case "analytics": return <AnalyticsView />;
      case "settings": return <SettingsView />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#070709", position: "relative", overflow: "hidden" }}>
      <div className="ambient-bg" />

      {/* Search Modal */}
      {searchOpen && (
        <div onClick={() => setSearchOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
          zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 120
        }}>
          <div className="glass-strong glow-card rounded-2xl slide-in" onClick={e => e.stopPropagation()}
            style={{ width: 540, padding: "6px" }}>
            <input
              autoFocus className="input-field" style={{ fontSize: 16, padding: "12px 16px", background: "transparent", border: "none" }}
              placeholder="Search contacts, deals, companies..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
            />
            {searchQ && (
              <div style={{ padding: "8px 8px 8px" }}>
                {contacts.filter(c => c.name.toLowerCase().includes(searchQ.toLowerCase()) || c.company.toLowerCase().includes(searchQ.toLowerCase())).slice(0, 4).map(c => (
                  <div key={c.id} className="glass-hover" onClick={() => { setView("contacts"); setSearchOpen(false); setSearchQ(""); }}
                    style={{ display: "flex", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", alignItems: "center" }}>
                    <Avatar initials={c.avatar} size={28} />
                    <div><div style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{c.name}</div>
                      <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)" }}>{c.company}</div></div>
                    <StageTag stage={c.stage} />
                  </div>
                ))}
              </div>
            )}
            <div style={{ padding: "6px 16px 10px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 12, marginTop: 4 }}>
              {["Dashboard", "Contacts", "Analytics"].map(s => (
                <span key={s} style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", cursor: "pointer" }}
                  onClick={() => { setView(s.toLowerCase() as NavView); setSearchOpen(false); }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Deal Modal */}
      {newDealOpen && (
        <div onClick={() => setNewDealOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div className="glass-strong glow-card rounded-2xl slide-in" onClick={e => e.stopPropagation()}
            style={{ width: 440, padding: "24px" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 20 }}>New Deal</div>
            {["Company Name", "Contact Name", "Email", "Deal Budget"].map(f => (
              <div key={f} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f}</label>
                <input className="input-field" placeholder={f} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Stage</label>
              <select className="input-field">
                <option>Prospecting</option><option>Discovery Call</option><option>Proposal Sent</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="gradient-btn" style={{ flex: 1, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", border: "none", cursor: "pointer" }}>
                <span>Create Deal</span>
              </button>
              <button onClick={() => setNewDealOpen(false)} style={{ padding: "10px 16px", borderRadius: 8, fontSize: 13, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="glass" style={{
        width: collapsed ? 60 : 220, flexShrink: 0, display: "flex", flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.06)", transition: "width 0.2s", position: "relative", zIndex: 10
      }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? "20px 14px" : "20px 18px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#00D9FF,#8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff", flexShrink: 0
          }}>D</div>
          {!collapsed && <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Divout</span>}
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(item => (
            <div key={item.key} className={`nav-item${view === item.key ? " active" : ""}`}
              onClick={() => setView(item.key)}
              title={collapsed ? item.label : undefined}
              style={{ justifyContent: collapsed ? "center" : undefined, padding: collapsed ? "8px" : undefined }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="nav-item" style={{ justifyContent: collapsed ? "center" : undefined, padding: collapsed ? "8px" : undefined }}>
            <Avatar initials="AW" size={24} gradient />
            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Alex Wright</div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>Account Executive</div>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          position: "absolute", top: "50%", right: -10, transform: "translateY(-50%)",
          width: 20, height: 20, borderRadius: "50%", background: "#1a1c24",
          border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "rgba(255,255,255,0.4)"
        }}>
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
        {/* Top bar */}
        <div className="glass" style={{
          height: 56, display: "flex", alignItems: "center", padding: "0 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)", gap: 12, flexShrink: 0
        }}>
          {/* Breadcrumb */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>Divout</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>›</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
              {NAV_ITEMS.find(n => n.key === view)?.label}
            </span>
          </div>

          {/* Search */}
          <button onClick={() => setSearchOpen(true)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 14px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 12
          }}>
            <span>⌘</span><span>K</span>
            <span style={{ marginLeft: 4 }}>Quick search...</span>
          </button>

          {/* + New Deal */}
          <button className="gradient-btn" onClick={() => setNewDealOpen(true)} style={{
            padding: "7px 16px", borderRadius: 8, fontSize: 12.5, fontWeight: 600,
            color: "#fff", border: "none", cursor: "pointer"
          }}>
            <span>+ New Deal</span>
          </button>

          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setNotifOpen(!notifOpen)} style={{
              width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", position: "relative",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
            }}>
              🔔
              <div className="ping-dot" style={{
                position: "absolute", top: 6, right: 6, width: 7, height: 7,
                borderRadius: "50%", background: "#00D9FF", border: "1.5px solid #070709"
              }} />
            </button>
            {notifOpen && (
              <div className="glass-strong glow-card rounded-xl slide-in" style={{
                position: "absolute", right: 0, top: 42, width: 280, zIndex: 50, overflow: "hidden"
              }}>
                <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#fff" }}>Notifications</span>
                  <span className="badge-cyan">{notifications.length}</span>
                </div>
                {notifications.map(n => (
                  <div key={n.id} className="table-row" style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{n.text}</span>
                    <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{n.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {renderView()}
        </div>
      </div>
    </div>
  );
}
