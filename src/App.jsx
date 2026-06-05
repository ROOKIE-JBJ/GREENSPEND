import { useState, useEffect, useRef } from "react";

const transactions = [
  { id:1, merchant:"Bolt Electric",      category:"Transport",  type:"green",   amount:24.50, date:"Today",      ref:"EV charge Whitechapel",      co2:-0.8,  icon:"⚡" },
  { id:2, merchant:"Tesco Organic",      category:"Groceries",  type:"green",   amount:61.20, date:"Today",      ref:"Weekly shop",                 co2:-1.2,  icon:"🌿" },
  { id:3, merchant:"Shell Petrol",       category:"Transport",  type:"harmful", amount:78.00, date:"Yesterday",  ref:"Fuel — M25",                  co2:18.4,  icon:"⛽" },
  { id:4, merchant:"Zara",              category:"Fashion",    type:"harmful", amount:95.00, date:"Yesterday",  ref:"Fast fashion purchase",        co2:12.1,  icon:"👕" },
  { id:5, merchant:"Oatly Café",         category:"Food",       type:"green",   amount:8.40,  date:"Mon",        ref:"Coffee oat milk",              co2:-0.2,  icon:"☕" },
  { id:6, merchant:"British Gas",       category:"Energy",     type:"neutral", amount:112.00,date:"Mon",        ref:"Monthly energy direct debit",  co2:4.2,   icon:"🔥" },
  { id:7, merchant:"Patagonia",         category:"Fashion",    type:"green",   amount:85.00, date:"Sun",        ref:"Recycled jacket",              co2:-2.1,  icon:"🧥" },
  { id:8, merchant:"Ryanair",           category:"Travel",     type:"harmful", amount:143.00,date:"Sun",        ref:"Flight LHR-BCN",               co2:142.0, icon:"✈️" },
  { id:9, merchant:"Octopus Energy",    category:"Energy",     type:"green",   amount:89.00, date:"Sat",        ref:"100% renewable tariff",        co2:-5.4,  icon:"🐙" },
  { id:10,merchant:"McDonald's",        category:"Food",       type:"harmful", amount:12.80, date:"Sat",        ref:"Lunch",                        co2:3.8,   icon:"🍔" },
  { id:11,merchant:"Monzo Savings Pot", category:"Finance",    type:"neutral", amount:200.00,date:"Fri",        ref:"Monthly savings transfer",     co2:0,     icon:"💰" },
  { id:12,merchant:"Too Good To Go",    category:"Food",       type:"green",   amount:3.50,  date:"Fri",        ref:"Surplus food bag",             co2:-1.8,  icon:"🥗" },
];

const COLORS = {
  forest:  "#1B4332",
  moss:    "#2D6A4F",
  sage:    "#52B788",
  mint:    "#D8F3DC",
  gold:    "#F59E0B",
  red:     "#DC2626",
  neutral: "#6B7280",
  bg:      "#0D1F16",
  card:    "#162B1E",
  border:  "#2D6A4F44",
};

function ScoreRing({ score }) {
  const r = 54, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1200, 1);
      setAnimated(Math.round(p * score));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);
  const pct = animated / 100;
  const col = animated >= 70 ? COLORS.sage : animated >= 45 ? COLORS.gold : COLORS.red;
  return (
    <div style={{ position:"relative", width:128, height:128 }}>
      <svg width={128} height={128} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1B4332" strokeWidth={10}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
          strokeLinecap="round" style={{ transition:"stroke-dashoffset 0.05s linear" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:32, fontWeight:700, color:col, fontFamily:"Georgia,serif", lineHeight:1 }}>{animated}</span>
        <span style={{ fontSize:10, color:COLORS.sage, letterSpacing:"0.1em", marginTop:2 }}>SCORE</span>
      </div>
    </div>
  );
}

function Tag({ type }) {
  const cfg = {
    green:   { bg:"#14532D", color:"#86EFAC", label:"🌿 Green" },
    harmful: { bg:"#450A0A", color:"#FCA5A5", label:"⚠️ Harmful" },
    neutral: { bg:"#1C1F26", color:"#9CA3AF", label:"◦ Neutral" },
  }[type];
  return (
    <span style={{ background:cfg.bg, color:cfg.color, fontSize:10, padding:"2px 8px", borderRadius:20, fontWeight:600, whiteSpace:"nowrap" }}>
      {cfg.label}
    </span>
  );
}

function CO2Badge({ co2 }) {
  const pos = co2 > 0;
  return (
    <span style={{ fontSize:11, color: pos ? "#FCA5A5" : "#86EFAC", fontWeight:600, whiteSpace:"nowrap" }}>
      {pos ? "+" : ""}{co2 > 0 ? co2.toFixed(1) : co2 === 0 ? "0" : co2.toFixed(1)} kg CO₂
    </span>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => Math.abs(d.value)));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {data.map((d, i) => {
        const pct = Math.abs(d.value) / max * 100;
        const col = d.value < 0 ? COLORS.sage : d.value === 0 ? COLORS.neutral : COLORS.red;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:11, color:"#9CA3AF", minWidth:90, textAlign:"right" }}>{d.label}</span>
            <div style={{ flex:1, height:8, background:"#1B4332", borderRadius:4, overflow:"hidden" }}>
              <div style={{ width:`${pct}%`, height:"100%", background:col, borderRadius:4, transition:"width 1s ease" }}/>
            </div>
            <span style={{ fontSize:11, color:col, minWidth:52, textAlign:"right", fontWeight:600 }}>
              {d.value > 0 ? "+" : ""}{d.value} kg
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function GreenSpend() {
  const [tab, setTab] = useState("dashboard");
  const [selectedTx, setSelectedTx] = useState(null);
  const [filter, setFilter] = useState("all");
  const [alertDismissed, setAlertDismissed] = useState(false);

  const score = 67;
  const totalCO2 = transactions.reduce((a, t) => a + t.co2, 0);
  const greenSpend = transactions.filter(t => t.type === "green").reduce((a,t) => a+t.amount, 0);
  const harmfulSpend = transactions.filter(t => t.type === "harmful").reduce((a,t) => a+t.amount, 0);
  const totalSpend = transactions.reduce((a,t) => a+t.amount, 0);

  const categoryNet = [
    { label:"Travel",    value: 142.0 },
    { label:"Fashion",   value: 10.0  },
    { label:"Food",      value: 1.8   },
    { label:"Energy",    value:-1.2   },
    { label:"Transport", value:-1.6   },
    { label:"Groceries", value:-1.2   },
  ];

  const filteredTx = filter === "all" ? transactions : transactions.filter(t => t.type === filter);

  const navItems = [
    { id:"dashboard", label:"Dashboard", icon:"📊" },
    { id:"transactions", label:"Payments",    icon:"💳" },
    { id:"carbon",   label:"Carbon",    icon:"🌍" },
    { id:"rewards",  label:"Rewards",   icon:"⭐" },
  ];

  return (
    <div style={{
      background: COLORS.bg,
      minHeight:"100vh",
      fontFamily:"'DM Sans', system-ui, sans-serif",
      color:"#E5F5EC",
      maxWidth:420,
      margin:"0 auto",
      position:"relative",
      boxShadow:"0 0 60px #00000066",
    }}>
      {/* Header */}
      <div style={{ padding:"24px 20px 12px", background:`linear-gradient(180deg, ${COLORS.forest} 0%, ${COLORS.bg} 100%)` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:22 }}>🌿</span>
            <span style={{ fontSize:20, fontWeight:700, fontFamily:"Georgia,serif", color:"#86EFAC" }}>GreenSpend</span>
          </div>
          <div style={{ background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:20, padding:"4px 12px", fontSize:11, color:COLORS.sage }}>
            May 2026
          </div>
        </div>
        <p style={{ fontSize:12, color:"#6B9E80", margin:0 }}>Your green financial score platform</p>
      </div>

      {/* Main content */}
      <div style={{ padding:"0 16px 80px" }}>

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <div>
            {/* Greenwashing alert */}
            {!alertDismissed && (
              <div style={{ background:"#451A03", border:"1px solid #F59E0B44", borderRadius:14, padding:"12px 14px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:COLORS.gold, marginBottom:3 }}>⚠️ Greenwashing Alert</div>
                  <div style={{ fontSize:11, color:"#FCD34D", lineHeight:1.5 }}>British Gas "Green Tariff" contributes 4.2kg CO₂ — consider switching to Octopus Energy (100% renewable).</div>
                </div>
                <button onClick={() => setAlertDismissed(true)} style={{ background:"none", border:"none", color:COLORS.gold, fontSize:16, cursor:"pointer", padding:"0 0 0 8px" }}>×</button>
              </div>
            )}

            {/* Score card */}
            <div style={{ background:`linear-gradient(135deg, ${COLORS.forest}, ${COLORS.moss})`, borderRadius:20, padding:"20px 20px", marginBottom:14, border:`1px solid ${COLORS.sage}33`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:11, color:COLORS.sage, letterSpacing:"0.08em", fontWeight:600, marginBottom:6 }}>GREEN FINANCIAL SCORE</div>
                <div style={{ fontSize:11, color:"#B7E4C7", marginBottom:14, maxWidth:160, lineHeight:1.5 }}>You're doing better than 58% of users this month</div>
                <div style={{ display:"flex", gap:8 }}>
                  <div style={{ background:"#14532D", borderRadius:10, padding:"6px 12px", textAlign:"center" }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#86EFAC" }}>£{greenSpend.toFixed(0)}</div>
                    <div style={{ fontSize:9, color:"#52B788" }}>Green spend</div>
                  </div>
                  <div style={{ background:"#450A0A", borderRadius:10, padding:"6px 12px", textAlign:"center" }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#FCA5A5" }}>£{harmfulSpend.toFixed(0)}</div>
                    <div style={{ fontSize:9, color:"#F87171" }}>Harmful spend</div>
                  </div>
                </div>
              </div>
              <ScoreRing score={score} />
            </div>

            {/* CO2 summary */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
              {[
                { label:"Net CO₂", value:`+${totalCO2.toFixed(1)}kg`, color:"#FCA5A5", sub:"this month" },
                { label:"Green %", value:`${Math.round(greenSpend/totalSpend*100)}%`, color:COLORS.sage, sub:"of spending" },
                { label:"Saved", value:"14.5kg", color:COLORS.gold, sub:"vs last month" },
              ].map((s, i) => (
                <div key={i} style={{ background:COLORS.card, borderRadius:14, padding:"12px 10px", border:`1px solid ${COLORS.border}`, textAlign:"center" }}>
                  <div style={{ fontSize:16, fontWeight:700, color:s.color, fontFamily:"Georgia,serif" }}>{s.value}</div>
                  <div style={{ fontSize:9, color:"#6B9E80", marginTop:2 }}>{s.label}</div>
                  <div style={{ fontSize:9, color:"#4B7060" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Recent payments */}
            <div style={{ background:COLORS.card, borderRadius:16, border:`1px solid ${COLORS.border}`, overflow:"hidden", marginBottom:14 }}>
              <div style={{ padding:"14px 16px 10px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, fontWeight:600, color:"#D1FAE5" }}>Recent Payments</span>
                <button onClick={() => setTab("transactions")} style={{ background:"none", border:"none", color:COLORS.sage, fontSize:11, cursor:"pointer" }}>See all →</button>
              </div>
              {transactions.slice(0,5).map((tx, i) => (
                <div key={tx.id} onClick={() => { setSelectedTx(tx); }} style={{
                  display:"flex", alignItems:"center", gap:12, padding:"10px 16px",
                  borderTop:`1px solid ${COLORS.border}`, cursor:"pointer",
                  background: selectedTx?.id === tx.id ? "#1F3A2A" : "transparent",
                  transition:"background 0.15s"
                }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:COLORS.forest, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{tx.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#D1FAE5", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{tx.merchant}</div>
                    <div style={{ fontSize:10, color:"#6B9E80" }}>{tx.date} · {tx.category}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#E5F5EC" }}>£{tx.amount.toFixed(2)}</div>
                    <Tag type={tx.type} />
                  </div>
                </div>
              ))}
            </div>

            {/* Green tips */}
            <div style={{ background:COLORS.card, borderRadius:16, border:`1px solid ${COLORS.border}`, padding:"14px 16px" }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#D1FAE5", marginBottom:10 }}>💡 Green Swaps for You</div>
              {[
                { from:"Shell Petrol", to:"Pod Point EV Charge", save:"18.4kg CO₂", icon:"⚡" },
                { from:"McDonald's", to:"Too Good To Go", save:"3.8kg CO₂", icon:"🥗" },
                { from:"Zara", to:"Vinted / Depop", save:"12.1kg CO₂", icon:"♻️" },
              ].map((tip, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderTop: i>0 ? `1px solid ${COLORS.border}` : "none" }}>
                  <span style={{ fontSize:20 }}>{tip.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:"#9CA3AF" }}>Switch <span style={{ color:"#FCA5A5" }}>{tip.from}</span></div>
                    <div style={{ fontSize:11, color:"#86EFAC" }}>→ {tip.to}</div>
                  </div>
                  <div style={{ fontSize:11, color:COLORS.sage, fontWeight:600 }}>-{tip.save}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {tab === "transactions" && (
          <div>
            <div style={{ paddingTop:16, marginBottom:12 }}>
              <div style={{ fontSize:16, fontWeight:700, fontFamily:"Georgia,serif", color:"#86EFAC", marginBottom:12 }}>Payment History</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {["all","green","neutral","harmful"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding:"5px 12px", borderRadius:20, border:`1px solid ${filter===f ? COLORS.sage : COLORS.border}`,
                    background: filter===f ? COLORS.forest : "transparent",
                    color: filter===f ? "#86EFAC" : "#6B9E80", fontSize:11, cursor:"pointer", fontWeight:600, textTransform:"capitalize"
                  }}>{f === "all" ? "All payments" : f}</button>
                ))}
              </div>
            </div>
            <div style={{ background:COLORS.card, borderRadius:16, border:`1px solid ${COLORS.border}`, overflow:"hidden" }}>
              {filteredTx.map((tx, i) => (
                <div key={tx.id} onClick={() => setSelectedTx(selectedTx?.id === tx.id ? null : tx)} style={{
                  padding:"12px 16px", borderTop: i>0 ? `1px solid ${COLORS.border}` : "none",
                  cursor:"pointer", background: selectedTx?.id === tx.id ? "#1F3A2A" : "transparent", transition:"background 0.15s"
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:COLORS.forest, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{tx.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#D1FAE5" }}>{tx.merchant}</div>
                      <div style={{ fontSize:10, color:"#6B9E80", marginTop:1 }}>{tx.ref}</div>
                      <div style={{ display:"flex", gap:6, marginTop:4, alignItems:"center" }}>
                        <Tag type={tx.type} />
                        <CO2Badge co2={tx.co2} />
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:"#E5F5EC" }}>£{tx.amount.toFixed(2)}</div>
                      <div style={{ fontSize:10, color:"#6B9E80" }}>{tx.date}</div>
                    </div>
                  </div>
                  {selectedTx?.id === tx.id && (
                    <div style={{ marginTop:12, background:COLORS.bg, borderRadius:10, padding:"10px 12px", fontSize:11, color:"#B7E4C7", lineHeight:1.6 }}>
                      <div><b style={{ color:COLORS.sage }}>Category:</b> {tx.category}</div>
                      <div><b style={{ color:COLORS.sage }}>Carbon impact:</b> <CO2Badge co2={tx.co2} /></div>
                      <div><b style={{ color:COLORS.sage }}>Payment ref:</b> {tx.ref}</div>
                      {tx.type === "harmful" && <div style={{ marginTop:6, color:"#FCA5A5" }}>⚠️ This payment adds to your carbon footprint. Consider a greener alternative.</div>}
                      {tx.type === "green" && <div style={{ marginTop:6, color:"#86EFAC" }}>✅ Great choice — this payment reduces your carbon score.</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CARBON TAB */}
        {tab === "carbon" && (
          <div>
            <div style={{ paddingTop:16, marginBottom:14 }}>
              <div style={{ fontSize:16, fontWeight:700, fontFamily:"Georgia,serif", color:"#86EFAC", marginBottom:4 }}>Carbon Footprint</div>
              <div style={{ fontSize:11, color:"#6B9E80" }}>Based on your payment transactions this month</div>
            </div>

            {/* Total CO2 big display */}
            <div style={{ background:`linear-gradient(135deg,${COLORS.forest},${COLORS.moss})`, borderRadius:20, padding:"20px", marginBottom:14, border:`1px solid ${COLORS.sage}33`, textAlign:"center" }}>
              <div style={{ fontSize:11, color:COLORS.sage, letterSpacing:"0.1em", fontWeight:600, marginBottom:6 }}>TOTAL NET CO₂ THIS MONTH</div>
              <div style={{ fontSize:52, fontWeight:700, color:"#FCA5A5", fontFamily:"Georgia,serif", lineHeight:1 }}>+{totalCO2.toFixed(1)}</div>
              <div style={{ fontSize:14, color:"#D1FAE5", marginTop:4 }}>kg CO₂ equivalent</div>
              <div style={{ marginTop:12, fontSize:11, color:"#B7E4C7", lineHeight:1.5 }}>
                That's equivalent to driving <b style={{ color:COLORS.gold }}>864km</b> in a petrol car, or<br/>
                <b style={{ color:COLORS.sage }}>14 flights</b> less than the average UK consumer
              </div>
            </div>

            {/* By category */}
            <div style={{ background:COLORS.card, borderRadius:16, border:`1px solid ${COLORS.border}`, padding:"16px", marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#D1FAE5", marginBottom:12 }}>Net CO₂ by Category</div>
              <BarChart data={categoryNet} />
            </div>

            {/* Breakdown */}
            <div style={{ background:COLORS.card, borderRadius:16, border:`1px solid ${COLORS.border}`, padding:"14px 16px" }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#D1FAE5", marginBottom:10 }}>Biggest Offenders</div>
              {transactions.filter(t => t.co2 > 0).sort((a,b) => b.co2 - a.co2).slice(0,4).map((tx, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderTop: i>0 ? `1px solid ${COLORS.border}` : "none" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <span style={{ fontSize:18 }}>{tx.icon}</span>
                    <div>
                      <div style={{ fontSize:12, color:"#D1FAE5" }}>{tx.merchant}</div>
                      <div style={{ fontSize:10, color:"#6B9E80" }}>{tx.category}</div>
                    </div>
                  </div>
                  <CO2Badge co2={tx.co2} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REWARDS TAB */}
        {tab === "rewards" && (
          <div>
            <div style={{ paddingTop:16, marginBottom:14 }}>
              <div style={{ fontSize:16, fontWeight:700, fontFamily:"Georgia,serif", color:"#86EFAC", marginBottom:4 }}>Rewards & Badges</div>
              <div style={{ fontSize:11, color:"#6B9E80" }}>Earn points for every green payment you make</div>
            </div>

            {/* Points */}
            <div style={{ background:`linear-gradient(135deg, ${COLORS.forest}, ${COLORS.moss})`, borderRadius:20, padding:20, marginBottom:14, border:`1px solid ${COLORS.sage}33`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:11, color:COLORS.sage, letterSpacing:"0.08em", fontWeight:600, marginBottom:4 }}>GREEN POINTS</div>
                <div style={{ fontSize:48, fontWeight:700, color:COLORS.gold, fontFamily:"Georgia,serif", lineHeight:1 }}>1,240</div>
                <div style={{ fontSize:11, color:"#B7E4C7", marginTop:4 }}>260 pts until next reward</div>
                <div style={{ marginTop:8, background:"#1B4332", borderRadius:8, height:6, width:180, overflow:"hidden" }}>
                  <div style={{ width:"82%", height:"100%", background:COLORS.sage, borderRadius:8 }}/>
                </div>
              </div>
              <div style={{ fontSize:56 }}>🏆</div>
            </div>

            {/* Badges */}
            <div style={{ background:COLORS.card, borderRadius:16, border:`1px solid ${COLORS.border}`, padding:"14px 16px", marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#D1FAE5", marginBottom:12 }}>Your Badges</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  { icon:"⚡", label:"EV Champion",     desc:"3 EV charges this month",  earned:true  },
                  { icon:"🌿", label:"Plant-Based",      desc:"5 organic purchases",       earned:true  },
                  { icon:"♻️", label:"Circular Shopper", desc:"Buy second-hand 3× ",       earned:true  },
                  { icon:"✈️", label:"Flight-Free",      desc:"No flights for 30 days",    earned:false },
                  { icon:"🔋", label:"Energy Saver",     desc:"Switch to 100% renewable",  earned:true  },
                  { icon:"🍔", label:"Meat Reducer",     desc:"5 plant-based meals",       earned:false },
                ].map((b, i) => (
                  <div key={i} style={{
                    background: b.earned ? COLORS.forest : "#111A14",
                    border:`1px solid ${b.earned ? COLORS.sage+"55" : COLORS.border}`,
                    borderRadius:14, padding:"12px", textAlign:"center",
                    opacity: b.earned ? 1 : 0.5
                  }}>
                    <div style={{ fontSize:28, marginBottom:4 }}>{b.icon}</div>
                    <div style={{ fontSize:11, fontWeight:700, color: b.earned ? "#86EFAC" : "#6B9E80" }}>{b.label}</div>
                    <div style={{ fontSize:9, color:"#4B7060", marginTop:2, lineHeight:1.3 }}>{b.desc}</div>
                    {b.earned && <div style={{ marginTop:6, fontSize:9, color:COLORS.sage, fontWeight:600 }}>✓ EARNED</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards to redeem */}
            <div style={{ background:COLORS.card, borderRadius:16, border:`1px solid ${COLORS.border}`, padding:"14px 16px" }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#D1FAE5", marginBottom:10 }}>Redeem Rewards</div>
              {[
                { icon:"🌳", label:"Plant a tree",              pts:500,  available:true  },
                { icon:"💚", label:"£5 Patagonia discount",     pts:800,  available:true  },
                { icon:"🚲", label:"Free Lime e-bike ride",     pts:600,  available:true  },
                { icon:"☀️", label:"Solar panel consultation",  pts:1500, available:false },
              ].map((r, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderTop: i>0 ? `1px solid ${COLORS.border}` : "none" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <span style={{ fontSize:22 }}>{r.icon}</span>
                    <div>
                      <div style={{ fontSize:12, color:"#D1FAE5" }}>{r.label}</div>
                      <div style={{ fontSize:10, color:"#6B9E80" }}>{r.pts} pts</div>
                    </div>
                  </div>
                  <button style={{
                    background: r.available ? COLORS.forest : "transparent",
                    border:`1px solid ${r.available ? COLORS.sage : COLORS.border}`,
                    color: r.available ? "#86EFAC" : "#4B7060",
                    fontSize:11, padding:"5px 12px", borderRadius:20, cursor: r.available ? "pointer" : "default", fontWeight:600
                  }}>
                    {r.available ? "Redeem" : "Locked"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:420,
        background:COLORS.card, borderTop:`1px solid ${COLORS.border}`,
        display:"grid", gridTemplateColumns:"repeat(4,1fr)", padding:"8px 0 12px",
        zIndex:100
      }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{
            background:"none", border:"none", display:"flex", flexDirection:"column",
            alignItems:"center", gap:3, cursor:"pointer", padding:"4px 0"
          }}>
            <span style={{ fontSize:20 }}>{n.icon}</span>
            <span style={{ fontSize:10, color: tab===n.id ? COLORS.sage : "#4B7060", fontWeight: tab===n.id ? 700 : 400 }}>
              {n.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
