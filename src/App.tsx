import { useState, useEffect } from "react";
import { IncidentReport, SensorDevice, IncidentType, Severity, IncidentStatus } from "./types";
import NepalMap from "./components/NepalMap";
import ReportForm from "./components/ReportForm";
import SurvivalChat from "./components/SurvivalChat";
import SurvivalChecklist from "./components/SurvivalChecklist";

import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Terminal, 
  Phone, 
  FileText, 
  Activity, 
  Award,
  AlertTriangle,
  Zap,
  Globe,
  Radio
} from "lucide-react";

export default function App() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [sensors, setSensors] = useState<SensorDevice[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  const [loadingSensors, setLoadingSensors] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [liveTime, setLiveTime] = useState("");

  // Live UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toUTCString());
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetching community incidents and sensor telemetry on startup
  const fetchIncidents = async () => {
    setLoadingIncidents(true);
    try {
      const res = await fetch("/api/incidents");
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
        // Default select first incident details if none selected
        if (data.length > 0 && !selectedIncident) {
          setSelectedIncident(data[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load incidents feed.", e);
    } finally {
      setLoadingIncidents(false);
    }
  };

  const fetchSensors = async () => {
    setLoadingSensors(true);
    try {
      const res = await fetch("/api/sensors");
      if (res.ok) {
        const data = await res.json();
        setSensors(data);
      }
    } catch (e) {
      console.error("Failed to fetch sensor network.", e);
    } finally {
      setLoadingSensors(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchSensors();
    
    // Auto refresh sensor grid telemetry every 10 seconds for high-fidelity interactive feel
    const interval = setInterval(() => {
      fetchSensors();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // AI-powered analysis request
  const handleAIAnalyze = async (incident: IncidentReport) => {
    if (aiLoading) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: incident.id,
          description: incident.description,
          type: incident.type,
          location: incident.location,
          severity: incident.severity
        })
      });

      if (res.ok) {
        const result = await res.json();
        
        // Update local incidents array with parsed Gemini analysis results
        setIncidents(prev => prev.map(item => 
          item.id === incident.id ? { ...item, aiAnalysis: result } : item
        ));
        
        // Update selected incident reference to refresh details display
        setSelectedIncident(curr => curr?.id === incident.id ? { ...curr, aiAnalysis: result } : curr);
      }
    } catch (e) {
      console.error("AI classification execution failed.", e);
    } finally {
      setAiLoading(false);
    }
  };

  // Province-based filtered counts
  const filteredIncidents = incidents.filter(inc => 
    !selectedProvince || inc.provinceCode === selectedProvince
  );

  return (
    <div className="bg-[#0A0A0A] text-white font-sans min-h-screen p-4 md:p-8 flex flex-col justify-between" id="app-root-container">
      
      {/* HEADER SECTION - BOLD TYPOGRAPHY IDENTITY */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 border-b border-white/10 pb-6" id="app-header">
        <div>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-white selection:bg-orange-600">
            SAFE NEPAL<br/>
            <span className="text-orange-600">SNIRS</span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs mt-4 tracking-widest text-white/50">
            <span className="flex items-center gap-1"><Terminal className="h-3.5 w-3.5 text-orange-500" /> SYSTEM ARCHITECTURE: ACTIVE</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-orange-500" /> {liveTime || "SAT_LNK CALIBRATING..."}</span>
          </div>
        </div>

        <div className="text-left lg:text-right border-l-2 lg:border-l-0 lg:border-r-2 border-orange-600 pl-4 lg:pl-0 lg:pr-4 py-1">
          <div className="text-3xl md:text-4xl font-black font-mono tracking-tight text-white flex items-center lg:justify-end gap-2">
            <Radio className="h-6 w-6 text-orange-500 animate-pulse" />
            LIVE OPS
          </div>
          <div className="text-orange-500 font-black uppercase text-xs tracking-wider">
            Crisis Command & Evaluation Base
          </div>
        </div>
      </header>

      {/* THREE-COLUMN BENTO GRID SYSTEM */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow mb-8" id="main-bento-grid">
        
        {/* COLUMN 1: LIVE DISASTER BULLETIN FEED */}
        <div className="flex flex-col gap-6" id="column-bulletin-feed">
          <div className="bg-[#111111] border border-white/10 rounded-none p-5 flex flex-col flex-grow relative overflow-hidden h-full">
            
            <div className="absolute top-0 right-0 p-4 font-mono font-black text-6xl text-white/5 select-none pointer-events-none">
              FEED
            </div>

            <div className="border-b-2 border-orange-600 pb-3 mb-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  Crisis Bulletin
                </h2>
                <p className="text-[10px] font-mono text-white/40 tracking-wider">COMMUNITY INCIDENT REPORTS & SAT RELAYS</p>
              </div>
              <button 
                onClick={fetchIncidents}
                disabled={loadingIncidents}
                className="text-[10px] font-mono bg-white/5 border border-white/10 hover:border-orange-500 hover:text-orange-500 text-white/70 px-2.5 py-1.5 cursor-pointer uppercase font-bold"
              >
                {loadingIncidents ? "SYNC_IN_PROGRESS" : "SYNC FEED"}
              </button>
            </div>

            {/* Selected Province Filter Status Alert */}
            {selectedProvince && (
              <div className="bg-orange-950/20 border border-orange-500/20 px-3 py-2 text-[10px] font-mono text-orange-400 mb-3 flex items-center justify-between">
                <span>FILTERING GEOGRAPHY: PROVINCE {selectedProvince}</span>
                <button 
                  onClick={() => setSelectedProvince(null)} 
                  className="hover:underline font-bold"
                >
                  CLEAR [X]
                </button>
              </div>
            )}

            {/* Incidents List */}
            <div className="flex-grow overflow-y-auto space-y-2 max-h-[280px] pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {filteredIncidents.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/10 font-mono text-xs text-white/40 bg-black">
                  No incident logs registered for Province {selectedProvince || "indicated"}.
                </div>
              ) : (
                filteredIncidents.map((inc) => {
                  const isCurSelected = selectedIncident?.id === inc.id;
                  
                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`p-3 border cursor-pointer transition-all relative ${
                        isCurSelected 
                          ? "bg-white/5 border-orange-600" 
                          : "bg-black border-white/5 hover:border-white/10"
                      }`}
                      id={`incident-item-${inc.id}`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 font-black ${
                          inc.severity === Severity.EXTREME ? "bg-red-950 border border-red-500/45 text-red-500" :
                          inc.severity === Severity.HIGH ? "bg-orange-950 border border-orange-500/40 text-orange-400" :
                          "bg-white/5 border border-white/10 text-white/50"
                        }`}>
                          {inc.severity.toUpperCase()} THREAT
                        </span>
                        <span className="text-[9px] font-mono text-white/40">
                          {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="text-xs font-black text-white hover:text-orange-400 leading-snug">
                        {inc.title}
                      </h3>
                      <p className="text-[10px] text-white/55 truncate mt-1 flex items-center gap-1 font-mono">
                        <MapPin className="h-3 w-3 text-orange-500 shrink-0" /> {inc.location} ({inc.provinceCode})
                      </p>

                      {/* AI Classified Tick Status Indicator */}
                      {inc.aiAnalysis && (
                        <span className="absolute bottom-2 right-2 text-[9px] font-mono bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.2 select-none">
                          AI RESOLUTION GENERATED
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* SECTION: INCIDENT DETAIL & SPECIAL AI RESOLUTION PANEL */}
            {selectedIncident && (
              <div className="mt-4 border-t border-white/15 pt-4 flex-grow flex flex-col justify-between" id="incident-evaluation-drillhead">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-orange-500 tracking-widest font-mono uppercase">
                      TELEMETRY DETAILED INSPECTOR
                    </span>
                    <span className="text-[9px] font-mono text-white/50">ID: {selectedIncident.id}</span>
                  </div>

                  <h3 className="text-lg font-black text-white uppercase tracking-tight leading-tight mb-2">
                    {selectedIncident.title}
                  </h3>

                  <p className="text-xs text-white/70 font-mono mb-3 leading-relaxed bg-black/50 p-2.5 border border-white/5">
                    "{selectedIncident.description}"
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-white/50 mb-4 bg-black p-2">
                    <div>
                      <span className="text-white/30 block">REPORTER INFO:</span>
                      <span className="text-white/80 font-bold">{selectedIncident.reporterName}</span>
                    </div>
                    <div>
                      <span className="text-white/30 block">RELAY PHONE / DIRECT CALL:</span>
                      <span className="text-orange-500 font-bold">{selectedIncident.reporterContact}</span>
                    </div>
                  </div>
                </div>

                {/* Gemini Safety Dispatch Generator Portal */}
                <div className="bg-[#181818] border border-white/10 p-4">
                  {!selectedIncident.aiAnalysis ? (
                    <div className="text-center py-2">
                      <p className="text-xs text-white/60 font-mono mb-3">
                        No AI Survival Guidance has been rendered for this monsoonal hazard yet.
                      </p>
                      <button
                        onClick={() => handleAIAnalyze(selectedIncident)}
                        disabled={aiLoading}
                        className="w-full bg-orange-600 hover:bg-white text-black font-black uppercase text-xs tracking-wider py-2.5 transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Zap className="h-4 w-4" />
                        {aiLoading ? "RUNNING MOUNTAIN THREAT MODEL..." : "LAUNCH AI CRISIS CLASSIFIER"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                        <span className="text-[10px] font-black uppercase text-emerald-400">
                          AI ANALYZER STATUS: SECURED
                        </span>
                        <span className="text-[9px] text-white/30">
                          PROPRIETARY KNOWLEDGE BASE
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] text-white/40 block">ASSESSED CATEGORY:</span>
                        <span className="text-white font-bold">{selectedIncident.aiAnalysis.category}</span>
                      </div>

                      <div>
                        <span className="text-[9px] text-white/40 block">NEPALI EMERGENCY CITIZEN ALERT (नेपाली अनुवाद):</span>
                        <p className="text-amber-400 leading-relaxed font-semibold bg-black/60 p-2 border border-amber-500/10 rounded-sm">
                          {selectedIncident.aiAnalysis.nepaliTranslation}
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] text-white/40 block mb-1">IMMEDIATE MOUNTAIN SURVIVAL PROTOCOL:</span>
                        <ul className="space-y-1 pl-3.5 list-disc text-white/80 text-[11px] leading-relaxed">
                          {selectedIncident.aiAnalysis.immediateActionPlan.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[11px]">
                        <span className="text-white/40">RECOMMENDED DISPATCH AGENT:</span>
                        <span className="text-emerald-400 border border-emerald-500/20 bg-emerald-950/20 px-1 py-0.5 font-bold">
                          {selectedIncident.aiAnalysis.recommendedResponder}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: EMERGENCY SOS LIVE BROADCAST & FIRST RESPONDER AGENTS */}
        <div className="flex flex-col gap-6" id="column-emergency-ops">
          {/* Geolocation Tagged SOS Form */}
          <ReportForm onSubmitSuccess={fetchIncidents} />

          {/* EMERGENCY TELEPHONE REGIONAL HOTLINES */}
          <div className="bg-[#111111] border border-white/10 rounded-none p-5 relative overflow-hidden flex-grow flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 font-mono font-black text-6xl text-white/5 select-none pointer-events-none">
              CALL
            </div>
            
            <div className="border-b-2 border-orange-600 pb-3 mb-4">
              <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
                <Phone className="h-5 w-5 text-orange-600" />
                Disaster Hotlines
              </h2>
              <p className="text-[10px] font-mono text-white/40 tracking-wider">DIRECT DIAL NEPAL DISPATCH COMMANDS</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black hover:border-orange-500/40 p-3 border border-white/5 transition-all">
                <span className="text-[10px] font-mono text-white/45 block">NEPAL POLICE (नेपाल प्रहरी)</span>
                <span className="text-xl font-black font-mono text-red-500">100</span>
                <p className="text-[8px] font-mono text-white/30 uppercase mt-1">Crimes & immediate incidents</p>
              </div>
              <div className="bg-black p-3 border border-white/5">
                <span className="text-[10px] font-mono text-white/45 block">FIRE EMERGENCY (दमकल)</span>
                <span className="text-xl font-black font-mono text-white">101</span>
                <p className="text-[8px] font-mono text-white/30 uppercase mt-1">Local regional fire brigade</p>
              </div>
              <div className="bg-black p-3 border border-white/5">
                <span className="text-[10px] font-mono text-white/45 block">AMBULANCE SERVICES</span>
                <span className="text-xl font-black font-mono text-white">102</span>
                <p className="text-[8px] font-mono text-white/30 uppercase mt-1">Red Cross dispatch unit</p>
              </div>
              <div className="bg-black p-3 border border-white/5">
                <span className="text-[10px] font-mono text-white/45 block">APF MOUNTAIN DISPATCH</span>
                <span className="text-xl font-black font-mono text-orange-500">1114</span>
                <p className="text-[8px] font-mono text-white/30 uppercase mt-1">Armed Police Force rescue</p>
              </div>
            </div>

            {/* DIRECT SATELLITE LINKS */}
            <div className="bg-black border border-white/5 p-3 font-mono text-xs">
              <div className="flex justify-between items-center text-[10px] font-black text-white/40 mb-2 uppercase">
                <span>Satellite Alert Network Channels</span>
                <span className="text-green-500 animate-pulse">ACTIVE FEED</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-white/70">
                <li className="flex justify-between"><span>National Emergency Command Center</span> <span className="text-slate-400 font-bold">+977-1-4200105</span></li>
                <li className="flex justify-between"><span>Flood Forecasting Toll-free Line</span> <span className="text-blue-400 font-bold">1149</span></li>
                <li className="flex justify-between"><span>Red Cross Crisis Center Nepal</span> <span className="text-slate-400 font-bold">+977-1-4284144</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* COLUMN 3: PROVINCIAL MAP, CHECKLIST, CHAT */}
        <div className="flex flex-col gap-6" id="column-telemetry-canvas">
          
          {/* Section: Nepal Interactive Telemetry Map */}
          <NepalMap 
            selectedProvince={selectedProvince} 
            onSelectProvince={setSelectedProvince} 
            sensors={sensors}
            onRefreshSensors={fetchSensors}
            loadingSensors={loadingSensors}
          />

          {/* Section: Survival checklist */}
          <SurvivalChecklist />

          {/* Section: Dynamic Chatbot Counselor */}
          <SurvivalChat />

        </div>

      </main>

      {/* FOOTER SYSTEM PERFORMANCE STATS */}
      <footer className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6" id="app-footer">
        <div className="flex flex-wrap gap-12">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40 mb-2">Live Satellite Relay Flow</div>
            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="px-2 py-1 bg-white/5 border border-white/10 text-white/80">COMMUNITY PORTAL</span>
              <span className="text-orange-500 font-bold">→</span>
              <span className="px-2 py-1 bg-white/5 border border-white/10 text-white/80">NODE.JS API SERVER</span>
              <span className="text-orange-500 font-bold">→</span>
              <span className="px-2 py-1 bg-orange-600/10 border border-orange-500/20 text-orange-400 font-bold">GEMINI AI RECON</span>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40 mb-2">TELEMETRY POLLING STATUS</div>
            <div className="text-sm font-mono text-white/80 flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-500 animate-pulse" />
              SATELLITE ACTIVE NETWORK 
              <span className="text-emerald-500 font-bold">[ONLINE]</span>
            </div>
          </div>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[9px] font-mono text-white/30 uppercase mt-1">
            Build Command Core v1.0.4 • All Rights Reserved for Safe Nepal Emergency System • SNIRS
          </p>
        </div>
      </footer>
    </div>
  );
}
