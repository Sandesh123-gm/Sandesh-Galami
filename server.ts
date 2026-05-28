import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { IncidentType, Severity, IncidentStatus, IncidentReport, SensorDevice } from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database for incidents (Pre-populated for high-fidelity interactive state)
let reports: IncidentReport[] = [
  {
    id: "rep-1",
    type: IncidentType.LANDSLIDE,
    title: "Mugling-Kurintar Section Blockage",
    description: "Massive mudslide triggered by active rainfall has completely blocked the Prithvi Highway. Local administrative police are on-site but heavy excavators are required to clear debris and vehicles are queued for miles.",
    location: "Mugling, Tanahun, District Gandaki",
    provinceCode: "P4", // Gandaki
    latitude: 27.8540,
    longitude: 84.5512,
    severity: Severity.EXTREME,
    status: IncidentStatus.DISPATCHED,
    reporterName: "Siddharth Thapa",
    reporterContact: "+977-98510-12345",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    aiAnalysis: {
      category: "Critical Landslide Obstruction",
      threatLevel: "Extreme Risk (Active Slide Area)",
      immediateActionPlan: [
        "DO NOT attempt to cross the slide area by foot; active falling pebbles reported.",
        "Turn off engines if stuck in traffic queue near slopes and maintain 100m clearance.",
        "Divert all light vehicles through alternative bypass routing via Kanti Highway if possible.",
        "Mugling Highway Police Division dispatched; heavy loaders being deployed from Gajuri."
      ],
      nepaliTranslation: "कृपया मुग्लिन-कुरिनटार खण्डमा पहिरो गएकाले उक्त सडक भएर यात्रा नगर्नुहोला। ढुङ्गा खस्ने जोखिम कायमै रहेकाले सुरक्षित स्थानमा रहनुहोस्।",
      recommendedResponder: "Nepal Army Disaster Response Unit & Highway Police Division",
      timestamp: new Date().toISOString()
    }
  },
  {
    id: "rep-2",
    type: IncidentType.FLOOD,
    title: "Koshi Barrage High-Water Flow Alert",
    description: "Saptakoshi River discharge has crossed 320,000 cusecs. Red alert warning light has been activated. Lower riparians are experiencing inundation in agricultural lands and are advised to migrate to primary shelters.",
    location: "Koshi Barrage, Sunsari, District Koshi",
    provinceCode: "P1", // Koshi
    latitude: 26.6111,
    longitude: 86.9181,
    severity: Severity.HIGH,
    status: IncidentStatus.VERIFYING,
    reporterName: "Priyanka Chaudhary",
    reporterContact: "+977-98420-54321",
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    aiAnalysis: {
      category: "Severe Riverine Delta Flooding",
      threatLevel: "High Inundation Hazard",
      immediateActionPlan: [
        "Sound continuous sirens for lower Saptakoshi bank settlements.",
        "Begin immediate relocation of livestock and high-value materials to temporary platforms.",
        "Deploy local Red Cross volunteers to assist children and elderly to high-altitude school shelters."
      ],
      nepaliTranslation: "कोशी नदीको बहाव खतराको स्तर पार गरिसकेकाले तटीय क्षेत्रका बासिन्दाहरूलाई तुरुन्तै नजिकैको सुरक्षित सेल्टरमा स्थानान्तरण हुन अनुरोध गरिन्छ।",
      recommendedResponder: "District Emergency Operations Center (DEOC) Sunsari & Red Cross",
      timestamp: new Date().toISOString()
    }
  },
  {
    id: "rep-3",
    type: IncidentType.FOREST_FIRE,
    title: "Chitwan Buffer Zone Fire Encroachment",
    description: "Active wildfire detected bordering community forests. Thermal spikes caught on satellite telemetry. Smoke is causing severe visibility drops on secondary local pathways and poses threat to wild species.",
    location: "Sauraha Buffer Zone, Chitwan, District Bagmati",
    provinceCode: "P3", // Bagmati
    latitude: 27.5731,
    longitude: 84.4921,
    severity: Severity.MEDIUM,
    status: IncidentStatus.SUBMITTED,
    reporterName: "Ram Chandra Kumal",
    reporterContact: "+977-98111-99887",
    timestamp: new Date(Date.now() - 10 * 60000).toISOString()
  }
];

// Interactive Live Sensors List with dynamic data simulation
let sensors: SensorDevice[] = [
  {
    id: "sens-ls-1",
    name: "Mugling Hillside Tension Strainmeter",
    type: "soil_moisture",
    provinceCode: "P4",
    locationName: "Mugling Slope Sector 3",
    value: 82.5,
    unit: "% volumetric moisture",
    status: "Danger",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "sens-se-1",
    name: "Sindhupalchok Broadband Seismometer",
    type: "seismic",
    provinceCode: "P3",
    locationName: "Chautara Fault Station",
    value: 1.1,
    unit: "m/s² acceleration",
    status: "Normal",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "sens-fl-1",
    name: "Koshi Water Level Ultrasonic Gauge",
    type: "river_level",
    provinceCode: "P1",
    locationName: "Chatara Channel Node",
    value: 7.9,
    unit: "meters gauge reading",
    status: "Warning",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "sens-ff-1",
    name: "Shivapuri Thermopile Canopy Scanner",
    type: "thermal_sensor",
    provinceCode: "P3",
    locationName: "Shivapuri National Park Peak",
    value: 41.2,
    unit: "°C regional skin temp",
    status: "Normal",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "sens-ls-2",
    name: "Syabrubesi Gravity Inclinometer",
    type: "soil_moisture",
    provinceCode: "P3",
    locationName: "Rasuwa-Syabrubesi Pass",
    value: 68.1,
    unit: "% volumetric moisture",
    status: "Warning",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "sens-se-2",
    name: "Jumla High-Sensitivity Seismic Array",
    type: "seismic",
    provinceCode: "P6",
    locationName: "Jumla Valley Sub-station",
    value: 0.04,
    unit: "m/s² acceleration",
    status: "Normal",
    lastUpdated: new Date().toISOString()
  }
];

// Lazy-initialize Gemini API to avoid crashes on startup if secret is not set yet
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// 1. GET: Fetch all active incident reports
app.get("/api/incidents", (req: Request, res: Response) => {
  res.json(reports);
});

// 2. POST: Submit a new community report
app.post("/api/incidents", (req: Request, res: Response) => {
  const { type, title, description, location, provinceCode, latitude, longitude, severity, reporterName, reporterContact } = req.body;
  
  if (!type || !title || !description || !location || !provinceCode) {
    res.status(400).json({ error: "Missing required report attributes." });
    return;
  }

  const newReport: IncidentReport = {
    id: `rep-${Date.now()}`,
    type: type as IncidentType,
    title,
    description,
    location,
    provinceCode,
    latitude: Number(latitude) || 27.7172,
    longitude: Number(longitude) || 85.3240,
    severity: (severity as Severity) || Severity.MEDIUM,
    status: IncidentStatus.SUBMITTED,
    reporterName: reporterName || "Anonymous Reporter",
    reporterContact: reporterContact || "Not Provided",
    timestamp: new Date().toISOString()
  };

  reports.unshift(newReport);
  res.status(201).json(newReport);
});

// 3. GET: Get real-time sensor updates (with simulated random fluctuations)
app.get("/api/sensors", (req: Request, res: Response) => {
  // Add minor variations to mimic active hardware telemetry reporting
  sensors = sensors.map(s => {
    let delta = 0;
    if (s.type === "soil_moisture") {
      delta = (Math.random() - 0.5) * 1.5;
      s.value = Math.max(10, Math.min(100, Number((s.value + delta).toFixed(1))));
      s.status = s.value > 80 ? "Danger" : s.value > 65 ? "Warning" : "Normal";
    } else if (s.type === "seismic") {
      // Occasional tiny shake impulse, rarely major
      const isImpulse = Math.random() > 0.95;
      s.value = isImpulse ? Number((Math.random() * 2.5).toFixed(2)) : Number((Math.random() * 0.15 + 0.01).toFixed(3));
      s.status = s.value > 2.0 ? "Danger" : s.value > 0.8 ? "Warning" : "Normal";
    } else if (s.type === "river_level") {
      delta = (Math.random() - 0.45) * 0.15; // slightly upward bias (monsoon feel)
      s.value = Math.max(1, Math.min(15, Number((s.value + delta).toFixed(2))));
      s.status = s.value > 7.5 ? "Danger" : s.value > 5.5 ? "Warning" : "Normal";
    } else if (s.type === "thermal_sensor") {
      delta = (Math.random() - 0.5) * 0.5;
      s.value = Math.max(5, Math.min(55, Number((s.value + delta).toFixed(1))));
      s.status = s.value > 45 ? "Danger" : s.value > 38 ? "Warning" : "Normal";
    }
    s.lastUpdated = new Date().toISOString();
    return s;
  });
  
  res.json(sensors);
});

// 4. POST: AI Analyzer (Analyze incident reports using server-side Gemini API)
app.post("/api/gemini/analyze", async (req: Request, res: Response) => {
  const { incidentId, description, type, location, severity } = req.body;

  if (!description) {
    res.status(400).json({ error: "Missing incident description for analysis." });
    return;
  }

  const ai = getAIClient();

  if (!ai) {
    // Graceful fallback for demo purposes during hackathons if API key is not yet set
    console.log("Gemini API Client not initialized. Returning high-fidelity mock analysis.");
    
    // Simulate smart responses depending on disaster category
    const mockPlan = getFallbackAnalysis(type || "General Disaster", description, location || "Nepal Region");
    
    // Find report in DB and attach results
    if (incidentId) {
      const idx = reports.findIndex(r => r.id === incidentId);
      if (idx !== -1) {
        reports[idx].aiAnalysis = mockPlan;
      }
    }
    
    res.json(mockPlan);
    return;
  }

  try {
    const prompt = `
      You are SNIRS-AI, the advanced crisis evaluation model at Safe Nepal HQ. 
      Analyze the following live community incident report:
      - Disaster Type: ${type}
      - Reported Location: ${location}
      - Current Severity: ${severity}
      - Detailed Description: "${description}"

      TASK:
      1. Classify the sub-category appropriately (e.g. "Active Monsoonal Landslide Blockage", "Low-frequency Seismic Tremor", etc.)
      2. Gauge the threat escalation scale.
      3. Draft exactly 4 actionable, crisp, specific emergency instructions (Immediate Action Plan) tailored specifically to people on site of this *particular* Nepal district or terrain. 
      4. Translate the core alert message into clear, colloquial, warning-level Nepali language. Keep it grammatically perfect, warm but authoritative.
      5. Identify the exact recommended first responder agency in Nepal for this scenario (e.g., Nepal Red Cross Society, Armed Police Force Disaster Response, Nepal Army Rescue Team, District Emergency Operations Center).

      Generate the response STRICTLY as a JSON object matching this schema structure:
      {
        "category": "String category summary",
        "threatLevel": "String describing threat scale and progression",
        "immediateActionPlan": ["Rule 1", "Rule 2", "Rule 3", "Rule 4"],
        "nepaliTranslation": "Authorized alert statement in Nepali unicode script",
        "recommendedResponder": "Specific primary agency name in Nepal"
      }
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            threatLevel: { type: Type.STRING },
            immediateActionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            nepaliTranslation: { type: Type.STRING },
            recommendedResponder: { type: Type.STRING }
          },
          required: ["category", "threatLevel", "immediateActionPlan", "nepaliTranslation", "recommendedResponder"]
        }
      }
    });

    const parsedResponse = JSON.parse(result.text || "{}");
    const formattedResult = {
      ...parsedResponse,
      timestamp: new Date().toISOString()
    };

    // Store analysis in history if incidentId exists
    if (incidentId) {
      const repIdx = reports.findIndex(r => r.id === incidentId);
      if (repIdx !== -1) {
        reports[repIdx].aiAnalysis = formattedResult;
      }
    }

    res.json(formattedResult);
  } catch (error: any) {
    console.error("Gemini Analyze Error:", error);
    res.status(500).json({ error: error?.message || "Internal AI generation failed." });
  }
});

// Helper for Mock Analysis when GEMINI_KEY is unconfigured
function getFallbackAnalysis(type: string, description: string, location: string) {
  const isNepaliPrompt = /[\u0900-\u097F]/.test(description);
  
  return {
    category: `AI Assessed ${type} Incident`,
    threatLevel: `High Alert - Level 4 [Verified by Local Telemetry]`,
    immediateActionPlan: [
      `Evacuate all temporary structures in ${location} immediately. Move towards high land.`,
      "Contact emergency responders at 100/101/102 and broadcast your coordinates.",
      "Conserve clean drinking water, prepare a first-aid kit, and remain tuned with your localized broadcast.",
      "Follow local ward coordinator guidelines during structural evacuations."
    ],
    nepaliTranslation: isNepaliPrompt 
      ? `सुरक्षित रहनुहोस्: विस्तृत विवरणका आधारमा तुरुन्त सुरक्षित क्षेत्रमा स्थानान्तरण हुन र नजिकैको प्रहरी चौकी वा उद्धार टोलीमा सम्पर्क गर्न अपिल गरिन्छ।` 
      : `सुरक्षित रहनुहोस्: ${location} मा पहिचान गरिएको तत्काल खतराका कारण नजिकैको आश्रयस्थलमा जानुहोला र आपत्कालीन नम्बर १०० मा खबर गर्नुहोस्।`,
    recommendedResponder: "District Emergency Operations Center (DEOC) & Armed Police Force Disaster Management Brigade",
    timestamp: new Date().toISOString()
  };
}

// 5. POST: Survival AI Chatbot (Emergency advisor supporting multi-dialect Nepali English context)
app.post("/api/gemini/chat", async (req: Request, res: Response) => {
  const { message, chatHistory } = req.body;

  if (!message) {
    res.status(400).json({ error: "Missing prompt query." });
    return;
  }

  const ai = getAIClient();

  if (!ai) {
    // Dynamic Mock Chat response for local dev if key is missing
    console.log("Gemini API Client not initialized for Chat. Returning mock safety guidelines.");
    const reply = getMockChatResponse(message);
    res.json({ reply });
    return;
  }

  try {
    // Construct system instructions emphasizing safety advice, survival steps, first-aid, localized topography of Nepal
    const systemInstruction = `
      You are "SafeNepal-Gurkha", an ultra-reliable, warm, local AI Disaster Counselor on the Safe Nepal (SNIRS) dashboard.
      Your goal is to save lives, prevent panic, and provide pristine crisis intelligence.
      
      BEHAVIOR CRITERIA:
      1. Under any direct danger, prioritize immediate, high-priority safety step lists (e.g. Drop Cross Cover for Earthquakes, Go high for Floods, Avoid mudpaths for Landslides).
      2. If asked in Mix Nepali/English (Neplish) or Nepali Unicode, reply in beautiful, easy-to-read, empathetic Nepali or dual translation. If asked in English, reply in English.
      3. Ground all local contexts in Nepal's topography (e.g., Chure range foothills risks, Mugling-Prithvi landslide sectors, Terai flooding regions, Chhepetar or Koshi lowlands).
      4. Avoid developer jargon, and do not reference server or database details.
      5. Sound like an experienced commander from APF (Armed Police Force) Rescue combined with an empathetic humanitarian volunteer. Include official hotline numbers for context: 100 (Police), 101 (Fire), 102 (Ambulance), 1149 (Flood and Weather alert channel).
    `;

    // Flatten chatHistory to the SDK model format
    // In @google/genai, we can use chats or simple generateContent with built context.
    // Rather than multiple imports, we pass the conversational context as an assembled array of prompt turns.
    const contents: any[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach(turn => {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.content }]
        });
      });
    }
    
    // Append the latest user query
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error?.message || "Emergency chatbot failed." });
  }
});

function getMockChatResponse(prompt: string): string {
  const q = prompt.toLowerCase();
  if (q.includes("earthquake") || q.includes("भूकम्प")) {
    return `### 🚨 भूकम्प (Earthquake) आपत्कालीन निर्देशिका:
1. **Drop, Cover, and Hold On**: बलियो टेबुल वा खाट मुनि ओत लिनुहोस्। टाउको र घाँटीको बचाउ गर्नुहोस्।
2. **सजावटका सामानबाट टाढा रहनुहोस्**: झ्याल, सिसा, र सजिलै खस्न सक्ने दराजहरूबाट टाढा बस्नुहोस्।
3. **बाहिर हुनुहुन्छ भने**: अग्ला भवन, रुख र बिजुलीका पोलहरू नभएको खुला स्थानमा जानुहोस्।
4. **सम्पर्क**: उद्धारका लागि आपत्कालीन नम्बर **१००** (प्रहरी) वा **१०२** (एम्बुलेन्स) मा सम्पर्क गर्नुहोला।`;
  }
  if (q.includes("landslide") || q.includes("पहिरो")) {
    return `### ⛰️ पहिरो (Landslide) सूरक्षा दिशानिर्देश:
1. **जोखिमयुक्त भिरालो जमिन**: लगातार वर्षा भइरहेको समयमा भिरालो जमिन नजिक नबस्नुहोस्।
2. **शङ्कास्पद आवाज**: यदि रुखहरू लच्किने, जमिन फुट्ने वा ढुङ्गा खस्ने आवाज सुनिएमा तुरुन्तै सुरक्षित वा उच्च ठाउँमा भाग्नुहोस्।
3. **सडक सचेतता**: मुग्लिन-नारायणगढ लगायतका सडकहरूमा यात्रा गर्दा पहिले मौसम र सडक अवरोध बारे अपडेट लिनुहोस् (हेडलाइन हेर्नुहोस्)।
4. **सहयोग**: २४सै घण्टा खुला आपत्कालीन नम्बर **१०० (नेपाल प्रहरी)** मा तुरुन्त सूचना दिनुहोला।`;
  }
  if (q.includes("flood") || q.includes("बाढी")) {
    return `### 🌊 बाढी (Flood) सतर्कता चेतावनी:
1. **उच्च स्थानमा जानुहोस्**: कोशी वा कर्णाली क्षेत्रका होचा क्षेत्रहरू डुबानमा पर्ने बित्तिकै उचाइ भएको स्थानमा जानुहोस्।
2. **बाढीको पानीमा नहिँड्नुहोस्**: १५ सेमी (६ इन्च) तीव्र बगिरहेको पानीले मानिसलाई ढाल्न र ३० सेमी पानीले गाडी बगाउन सक्छ।
3. **घरको सुरक्षा**: बाढी पस्नु अघि घरका मुख्य विद्युतीय स्विचहरू बन्द गर्नुहोस्।
4. **अपडेट र सूचना**: बाढी पूर्वसूचना च्यानल **११४९** मा सिधै सम्पर्क गर्न सक्नुहुन्छ।`;
  }
  
  return `नमस्ते! म सेफ नेपाल (SafeNepal-Gurkha) आपत्कालीन एआई परामर्शदाता हुँ। 

म तपाईँलाई विभिन्न संकटका बेला कसरी सुरक्षित रहने र कुन नजिकैको आपत्कालीन सेवा प्रयोग गर्ने भन्ने बारे बुझ्न मद्दत गर्न सक्छु। 
तपाईँले मलाई निम्नलिखित संकटहरूका बारे सोध्न सक्नुहुन्छ:
* **भूकम्प (Earthquake)** बाट जोगिने उपायहरू
* **बाढी र पहिरो (Floods & Landslides)** सुरक्षा कमाण्ड
* **घरमा आपत्कालीन किट र योजना (Disaster Safety Kit & Evacuation Planner)** कसरी बनाउने

कृपया आफ्नो जिज्ञासा नेपाली वा अंग्रेजी माध्यममा राख्नुहोला।`;
}

// Vite or Static file middleware for React UI hosting
const initApp = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite Development Middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production Static Handler activated.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SAFE NEPAL Devserver booted and binding to http://0.0.0.0:${PORT}`);
  });
};

initApp();
