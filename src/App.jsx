import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Zap, Leaf, Fuel, Shirt, Coffee, Flame, Heart, Recycle,
  Plane, Landmark, Wind, UtensilsCrossed, PiggyBank, Apple,
  LayoutDashboard, CreditCard, Calculator, Globe, Sprout,
  TrendingUp, TrendingDown, Gift, Trophy, Circle,
  ShieldCheck, AlertTriangle, ArrowDownToLine, ChevronDown,
  Activity, RefreshCw, ToggleLeft, ToggleRight, ArrowRight,
  Banknote, CheckCircle, Loader
} from "lucide-react";

// ── BEIS 2024 intensity factors ───────────────────────────────────────────────
const INTENSITY = {
  petrol:              0.236,
  flight:              0.990,
  fast_fashion:        0.127,
  fast_food:           0.297,
  gas_energy:          0.038,
  organic_grocery:    -0.020,
  ev_charging:        -0.032,
  renewable_energy:   -0.061,
  surplus_food:       -0.514,
  sustainable_fashion:-0.025,
  charity:            -0.140,
  oat_coffee:         -0.024,
  neutral:             0.000,
};

const CAT_ICON = {
  ev_charging:         { Icon: Zap,            bg:"#1A2E1A", col:"#86EFAC" },
  organic_grocery:     { Icon: Leaf,           bg:"#1A2E1A", col:"#52B788" },
  petrol:              { Icon: Fuel,           bg:"#2E1A1A", col:"#FCA5A5" },
  fast_fashion:        { Icon: Shirt,          bg:"#2E1A1A", col:"#F87171" },
  oat_coffee:          { Icon: Coffee,         bg:"#1A2E1A", col:"#86EFAC" },
  gas_energy:          { Icon: Flame,          bg:"#2E1E1A", col:"#FDBA74" },
  charity:             { Icon: Heart,          bg:"#2E1065", col:"#E9D5FF" },
  sustainable_fashion: { Icon: Recycle,        bg:"#1A2E1A", col:"#52B788" },
  flight:              { Icon: Plane,          bg:"#2E1A1A", col:"#FCA5A5" },
  neutral:             { Icon: Landmark,       bg:"#1A1C26", col:"#9CA3AF" },
  renewable_energy:    { Icon: Wind,           bg:"#1A2E1A", col:"#67E8F9" },
  fast_food:           { Icon: UtensilsCrossed,bg:"#2E1A1A", col:"#FCA5A5" },
  surplus_food:        { Icon: Apple,          bg:"#1A2E1A", col:"#86EFAC" },
};

const CAT_LABEL = {
  petrol:"Petrol", flight:"Flight", fast_fashion:"Fast fashion",
  fast_food:"Fast food", gas_energy:"Gas energy",
  organic_grocery:"Organic grocery", ev_charging:"EV charging",
  renewable_energy:"Renewable", surplus_food:"Surplus food",
  sustainable_fashion:"Eco fashion", charity:"Charity",
  oat_coffee:"Plant café", neutral:"ATM/Cash",
};

function calcCO2(amt, cat) {
  return parseFloat(((INTENSITY[cat] ?? 0) * amt).toFixed(2));
}

function getType(cat) {
  if (cat === "charity") return "donation";
  const f = INTENSITY[cat] ?? 0;
  if (f === 0) return "neutral";
  return f < 0 ? "green" : "harmful";
}

// ── Raw transactions (fallback / demo data) ───────────────────────────────────
const RAW_TX = [
  { id:1,  merchant:"Bolt Electric",        cat:"ev_charging",         amt:24.50,  ref:"EV charge Whitechapel"       },
  { id:2,  merchant:"Tesco Organic",         cat:"organic_grocery",     amt:61.20,  ref:"Weekly shop"                 },
  { id:3,  merchant:"Shell Petrol",          cat:"petrol",              amt:78.00,  ref:"Fuel — M25"                  },
  { id:4,  merchant:"Zara",                 cat:"fast_fashion",        amt:95.00,  ref:"Fast fashion purchase"        },
  { id:5,  merchant:"Oatly Café",            cat:"oat_coffee",          amt:8.40,   ref:"Coffee oat milk"             },
  { id:6,  merchant:"British Gas",           cat:"gas_energy",          amt:112.00, ref:"Monthly energy direct debit" },
  { id:7,  merchant:"WWF Donation",          cat:"charity",             amt:25.00,  ref:"Monthly charity donation"    },
  { id:8,  merchant:"Patagonia",             cat:"sustainable_fashion", amt:85.00,  ref:"Recycled jacket"             },
  { id:9,  merchant:"Ryanair",               cat:"flight",              amt:143.00, ref:"Flight LHR-BCN"              },
  { id:10, merchant:"ATM Withdrawal",        cat:"neutral",             amt:50.00,  ref:"Cash withdrawal — Barclays"  },
  { id:11, merchant:"Octopus Energy",        cat:"renewable_energy",    amt:89.00,  ref:"100% renewable tariff"       },
  { id:12, merchant:"McDonald's",            cat:"fast_food",           amt:12.80,  ref:"Lunch"                       },
  { id:13, merchant:"Cancer Research UK",    cat:"charity",             amt:15.00,  ref:"Standing order — charity"    },
  { id:14, merchant:"Too Good To Go",        cat:"surplus_food",        amt:3.50,   ref:"Surplus food bag"            },
];

// ── Green swap alternatives ───────────────────────────────────────────────────
const SWAP_DEFS = [
  { id:"s1", txId:3,  amt:78.00,  from:"Shell Petrol",  to:"Pod Point EV",       fromCat:"petrol",       toCat:"ev_charging"        },
  { id:"s2", txId:4,  amt:95.00,  from:"Zara",          to:"Vinted second-hand", fromCat:"fast_fashion", toCat:"sustainable_fashion"},
  { id:"s3", txId:9,  amt:143.00, from:"Ryanair",       to:"Eurostar train",     fromCat:"flight",       toCat:"ev_charging"        },
  { id:"s4", txId:12, amt:12.80,  from:"McDonald's",    to:"Too Good To Go",     fromCat:"fast_food",    toCat:"surplus_food"       },
  { id:"s5", txId:6,  amt:112.00, from:"British Gas",   to:"Octopus Energy",     fromCat:"gas_energy",   toCat:"renewable_energy"   },
];

const COLORS = {
  forest:"#1B4332", moss:"#2D6A4F", sage:"#52B788",
  gold:"#F59E0B", red:"#DC2626", bg:"#0D1F16",
  card:"#162B1E", border:"#2D6A4F44",
};

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r=54, cx=64, cy=64, circ=2*Math.PI*r;
  const [anim, setAnim] = useState(score);
  useEffect(()=>{
    let start=null, from=anim;
    const step=ts=>{
      if(!start)start=ts;
      const p=Math.min((ts-start)/600,1);
      setAnim(Math.round(from+(score-from)*p));
      if(p<1)requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },[score]);
  const col=anim>=70?COLORS.sage:anim>=45?COLORS.gold:COLORS.red;
  return (
    <div style={{position:"relative",width:120,height:120}}>
      <svg width={120} height={120} style={{transform:"rotate(-90deg)"}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1B4332" strokeWidth={10}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={circ*(1-anim/100)}
          strokeLinecap="round" style={{transition:"stroke-dashoffset 0.05s"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:30,fontWeight:700,color:col,fontFamily:"Georgia,serif",lineHeight:1}}>{anim}</span>
        <span style={{fontSize:9,color:COLORS.sage,letterSpacing:"0.1em",marginTop:2}}>SCORE</span>
      </div>
    </div>
  );
}

// ── Tag chip ──────────────────────────────────────────────────────────────────
function Tag({ type }) {
  const cfg={
    green:    {bg:"#14532D",color:"#86EFAC",Icon:Leaf,          label:"Green"   },
    harmful:  {bg:"#450A0A",color:"#FCA5A5",Icon:AlertTriangle, label:"Harmful" },
    neutral:  {bg:"#1C1F26",color:"#9CA3AF",Icon:Landmark,      label:"Neutral" },
    donation: {bg:"#3B0764",color:"#E9D5FF",Icon:Heart,         label:"Donation"},
  }[type]||{bg:"#1C1F26",color:"#9CA3AF",Icon:Landmark,label:"Neutral"};
  return (
    <span style={{background:cfg.bg,color:cfg.color,fontSize:10,padding:"2px 7px",borderRadius:20,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4,whiteSpace:"nowrap"}}>
      <cfg.Icon size={9} strokeWidth={2.5}/>{cfg.label}
    </span>
  );
}

function CO2Badge({ co2 }) {
  const col=co2>0?"#FCA5A5":co2===0?"#9CA3AF":"#86EFAC";
  return <span style={{fontSize:11,color:col,fontWeight:600,whiteSpace:"nowrap"}}>{co2>0?"+":""}{co2===0?"0":co2.toFixed(2)} kg CO₂</span>;
}

function TxIcon({ cat, type, size=18 }) {
  const cfg=CAT_ICON[cat]||CAT_ICON.neutral;
  const {Icon,bg,col}=cfg;
  const boxBg=type==="donation"?"#2E1065":bg;
  const iconCol=type==="donation"?"#E9D5FF":col;
  return (
    <div style={{width:38,height:38,borderRadius:11,background:boxBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <Icon size={size} color={iconCol} strokeWidth={1.8}/>
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────
export default function GreenSpend() {
  const [tab, setTab]           = useState("dashboard");
  const [swaps, setSwaps]       = useState(SWAP_DEFS.map(s=>({...s,enabled:false})));
  const [selectedTx, setSelectedTx] = useState(null);
  const [scoreOpen, setScoreOpen]   = useState(false);
  const [dismissed, setDismissed]   = useState(false);
  const [filter, setFilter]         = useState("all");
  const [liveIdx, setLiveIdx]       = useState(0);
  const [calcAmount, setCalcAmount] = useState("");
  const [calcCat, setCalcCat]       = useState("petrol");
  const [calcResult, setCalcResult] = useState(null);
  const [openAlts, setOpenAlts]     = useState({});
  const [scoreCardOpen, setScoreCardOpen] = useState(false);

  // ── TrueLayer state ───────────────────────────────────────────────────────
  const [bankToken, setBankToken]         = useState(null);
  const [bankConnected, setBankConnected] = useState(false);
  const [bankLoading, setBankLoading]     = useState(false);
  const [realTransactions, setRealTransactions] = useState([]);
  const [bankError, setBankError]         = useState(null);

  // ── On load: check if TrueLayer redirected back with a token ─────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setBankToken(token);
      setBankConnected(true);
      setBankLoading(true);
      // Clean the token from the URL so it doesn't linger
      window.history.replaceState({}, document.title, "/");
      // Fetch real transactions from our backend
      fetch(`/api/transactions?token=${token}`)
        .then(r => r.json())
        .then(data => {
          if (data && Array.isArray(data)) {
            // Map TrueLayer transactions to GreenSpend format
            const mapped = data.slice(0, 20).map((tx, i) => ({
              id: i + 100,
              merchant: tx.merchant_name || tx.description || "Unknown",
              cat: "neutral", // Will be replaced by AI categorisation later
              amt: Math.abs(tx.amount),
              ref: tx.description || "",
              _raw: tx,
            }));
            setRealTransactions(mapped);
          }
          setBankLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch transactions:", err);
          setBankError("Could not load transactions. Please try reconnecting.");
          setBankLoading(false);
        });
    }
  }, []);

  // ── Connect bank — redirects to TrueLayer auth ───────────────────────────
  const connectBank = () => {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: "sandbox-greenspend-a080fd",
      scope: "info accounts balance transactions",
      redirect_uri: window.location.origin + "/api/auth/callback",
      providers: "uk-ob-all uk-oauth-all",
    });
    window.location.href = `https://auth.truelayer-sandbox.com/?${params}`;
  };

  // ── Disconnect bank ───────────────────────────────────────────────────────
  const disconnectBank = () => {
    setBankToken(null);
    setBankConnected(false);
    setRealTransactions([]);
    setBankError(null);
  };

  useEffect(()=>{
    const t=setInterval(()=>setLiveIdx(i=>(i+1)%Object.keys(INTENSITY).length),1800);
    return ()=>clearInterval(t);
  },[]);

  // ── Use real transactions if connected, otherwise demo data ──────────────
  const sourceTx = bankConnected && realTransactions.length > 0 ? realTransactions : RAW_TX;

  // ── Compute derived stats with swaps applied ──────────────────────────────
  const transactions = sourceTx.map(tx=>{
    const sw=swaps.find(s=>s.txId===tx.id&&s.enabled);
    const cat=sw?sw.toCat:tx.cat;
    return {...tx, activeCat:cat, co2:calcCO2(tx.amt,cat), type:getType(cat), swapped:!!sw, swapTo:sw?.to};
  });

  const totalSpend    = transactions.reduce((a,t)=>a+t.amt,0);
  const totalCO2      = transactions.reduce((a,t)=>a+t.co2,0);
  const greenSpend    = transactions.filter(t=>t.type==="green").reduce((a,t)=>a+t.amt,0);
  const harmfulSpend  = transactions.filter(t=>t.type==="harmful").reduce((a,t)=>a+t.amt,0);
  const donationSpend = transactions.filter(t=>t.type==="donation").reduce((a,t)=>a+t.amt,0);
  const atmSpend      = transactions.filter(t=>t.cat==="neutral").reduce((a,t)=>a+t.amt,0);
  const greenPct      = (greenSpend/totalSpend)*100;
  const co2Penalty    = Math.min(totalCO2*0.1,50);
  const donBonus      = Math.min(donationSpend/10,15);
  const score         = Math.max(0,Math.min(100,Math.round(50+greenPct*0.4-co2Penalty+donBonus)));

  // ── Pie chart data ────────────────────────────────────────────────────────
  const pieData = [
    {name:"Green",   value:Math.round(greenSpend),   color:"#52B788"},
    {name:"Harmful", value:Math.round(harmfulSpend),  color:"#DC2626"},
    {name:"Donations",value:Math.round(donationSpend),color:"#7C3AED"},
    {name:"Neutral", value:Math.round(atmSpend),      color:"#4B5563"},
  ].filter(d=>d.value>0);

  // ── Category CO₂ breakdown ─────────────────────────────────────────────────
  const catCO2={};
  transactions.forEach(t=>{
    if(!catCO2[t.activeCat])catCO2[t.activeCat]=0;
    catCO2[t.activeCat]+=t.co2;
  });
  const sortedCats=Object.entries(catCO2).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));
  const maxAbs=Math.max(...sortedCats.map(([,v])=>Math.abs(v)),0.1);

  const filteredTx=filter==="all"?transactions:transactions.filter(t=>t.type===filter);

  function toggleSwap(id){
    setSwaps(prev=>prev.map(s=>s.id===id?{...s,enabled:!s.enabled}:s));
  }

  const CALC_CATS=Object.entries(INTENSITY).map(([k,v])=>({key:k,label:CAT_LABEL[k]||k,factor:v}));
  const liveKeys=Object.keys(INTENSITY);

  const navItems=[
    {id:"dashboard",    label:"Dashboard",  Icon:LayoutDashboard},
    {id:"transactions", label:"Payments",   Icon:CreditCard},
    {id:"calculator",   label:"Calculator", Icon:Calculator},
    {id:"carbon",       label:"Carbon",     Icon:Globe},
  ];

  return (
    <div style={{background:COLORS.bg,minHeight:"100vh",fontFamily:"'DM Sans',system-ui,sans-serif",color:"#E5F5EC",maxWidth:420,margin:"0 auto",boxShadow:"0 0 60px #00000066"}}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes glow{0%,100%{box-shadow:none}50%{box-shadow:0 0 10px #52B78844}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{padding:"22px 18px 10px",background:`linear-gradient(180deg,${COLORS.forest},${COLORS.bg})`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,background:"#14532D",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Sprout size={16} color="#86EFAC" strokeWidth={2}/>
            </div>
            <span style={{fontSize:19,fontWeight:700,fontFamily:"Georgia,serif",color:"#86EFAC"}}>GreenSpend</span>
          </div>
          <div style={{background:COLORS.card,border:`1px solid ${COLORS.border}`,borderRadius:20,padding:"3px 10px",fontSize:10,color:COLORS.sage,display:"flex",alignItems:"center",gap:4}}>
            <Activity size={10} color={COLORS.sage}/>Live BEIS 2024
          </div>
        </div>
        <p style={{fontSize:11,color:"#6B9E80",margin:0}}>Carbon scored live using BEIS 2024 formula</p>
      </div>

      <div style={{padding:"0 14px 80px"}}>

        {/* ── DASHBOARD ─────────────────────────────────────────────────── */}
        {tab==="dashboard" && (
          <div>

            {/* ── TRUELAYER BANK CONNECTION CARD ── */}
            <div style={{background:COLORS.card,borderRadius:14,border:`1px solid ${bankConnected?"#52B78888":COLORS.border}`,padding:"12px 14px",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div style={{width:32,height:32,background:bankConnected?"#14532D":"#1A1C26",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {bankConnected
                    ? <CheckCircle size={17} color="#86EFAC" strokeWidth={2}/>
                    : <Banknote size={17} color="#6B9E80" strokeWidth={1.8}/>
                  }
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#D1FAE5"}}>
                    {bankConnected ? "Bank connected" : "Connect your bank"}
                  </div>
                  <div style={{fontSize:10,color:"#6B9E80",marginTop:1}}>
                    {bankConnected
                      ? bankLoading
                        ? "Loading your transactions…"
                        : `${realTransactions.length} real transactions loaded`
                      : "Powered by TrueLayer open banking"}
                  </div>
                </div>
                {bankConnected && !bankLoading && (
                  <button onClick={disconnectBank} style={{background:"none",border:"none",color:"#6B9E80",fontSize:10,cursor:"pointer",padding:"4px 8px",borderRadius:8,border:`1px solid ${COLORS.border}`}}>
                    Disconnect
                  </button>
                )}
              </div>

              {/* Error state */}
              {bankError && (
                <div style={{background:"#450A0A",borderRadius:10,padding:"8px 10px",marginBottom:8,fontSize:10,color:"#FCA5A5",display:"flex",alignItems:"center",gap:6}}>
                  <AlertTriangle size={12} color="#FCA5A5"/>{bankError}
                </div>
              )}

              {/* Loading spinner */}
              {bankLoading && (
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0"}}>
                  <Loader size={14} color={COLORS.sage} style={{animation:"spin 1s linear infinite"}}/>
                  <span style={{fontSize:11,color:"#6B9E80"}}>Fetching transactions from your bank…</span>
                </div>
              )}

              {/* Connect button — only show when not connected */}
              {!bankConnected && (
                <button
                  onClick={connectBank}
                  style={{
                    width:"100%",
                    background:COLORS.forest,
                    border:`1px solid ${COLORS.sage}`,
                    borderRadius:11,
                    padding:"11px",
                    fontSize:13,
                    fontWeight:700,
                    color:"#86EFAC",
                    cursor:"pointer",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    gap:8,
                  }}
                >
                  <Banknote size={15} color="#86EFAC"/>
                  Connect Bank Account
                </button>
              )}

              {/* Live data badge */}
              {bankConnected && !bankLoading && realTransactions.length > 0 && (
                <div style={{display:"flex",alignItems:"center",gap:5,marginTop:6}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#86EFAC",animation:"pulse 1.8s infinite"}}/>
                  <span style={{fontSize:10,color:COLORS.sage,fontWeight:600}}>Showing real bank data</span>
                  <span style={{fontSize:10,color:"#6B9E80"}}>— carbon scored live</span>
                </div>
              )}

              {/* Demo mode badge */}
              {!bankConnected && (
                <div style={{fontSize:10,color:"#4B7060",marginTop:6,textAlign:"center"}}>
                  Currently showing demo data · Connect to score real spending
                </div>
              )}
            </div>

            {/* Greenwashing alert */}
            {!dismissed && (
              <div style={{background:"#451A03",border:"1px solid #F59E0B44",borderRadius:14,padding:"10px 12px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",gap:7,alignItems:"flex-start"}}>
                  <AlertTriangle size={13} color={COLORS.gold} style={{marginTop:2,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:COLORS.gold,marginBottom:2}}>Greenwashing Alert</div>
                    <div style={{fontSize:10,color:"#FCD34D",lineHeight:1.5}}>British Gas "Green Tariff" scores +{calcCO2(112,"gas_energy").toFixed(2)} kg CO₂. Switch to Octopus to score {calcCO2(112,"renewable_energy").toFixed(2)} kg instead.</div>
                  </div>
                </div>
                <button onClick={()=>setDismissed(true)} style={{background:"none",border:"none",color:COLORS.gold,fontSize:16,cursor:"pointer",padding:"0 0 0 6px"}}>×</button>
              </div>
            )}

            {/* Score card — expandable on click */}
            <div style={{background:`linear-gradient(135deg,${COLORS.forest},${COLORS.moss})`,borderRadius:18,marginBottom:12,border:`1px solid ${scoreCardOpen?"#52B78888":"#52B78833"}`,overflow:"hidden",transition:"border-color .3s",boxShadow:scoreCardOpen?"0 4px 24px #0005":"none"}}>

              {/* Clickable top row */}
              <div onClick={()=>setScoreCardOpen(o=>!o)}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 16px 14px",cursor:"pointer",userSelect:"none"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:"#95D5B2",letterSpacing:".06em",fontWeight:600,marginBottom:6,display:"flex",alignItems:"center",gap:7}}>
                    <Sprout size={13} color="#95D5B2"/>
                    Green Financial Score
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:8}}>
                    <span style={{fontSize:38,fontWeight:700,fontFamily:"Georgia,serif",color:score>=70?"#86EFAC":score>=45?"#F59E0B":"#FCA5A5",lineHeight:1}}>{score}</span>
                    <span style={{fontSize:13,color:"#B7E4C7"}}>/100</span>
                  </div>
                  <div style={{fontSize:11,color:"#B7E4C7",marginBottom:10,lineHeight:1.4}}>
                    🌍 You're in the top <b style={{color:"#86EFAC"}}>{score>50?Math.round((score-50)*1.2+50):40}%</b> of green spenders
                  </div>
                  {/* Progress bar */}
                  <div style={{height:6,background:"rgba(0,0,0,0.25)",borderRadius:3,overflow:"hidden",width:"90%"}}>
                    <div style={{height:"100%",borderRadius:3,width:`${score}%`,background:score>=70?"#52B788":score>=45?"#F59E0B":"#EF4444",transition:"width .8s ease"}}/>
                  </div>
                  {!scoreCardOpen && (
                    <div style={{display:"flex",gap:5,marginTop:10}}>
                      <div style={{background:"rgba(20,83,45,0.8)",borderRadius:8,padding:"3px 9px",fontSize:10,color:"#86EFAC",fontWeight:600}}>£{Math.round(greenSpend)} green</div>
                      <div style={{background:"rgba(69,10,10,0.8)",borderRadius:8,padding:"3px 9px",fontSize:10,color:"#FCA5A5",fontWeight:600}}>£{Math.round(harmfulSpend)} harmful</div>
                      <div style={{background:"rgba(46,16,101,0.8)",borderRadius:8,padding:"3px 9px",fontSize:10,color:"#E9D5FF",fontWeight:600}}>£{Math.round(donationSpend)} donated</div>
                    </div>
                  )}
                </div>
                {/* Right side — ring */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flexShrink:0,marginLeft:10}}>
                  <ScoreRing score={score}/>
                  <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(0,0,0,0.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <ChevronDown size={16} color="#95D5B2" style={{transition:"transform .35s",transform:scoreCardOpen?"rotate(180deg)":"rotate(0deg)"}}/>
                  </div>
                </div>
              </div>

              {/* Expandable spending breakdown */}
              <div style={{maxHeight:scoreCardOpen?"420px":"0",overflow:"hidden",transition:"max-height .4s ease"}}>
                <div style={{padding:"0 16px 18px"}}>
                  <div style={{height:".5px",background:"rgba(82,183,136,0.25)",marginBottom:14}}/>

                  {/* Spending breakdown */}
                  <div style={{background:"rgba(0,0,0,0.18)",borderRadius:14,padding:"12px 14px",marginBottom:12}}>
                    <div style={{fontSize:10,color:"#95D5B2",fontWeight:600,letterSpacing:".05em",marginBottom:10,display:"flex",alignItems:"center",gap:5}}>
                      <Activity size={11} color="#95D5B2"/> Spending breakdown
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:96,height:96,flexShrink:0}}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={24} outerRadius={42} paddingAngle={3} dataKey="value">
                              {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                            </Pie>
                            <Tooltip formatter={(v)=>`£${v}`} contentStyle={{background:"#0D1F16",border:"none",borderRadius:8,fontSize:10,color:"#D1FAE5"}}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                        {pieData.map((d,i)=>(
                          <div key={i}>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                              <div style={{width:8,height:8,borderRadius:2,background:d.color,flexShrink:0}}/>
                              <span style={{fontSize:10,color:"#B7E4C7",flex:1}}>{d.name}</span>
                              <span style={{fontSize:11,fontWeight:700,color:"#D1FAE5"}}>£{d.value}</span>
                            </div>
                            <div style={{height:3,background:"rgba(0,0,0,0.3)",borderRadius:2,overflow:"hidden"}}>
                              <div style={{height:"100%",background:d.color,borderRadius:2,width:`${Math.round(d.value/Math.round(totalSpend)*100)}%`,transition:"width .8s ease"}}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Friendly stat pills */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
                    {[
                      {v:`£${Math.round(greenSpend)}`,l:"Green spend",bg:"#14532D",col:"#86EFAC",sub:"#52B788"},
                      {v:`£${Math.round(harmfulSpend)}`,l:"Harmful spend",bg:"#450A0A",col:"#FCA5A5",sub:"#F87171"},
                      {v:`£${Math.round(donationSpend)}`,l:"Donated",bg:"#2E1065",col:"#E9D5FF",sub:"#A78BFA"},
                    ].map((p,i)=>(
                      <div key={i} style={{background:p.bg,borderRadius:11,padding:"8px 6px",textAlign:"center"}}>
                        <div style={{fontSize:13,fontWeight:700,color:p.col}}>{p.v}</div>
                        <div style={{fontSize:8,color:p.sub,marginTop:2,lineHeight:1.3}}>{p.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:12}}>
              {[
                {label:"Net CO₂",  value:`${totalCO2>0?"+":""}${totalCO2.toFixed(1)}kg`, color:totalCO2>0?"#FCA5A5":"#86EFAC", Icon:Globe},
                {label:"Green %",  value:`${Math.round(greenPct)}%`,                      color:COLORS.sage, Icon:Leaf},
                {label:"Donated",  value:`£${Math.round(donationSpend)}`,                 color:"#E9D5FF",   Icon:Heart},
              ].map((s,i)=>(
                <div key={i} style={{background:COLORS.card,borderRadius:12,padding:"10px 8px",border:`1px solid ${COLORS.border}`,textAlign:"center"}}>
                  <s.Icon size={13} color={s.color} style={{marginBottom:3}}/>
                  <div style={{fontSize:14,fontWeight:700,color:s.color,fontFamily:"Georgia,serif"}}>{s.value}</div>
                  <div style={{fontSize:8,color:"#6B9E80",marginTop:1}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* 🔄 Green Swap Simulator */}
            <div style={{background:COLORS.card,borderRadius:14,border:`1px solid ${COLORS.border}`,padding:"12px 14px",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <RefreshCw size={13} color={COLORS.sage}/>
                <span style={{fontSize:12,fontWeight:600,color:"#D1FAE5"}}>Green swap simulator</span>
              </div>
              <div style={{fontSize:10,color:"#6B9E80",marginBottom:10,lineHeight:1.4}}>Toggle harmful → green. Watch the score update live.</div>
              {swaps.map(sw=>{
                const origCO2=calcCO2(sw.amt,sw.fromCat);
                const newCO2=calcCO2(sw.amt,sw.toCat);
                const saving=parseFloat((origCO2-newCO2).toFixed(2));
                return (
                  <div key={sw.id} style={{display:"flex",alignItems:"center",gap:9,marginBottom:7,background:sw.enabled?"#0A2A1A":"#1B2A1E",borderRadius:10,padding:"8px 10px",border:`1px solid ${sw.enabled?COLORS.sage+"44":COLORS.border}`,transition:"all .3s"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:500,color:"#D1FAE5",display:"flex",alignItems:"center",gap:5}}>
                        <span style={{color:"#FCA5A5",textDecoration:sw.enabled?"line-through":"none",opacity:sw.enabled?.6:1}}>{sw.from}</span>
                        {sw.enabled&&<><ArrowRight size={9} color="#52B788"/><span style={{color:"#86EFAC"}}>{sw.to}</span></>}
                      </div>
                      <div style={{fontSize:9,marginTop:2,color:sw.enabled?"#86EFAC":"#9CA3AF"}}>
                        {sw.enabled?<>Saving <b>+{saving.toFixed(1)} kg CO₂</b></>:<>Would save <b>{saving.toFixed(1)} kg CO₂</b></>}
                      </div>
                    </div>
                    <div onClick={()=>toggleSwap(sw.id)} style={{width:38,height:21,background:sw.enabled?COLORS.sage:"#374151",borderRadius:20,position:"relative",cursor:"pointer",transition:"background .3s",flexShrink:0}}>
                      <div style={{position:"absolute",top:3,left:sw.enabled?"19px":"3px",width:15,height:15,background:"#fff",borderRadius:"50%",transition:"left .3s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Collapsible score formula */}
            <div style={{background:COLORS.card,borderRadius:14,border:`1px solid ${scoreOpen?COLORS.sage+"66":COLORS.border}`,marginBottom:12,overflow:"hidden",transition:"border-color .3s"}}>
              <div onClick={()=>setScoreOpen(o=>!o)} style={{padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <ShieldCheck size={13} color={COLORS.sage}/>
                  <span style={{fontSize:11,color:COLORS.sage,fontWeight:600}}>HOW YOUR SCORE IS CALCULATED</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:12,color:COLORS.gold,fontWeight:700,fontFamily:"monospace"}}>{score}/100</span>
                  <ChevronDown size={15} color={COLORS.sage} style={{transition:"transform .3s",transform:scoreOpen?"rotate(180deg)":"rotate(0deg)"}}/>
                </div>
              </div>
              <div style={{maxHeight:scoreOpen?"300px":"0",overflow:"hidden",transition:"max-height .35s ease"}}>
                <div style={{padding:"0 14px 12px",borderTop:`1px solid ${COLORS.border}`}}>
                  {[
                    {label:"Base score",        val:"50",                             col:"#D1FAE5", Icon:Circle},
                    {label:"Green spend bonus",  val:`+${(greenPct*.4).toFixed(1)} pts`,col:"#86EFAC",Icon:TrendingUp},
                    {label:"CO₂ penalty",        val:`−${co2Penalty.toFixed(1)} pts`,  col:"#FCA5A5",Icon:TrendingDown},
                    {label:"Donation bonus",     val:`+${donBonus.toFixed(1)} pts`,    col:"#E9D5FF",Icon:Gift},
                    {label:"Final score",        val:`= ${score}/100`,                 col:COLORS.gold,Icon:Trophy},
                  ].map((r,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderTop:i>0?`1px solid ${COLORS.border}`:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <r.Icon size={12} color={r.col} strokeWidth={2}/>
                        <span style={{fontSize:11,color:"#9CA3AF"}}>{r.label}</span>
                      </div>
                      <span style={{fontSize:11,fontWeight:700,color:r.col,fontFamily:"monospace"}}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent payments */}
            <div style={{background:COLORS.card,borderRadius:14,border:`1px solid ${COLORS.border}`,overflow:"hidden"}}>
              <div style={{padding:"12px 14px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><CreditCard size={13} color={COLORS.sage}/><span style={{fontSize:12,fontWeight:600,color:"#D1FAE5"}}>Recent payments</span></div>
                <button onClick={()=>setTab("transactions")} style={{background:"none",border:"none",color:COLORS.sage,fontSize:11,cursor:"pointer"}}>See all →</button>
              </div>
              {transactions.slice(0,5).map((tx,i)=>(
                <div key={tx.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderTop:`1px solid ${COLORS.border}`}}>
                  <TxIcon cat={tx.activeCat} type={tx.type} size={16}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#D1FAE5",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.swapped?<><span style={{opacity:.5,textDecoration:"line-through"}}>{tx.merchant}</span> → {tx.swapTo}</>:tx.merchant}</div>
                    <div style={{fontSize:9,color:"#6B9E80",marginTop:1}}>{tx.ref}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:11,fontWeight:600}}>£{tx.amt.toFixed(2)}</div>
                    <CO2Badge co2={tx.co2}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PAYMENTS ──────────────────────────────────────────────────── */}
        {tab==="transactions" && (
          <div>
            <div style={{paddingTop:14,marginBottom:10}}>
              <div style={{fontSize:15,fontWeight:700,fontFamily:"Georgia,serif",color:"#86EFAC",marginBottom:10}}>Payment History</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                {["all","green","donation","neutral","harmful"].map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${filter===f?(f==="donation"?"#7C3AED":COLORS.sage):COLORS.border}`,background:filter===f?(f==="donation"?"#3B0764":COLORS.forest):"transparent",color:filter===f?(f==="donation"?"#E9D5FF":"#86EFAC"):"#6B9E80",fontSize:10,cursor:"pointer",fontWeight:600}}>
                    {f==="all"?"All":f==="donation"?"Donations":f==="neutral"?"ATM & Other":f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>
              {/* CO₂ bar chart */}
              <div style={{background:COLORS.card,borderRadius:12,border:`1px solid ${COLORS.border}`,padding:"10px 12px",marginBottom:10}}>
                <div style={{fontSize:10,color:COLORS.sage,fontWeight:600,marginBottom:8}}>CO₂ BY CATEGORY</div>
                {sortedCats.map(([cat,co2],i)=>{
                  const pct=Math.abs(co2)/maxAbs*100;
                  const col=co2>0?"#DC2626":co2===0?"#4B5563":"#1D9E75";
                  return (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                      <span style={{fontSize:9,color:"#9CA3AF",minWidth:80,textAlign:"right"}}>{CAT_LABEL[cat]||cat}</span>
                      <div style={{flex:1,height:5,background:"#1B4332",borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:3,transition:"width .5s"}}/>
                      </div>
                      <span style={{fontSize:9,fontWeight:600,minWidth:45,color:col}}>{co2>0?"+":""}{co2.toFixed(1)} kg</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{background:COLORS.card,borderRadius:14,border:`1px solid ${COLORS.border}`,overflow:"hidden"}}>
              {filteredTx.map((tx,i)=>(
                <div key={tx.id}>
                  <div onClick={()=>setSelectedTx(selectedTx===tx.id?null:tx.id)} style={{padding:"10px 12px",borderTop:i>0?`1px solid ${COLORS.border}`:"none",cursor:"pointer",background:selectedTx===tx.id?"#1F3A2A":"transparent",transition:"background .15s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <TxIcon cat={tx.activeCat} type={tx.type} size={18}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#D1FAE5"}}>{tx.swapped?<><span style={{opacity:.5,textDecoration:"line-through",fontSize:10}}>{tx.merchant}</span> → {tx.swapTo}</>:tx.merchant}</div>
                        <div style={{fontSize:9,color:"#6B9E80",marginTop:1}}>{tx.ref}</div>
                        <div style={{display:"flex",gap:5,marginTop:3,alignItems:"center"}}>
                          <Tag type={tx.type}/><CO2Badge co2={tx.co2}/>
                        </div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:13,fontWeight:700}}>£{tx.amt.toFixed(2)}</div>
                        <ChevronDown size={12} color="#6B9E80" style={{transform:selectedTx===tx.id?"rotate(180deg)":"none",transition:"transform .3s"}}/>
                      </div>
                    </div>
                  </div>
                  {selectedTx===tx.id && (
                    <div style={{background:COLORS.bg,margin:"0 10px 8px",borderRadius:10,padding:"10px 12px",fontSize:10,color:"#B7E4C7",lineHeight:1.9}}>
                      <div style={{color:COLORS.sage,fontWeight:600,marginBottom:4,display:"flex",alignItems:"center",gap:5}}><ShieldCheck size={11} color={COLORS.sage}/>Live BEIS 2024 formula</div>
                      <div style={{fontFamily:"monospace",color:"#86EFAC",fontSize:11}}>£{tx.amt.toFixed(2)} × {INTENSITY[tx.activeCat]??0} = {tx.co2>0?"+":""}{tx.co2.toFixed(2)} kg CO₂</div>
                      <div style={{color:"#6B9E80",marginTop:4}}>Factor source: BEIS 2024 / Exiobase</div>
                      {tx.swapped&&<div style={{marginTop:5,color:"#86EFAC"}}>✓ Green swap active — swapped from {tx.merchant}</div>}
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
            <div style={{paddingTop:14,marginBottom:12}}>
              <div style={{fontSize:15,fontWeight:700,fontFamily:"Georgia,serif",color:"#86EFAC",marginBottom:4,display:"flex",alignItems:"center",gap:7}}><Calculator size={16} color="#86EFAC"/>Carbon Impact Calculator</div>
              <div style={{fontSize:11,color:"#6B9E80"}}>Type any amount — CO₂ calculated live using BEIS 2024</div>
            </div>
            <div style={{background:COLORS.card,borderRadius:14,border:`1px solid ${COLORS.border}`,padding:"14px",marginBottom:12}}>
              <label style={{fontSize:10,color:"#9CA3AF",display:"block",marginBottom:4}}>Amount (£)</label>
              <input type="number" placeholder="e.g. 50" value={calcAmount}
                onChange={e=>{setCalcAmount(e.target.value);setCalcResult(null);}}
                style={{width:"100%",background:COLORS.bg,border:`1px solid ${COLORS.border}`,borderRadius:10,padding:"9px 12px",fontSize:15,color:"#D1FAE5",outline:"none",marginBottom:10}}/>
              <label style={{fontSize:10,color:"#9CA3AF",display:"block",marginBottom:4}}>Category</label>
              <select value={calcCat} onChange={e=>{setCalcCat(e.target.value);setCalcResult(null);}}
                style={{width:"100%",background:COLORS.bg,border:`1px solid ${COLORS.border}`,borderRadius:10,padding:"9px 12px",fontSize:12,color:"#D1FAE5",outline:"none",marginBottom:12}}>
                {CALC_CATS.map(c=><option key={c.key} value={c.key}>{c.label} (×{c.factor} kg CO₂/£)</option>)}
              </select>
              <button onClick={()=>{const a=parseFloat(calcAmount);if(!a||a<=0)return;const co2=calcCO2(a,calcCat);setCalcResult({amt:a,co2,factor:INTENSITY[calcCat],cat:CALC_CATS.find(c=>c.key===calcCat)});}}
                style={{width:"100%",background:COLORS.forest,border:`1px solid ${COLORS.sage}`,borderRadius:11,padding:"11px",fontSize:13,fontWeight:700,color:"#86EFAC",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                <Zap size={14} color="#86EFAC"/>Calculate CO₂
              </button>
            </div>
            {calcResult&&(
              <div style={{background:calcResult.co2>0?"#450A0A":calcResult.co2===0?COLORS.card:"#14532D",border:`1px solid ${calcResult.co2>0?"#F09595":calcResult.co2===0?COLORS.border:"#52B788"}`,borderRadius:14,padding:"14px",marginBottom:12}}>
                <div style={{fontSize:10,color:calcResult.co2>0?"#FCA5A5":calcResult.co2===0?"#9CA3AF":"#86EFAC",fontWeight:600,marginBottom:6,display:"flex",alignItems:"center",gap:5}}>
                  {calcResult.co2>0?<AlertTriangle size={12}/>:calcResult.co2===0?<Landmark size={12}/>:<Leaf size={12}/>}
                  {calcResult.co2>0?"CARBON FOOTPRINT":calcResult.co2===0?"UNTRACKED":"CARBON OFFSET"}
                </div>
                <div style={{fontSize:44,fontWeight:700,color:calcResult.co2>0?"#FCA5A5":calcResult.co2===0?"#9CA3AF":"#86EFAC",fontFamily:"Georgia,serif",lineHeight:1,marginBottom:8}}>
                  {calcResult.co2>0?"+":""}{calcResult.co2.toFixed(2)} kg
                </div>
                <div style={{background:"rgba(0,0,0,.2)",borderRadius:9,padding:"9px 11px",fontSize:11}}>
                  <div style={{fontSize:9,color:"#9CA3AF",marginBottom:3}}>📐 BEIS 2024 Formula</div>
                  <div style={{fontFamily:"monospace",color:"#D1FAE5"}}>£{calcResult.amt.toFixed(2)} × {calcResult.factor} = {calcResult.co2>0?"+":""}{calcResult.co2.toFixed(2)} kg CO₂</div>
                </div>
              </div>
            )}
            {/* Live intensity table */}
            <div style={{background:COLORS.card,borderRadius:14,border:`1px solid ${COLORS.border}`,padding:"12px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><ShieldCheck size={13} color="#D1FAE5"/><span style={{fontSize:11,fontWeight:600,color:"#D1FAE5"}}>BEIS 2024 Intensity Factors</span></div>
                <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:"50%",background:"#86EFAC",animation:"pulse 1.8s infinite"}}/><span style={{fontSize:9,color:COLORS.sage}}>LIVE</span></div>
              </div>
              {CALC_CATS.map((c,i)=>{
                const isActive=liveKeys[liveIdx]===c.key;
                const isSelected=c.key===calcCat;
                const col=c.factor>0?"#FCA5A5":c.factor===0?"#9CA3AF":"#86EFAC";
                return (
                  <div key={i} onClick={()=>{setCalcCat(c.key);setCalcResult(null);}}
                    style={{padding:"7px 9px",borderRadius:9,cursor:"pointer",marginBottom:2,background:isActive?(c.factor>0?"#3A0A0A":c.factor===0?"#1C2030":"#0A2A1A"):isSelected?COLORS.forest:"transparent",border:isActive?`1px solid ${col}55`:isSelected?`1px solid ${COLORS.sage}44`:"1px solid transparent",transition:"all .4s",animation:isActive?"glow 1.8s":"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:11,color:isActive?"#D1FAE5":"#9CA3AF",fontWeight:isActive?600:400}}>{c.label}</span>
                      <span style={{fontSize:11,fontWeight:700,color:col,fontFamily:"monospace"}}>{c.factor>0?"+":""}{c.factor} kg/£</span>
                    </div>
                    {isActive&&<div style={{marginTop:4,height:4,background:"#1B4332",borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",background:col,width:`${Math.min(Math.abs(c.factor)/1*100,100)}%`,borderRadius:2,transition:"width .6s"}}/>
                    </div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CARBON ────────────────────────────────────────────────────── */}
        {tab==="carbon" && (
          <div>
            <div style={{paddingTop:14,marginBottom:12}}>
              <div style={{fontSize:15,fontWeight:700,fontFamily:"Georgia,serif",color:"#86EFAC",marginBottom:4,display:"flex",alignItems:"center",gap:7}}><Globe size={16} color="#86EFAC"/>Carbon Footprint</div>
              <div style={{fontSize:11,color:"#6B9E80"}}>All values calculated live using BEIS 2024 formula</div>
            </div>
            <div style={{background:`linear-gradient(135deg,${COLORS.forest},${COLORS.moss})`,borderRadius:18,padding:"18px",marginBottom:12,border:`1px solid ${COLORS.sage}33`,textAlign:"center"}}>
              <Globe size={20} color={COLORS.sage} style={{margin:"0 auto 6px"}}/>
              <div style={{fontSize:10,color:COLORS.sage,letterSpacing:".1em",fontWeight:600,marginBottom:5}}>TOTAL NET CO₂</div>
              <div style={{fontSize:48,fontWeight:700,color:totalCO2>0?"#FCA5A5":"#86EFAC",fontFamily:"Georgia,serif",lineHeight:1}}>{totalCO2>0?"+":""}{totalCO2.toFixed(1)}</div>
              <div style={{fontSize:12,color:"#D1FAE5",marginTop:4}}>kg CO₂ equivalent</div>
              <div style={{fontSize:10,color:"#B7E4C7",marginTop:8}}>Auto-calculated: <b style={{color:COLORS.gold}}>Amount × BEIS factor</b></div>
              {swaps.some(s=>s.enabled)&&<div style={{marginTop:8,background:"rgba(0,0,0,.2)",borderRadius:10,padding:"5px 12px",fontSize:10,color:"#86EFAC"}}>✓ {swaps.filter(s=>s.enabled).length} green swap{swaps.filter(s=>s.enabled).length>1?"s":""} active</div>}
            </div>
            <div style={{background:COLORS.card,borderRadius:14,border:`1px solid ${COLORS.border}`,padding:"12px 14px",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><Activity size={13} color="#D1FAE5"/><span style={{fontSize:11,fontWeight:600,color:"#D1FAE5"}}>Every transaction — live formula</span></div>
              {transactions.sort((a,b)=>b.co2-a.co2).slice(0,10).map((tx,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderTop:i>0?`1px solid ${COLORS.border}`:"none"}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <TxIcon cat={tx.activeCat} type={tx.type} size={14}/>
                    <div>
                      <div style={{fontSize:11,color:"#D1FAE5"}}>{tx.swapped?tx.swapTo:tx.merchant}</div>
                      <div style={{fontSize:9,color:"#4B7060",fontFamily:"monospace"}}>£{tx.amt} × {INTENSITY[tx.activeCat]??0}</div>
                    </div>
                  </div>
                  <CO2Badge co2={tx.co2}/>
                </div>
              ))}
            </div>
            {/* ── Green Alternatives ─────────────────────────────────── */}
            <div style={{background:COLORS.card,borderRadius:14,border:`1px solid ${COLORS.border}`,padding:"12px 14px",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                <Zap size={13} color={COLORS.sage}/>
                <span style={{fontSize:11,fontWeight:600,color:"#D1FAE5"}}>Recommended alternatives</span>
              </div>
              {[
                {
                  harm:"Ryanair flight",
                  harmCO2:calcCO2(143,"flight"),
                  Icon:Plane,
                  alts:[
                    {name:"Eurostar train",      cat:"ev_charging",      saving:+(calcCO2(143,"flight")-calcCO2(143,"ev_charging")).toFixed(1), col:"#86EFAC", note:"London–Paris in 2h20"},
                    {name:"Video call instead",  cat:"ev_charging",      saving:+(calcCO2(143,"flight")).toFixed(1),                             col:"#86EFAC", note:"Zero travel emissions"},
                  ]
                },
                {
                  harm:"Shell Petrol",
                  harmCO2:calcCO2(78,"petrol"),
                  Icon:Fuel,
                  alts:[
                    {name:"Pod Point EV charge", cat:"ev_charging",      saving:+(calcCO2(78,"petrol")-calcCO2(78,"ev_charging")).toFixed(1),    col:"#86EFAC", note:"59% lower than petrol"},
                    {name:"National Rail",        cat:"ev_charging",      saving:+(calcCO2(78,"petrol")-0.3).toFixed(1),                         col:"#67E8F9", note:"0.035 kg CO₂/km"},
                  ]
                },
                {
                  harm:"British Gas",
                  harmCO2:calcCO2(112,"gas_energy"),
                  Icon:Flame,
                  alts:[
                    {name:"Octopus Energy",      cat:"renewable_energy", saving:+(calcCO2(112,"gas_energy")-calcCO2(112,"renewable_energy")).toFixed(1), col:"#67E8F9", note:"100% renewable tariff"},
                    {name:"Solar + battery",     cat:"renewable_energy", saving:+(calcCO2(112,"gas_energy")-0.1).toFixed(1),                    col:"#86EFAC", note:"Near-zero home energy"},
                  ]
                },
                {
                  harm:"McDonald's",
                  harmCO2:calcCO2(12.8,"fast_food"),
                  Icon:UtensilsCrossed,
                  alts:[
                    {name:"Too Good To Go",      cat:"surplus_food",     saving:+(calcCO2(12.8,"fast_food")-calcCO2(12.8,"surplus_food")).toFixed(1), col:"#86EFAC", note:"Prevents food waste"},
                    {name:"Plant-based café",    cat:"oat_coffee",       saving:+(calcCO2(12.8,"fast_food")-calcCO2(12.8,"oat_coffee")).toFixed(1),  col:"#52B788", note:"70% lower emissions"},
                  ]
                },
                {
                  harm:"Zara fast fashion",
                  harmCO2:calcCO2(95,"fast_fashion"),
                  Icon:Shirt,
                  alts:[
                    {name:"Vinted / Depop",      cat:"sustainable_fashion", saving:+(calcCO2(95,"fast_fashion")-calcCO2(95,"sustainable_fashion")).toFixed(1), col:"#86EFAC", note:"Second-hand, no new production"},
                    {name:"Patagonia (repair)", cat:"sustainable_fashion", saving:+(calcCO2(95,"fast_fashion")-0.5).toFixed(1),                    col:"#52B788", note:"Repair programme, recycled materials"},
                  ]
                },
              ].map((item, idx)=>{
                const open = !!openAlts[idx];
                return (
                  <div key={idx} style={{marginBottom:8,borderRadius:11,overflow:"hidden",border:`1px solid ${COLORS.border}`}}>
                    <div onClick={()=>setOpenAlts(p=>({...p,[idx]:!p[idx]}))} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 11px",cursor:"pointer",background:"#1B2A1E"}}>
                      <div style={{width:30,height:30,borderRadius:8,background:"#2E1A1A",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <item.Icon size={14} color="#FCA5A5" strokeWidth={1.8}/>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,fontWeight:600,color:"#D1FAE5"}}>{item.harm}</div>
                        <div style={{fontSize:9,color:"#FCA5A5"}}>+{item.harmCO2.toFixed(2)} kg CO₂ this month</div>
                      </div>
                      <ChevronDown size={14} color="#6B9E80" style={{transition:"transform .3s",transform:open?"rotate(180deg)":"none",flexShrink:0}}/>
                    </div>
                    <div style={{maxHeight:open?"300px":"0",overflow:"hidden",transition:"max-height .35s ease"}}>
                      {item.alts.map((alt,ai)=>(
                        <div key={ai} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 11px",borderTop:`1px solid ${COLORS.border}`,background:"#0D1F16"}}>
                          <div style={{width:30,height:30,borderRadius:8,background:"#0A2A1A",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <Leaf size={13} color={alt.col} strokeWidth={1.8}/>
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:11,fontWeight:500,color:"#D1FAE5"}}>{alt.name}</div>
                            <div style={{fontSize:9,color:"#6B9E80"}}>{alt.note}</div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            <div style={{fontSize:10,fontWeight:700,color:alt.col}}>−{alt.saving} kg</div>
                            <div style={{fontSize:8,color:"#4B7060"}}>CO₂ saved</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ATM note */}
            <div style={{background:"#162030",border:"1px solid #6B728044",borderRadius:13,padding:"11px 13px",display:"flex",gap:9,alignItems:"flex-start"}}>
              <ArrowDownToLine size={15} color="#9CA3AF" style={{flexShrink:0,marginTop:1}}/>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:"#9CA3AF",marginBottom:2}}>ATM / Cash = Untracked</div>
                <div style={{fontSize:10,color:"#6B7280",lineHeight:1.5}}>£{atmSpend.toFixed(0)} withdrawn this month scored as 0 kg CO₂. Pay by card so GreenSpend can score every £.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:420,background:COLORS.card,borderTop:`1px solid ${COLORS.border}`,display:"grid",gridTemplateColumns:"repeat(4,1fr)",padding:"7px 0 11px",zIndex:100}}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",padding:"3px 0"}}>
            <n.Icon size={20} color={tab===n.id?COLORS.sage:"#4B7060"} strokeWidth={tab===n.id?2:1.5}/>
            <span style={{fontSize:9,color:tab===n.id?COLORS.sage:"#4B7060",fontWeight:tab===n.id?700:400}}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
