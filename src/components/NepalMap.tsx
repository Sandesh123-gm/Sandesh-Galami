import { useMemo } from "react";
import { SensorDevice } from "../types";
import { Trees, RefreshCw, Layers, Flame, ShieldAlert, Navigation } from "lucide-react";

interface ProvinceData {
  code: string;
  name: string;
  hq: string; // Headquarters
  riskLevel: "Low" | "Medium" | "High" | "Extreme";
  terrain: string;
  color: string;
}

const PROVINCES: ProvinceData[] = [
  { code: "P1", name: "Koshi Province", hq: "Biratnagar", riskLevel: "High", terrain: "Saptakoshi Plains / Mt. Everest Range", color: "hover:bg-red-900/20 border-red-500/20 text-red-400 bg-red-950/5" },
  { code: "P2", name: "Madhesh Province", hq: "Janakpur", riskLevel: "Medium", terrain: "Terai Agricultural Plains", color: "hover:bg-amber-900/20 border-amber-500/20 text-amber-400 bg-amber-950/5" },
  { code: "P3", name: "Bagmati Province", hq: "Hetauda", riskLevel: "High", terrain: "Urban Foothills / fault lanes", color: "hover:bg-orange-900/20 border-orange-500/20 text-orange-400 bg-orange-950/5" },
  { code: "P4", name: "Gandaki Province", hq: "Pokhara", riskLevel: "Extreme", terrain: "Trishuli Gorge / Alpine slopes", color: "hover:bg-rose-900/20 border-rose-500/20 text-rose-400 bg-rose-950/5" },
  { code: "P5", name: "Lumbini Province", hq: "Deukhuri", riskLevel: "Medium", terrain: "Chure Forests / Plains", color: "hover:bg-amber-900/20 border-amber-500/20 text-amber-400 bg-amber-950/5" },
  { code: "P6", name: "Karnali Province", hq: "Birendranagar", riskLevel: "High", terrain: "Tectonic Valleys / Arid range", color: "hover:bg-red-900/20 border-red-500/20 text-red-400 bg-red-950/5" },
  { code: "P7", name: "Sudurpashchim Province", hq: "Godawari", riskLevel: "Medium", terrain: "Far-West high mountains", color: "hover:bg-orange-900/20 border-orange-500/20 text-orange-400 bg-orange-950/5" },
];

interface NepalMapProps {
  selectedProvince: string | null;
  onSelectProvince: (code: string | null) => void;
  sensors: SensorDevice[];
  onRefreshSensors: () => void;
  loadingSensors: boolean;
}

export default function NepalMap({ selectedProvince, onSelectProvince, sensors, onRefreshSensors, loadingSensors }: NepalMapProps) {
  
  const alertsCount = useMemo(() => {
    return sensors.filter(s => s.status !== "Normal").length;
  }, [sensors]);

  return (
    <div className="bg-[#111111] border border-white/10 rounded-none p-6 flex flex-col h-full relative group" id="nepal-map-card">
      <div className="absolute top-0 right-0 p-4 font-mono font-black text-6xl text-white/5 select-none pointer-events-none">
        MAP
      </div>

      <div className="border-b-2 border-orange-600 pb-3 mb-4 flex items-center justify-between z-10">
        <div>
          <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-orange-600" />
            Provincial Hazard Maps & Telemetry
          </h2>
          <p className="text-[10px] font-mono text-white/40 tracking-wider">CLICK SENSORS GRID TO DRILL DOWN GEOGRAPHIC FILTERS</p>
        </div>
        <div className="flex items-center gap-2">
          {alertsCount > 0 && (
            <span className="bg-red-950/35 border border-red-500/40 text-[9px] text-red-500 font-bold px-2.5 py-1 rounded-none flex items-center gap-1 font-mono uppercase animate-pulse">
              <ShieldAlert className="h-3 w-3" />
              {alertsCount} Warnings Active
            </span>
          )}
          <button 
            onClick={onRefreshSensors}
            disabled={loadingSensors}
            className="p-1.5 bg-black hover:bg-white/5 border border-white/10 text-white/40 hover:text-orange-500 transition-colors cursor-pointer"
            title="Refresh active sensor network grid"
          >
            <RefreshCw className={`h-4 w-4 ${loadingSensors ? "animate-spin text-orange-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Styled Interactive SVG-like Map Alignment Framework */}
      <div className="relative border border-white/10 bg-black p-4 flex flex-col justify-between items-center overflow-hidden h-[240px]">
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-[0.05] border-collapse z-0">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="border border-white"></div>
          ))}
        </div>

        {/* Compass & General Scale Annotations */}
        <div className="absolute top-2 left-2 text-[8px] text-white/30 font-mono z-10 flex flex-col">
          <span>COORDINATES: NEPAL ZONE</span>
          <span>LAT: 26.3N - 30.5N</span>
          <span>LNG: 80.0E - 88.2E</span>
        </div>

        {/* Dynamic Nepal West-to-East Graphical Provinces Array */}
        <div className="w-full h-full flex flex-col justify-center items-center gap-2 py-2 z-10 relative">
          
          <div className="grid grid-cols-7 gap-2 w-full max-w-lg min-h-[90px] px-1">
            {PROVINCES.map((prov) => {
              const isSelected = selectedProvince === prov.code;
              const provSensors = sensors.filter(s => s.provinceCode === prov.code);
              const hasDangerAlert = provSensors.some(s => s.status === "Danger");
              const hasWarningAlert = provSensors.some(s => s.status === "Warning");

              return (
                <button
                  key={prov.code}
                  onClick={() => onSelectProvince(isSelected ? null : prov.code)}
                  className={`relative flex flex-col items-center justify-between p-2 rounded-none border text-center transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-orange-600 border-orange-600 text-black shadow-lg ring-1 ring-white scale-102"
                      : prov.color
                  }`}
                  id={`btn-province-${prov.code}`}
                >
                  {/* Alert Dot Indicator */}
                  {hasDangerAlert && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border border-black"></span>
                    </span>
                  )}
                  {!hasDangerAlert && hasWarningAlert && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 border border-black"></span>
                    </span>
                  )}

                  <span className={`font-mono text-[8px] font-bold ${isSelected ? "text-black/60" : "text-white/40"}`}>PROV.</span>
                  <span className={`font-black text-[14px] leading-tight tracking-tighter mt-1 ${isSelected ? "text-black" : "text-white"}`}>
                    {prov.code === "P1" ? "Koshi" : 
                     prov.code === "P2" ? "Mdhs" :
                     prov.code === "P3" ? "Bgmt" : 
                     prov.code === "P4" ? "Gndk" :
                     prov.code === "P5" ? "Lmbn" :
                     prov.code === "P6" ? "Krnl" : "Sdrp"}
                  </span>

                  <span className={`text-[8px] font-mono px-1 py-0.2 mt-2 font-bold ${
                    isSelected 
                      ? "bg-black text-orange-500" 
                      : prov.riskLevel === "Extreme" ? "bg-red-950 text-red-400 border border-red-500/20" : "bg-white/5 text-white/60"
                  }`}>
                    {prov.riskLevel}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 mt-2 justify-center text-[9px] font-mono text-white/50">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-none bg-red-600 block"></span> RED ALERT</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-none bg-amber-500 block"></span> WARNING</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-none bg-emerald-500 block"></span> SECURE</span>
          </div>

        </div>

        {/* Clear Filter Prompt if province is active */}
        {selectedProvince && (
          <button 
            onClick={() => onSelectProvince(null)}
            className="absolute bottom-2 right-2 bg-orange-600 hover:bg-white text-black text-[10px] font-black px-3 py-1 font-mono transition-colors cursor-pointer"
          >
            CLEAR REGIONAL FILTER [X]
          </button>
        )}
      </div>

      {/* Real-time Telemetry Feeds list matching current selection */}
      <div className="mt-5 flex-grow overflow-y-auto max-h-[190px]">
        <h3 className="text-[10px] font-black text-white/40 tracking-widest uppercase mb-2 font-mono">
          {selectedProvince 
            ? `TELEMETRY GRID: ${PROVINCES.find(p => p.code === selectedProvince)?.name.toUpperCase()}` 
            : "ACTIVE SENSOR TELEMETRY"}
        </h3>

        <div className="space-y-1.5">
          {sensors
            .filter(sensor => !selectedProvince || sensor.provinceCode === selectedProvince)
            .map(sensor => {
              const dateObj = new Date(sensor.lastUpdated);
              const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              
              return (
                <div 
                  key={sensor.id}
                  className="flex items-center justify-between p-2.5 bg-black border border-white/5 hover:border-white/10 transition-all font-mono"
                  id={`sensor-${sensor.id}`}
                >
                  <div className="flex items-center gap-2">
                    {sensor.type === "soil_moisture" && (
                      <div className="p-1.5 bg-sky-950/20 text-sky-400 border border-sky-500/10">
                        <Trees className="h-4 w-4" />
                      </div>
                    )}
                    {sensor.type === "seismic" && (
                      <div className="p-1.5 bg-rose-950/20 text-rose-400 border border-rose-500/10 animate-pulse">
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                    )}
                    {sensor.type === "river_level" && (
                      <div className="p-1.5 bg-blue-950/20 text-blue-400 border border-blue-500/10">
                        <Layers className="h-4 w-4" />
                      </div>
                    )}
                    {sensor.type === "thermal_sensor" && (
                      <div className="p-1.5 bg-amber-950/20 text-amber-400 border border-amber-500/10">
                        <Flame className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{sensor.name}</h4>
                      <p className="text-[9px] text-white/40">
                        {sensor.locationName} • ST_LNK: {formattedTime}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="text-xs font-bold text-white">
                      {sensor.value} <span className="text-[8px] font-normal text-white/40">{sensor.unit.split(" ")[0]}</span>
                    </span>
                    <span className={`text-[8px] font-black px-1.5 py-0.2 mt-1 ${
                      sensor.status === "Danger" 
                        ? "bg-red-950 border border-red-500/30 text-red-400 animate-pulse" 
                        : sensor.status === "Warning" 
                          ? "bg-amber-950 border border-amber-500/30 text-amber-400" 
                          : "bg-emerald-950 border border-emerald-500/30 text-emerald-400"
                    }`}>
                      {sensor.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
