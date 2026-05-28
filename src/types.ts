export enum IncidentType {
  LANDSLIDE = "Landslide",
  EARTHQUAKE = "Earthquake",
  FLOOD = "Flood",
  FOREST_FIRE = "Forest Fire",
  ROAD_ACCIDENT = "Road Accident"
}

export enum Severity {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  EXTREME = "Extreme"
}

export enum IncidentStatus {
  SUBMITTED = "Submitted",
  VERIFYING = "Verifying",
  DISPATCHED = "Dispatched",
  RESOLVED = "Resolved"
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface AIAnalysisResult {
  category: string;
  threatLevel: string;
  immediateActionPlan: string[];
  nepaliTranslation: string;
  recommendedResponder: string;
  timestamp: string;
}

export interface IncidentReport {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  location: string;
  provinceCode: string; // "P1" to "P7"
  latitude: number;
  longitude: number;
  severity: Severity;
  status: IncidentStatus;
  reporterName: string;
  reporterContact: string;
  timestamp: string;
  aiAnalysis?: AIAnalysisResult;
}

export interface SensorDevice {
  id: string;
  name: string;
  type: "soil_moisture" | "seismic" | "river_level" | "thermal_sensor";
  provinceCode: string;
  locationName: string;
  value: number;
  unit: string;
  status: "Normal" | "Warning" | "Danger";
  lastUpdated: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  active: boolean;
}

export interface CrisisHotline {
  agency: string;
  phone: string;
  location: string;
  role: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}
