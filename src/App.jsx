import { useState, useEffect } from "react";
import {
  Zap, Leaf, Fuel, Shirt, Coffee, Flame, Heart, Recycle,
  Plane, Landmark, Wind, UtensilsCrossed, PiggyBank, Apple,
  Ribbon, LayoutDashboard, CreditCard, Calculator, Globe,
  Sprout, TrendingUp, TrendingDown, Gift, Trophy, Circle,
  ShieldCheck, AlertTriangle, BadgeDollarSign, CircleDot,
  Wallet, ArrowDownToLine, ChevronDown, Activity
} from "lucide-react";

// ── Icon map per category ─────────────────────────────────────────────────────
const CAT_ICON = {
  ev_charging:         { Icon: Zap,               bg:"#1A2E1A", col:"#86EFAC" },
  organic_grocery:     { Icon: Leaf,               bg:"#1A2E1A", col:"#52B788" },
  petrol:              { Icon: Fuel,               bg:"#2E1A1A", col:"#FCA5A5" },
  fast_fashion:        { Icon: Shirt,              bg:"#2E1A1A", col:"#F87171" },
  oat_coffee:          { Icon: Coffee,             bg:"#1A2E1A", col:"#86EFAC" },
  gas_energy:          { Icon: Flame,              bg:"#2E1E1A", col:"#FDBA74" },
  charity:             { Icon: Heart,              bg:"#2E1065", col:"#E9D5FF" },
  sustainable_fashion: { Icon: Recycle,            bg:"#1A2E1A", col:"#52B788" },
  flight:              { Icon: Plane,              bg:"#2E1A1A", col:"#FCA5A5" },
  neutral:             { Icon: Landmark,           bg:"#1A1C26", col:"#9CA3AF" },
  renewable_energy:    { Icon: Wind,               bg:"#1A2E1A", col:"#67E8F9" },
  fast_food:           { Icon: UtensilsCrossed,    bg:"#2E1A1A", col:"#FCA5A5" },
  savings:             { Icon: PiggyBank,          bg:"#1A1C26", col:"#9CA3AF" },
  surplus_food:        { Icon: Apple,              bg:"#1A2E1A", col:"#86EFAC" },
};

function TxIcon({ category, type, size = 20 }) {
  const cfg = CAT_ICON[category] || CAT_ICON.neutral;
  const { Icon, bg, col } = cfg;
  const boxBg = type === "donation" ? "#2E1065" : bg;
  const iconCol = type === "donation" ? "#E9D5FF" : col;
  return (
    <div style={{ width:40, height:40, borderRadius:12, background:boxBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Icon size={size} color={iconCol} strokeWidth={1.8}/>
    </div>
  );
}

// ── BEIS 2024 INTENSITY FACTORS ───────────────────────────────────────────────
const INTENSITY = {
  petrol:             0.236,
  flight:             0.990,
  fast_fashion:       0.127,
  fast_food:          0.297,
  gas_energy:         0.038,
  organic_grocery:   -0.020,
  ev_charging:       -0.032,
  renewable_energy:  -0.061,
  surplus_food:      -0.514,
  sustainable_fashion:-0.025,
  charity:           -0.140,
  oat_coffee:        -0.024,
  neutral:            0.000,
};

function calcCO2(amount, category) {
  return parseFloat(((INTENSITY[category] ?? 0) * amount).toFixed(2));
}

const RAW_TX = [
  { id:1,  merchant:"Bolt Electric",       category:"ev_charging",         amount:24.50,  ref:"EV charge Whitechapel"       },
  { id:2,  merchant:"Tesco Organic",        category:"organic_grocery",     amount:61.20,  ref:"Weekly shop"                 },
  { id:3,  merchant:"Shell Petrol",         category:"petrol",              amount:78.00,  ref:"Fuel — M25"                  },
  { id:4,  merchant:"Zara",                category:"fast_fashion",        amount:95.00,  ref:"Fast fashion purchase"        },
  { id:5,  merchant:"Oatly Café",           category:"oat_coffee",          amount:8.40,   ref:"Coffee oat milk"             },
  { id:6,  merchant:"British Gas",          category:"gas_energy",          amount:112.00, ref:"Monthly energy direct debit" },
  { id:7,  merchant:"WWF Donation",         category:"charity",             amount:25.00,  ref:"Monthly charity donation"    },
  { id:8,  merchant:"Patagonia",            category:"sustainable_fashion", amount:85.00,  ref:"Recycled jacket"             },
  { id:9,  merchant:"Ryanair",              category:"flight",              amount:143.00, ref:"Flight LHR-BCN"              },
  { id:10, merchant:"ATM Withdrawal",       category:"neutral",             amount:50.00,  ref:"Cash withdrawal — Barclays"  },
  { id:11, merchant:"Octopus Energy",       category:"renewable_energy",    amount:89.00,  ref:"100% renewable tariff"       },
  { id:12, merchant:"Oxfam Donation",       category:"charity",             amount:10.00,  ref:"One-off charity donation"    },
  { id:13, merchant:"McDonald's",           category:"fast_food",           amount:12.80,  ref:"Lunch"                       },
  { id:14, merchant:"ATM Withdrawal",       category:"neutral",             amount:100.00, ref:"Cash withdrawal — HSBC"      },
  { id:15, merchant:"Monzo Savings Pot",    category:"neutral",             amount:200.00, ref:"Monthly savings transfer"    },
  { id:16, merchant:"Too Good To Go",       category:"surplus_food",        amount:3.50,   ref:"Surplus food bag"            },
  { id:17, merchant:"Cancer Research UK",   category:"charity",             amount:15.00,  ref:"Standing order — charity"    },
  { id:18, merchant:"ATM Withdrawal",       category:"neutral",             amount:20.00,  ref:"Cash withdrawal — Santander" },
];

const transactions = RAW_TX.map(tx => ({
  ...tx,
  co2: calcCO2(tx.amount, tx.category),
  type: INTENSITY[tx.category] === 0 || INTENSITY[tx.category] === undefined
    ? "neutral"
    : tx.category === "charity"
    ? "donation"
    : INTENSITY[tx.category] < 0 ? "green" : "harmful",
}));

const CALC_CATS = [
  { key:"petrol",              label:"Petrol / Fuel",          factor:0.236,   Icon:Fuel             },
  { key:"flight",              label:"Flight",                 factor:0.990,   Icon:Plane            },
  { key:"fast_fashion",        label:"Fast Fashion",           factor:0.127,   Icon:Shirt            },
  { key:"fast_food",           label:"Fast Food",              factor:0.297,   Icon:UtensilsCrossed  },
  { key:"gas_energy",          label:"Gas Energy",             factor:0.038,   Icon:Flame            },
  { key:"organic_grocery",     label:"Organic Grocery",        factor:-0.020,  Icon:Leaf             },
  { key:"ev_charging",         label:"EV Charging",            factor:-0.032,  Icon:Zap              },
  { key:"renewable_energy",    label:"Renewable Energy",       factor:-0.061,  Icon:Wind             },
  { key:"surplus_food",        label:"Surplus Food",           factor:-0.514,  Icon:Apple            },
  { key:"sustainable_fashion", label:"Sustainable Fashion",    factor:-0.025,  Icon:Recycle          },
  { key:"charity",             label:"Charity Donation",       factor:-0.140,  Icon:Heart            },
  { key:"oat_coffee",          label:"Plant-Based Café",       factor:-0.024,  Icon:Coffee           },
  { key:"neutral",             label:"ATM / Cash",             factor:0.000,   Icon:Landmark         },
];

const COLORS = {
  forest:"#1B4332", moss:"#2D6A4F", sage:"#52B788",
  gold:"#F59E0B",   red:"#DC2626",  bg:"#0D1F16",
  card:"#162B1E",   border:"#2D6A4F44",
};

function ScoreRing({ score }) {
  const r=54, cx=64, cy=64, circ=2*Math.PI*r;
  const [anim, setAnim] = useState(0);
  useEffect(()=>{
    let start=null;
    const step=ts=>{ if(!start)start=ts; const p=Math.min((ts-start)/1200,1); setAnim(Math.round(p*score)); if(p<1)requestAnimationFrame(step); };
    requestAnimationFrame(step);
  },[score]);
  const col=anim>=70?COLORS.sage:anim>=45?COLORS.gold:COLORS.red;
  return (
    <div style={{position:"relative",width:128,height:128}}>
      <svg width={128} height={128} style={{transform:"rotate(-90deg)"}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1B4332" strokeWidth={10}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={circ*(1-anim/100)}
          strokeLinecap="round" style={{transition:"stroke-dashoffset 0.05s linear"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:32,fontWeight:700,color:col,fontFamily:"Georgia,serif",lineHeight:1}}>{anim}</span>
        <span style={{fontSize:10,color:COLORS.sage,letterSpacing:"0.1em",marginTop:2}}>SCORE</span>
      </div>
    </div>
  );
}

function Tag({ type }) {
  const cfg={
    green:    {bg:"#14532D",color:"#86EFAC", Icon:Leaf,          label:"Green"   },
    harmful:  {bg:"#450A0A",color:"#FCA5A5", Icon:AlertTriangle, label:"Harmful" },
    neutral:  {bg:"#1C1F26",color:"#9CA3AF", Icon:CircleDot,     label:"Neutral" },
    donation: {bg:"#3B0764",color:"#E9D5FF", Icon:Heart,         label:"Donation"},
  }[type]||{bg:"#1C1F26",color:"#9CA3AF",Icon:CircleDot,label:"Neutral"};
  return (
    <span style={{background:cfg.bg,color:cfg.color,fontSize:10,padding:"2px 8px",borderRadius:20,fontWeight:600,whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:4}}>
      <cfg.Icon size={9} strokeWidth={2.5}/>{cfg.label}
    </span>
  );
}

function CO2Badge({ co2 }) {
  const col=co2>0?"#FCA5A5":co2===0?"#9CA3AF":"#86EFAC";
  return <span style={{fontSize:11,color:col,fontWeight:600,whiteSpace:"nowrap"}}>{co2>0?"+":""}{co2===0?"0":co2.toFixed(2)} kg CO₂</span>;
}

export default function GreenSpend() {
  const [tab,setTab]               = useState("dashboard");
  const [selectedTx,setSelectedTx] = useState(null);
  const [filter,setFilter]         = useState("all");
  const [dismissed,setDismissed]   = useState(false);
  const [scoreOpen,setScoreOpen]   = useState(false);
  const [calcAmount,setCalcAmount] = useState("");
  const [calcCat,setCalcCat]       = useState("petrol");
  const [calcResult,setCalcResult] = useState(null);
  const [liveIdx,setLiveIdx]       = useState(0);

  useEffect(()=>{
    const t=setInterval(()=>setLiveIdx(i=>(i+1)%CALC_CATS.length),1800);
    return ()=>clearInterval(t);
  },[]);

  const totalCO2      = transactions.reduce((a,t)=>a+t.co2,0);
  const greenSpend    = transactions.filter(t=>t.type==="green").reduce((a,t)=>a+t.amount,0);
  const harmfulSpend  = transactions.filter(t=>t.type==="harmful").reduce((a,t)=>a+t.amount,0);
  const donationSpend = transactions.filter(t=>t.type==="donation").reduce((a,t)=>a+t.amount,0);
  const atmSpend      = transactions.filter(t=>t.category==="neutral").reduce((a,t)=>a+t.amount,0);
  const totalSpend    = transactions.reduce((a,t)=>a+t.amount,0);
  const greenPct      = (greenSpend/totalSpend)*100;
  const co2Penalty    = Math.min(totalCO2*0.1,50);
  const donationBonus = Math.min(donationSpend/10,15);
  const score         = Math.max(0,Math.min(100,Math.round(50+greenPct*0.4-co2Penalty+donationBonus)));
  const filteredTx    = filter==="all"?transactions:transactions.filter(t=>t.type===filter);

  function runCalc(){
    const amt=parseFloat(calcAmount);
    if(!amt||amt<=0)return;
    const co2=calcCO2(amt,calcCat);
    setCalcResult({amt,co2,factor:INTENSITY[calcCat],cat:CALC_CATS.find(c=>c.key===calcCat)});
  }

  const navItems=[
    {id:"dashboard",    label:"Dashboard",  Icon:LayoutDashboard},
    {id:"transactions", label:"Payments",   Icon:CreditCard},
    {id:"calculator",   label:"Calculator", Icon:Calculator},
    {id:"carbon",       label:"Carbon",     Icon:Globe},
  ];

  return (
    <div style={{background:COLORS.bg,minHeight:"100vh",fontFamily:"'DM Sans',system-ui,sans-serif",color:"#E5F5EC",maxWidth:420,margin:"0 auto",boxShadow:"0 0 60px #00000066"}}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.4)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes glow{0%,100%{box-shadow:none}50%{box-shadow:0 0 12px #52B78844}}
      `}</style>

      {/* Header */}
      <div style={{padding:"24px 20px 12px",background:`linear-gradient(180deg,${COLORS.forest} 0%,${COLORS.bg} 100%)`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:30,height:30,background:"#14532D",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Sprout size={18} color="#86EFAC" strokeWidth={2}/>
            </div>
            <span style={{fontSize:20,fontWeight:700,fontFamily:"Georgia,serif",color:"#86EFAC"}}>GreenSpend</span>
          </div>
          <div style={{background:COLORS.card,border:`1px solid ${COLORS.border}`,borderRadius:20,padding:"4px 10px",fontSize:10,color:COLORS.sage,display:"flex",alignItems:"center",gap:5}}>
            <Activity size={11} color={COLORS.sage}/>BEIS 2024 Live
          </div>
        </div>
        <p style={{fontSize:12,color:"#6B9E80",margin:0}}>Carbon scored live using BEIS 2024 formula</p>
      </div>

      <div style={{padding:"0 16px 80px"}}>

        {/* ── DASHBOARD ─────────────────────────────────────────────────── */}
        {tab==="dashboard" && (
          <div>
            {!dismissed && (
              <div style={{background:"#451A03",border:"1px solid #F59E0B44",borderRadius:14,padding:"12px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <AlertTriangle size={14} color={COLORS.gold} style={{marginTop:2,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:COLORS.gold,marginBottom:3}}>Greenwashing Alert</div>
                    <div style={{fontSize:11,color:"#FCD34D",lineHeight:1.5}}>British Gas "Green Tariff" scores +{calcCO2(112,"gas_energy").toFixed(2)} kg CO₂. Switch to Octopus renewable: {calcCO2(112,"renewable_energy").toFixed(2)} kg instead.</div>
                  </div>
                </div>
                <button onClick={()=>setDismissed(true)} style={{background:"none",border:"none",color:COLORS.gold,fontSize:18,cursor:"pointer",padding:"0 0 0 8px",lineHeight:1}}>×</button>
              </div>
            )}

            {/* Score card */}
            <div style={{background:`linear-gradient(135deg,${COLORS.forest},${COLORS.moss})`,borderRadius:20,padding:"20px",marginBottom:14,border:`1px solid ${COLORS.sage}33`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:11,color:COLORS.sage,letterSpacing:"0.08em",fontWeight:600,marginBottom:4}}>GREEN FINANCIAL SCORE</div>
                <div style={{fontSize:10,color:"#B7E4C7",marginBottom:6}}>Formula: 50 + (green% × 0.4) − CO₂ + donations</div>
                <div style={{fontSize:11,color:"#B7E4C7",marginBottom:12}}>Better than 63% of users this month</div>
                <div style={{display:"flex",gap:8}}>
                  <div style={{background:"#14532D",borderRadius:10,padding:"6px 12px",textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#86EFAC"}}>£{greenSpend.toFixed(0)}</div>
                    <div style={{fontSize:9,color:"#52B788"}}>Green spend</div>
                  </div>
                  <div style={{background:"#450A0A",borderRadius:10,padding:"6px 12px",textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#FCA5A5"}}>£{harmfulSpend.toFixed(0)}</div>
                    <div style={{fontSize:9,color:"#F87171"}}>Harmful spend</div>
                  </div>
                </div>
              </div>
              <ScoreRing score={score}/>
            </div>

            {/* Collapsible score formula */}
            <div style={{background:COLORS.card,borderRadius:16,border:`1px solid ${scoreOpen?COLORS.sage+"66":COLORS.border}`,marginBottom:14,overflow:"hidden",transition:"all 0.3s ease"}}>
              <div onClick={()=>setScoreOpen(o=>!o)} style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <ShieldCheck size={15} color={COLORS.sage}/>
                  <span style={{fontSize:11,color:COLORS.sage,fontWeight:600}}>HOW YOUR SCORE IS CALCULATED</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12,color:COLORS.gold,fontWeight:700,fontFamily:"monospace"}}>{score}/100</span>
                  <ChevronDown size={16} color={COLORS.sage} style={{transition:"transform 0.3s",transform:scoreOpen?"rotate(180deg)":"rotate(0deg)"}}/>
                </div>
              </div>
              <div style={{maxHeight:scoreOpen?"300px":"0px",overflow:"hidden",transition:"max-height 0.35s ease"}}>
                <div style={{padding:"0 16px 14px",borderTop:`1px solid ${COLORS.border}`}}>
                  {[
                    {label:"Base score",       val:"50",                              col:"#D1FAE5", Icon:Circle},
                    {label:"Green spend bonus", val:`+${(greenPct*0.4).toFixed(1)} pts`,col:"#86EFAC", Icon:TrendingUp},
                    {label:"CO₂ penalty",       val:`−${co2Penalty.toFixed(1)} pts`,   col:"#FCA5A5", Icon:TrendingDown},
                    {label:"Donation bonus",    val:`+${donationBonus.toFixed(1)} pts`, col:"#E9D5FF", Icon:Gift},
                    {label:"Final score",       val:`= ${score}/100`,                  col:COLORS.gold,Icon:Trophy},
                  ].map((r,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderTop:i>0?`1px solid ${COLORS.border}`:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <r.Icon size={13} color={r.col} strokeWidth={2}/>
                        <span style={{fontSize:11,color:"#9CA3AF"}}>{r.label}</span>
                      </div>
                      <span style={{fontSize:12,fontWeight:700,color:r.col,fontFamily:"monospace"}}>{r.val}</span>
                    </div>
                  ))}
                  <div style={{marginTop:8,background:COLORS.bg,borderRadius:10,padding:"8px 12px",fontSize:10,color:"#4B7060",lineHeight:1.6}}>
                    Formula: 50 + (green% × 0.4) − (CO₂ × 0.1) + donations ÷ 10
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
              {[
                {label:"Net CO₂",  value:`${totalCO2>0?"+":""}${totalCO2.toFixed(1)}kg`,color:"#FCA5A5",sub:"auto-calculated",Icon:Globe},
                {label:"Green %",  value:`${Math.round(greenSpend/totalSpend*100)}%`,    color:COLORS.sage, sub:"of spending",  Icon:Leaf},
                {label:"Donated",  value:`£${donationSpend.toFixed(0)}`,                 color:"#E9D5FF",   sub:"to charity",   Icon:Heart},
              ].map((s,i)=>(
                <div key={i} style={{background:COLORS.card,borderRadius:14,padding:"12px 10px",border:`1px solid ${COLORS.border}`,textAlign:"center"}}>
                  <s.Icon size={14} color={s.color} style={{marginBottom:4}}/>
                  <div style={{fontSize:15,fontWeight:700,color:s.color,fontFamily:"Georgia,serif"}}>{s.value}</div>
                  <div style={{fontSize:9,color:"#6B9E80",marginTop:2}}>{s.label}</div>
                  <div style={{fontSize:9,color:"#4B7060"}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Charity & ATM */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              <div style={{background:"#1E0A3C",border:"1px solid #7C3AED44",borderRadius:14,padding:"12px 14px"}}>
                <Heart size={20} color="#E9D5FF" style={{marginBottom:6}}/>
                <div style={{fontSize:15,fontWeight:700,color:"#E9D5FF",fontFamily:"Georgia,serif"}}>£{donationSpend.toFixed(0)}</div>
                <div style={{fontSize:10,color:"#A78BFA",marginTop:2}}>Charity donations</div>
                <div style={{fontSize:9,color:"#7C3AED"}}>Offsets {Math.abs(transactions.filter(t=>t.type==="donation").reduce((a,t)=>a+t.co2,0)).toFixed(1)} kg CO₂</div>
              </div>
              <div style={{background:"#162030",border:"1px solid #6B728044",borderRadius:14,padding:"12px 14px"}}>
                <ArrowDownToLine size={20} color="#9CA3AF" style={{marginBottom:6}}/>
                <div style={{fontSize:15,fontWeight:700,color:"#D1FAE5",fontFamily:"Georgia,serif"}}>£{atmSpend.toFixed(0)}</div>
                <div style={{fontSize:10,color:"#9CA3AF",marginTop:2}}>ATM withdrawals</div>
                <div style={{fontSize:9,color:"#6B7280"}}>0 kg CO₂ (untracked)</div>
              </div>
            </div>

            {/* Recent payments */}
            <div style={{background:COLORS.card,borderRadius:16,border:`1px solid ${COLORS.border}`,overflow:"hidden",marginBottom:14}}>
              <div style={{padding:"14px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><CreditCard size={14} color={COLORS.sage}/><span style={{fontSize:13,fontWeight:600,color:"#D1FAE5"}}>Recent Payments</span></div>
                <button onClick={()=>setTab("transactions")} style={{background:"none",border:"none",color:COLORS.sage,fontSize:11,cursor:"pointer"}}>See all →</button>
              </div>
              {transactions.slice(0,5).map((tx,i)=>(
                <div key={tx.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderTop:`1px solid ${COLORS.border}`}}>
                  <TxIcon category={tx.category} type={tx.type} size={18}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#D1FAE5",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.merchant}</div>
                    <div style={{fontSize:10,color:"#6B9E80"}}>{tx.ref}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:12,fontWeight:600}}>£{tx.amount.toFixed(2)}</div>
                    <CO2Badge co2={tx.co2}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Green swaps */}
            <div style={{background:COLORS.card,borderRadius:16,border:`1px solid ${COLORS.border}`,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><Zap size={14} color={COLORS.sage}/><span style={{fontSize:13,fontWeight:600,color:"#D1FAE5"}}>Green Swaps for You</span></div>
              {[
                {FromIcon:Fuel,      ToIcon:Zap,    from:"Shell Petrol", to:"Pod Point EV",    save:"18.4kg CO₂"},
                {FromIcon:UtensilsCrossed,ToIcon:Apple,from:"McDonald's",to:"Too Good To Go",  save:"3.8kg CO₂" },
                {FromIcon:Landmark,  ToIcon:CreditCard,from:"ATM Cash",to:"Contactless card",  save:"Full tracking"},
              ].map((tip,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:i>0?`1px solid ${COLORS.border}`:"none"}}>
                  <div style={{width:28,height:28,borderRadius:8,background:"#2E1A1A",display:"flex",alignItems:"center",justifyContent:"center"}}><tip.FromIcon size={14} color="#FCA5A5"/></div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:"#9CA3AF"}}>Switch <span style={{color:"#FCA5A5"}}>{tip.from}</span></div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}><tip.ToIcon size={10} color="#86EFAC"/><span style={{fontSize:11,color:"#86EFAC"}}>{tip.to}</span></div>
                  </div>
                  <div style={{fontSize:11,color:COLORS.sage,fontWeight:600}}>{tip.save}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PAYMENTS ──────────────────────────────────────────────────── */}
        {tab==="transactions" && (
          <div>
            <div style={{paddingTop:16,marginBottom:12}}>
              <div style={{fontSize:16,fontWeight:700,fontFamily:"Georgia,serif",color:"#86EFAC",marginBottom:12}}>Payment History</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["all","green","donation","neutral","harmful"].map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${filter===f?(f==="donation"?"#7C3AED":COLORS.sage):COLORS.border}`,background:filter===f?(f==="donation"?"#3B0764":COLORS.forest):"transparent",color:filter===f?(f==="donation"?"#E9D5FF":"#86EFAC"):"#6B9E80",fontSize:11,cursor:"pointer",fontWeight:600}}>
                    {f==="all"?"All":f==="donation"?"Donations":f==="neutral"?"ATM & Other":f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{background:COLORS.card,borderRadius:16,border:`1px solid ${COLORS.border}`,overflow:"hidden"}}>
              {filteredTx.map((tx,i)=>(
                <div key={tx.id} onClick={()=>setSelectedTx(selectedTx?.id===tx.id?null:tx)} style={{padding:"12px 16px",borderTop:i>0?`1px solid ${COLORS.border}`:"none",cursor:"pointer",background:selectedTx?.id===tx.id?"#1F3A2A":"transparent"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <TxIcon category={tx.category} type={tx.type} size={20}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:"#D1FAE5"}}>{tx.merchant}</div>
                      <div style={{fontSize:10,color:"#6B9E80",marginTop:1}}>{tx.ref}</div>
                      <div style={{display:"flex",gap:6,marginTop:4,alignItems:"center"}}>
                        <Tag type={tx.type}/><CO2Badge co2={tx.co2}/>
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:14,fontWeight:700}}>£{tx.amount.toFixed(2)}</div>
                    </div>
                  </div>
                  {selectedTx?.id===tx.id && (
                    <div style={{marginTop:12,background:COLORS.bg,borderRadius:10,padding:"10px 12px",fontSize:11,lineHeight:1.7}}>
                      <div style={{color:COLORS.sage,fontWeight:600,marginBottom:4,display:"flex",alignItems:"center",gap:5}}><ShieldCheck size={12} color={COLORS.sage}/>Live formula</div>
                      <div style={{fontFamily:"monospace",color:"#86EFAC"}}>£{tx.amount.toFixed(2)} × {INTENSITY[tx.category]??0} = {tx.co2>0?"+":""}{tx.co2.toFixed(2)} kg CO₂</div>
                      <div style={{color:"#9CA3AF",marginTop:4}}>Source: BEIS 2024 / Exiobase</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CALCULATOR ────────────────────────────────────────────────── */}
        {tab==="calculator" && (
          <div>
            <div style={{paddingTop:16,marginBottom:14}}>
              <div style={{fontSize:16,fontWeight:700,fontFamily:"Georgia,serif",color:"#86EFAC",marginBottom:4,display:"flex",alignItems:"center",gap:8}}><Calculator size={18} color="#86EFAC"/>Carbon Impact Calculator</div>
              <div style={{fontSize:11,color:"#6B9E80"}}>Type any amount — CO₂ calculated live using BEIS 2024</div>
            </div>

            <div style={{background:COLORS.card,borderRadius:16,border:`1px solid ${COLORS.border}`,padding:"16px",marginBottom:14}}>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,color:"#9CA3AF",display:"block",marginBottom:4}}>Amount (£)</label>
                <input type="number" placeholder="e.g. 50" value={calcAmount}
                  onChange={e=>{setCalcAmount(e.target.value);setCalcResult(null);}}
                  style={{width:"100%",background:COLORS.bg,border:`1px solid ${COLORS.border}`,borderRadius:10,padding:"10px 14px",fontSize:16,color:"#D1FAE5",outline:"none"}}/>
              </div>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:11,color:"#9CA3AF",display:"block",marginBottom:4}}>Category</label>
                <select value={calcCat} onChange={e=>{setCalcCat(e.target.value);setCalcResult(null);}}
                  style={{width:"100%",background:COLORS.bg,border:`1px solid ${COLORS.border}`,borderRadius:10,padding:"10px 14px",fontSize:13,color:"#D1FAE5",outline:"none"}}>
                  {CALC_CATS.map(c=><option key={c.key} value={c.key}>{c.label} (×{c.factor} kg CO₂/£)</option>)}
                </select>
              </div>
              <button onClick={runCalc} style={{width:"100%",background:COLORS.forest,border:`1px solid ${COLORS.sage}`,borderRadius:12,padding:"12px",fontSize:14,fontWeight:700,color:"#86EFAC",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <Zap size={16} color="#86EFAC"/>Calculate CO₂
              </button>
            </div>

            {calcResult && (
              <div style={{background:calcResult.co2>0?"#450A0A":calcResult.co2===0?COLORS.card:"#14532D",border:`1px solid ${calcResult.co2>0?"#F09595":calcResult.co2===0?COLORS.border:"#52B788"}`,borderRadius:16,padding:"16px",marginBottom:14}}>
                <div style={{fontSize:11,color:calcResult.co2>0?"#FCA5A5":calcResult.co2===0?"#9CA3AF":"#86EFAC",fontWeight:600,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                  {calcResult.co2>0?<AlertTriangle size={13}/>:calcResult.co2===0?<Landmark size={13}/>:<Leaf size={13}/>}
                  {calcResult.co2>0?"CARBON FOOTPRINT":calcResult.co2===0?"UNTRACKED":"CARBON OFFSET"}
                </div>
                <div style={{fontSize:48,fontWeight:700,color:calcResult.co2>0?"#FCA5A5":calcResult.co2===0?"#9CA3AF":"#86EFAC",fontFamily:"Georgia,serif",lineHeight:1,marginBottom:8}}>
                  {calcResult.co2>0?"+":""}{calcResult.co2.toFixed(2)} kg
                </div>
                <div style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
                  <div style={{fontSize:10,color:"#9CA3AF",marginBottom:4,display:"flex",alignItems:"center",gap:4}}><ShieldCheck size={10} color="#9CA3AF"/>BEIS 2024 Formula</div>
                  <div style={{fontFamily:"monospace",fontSize:13,color:"#D1FAE5"}}>£{calcResult.amt.toFixed(2)} × {calcResult.factor} = {calcResult.co2>0?"+":""}{calcResult.co2.toFixed(2)} kg CO₂</div>
                </div>
              </div>
            )}

            {/* Live intensity table */}
            <div style={{background:COLORS.card,borderRadius:16,border:`1px solid ${COLORS.border}`,padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><ShieldCheck size={14} color="#D1FAE5"/><span style={{fontSize:12,fontWeight:600,color:"#D1FAE5"}}>BEIS 2024 Intensity Factors</span></div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#86EFAC",animation:"pulse 1.8s infinite"}}/>
                  <span style={{fontSize:10,color:COLORS.sage}}>LIVE</span>
                </div>
              </div>
              {CALC_CATS.map((c,i)=>{
                const isActive=i===liveIdx;
                const isSelected=c.key===calcCat;
                const col=c.factor>0?"#FCA5A5":c.factor===0?"#9CA3AF":"#86EFAC";
                const bg=isActive?(c.factor>0?"#3A0A0A":c.factor===0?"#1C2030":"#0A2A1A"):isSelected?COLORS.forest:"transparent";
                return (
                  <div key={i} onClick={()=>{setCalcCat(c.key);setCalcResult(null);}}
                    style={{padding:"8px 10px",borderRadius:10,cursor:"pointer",marginBottom:3,background:bg,border:isActive?`1px solid ${col}55`:isSelected?`1px solid ${COLORS.sage}44`:"1px solid transparent",transition:"all 0.4s ease",animation:isActive?"glow 1.8s ease":"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:isActive?5:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <c.Icon size={14} color={isActive?col:"#6B9E80"} strokeWidth={1.8}/>
                        <span style={{fontSize:12,color:isActive?"#D1FAE5":"#9CA3AF",fontWeight:isActive?600:400,transition:"color 0.3s"}}>{c.label}</span>
                      </div>
                      <span style={{fontSize:12,fontWeight:700,color:col,fontFamily:"monospace",animation:isActive?"slideIn 0.3s ease":"none"}}>{c.factor>0?"+":""}{c.factor} kg/£</span>
                    </div>
                    {isActive && (
                      <div style={{marginTop:4}}>
                        <div style={{height:4,background:"#1B4332",borderRadius:2,overflow:"hidden"}}>
                          <div style={{height:"100%",borderRadius:2,background:col,width:`${Math.min(Math.abs(c.factor)/1.0*100,100)}%`,transition:"width 0.6s ease"}}/>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                          <span style={{fontSize:9,color:"#6B9E80"}}>Source: BEIS 2024 / Exiobase</span>
                          <span style={{fontSize:9,color:col}}>{c.factor>0?"⚠ Harmful":c.factor===0?"◦ Untracked":"✓ Green"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{marginTop:8,fontSize:10,color:"#4B7060",textAlign:"center"}}>Tap any row to select it as your calculator category</div>
            </div>
          </div>
        )}

        {/* ── CARBON ────────────────────────────────────────────────────── */}
        {tab==="carbon" && (
          <div>
            <div style={{paddingTop:16,marginBottom:14}}>
              <div style={{fontSize:16,fontWeight:700,fontFamily:"Georgia,serif",color:"#86EFAC",marginBottom:4,display:"flex",alignItems:"center",gap:8}}><Globe size={18} color="#86EFAC"/>Carbon Footprint</div>
              <div style={{fontSize:11,color:"#6B9E80"}}>All values calculated live using BEIS 2024 formula</div>
            </div>
            <div style={{background:`linear-gradient(135deg,${COLORS.forest},${COLORS.moss})`,borderRadius:20,padding:"20px",marginBottom:14,border:`1px solid ${COLORS.sage}33`,textAlign:"center"}}>
              <Globe size={22} color={COLORS.sage} style={{margin:"0 auto 8px"}}/>
              <div style={{fontSize:11,color:COLORS.sage,letterSpacing:"0.1em",fontWeight:600,marginBottom:6}}>TOTAL NET CO₂ THIS MONTH</div>
              <div style={{fontSize:52,fontWeight:700,color:"#FCA5A5",fontFamily:"Georgia,serif",lineHeight:1}}>{totalCO2>0?"+":""}{totalCO2.toFixed(1)}</div>
              <div style={{fontSize:14,color:"#D1FAE5",marginTop:4}}>kg CO₂ equivalent</div>
              <div style={{fontSize:11,color:"#B7E4C7",marginTop:8,lineHeight:1.5}}>Auto-calculated: <b style={{color:COLORS.gold}}>Amount × BEIS factor</b> per transaction</div>
            </div>
            <div style={{background:COLORS.card,borderRadius:16,border:`1px solid ${COLORS.border}`,padding:"14px 16px",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><Activity size={14} color="#D1FAE5"/><span style={{fontSize:12,fontWeight:600,color:"#D1FAE5"}}>Every transaction auto-scored</span></div>
              {transactions.sort((a,b)=>b.co2-a.co2).slice(0,8).map((tx,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderTop:i>0?`1px solid ${COLORS.border}`:"none"}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <TxIcon category={tx.category} type={tx.type} size={15}/>
                    <div>
                      <div style={{fontSize:12,color:"#D1FAE5"}}>{tx.merchant}</div>
                      <div style={{fontSize:10,color:"#4B7060",fontFamily:"monospace"}}>£{tx.amount} × {INTENSITY[tx.category]??0}</div>
                    </div>
                  </div>
                  <CO2Badge co2={tx.co2}/>
                </div>
              ))}
            </div>
            <div style={{background:"#162030",border:"1px solid #6B728044",borderRadius:14,padding:"12px 14px",display:"flex",gap:10,alignItems:"flex-start"}}>
              <Landmark size={16} color="#9CA3AF" style={{flexShrink:0,marginTop:1}}/>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:"#9CA3AF",marginBottom:3}}>ATM / Cash = Untracked</div>
                <div style={{fontSize:11,color:"#6B7280",lineHeight:1.5}}>£{atmSpend.toFixed(0)} withdrawn this month scored as 0 kg CO₂. Pay by card so GreenSpend can score every £ you spend.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:420,background:COLORS.card,borderTop:`1px solid ${COLORS.border}`,display:"grid",gridTemplateColumns:"repeat(4,1fr)",padding:"8px 0 12px",zIndex:100}}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"4px 0"}}>
            <n.Icon size={20} color={tab===n.id?COLORS.sage:"#4B7060"} strokeWidth={tab===n.id?2:1.5}/>
            <span style={{fontSize:10,color:tab===n.id?COLORS.sage:"#4B7060",fontWeight:tab===n.id?700:400}}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
