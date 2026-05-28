import React, { useState } from "react";
import { IncidentType, Severity } from "../types";
import { Send, MapPin, CheckCircle, ShieldAlert } from "lucide-react";

interface ReportFormProps {
  onSubmitSuccess: () => void;
}

export default function ReportForm({ onSubmitSuccess }: ReportFormProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<IncidentType>(IncidentType.LANDSLIDE);
  const [severity, setSeverity] = useState<Severity>(Severity.MEDIUM);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [provinceCode, setProvinceCode] = useState("P3");
  const [latitude, setLatitude] = useState("27.7172");
  const [longitude, setLongitude] = useState("85.3240");
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(4));
          setLongitude(position.coords.longitude.toFixed(4));
          setLocation(`GPS Coordinates (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
        },
        (err) => {
          console.error("Error getting geolocation: ", err);
          setError("Frame geolocation permission required. Modify coordinates manually.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) {
      setError("Please fill in high-priority fields: Title, Location, and Description.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          description,
          location,
          provinceCode,
          latitude: parseFloat(latitude) || 27.7172,
          longitude: parseFloat(longitude) || 85.3240,
          severity,
          reporterName: reporterName || "Anonymous Reporter",
          reporterContact: reporterContact || "Not Provided",
        }),
      });

      if (!response.ok) {
        throw new Error("Failure processing incident transmission.");
      }

      setSuccess(true);
      setTitle("");
      setDescription("");
      setLocation("");
      setReporterName("");
      setReporterContact("");
      
      setTimeout(() => {
        setSuccess(false);
        onSubmitSuccess();
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-white/10 rounded-none p-6 relative overflow-hidden group" id="report-incident-form">
      <div className="absolute top-0 right-0 p-4 font-mono font-black text-6xl text-white/5 select-none pointer-events-none">
        SOS
      </div>
      
      <div className="border-b-2 border-orange-600 pb-3 mb-6">
        <h2 className="text-2xl font-black uppercase text-white tracking-tight">Report Incident</h2>
        <p className="text-xs font-mono text-white/40 tracking-wider">SECURE EMERGENCY BROADCAST CHANNEL</p>
      </div>

      {success ? (
        <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-4 text-emerald-400 font-mono text-sm leading-relaxed mb-4">
          <div className="flex items-center gap-2 font-bold uppercase mb-1">
            <CheckCircle className="h-5 w-5" />
            TRANSMISSION SUCESSFUL
          </div>
          Your distress/hazard notice has been logged. Automated LLM threat classifiers and dispatch units have been notified.
        </div>
      ) : null}

      {error ? (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 text-red-400 font-mono text-xs leading-relaxed mb-4 flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono tracking-widest text-white/50 uppercase mb-1">Incident Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as IncidentType)}
              className="w-full bg-black border border-white/20 rounded-none text-white font-mono text-xs p-2.5 focus:border-orange-500 focus:outline-none"
            >
              <option value={IncidentType.LANDSLIDE}>🏔️ {IncidentType.LANDSLIDE}</option>
              <option value={IncidentType.EARTHQUAKE}>🚨 {IncidentType.EARTHQUAKE}</option>
              <option value={IncidentType.FLOOD}>🌊 {IncidentType.FLOOD}</option>
              <option value={IncidentType.FOREST_FIRE}>🔥 {IncidentType.FOREST_FIRE}</option>
              <option value={IncidentType.ROAD_ACCIDENT}>🚧 {IncidentType.ROAD_ACCIDENT}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono tracking-widest text-white/50 uppercase mb-1">Assessed Severity *</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full bg-black border border-white/20 rounded-none text-white font-mono text-xs p-2.5 focus:border-orange-500 focus:outline-none"
            >
              <option value={Severity.LOW}>🟢 Low Priority</option>
              <option value={Severity.MEDIUM}>🟡 Medium Severity</option>
              <option value={Severity.HIGH}>🟠 High Hazard</option>
              <option value={Severity.EXTREME}>🔴 EXTREME THREAT</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono tracking-widest text-white/50 uppercase mb-1">Disaster Headline / Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Heavy Rainfall Landslide near Malekhu"
            className="w-full bg-black border border-white/20 rounded-none text-white text-xs p-2.5 focus:border-orange-500 focus:outline-none placeholder-white/30"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono tracking-widest text-white/50 uppercase mb-1">Geographic Province *</label>
            <select
              value={provinceCode}
              onChange={(e) => setProvinceCode(e.target.value)}
              className="w-full bg-black border border-white/20 rounded-none text-white font-mono text-xs p-2.5 focus:border-orange-500 focus:outline-none"
            >
              <option value="P1">Province 1 (Koshi)</option>
              <option value="P2">Province 2 (Madhesh)</option>
              <option value="P3">Province 3 (Bagmati)</option>
              <option value="P4">Province 4 (Gandaki)</option>
              <option value="P5">Province 5 (Lumbini)</option>
              <option value="P6">Province 6 (Karnali)</option>
              <option value="P7">Province 7 (Sudurpashchim)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono tracking-widest text-white/50 uppercase mb-1">Specific Location / District *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Ward 4, Malekhu, Dhading"
                className="w-full bg-black border border-white/20 rounded-none text-white text-xs p-2.5 pr-10 focus:border-orange-500 focus:outline-none placeholder-white/30"
              />
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="absolute right-2 top-2 text-white/40 hover:text-orange-500 transition-colors cursor-pointer"
                title="Use Present GPS Location"
              >
                <MapPin className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono tracking-widest text-white/50 uppercase mb-1">Latitude</label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full bg-black border border-white/20 rounded-none text-white font-mono text-xs p-2 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono tracking-widest text-white/50 uppercase mb-1">Longitude</label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full bg-black border border-white/20 rounded-none text-white font-mono text-xs p-2 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono tracking-widest text-white/50 uppercase mb-1">Distress Details / Situation Description *</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the blockage, scale, volume of debris, water surges, missing individuals, block roads, etc..."
            className="w-full bg-black border border-white/20 rounded-none text-white text-xs p-2.5 focus:border-orange-500 focus:outline-none placeholder-white/30"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono tracking-widest text-white/50 uppercase mb-1">Reporter Name</label>
            <input
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-black border border-white/20 rounded-none text-white text-xs p-2 focus:border-orange-500 focus:outline-none placeholder-white/30"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono tracking-widest text-white/50 uppercase mb-1">Rescue Contact Phone</label>
            <input
              type="text"
              value={reporterContact}
              onChange={(e) => setReporterContact(e.target.value)}
              placeholder="+977-98..."
              className="w-full bg-black border border-white/20 rounded-none text-white font-mono text-xs p-2 focus:border-orange-500 focus:outline-none placeholder-white/30"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-white text-black font-black uppercase text-sm tracking-widest py-3 mt-2 transition-colors duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 rounded-none shadow-md"
        >
          <Send className="h-4 w-4" />
          {loading ? "TRANSMITTING DISTRESS UNIT..." : "TRANSMIT INCIDENT STATUS"}
        </button>
      </form>
    </div>
  );
}
