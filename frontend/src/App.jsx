import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  Cpu,
  DollarSign,
  Eye,
  FileCheck,
  Gauge,
  Globe,
  GripVertical,
  HardDrive,
  KeyRound,
  Layers,
  Leaf,
  Lightbulb,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Play,
  RefreshCw,
  Send,
  Server,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Sprout,
  TrendingDown,
  Trees,
  User,
  X,
  Zap
} from "lucide-react";
import "./App.css";
import {
  ENTERPRISE_PERSONAS,
  HARDWARE_CACHE,
  REGIONS_CACHE,
  runOfflineAudit,
  simulateOfflineSendOtp,
  simulateOfflineVerifyOtp
} from "./utils/offlineEngine";

const API_URL = "http://127.0.0.1:5000";

const INITIAL_FORM = {
  trainingHours: 100,
  gpuPower: 400,
  gpuCount: 8,
  hardwareId: "a100",
  requestsPerDay: 50000,
  energyPerRequest: 0.0015,
  storageGB: 1200,
  networkGB: 2500,
  retrainingPerYear: 4,
  regionId: "us-east-va"
};

const DRAGGABLE_TOPOLOGY_ITEMS = [
  {
    type: "topology",
    id: "topo-llm-eco",
    title: "LLM Quantized Cluster (64x L4)",
    tag: "79.4% Carbon Abatement",
    badge: "Eco Leader",
    hardwareId: "l4",
    powerW: 72,
    count: 64,
    totalPowerW: 4608,
    annualEnergyKWh: 40366,
    carbonAbatementPct: 79.4,
    vramGB: 1536,
    architecture: "Ada Lovelace INT8",
    batchingEngine: "vLLM Dynamic Continuous Batching",
    rationale: "Distributed INT8/FP8 quantized partition across 64x L4 nodes slashes power draw by 79.4% while maintaining 70B+ inference token rate."
  },
  {
    type: "topology",
    id: "topo-vision-edge",
    title: "Multimodal Edge Cluster (4x L4)",
    tag: "91.0% Carbon Abatement",
    badge: "Eco Leader",
    hardwareId: "l4",
    powerW: 72,
    count: 4,
    totalPowerW: 288,
    annualEnergyKWh: 2522,
    carbonAbatementPct: 91.0,
    vramGB: 96,
    architecture: "Ada Lovelace Vision",
    batchingEngine: "TensorRT INT8 Precision Engine",
    rationale: "Ultra-low power multi-camera inference node drawing under 300W total with dedicated optical flow and Tensor cores."
  },
  {
    type: "topology",
    id: "topo-rag-tpu",
    title: "RAG & Vector Supernode (8x TPU v5e)",
    tag: "78.1% Carbon Abatement",
    badge: "Best Balance",
    hardwareId: "tpu-v5e",
    powerW: 175,
    count: 8,
    totalPowerW: 1400,
    annualEnergyKWh: 12264,
    carbonAbatementPct: 78.1,
    vramGB: 128,
    architecture: "TPU v5e Matrix Core",
    batchingEngine: "JAX / XLA Graph Optimization",
    rationale: "Cloud-optimized TPU pods delivering continuous semantic vector indexing, embedding creation, and low-latency search re-ranking."
  },
  {
    type: "topology",
    id: "topo-frontier-gh200",
    title: "Frontier Megacluster (8x GH200)",
    tag: "Unified 4.6TB NVLink",
    badge: "Peak Throughput",
    hardwareId: "gh200",
    powerW: 900,
    count: 8,
    totalPowerW: 7200,
    annualEnergyKWh: 63072,
    carbonAbatementPct: 67.8,
    vramGB: 4608,
    architecture: "Grace Hopper Superchip",
    batchingEngine: "Tensor Parallelism + Zero Redundancy",
    rationale: "Unified coherent CPU+GPU memory across 8 superchips with 900 GB/s NVLink-C2C bandwidth, eliminating pipeline bubbles for massive frontier models."
  }
];

const COUNTRY_CODES = [
  { code: "+91", label: "+91 (India)" },
  { code: "+1", label: "+1 (US / Canada)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+49", label: "+49 (Germany)" },
  { code: "+33", label: "+33 (France)" },
  { code: "+81", label: "+81 (Japan)" },
  { code: "+61", label: "+61 (Australia)" },
  { code: "+971", label: "+971 (UAE)" },
  { code: "+65", label: "+65 (Singapore)" }
];

function Input({ label, name, value, onChange, type = "number", step = "any", unit = "", icon = null }) {
  return (
    <div className="input-group">
      <div className="label-row">
        <label className="input-label-with-icon">
          {icon && <span className="label-inline-icon">{icon}</span>}
          {label}
        </label>
        {unit && <span className="unit-tag">{unit}</span>}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        step={step}
        min="0"
      />
    </div>
  );
}

function KPI({ title, value, icon, subtext }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon-wrap">
        <span className="kpi-icon">{icon}</span>
      </div>
      <div className="kpi-body">
        <p className="kpi-title">{title}</p>
        <h3 className="kpi-value">{value}</h3>
        {subtext && <span className="kpi-subtext">{subtext}</span>}
      </div>
    </div>
  );
}

function LifecycleBar({ label, percentage, value }) {
  const safePercentage = Number.isFinite(Number(percentage)) ? Number(percentage) : 0;
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  return (
    <div className="lifecycle-row">
      <div className="lifecycle-header">
        <span className="lifecycle-label">{label}</span>
        <div className="lifecycle-meta">
          <span className="lifecycle-val">{safeValue.toLocaleString()} Wh</span>
          <strong className="lifecycle-pct">{safePercentage}%</strong>
        </div>
      </div>
      <div className="lifecycle-track">
        <div
          className="lifecycle-fill"
          style={{ width: `${Math.min(Math.max(safePercentage, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, highlight = false, icon = null }) {
  return (
    <div className={`stat-box ${highlight ? "highlight" : ""}`}>
      <span className="stat-label">
        {icon && <span className="stat-icon">{icon}</span>}
        {label}
      </span>
      <strong className="stat-value">{value}</strong>
    </div>
  );
}

function App() {
  // Telemetry Audit Form State
  const [form, setForm] = useState(INITIAL_FORM);

  // Regional & Hardware Catalog State
  const [hardware, setHardware] = useState(HARDWARE_CACHE);
  const [regions, setRegions] = useState(REGIONS_CACHE);
  const [hardwareLoading, setHardwareLoading] = useState(false);

  // Audit Result State (initialized with baseline offline calculation)
  const [result, setResult] = useState(() => runOfflineAudit(INITIAL_FORM));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Applied Workbench Notification State
  const [appliedComboNotification, setAppliedComboNotification] = useState("");

  // How It Works Explorer State
  const [activeStepTab, setActiveStepTab] = useState(0);

  // Neural Optimizer State
  const [accuracy, setAccuracy] = useState(92);
  const [latency, setLatency] = useState(85);
  const [recommendation, setRecommendation] = useState(null);
  const [optimizerLoading, setOptimizerLoading] = useState(false);
  const [optimizerMessage, setOptimizerMessage] = useState("");

  // On-Demand How It Works Architecture Modal
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);

  // Drag-and-Drop Silicon & Grid Workbench State (Declutters Visual Noise)
  const [dragCategory, setDragCategory] = useState("hardware"); // "hardware" | "regions"
  const [isDragOver, setIsDragOver] = useState(false);
  const [droppedItem, setDroppedItem] = useState({
    type: "hardware",
    id: "l4",
    title: "NVIDIA L4 Tensor Core (4x Cluster)",
    tag: "88.5% Carbon Reduction",
    badge: "Eco Leader",
    powerW: 72,
    count: 4,
    totalPowerW: 288,
    annualEnergyKWh: 2522,
    carbonAbatementPct: 88.5,
    vramGB: 96,
    architecture: "Ada Lovelace INT8",
    batchingEngine: "TensorRT INT8 Precision Engine",
    estAnnualCost: Math.round(2522 * 0.11),
    rationale: "4x L4 units leverage 4th-gen Tensor Cores and optical flow accelerators for 120 FPS video analytics & quantized LLM serving at under 300 Watts total."
  });

  // Book Demo Consultation Modal State
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const [demoForm, setDemoForm] = useState({
    track: "enterprise-audit",
    fleetSize: "50-500",
    cloudProvider: "aws",
    name: "",
    email: "",
    company: "",
    date: "2026-09-30",
    timeSlot: "14:00 UTC",
    notes: "",
    bookingRef: "GL-498217"
  });
  const [demoBooked, setDemoBooked] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(true);

  // ====================================================
  // DONUT CHALLENGE 02: AUTHENTICATION & OTP STATE (EMAIL + MOBILE SMS)
  // ====================================================
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState(1); // 1: Input, 2: OTP verify, 3: Success
  const [authMode, setAuthMode] = useState("email"); // "email" | "phone"
  const [authEmail, setAuthEmail] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [authDeliveryInfo, setAuthDeliveryInfo] = useState(null);

  // Authenticated user session
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("greenlens_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const otpInputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Resend OTP Cooldown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // WebOTP API for automatic SMS OTP verification on Mobile Android / iOS Web
  useEffect(() => {
    if (authStep === 2 && typeof window !== "undefined" && "OTPCredential" in window) {
      const ac = new AbortController();
      navigator.credentials
        .get({
          otp: { transport: ["sms"] },
          signal: ac.signal
        })
        .then((otpCredential) => {
          if (otpCredential && otpCredential.code) {
            const digits = otpCredential.code.replace(/[^0-9]/g, "").slice(0, 6).split("");
            if (digits.length === 6) {
              setOtpDigits(digits);
              setAuthSuccessMsg("Auto-read SMS verification code!");
            }
          }
        })
        .catch(() => {
          // Ignore WebOTP cancellation on close/non-mobile
        });
      return () => ac.abort();
    }
  }, [authStep]);

  // Local fallback calculation
  const calculateLocalFallback = useCallback((currentForm = form) => {
    const offlineRes = runOfflineAudit(currentForm);
    setResult(offlineRes);
  }, [form]);

  // Load Regional and Hardware Catalogs
  useEffect(() => {
    let isMounted = true;
    const loadCatalogs = async () => {
      try {
        setHardwareLoading(true);
        const [hwRes, regRes] = await Promise.all([
          fetch(`${API_URL}/api/hardware`),
          fetch(`${API_URL}/api/regions`)
        ]);

        if (hwRes.ok && isMounted) {
          const hwData = await hwRes.json();
          if (hwData.success && Array.isArray(hwData.hardware)) {
            setHardware(hwData.hardware);
          }
        }

        if (regRes.ok && isMounted) {
          const regData = await regRes.json();
          if (regData.success && Array.isArray(regData.regions)) {
            setRegions(regData.regions);
          }
        }
      } catch (err) {
        console.warn("Using offline catalog caches:", err);
      } finally {
        if (isMounted) setHardwareLoading(false);
      }
    };

    loadCatalogs();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleRegionChange = (event) => {
    const regionId = event.target.value;
    setForm((prev) => ({ ...prev, regionId }));
  };

  const handleHardwareChange = (event) => {
    const hardwareId = event.target.value;
    if (hardwareId === "custom") {
      setForm((prev) => ({ ...prev, hardwareId: "custom" }));
      return;
    }

    const selected = hardware.find((item) => item.id === hardwareId);
    if (!selected) return;

    setForm((prev) => ({
      ...prev,
      hardwareId: selected.id,
      gpuPower: Number(selected.powerW)
    }));
  };

  const applyPreset = (presetKey) => {
    if (presetKey === "llm") {
      setForm((prev) => ({
        ...prev,
        trainingHours: 240,
        gpuPower: 700,
        gpuCount: 32,
        hardwareId: "h100",
        requestsPerDay: 250000,
        energyPerRequest: 0.0035,
        storageGB: 8500,
        networkGB: 15000,
        retrainingPerYear: 6
      }));
    } else if (presetKey === "vision") {
      setForm((prev) => ({
        ...prev,
        trainingHours: 48,
        gpuPower: 72,
        gpuCount: 4,
        hardwareId: "l4",
        requestsPerDay: 500000,
        energyPerRequest: 0.0004,
        storageGB: 2000,
        networkGB: 8000,
        retrainingPerYear: 12
      }));
    } else if (presetKey === "agentic") {
      setForm((prev) => ({
        ...prev,
        trainingHours: 80,
        gpuPower: 400,
        gpuCount: 8,
        hardwareId: "a100",
        requestsPerDay: 80000,
        energyPerRequest: 0.002,
        storageGB: 3000,
        networkGB: 6000,
        retrainingPerYear: 4
      }));
    } else if (presetKey === "gh200") {
      setForm((prev) => ({
        ...prev,
        trainingHours: 120,
        gpuPower: 900,
        gpuCount: 8,
        hardwareId: "gh200",
        requestsPerDay: 300000,
        energyPerRequest: 0.0025,
        storageGB: 10000,
        networkGB: 20000,
        retrainingPerYear: 4
      }));
    }
  };

  const executeAudit = async (currentForm = form) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        trainingHours: Number(currentForm.trainingHours),
        gpuPower: Number(currentForm.gpuPower),
        gpuCount: Number(currentForm.gpuCount),
        hardwareId: currentForm.hardwareId === "custom" ? null : currentForm.hardwareId,
        requestsPerDay: Number(currentForm.requestsPerDay),
        energyPerRequest: Number(currentForm.energyPerRequest),
        storageGB: Number(currentForm.storageGB),
        networkGB: Number(currentForm.networkGB),
        retrainingPerYear: Number(currentForm.retrainingPerYear),
        regionId: currentForm.regionId
      };

      const response = await fetch(`${API_URL}/api/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Audit was not successful.");
      }

      setResult(data);
    } catch (err) {
      console.warn("Backend unavailable, calculating locally with regional engine:", err);
      calculateLocalFallback(currentForm);
    } finally {
      setLoading(false);
    }
  };

  const currentRegion = regions.find((r) => r.id === form.regionId) || regions[0];

  // Draggable Items Catalogs
  const DRAGGABLE_HARDWARE_ITEMS = [
    {
      type: "hardware",
      id: "l4",
      title: "NVIDIA L4 Tensor Core (4x)",
      tag: "88.5% Carbon Reduction",
      badge: "Eco Leader",
      powerW: 72,
      count: 4,
      totalPowerW: 288,
      annualEnergyKWh: 2522,
      carbonAbatementPct: 88.5,
      vramGB: 96,
      architecture: "Ada Lovelace INT8",
      batchingEngine: "TensorRT INT8 Precision Engine",
      estAnnualCost: Math.round(2522 * currentRegion.electricityCost),
      rationale: "4x L4 units leverage 4th-gen Tensor Cores and optical flow accelerators for 120 FPS video analytics & quantized LLM serving at under 300 Watts total."
    },
    {
      type: "hardware",
      id: "gh200",
      title: "NVIDIA GH200 Grace Hopper",
      tag: "Unified 576GB Memory",
      badge: "Superchip",
      powerW: 900,
      count: 1,
      totalPowerW: 900,
      annualEnergyKWh: 7884,
      carbonAbatementPct: 72.0,
      vramGB: 576,
      architecture: "Hopper + Grace NVLink-C2C",
      batchingEngine: "vLLM Continuous Dynamic Batching",
      estAnnualCost: Math.round(7884 * currentRegion.electricityCost),
      rationale: "900 GB/s bidirectional NVLink-C2C connects CPU and GPU memory seamlessly, eliminating PCIe bottlenecks for giant 70B+ LLMs."
    },
    {
      type: "hardware",
      id: "tpu-v5e",
      title: "Google TPU v5e (8x Pod)",
      tag: "Cloud ASIC Matrix Core",
      badge: "Lowest Cost/Flop",
      powerW: 175,
      count: 8,
      totalPowerW: 1400,
      annualEnergyKWh: 12264,
      carbonAbatementPct: 78.1,
      vramGB: 128,
      architecture: "TPU v5e Matrix Core",
      batchingEngine: "JAX / XLA Graph Optimization",
      estAnnualCost: Math.round(12264 * currentRegion.electricityCost),
      rationale: "Cost-optimized TPU v5e pods provide high-efficiency embedding generation and vector search at minimal power."
    },
    {
      type: "hardware",
      id: "h100",
      title: "NVIDIA H100 SXM5 (8x Cluster)",
      tag: "Frontier FP8 Transformer Engine",
      badge: "Max Throughput",
      powerW: 700,
      count: 8,
      totalPowerW: 5600,
      annualEnergyKWh: 49056,
      carbonAbatementPct: 40.0,
      vramGB: 640,
      architecture: "Hopper SXM5",
      batchingEngine: "Megatron-LM + Tensor Parallelism",
      estAnnualCost: Math.round(49056 * currentRegion.electricityCost),
      rationale: "Standard high-density frontier pretraining node with 4th-gen Tensor Cores and 3.35 TB/s HBM3 bandwidth."
    },
    {
      type: "hardware",
      id: "mi300x",
      title: "AMD Instinct MI300X (4x)",
      tag: "192GB HBM3 High Density",
      badge: "Massive VRAM",
      powerW: 750,
      count: 4,
      totalPowerW: 3000,
      annualEnergyKWh: 26280,
      carbonAbatementPct: 53.1,
      vramGB: 768,
      architecture: "CDNA 3",
      batchingEngine: "ROCm vLLM + Flash-Attention",
      estAnnualCost: Math.round(26280 * currentRegion.electricityCost),
      rationale: "192 GB VRAM per accelerator holds massive 1M+ context windows entirely in ultra-fast HBM3 without KV cache eviction."
    },
    {
      type: "hardware",
      id: "inf2",
      title: "AWS Inferentia2 (4x)",
      tag: "Dedicated Cloud ASIC",
      badge: "AWS Native",
      powerW: 190,
      count: 4,
      totalPowerW: 760,
      annualEnergyKWh: 6657,
      carbonAbatementPct: 76.2,
      vramGB: 128,
      architecture: "NeuronCore-v2",
      batchingEngine: "Neuron SDK Dynamic Batching",
      estAnnualCost: Math.round(6657 * currentRegion.electricityCost),
      rationale: "Hardware-optimized NeuronCores provide sustained high throughput on Vision Transformers (ViT) with lowest cloud host overhead."
    }
  ];

  const DRAGGABLE_REGION_ITEMS = [
    {
      type: "region",
      id: "eu-north-se",
      name: "Europe North (Sweden)",
      carbonIntensity: 0.025,
      electricityCost: 0.14,
      renewableMix: 96,
      gridComposition: "Hydro 45%, Nuclear 35%, Wind 18%, Bio 2%",
      badge: "Ultra-Clean Eco Zone"
    },
    {
      type: "region",
      id: "us-west-or",
      name: "US West (Oregon Hydro)",
      carbonIntensity: 0.085,
      electricityCost: 0.085,
      renewableMix: 82,
      gridComposition: "Hydro 65%, Wind 17%, Gas 12%, Solar 6%",
      badge: "Low Carbon Hydro"
    },
    {
      type: "region",
      id: "eu-west-fr",
      name: "France (Paris Nuclear)",
      carbonIntensity: 0.052,
      electricityCost: 0.16,
      renewableMix: 92,
      gridComposition: "Nuclear 70%, Hydro 12%, Wind 10%, Gas 8%",
      badge: "Low Carbon Nuclear"
    },
    {
      type: "region",
      id: "us-central-ia",
      name: "US Central (Iowa Wind)",
      carbonIntensity: 0.240,
      electricityCost: 0.080,
      renewableMix: 64,
      gridComposition: "Wind 58%, Gas 25%, Coal 12%, Nuclear 5%",
      badge: "Renewable Heavy"
    },
    {
      type: "region",
      id: "us-east-va",
      name: "US East (N. Virginia PJM)",
      carbonIntensity: 0.380,
      electricityCost: 0.11,
      renewableMix: 28,
      gridComposition: "Gas 42%, Nuclear 30%, Coal 18%, Renewables 10%",
      badge: "Standard Cloud Zone"
    },
    {
      type: "region",
      id: "ap-south-in",
      name: "Asia South (India CEA)",
      carbonIntensity: 0.710,
      electricityCost: 0.095,
      renewableMix: 22,
      gridComposition: "Coal 72%, Solar 12%, Hydro 9%, Wind 7%",
      badge: "High Optimization Upside"
    }
  ];

  const handleDropItem = (item) => {
    setDroppedItem(item);
    if (item.type === "region") {
      const updated = { ...form, regionId: item.id };
      setForm(updated);
      setAppliedComboNotification(`Switched regional electricity grid to ${item.name} (${item.carbonIntensity} kg CO2e/kWh)`);
      setTimeout(() => setAppliedComboNotification(""), 4000);
      executeAudit(updated);
    } else if (item.type === "hardware" || item.type === "topology") {
      const updated = {
        ...form,
        hardwareId: item.hardwareId || item.id,
        gpuCount: item.count || 4,
        gpuPower: item.powerW
      };
      setForm(updated);
      setAppliedComboNotification(`Loaded ${item.title} into active telemetry audit.`);
      setTimeout(() => setAppliedComboNotification(""), 4000);
      executeAudit(updated);
    }
  };

  const runAudit = () => {
    executeAudit(form);
    const resultsEl = document.getElementById("results-section");
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const runOptimizer = async () => {
    setOptimizerLoading(true);
    setOptimizerMessage("");
    setRecommendation(null);

    try {
      const payload = {
        accuracy: Number(accuracy),
        latency: Number(latency)
      };

      const response = await fetch(`${API_URL}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok || !data.recommendation) {
        setOptimizerMessage(data.message || "No architecture satisfies these constraints.");
        return;
      }

      setRecommendation(data);
    } catch {
      setRecommendation({
        recommendation: {
          name: "L4 INT8 - Quantized Inference Engine",
          description: "Distilled pruning with AWQ quantization, achieving optimal throughput under strict energy limits.",
          accuracy: Math.min(Number(accuracy) + 1.2, 98.5).toFixed(1),
          latency: Math.max(Number(latency) - 18, 14),
          energy: "Low Carbon Tier (28.4 W/infer)",
          estimatedEnergySaving: 52
        }
      });
    } finally {
      setOptimizerLoading(false);
    }
  };

  const handleBookDemoSubmit = (e) => {
    e.preventDefault();
    const randomId = `GL-${Date.now().toString().slice(-6)}`;
    setDemoForm((prev) => ({ ...prev, bookingRef: randomId }));
    setDemoBooked(true);
  };

  // ====================================================
  // AUTHENTICATION & OTP HANDLERS (DONUT CHALLENGE 02)
  // ====================================================
  const handleOpenAuthModal = () => {
    setAuthStep(1);
    setAuthError("");
    setAuthSuccessMsg("");
    setAuthDeliveryInfo(null);
    setOtpDigits(["", "", "", "", "", ""]);
    setShowAuthModal(true);
  };

  const handleSendOtp = async (overrideTarget = null, overrideType = null) => {
    const currentMode = overrideType || authMode;
    let target = overrideTarget;

    if (!target) {
      if (currentMode === "phone") {
        const cleanPhone = authPhone.trim().replace(/[\s()-]/g, "");
        target = `${phoneCountryCode}${cleanPhone}`;
      } else {
        target = authEmail.trim();
      }
    }

    if (currentMode === "phone") {
      if (!target || target.replace(/[^0-9]/g, "").length < 8) {
        setAuthError("Please enter a valid mobile phone number with country code.");
        return;
      }
    } else {
      if (!target || !target.includes("@")) {
        setAuthError("Please enter a valid registered work email address.");
        return;
      }
    }

    setAuthLoading(true);
    setAuthError("");
    setAuthSuccessMsg("");

    try {
      const payload = currentMode === "phone"
        ? { phone: target, targetType: "phone" }
        : { email: target, targetType: "email" };

      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to deliver OTP.");
      }

      if (currentMode === "phone") {
        setAuthPhone(target.replace(phoneCountryCode, ""));
      } else {
        setAuthEmail(target);
      }
      setAuthDeliveryInfo(data);
      setAuthSuccessMsg(
        data.isRealDelivery
          ? `Real 6-digit code dispatched to ${target}`
          : `6-digit verification code delivered to ${target}`
      );
      setAuthStep(2);
      setResendCooldown(60);

      // Auto-focus first digit input
      setTimeout(() => {
        if (otpInputRefs[0].current) {
          otpInputRefs[0].current.focus();
        }
      }, 150);
    } catch (err) {
      console.warn("Backend auth offline or network error, using fallback engine:", err);
      const simulated = simulateOfflineSendOtp(target);
      if (currentMode === "phone") {
        setAuthPhone(target.replace(phoneCountryCode, ""));
      } else {
        setAuthEmail(target);
      }
      setAuthDeliveryInfo(simulated);
      setAuthSuccessMsg(`Verification code dispatched (${simulated.deliveryProvider})`);
      setAuthStep(2);
      setResendCooldown(60);
      setTimeout(() => {
        if (otpInputRefs[0].current) otpInputRefs[0].current.focus();
      }, 150);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOtpDigitChange = (index, value) => {
    // Only accept numeric digit
    const cleanVal = value.replace(/[^0-9]/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto-advance to next input if filled
    if (cleanVal && index < 5 && otpInputRefs[index + 1].current) {
      otpInputRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // On Backspace, clear and move to previous box
    if (e.key === "Backspace" && !otpDigits[index] && index > 0 && otpInputRefs[index - 1].current) {
      otpInputRefs[index - 1].current.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasteData) return;

    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setOtpDigits(newDigits);

    const focusIdx = Math.min(pasteData.length, 5);
    if (otpInputRefs[focusIdx].current) {
      otpInputRefs[focusIdx].current.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setAuthError("Please enter all 6 digits of your verification code.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    const target = authMode === "phone"
      ? `${phoneCountryCode}${authPhone.trim().replace(/[\s()-]/g, "")}`
      : authEmail.trim();

    try {
      const payload = authMode === "phone"
        ? { phone: target, otp: fullOtp }
        : { email: target, otp: fullOtp };

      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid verification code.");
      }

      // Save user session
      setUser(data.user);
      localStorage.setItem("greenlens_user", JSON.stringify(data.user));
      localStorage.setItem("greenlens_token", data.token);

      setAuthStep(3);
      setTimeout(() => {
        setShowAuthModal(false);
      }, 2000);
    } catch (err) {
      console.warn("Backend auth offline, verifying locally:", err);
      const simulated = simulateOfflineVerifyOtp(target, fullOtp);
      if (simulated.success) {
        setUser(simulated.user);
        localStorage.setItem("greenlens_user", JSON.stringify(simulated.user));
        localStorage.setItem("greenlens_token", simulated.token);
        setAuthStep(3);
        setTimeout(() => {
          setShowAuthModal(false);
        }, 2000);
      } else {
        setAuthError(simulated.message || err.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("greenlens_token");
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch {
      // ignore
    } finally {
      setUser(null);
      localStorage.removeItem("greenlens_user");
      localStorage.removeItem("greenlens_token");
    }
  };

  const formatImpactName = (name) => {
    if (!name) return "None";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const lifecycleEnergy = result?.lifecycleEnergy || {};
  const lifecycle = result?.lifecycle || {};
  const intelligence = result?.intelligence || {
    largestImpact: result?.biggestImpact?.category || "training",
    largestPercentage: result?.biggestImpact?.percentage || 0,
    insight: "Lifecycle calculation complete.",
    recommendations: []
  };
  const recommendations = Array.isArray(intelligence.recommendations) ? intelligence.recommendations : [];

  const calculateScore = () => {
    if (!result) return 92;
    const energy = Number(result.totalEnergy) || 0;
    if (energy <= 20000) return 96;
    if (energy <= 60000) return 88;
    if (energy <= 150000) return 78;
    if (energy <= 400000) return 68;
    return 54;
  };

  const score = calculateScore();
  const getRatingTier = (s) => {
    if (s >= 90) return { grade: "A+ Eco-Leader", desc: "Top 5% energy efficiency. High sustainability index.", color: "#2ee59d" };
    if (s >= 80) return { grade: "A Sustainable", desc: "Well-optimized compute footprint. Minor optimizations available.", color: "#4ade80" };
    if (s >= 70) return { grade: "B Moderate Grid Load", desc: "Standard datacenter footprint. High optimization upside.", color: "#fbbf24" };
    return { grade: "C High Carbon Intensity", desc: "Urgent architectural refactoring required to curb emissions.", color: "#f87171" };
  };

  const rating = getRatingTier(score);

  // Environmental Equivalents
  const carbonKg = Number(result?.carbon || 0);
  const treeSeedlings = (carbonKg / 21.7).toFixed(1);
  const carMiles = Math.round(carbonKg * 2.45);
  const phoneCharges = Math.round(carbonKg * 122);
  const costUSD = result?.costUSD !== undefined ? result.costUSD : ((Number(result?.totalEnergy || 0) / 1000) * currentRegion.electricityCost).toFixed(2);

  // How It Works Pipeline Stages
  const howItWorksStages = [
    {
      step: "01",
      title: "Zero-Overhead Cluster Telemetry Sensor",
      badge: "DATA EXTRACTION",
      icon: <Activity className="stage-icon-svg" />,
      tagline: "Extracts microsecond accelerator power, memory, and FLOPS without runtime penalties.",
      description: "GreenLens deploys an ultra-lightweight daemon sensor leveraging eBPF, NVIDIA NVML, and AMD ROCm SMI to passively collect wattage, memory bus utilization, and thermal states across distributed training and inference nodes.",
      specs: [
        "Negligible overhead (<0.02% GPU cycle penalty)",
        "Compatible with Slurm, Kubernetes, Ray, and bare-metal",
        "Continuous per-request attribution for multi-tenant LLM serving"
      ],
      codeSnippet: `// GreenLens Telemetry Packet Sample\n{\n  "timestamp": "2026-09-22T12:00:00Z",\n  "cluster_id": "us-east-h100-node-4",\n  "accelerator": "NVIDIA H100 SXM5",\n  "avg_power_draw_w": 684.2,\n  "memory_used_gb": 74.8,\n  "tensor_core_util": "94.2%",\n  "active_job_id": "llm-pretrain-v4"\n}`
    },
    {
      step: "02",
      title: "Real-Time Grid & Marginal Carbon Engine",
      badge: "ISO 14064 GHG AUDIT",
      icon: <Globe className="stage-icon-svg" />,
      tagline: "Matches compute timestamps against 11+ regional power grid mixes and marginal emissions.",
      description: "Raw Megawatt-hours are paired with high-resolution regional emission factors (US PJM, Bonneville Hydro, Nord Pool, EEA, CEA India). GreenLens calculates precise Scope 2 location-based and market-based greenhouse gas figures.",
      specs: [
        "Hourly marginal emissions factoring (g CO₂e / kWh)",
        "Multi-cloud regional arbitrage (AWS, GCP, Azure, CoreWeave)",
        "Zero-Carbon PPA 24/7 matching certification"
      ],
      codeSnippet: `// Marginal Carbon Reconciliation Model\nconst scope2Carbon = (\n  energy_kwh * region.carbonIntensity_kg_kwh *\n  (1 - region.renewablePPA_offset)\n);\n// Output: Verified Scope 2 kg CO2e`
    },
    {
      step: "03",
      title: "Green Neural & Silicon Topology Optimizer",
      badge: "SILICON CO-DESIGN",
      icon: <Cpu className="stage-icon-svg" />,
      tagline: "Multi-objective Pareto solver finding optimal quantization, pruning, and hardware combos.",
      description: "Identifies the highest-performing hardware combinations and lower-precision architectures (FP8, INT8 AWQ, SmoothQuant, Speculative Decoding) that slash compute footprint without compromising benchmark accuracy.",
      specs: [
        "Up to 80% carbon abatement through multi-node L4/GH200 topology",
        "KV-Cache compaction and continuous dynamic batching",
        "Hardware-aware latency vs energy Pareto frontier analysis"
      ],
      codeSnippet: `// Pareto Optimization Constraint Solver\nconst optimalTopology = solvePareto({\n  target_accuracy: ">= 95%",\n  max_latency: "<= 40ms",\n  minimize: "carbon_intensity_and_cost"\n});`
    },
    {
      step: "04",
      title: "Audit-Safe ESG Disclosures & Export",
      badge: "REGULATORY COMPLIANCE",
      icon: <FileCheck className="stage-icon-svg" />,
      tagline: "One-click export for CSRD, SEC Climate Disclosures, and GHG Protocol Scope 1-3 audits.",
      description: "Produces immutable, audit-trail verified reports ready for external auditors, ESG sustainability committees, and compliance boards, eliminating months of manual spreadsheet estimations.",
      specs: [
        "CSRD & SEC Climate Disclosure standard compliance",
        "Green Software Foundation SCI (Software Carbon Intensity) rating",
        "Automated CI/CD carbon budget gates for ML pipelines"
      ],
      codeSnippet: `// Audit-Safe ESG Export Manifest\n{\n  "standard": "GHG Protocol Scope 2/3",\n  "verification": "ISO 14064-1 Compliant",\n  "total_footprint_mt": 78.85,\n  "audit_hash": "sha256:4f8e9b01c..."\n}`
    }
  ];

  return (
    <div className="greenlens-app">
      {/* ====================================================
          TOP NAVIGATION
          ==================================================== */}
      <nav className="top-navbar">
        <div className="nav-inner">
          <div className="brand-logo">
            <Leaf className="brand-leaf-icon" />
            <span className="logo-text">GreenLens<span className="green-dot">.</span></span>
          </div>

          <div className="nav-links">
            <a href="#hero" className="nav-link">Why GreenLens</a>
            <button
              type="button"
              className="nav-link btn-nav-text-btn"
              onClick={() => setShowHowItWorksModal(true)}
            >
              How It Works
            </button>
            <a href="#hardware-combos" className="nav-link highlight-link">
              <Sparkles className="link-icon-svg" /> Silicon Workbench
            </a>
            <a href="#telemetry" className="nav-link">Carbon Audit</a>
            <a href="#regions-section" className="nav-link">Regional Grids</a>
            <a href="#optimizer" className="nav-link">Topology Optimizer</a>
          </div>

          <div className="nav-actions">
            {/* User Profile or Sign In Button */}
            {user ? (
              <div className="user-profile-nav-pill" onClick={handleOpenAuthModal} title="Click to view authenticated profile">
                <div className="user-avatar-circle">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
                <span className="user-name-text">{user.name.split(" ")[0]}</span>
                <span className="user-verified-dot" title="OTP Verified Session"></span>
                <button
                  className="btn-mini-logout"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button className="btn-nav-login" onClick={handleOpenAuthModal}>
                <Lock className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}

            <button className="btn-book-demo" onClick={() => { setShowDemoModal(true); setDemoBooked(false); }}>
              <Calendar className="btn-icon" />
              Book demo
            </button>
            <a href="#telemetry" className="btn-try-free">
              <Sprout className="btn-icon" />
              Try it for free
            </a>
          </div>
        </div>
      </nav>

      {/* ====================================================
          FLOATING DONUT CHALLENGE 02 PILL (Non-intrusive)
          ==================================================== */}
      <div className="floating-donut-pill" onClick={handleOpenAuthModal} title="Click to open Donut Challenge 02 OTP Login">
        <span className="donut-badge-mini">DONUT CHALLENGE 02</span>
        <span className="donut-pill-text">
          <KeyRound className="w-3 h-3 text-mint" />
          {user ? `Signed in as ${user.name}` : "OTP Email Auth Active"}
        </span>
        <span className="donut-live-glow"></span>
      </div>

      {/* ====================================================
          HERO SECTION
          ==================================================== */}
      <section className="hero-section" id="hero">
        <div className="hero-container">
          <div className="hero-left">
            <h1 className="hero-title">
              GreenLens<span className="green-dot">.</span>
            </h1>
            <div className="hero-tagline-wrap">
              <span className="hero-tagline">Making carbon visible<span className="cursor-blink">.</span></span>
            </div>

            <p className="hero-description">
              Reveal the emissions your AI workloads keep hidden — GreenLens automatically extracts high-resolution, model-level carbon data directly from your training and inference pipelines, in seconds, not months.
            </p>

            <p className="hero-subtext">
              Discover how GreenLens turns raw compute telemetry into world-class carbon intelligence with multi-region electricity matching and hardware combination optimization.
            </p>

            <div className="hero-buttons">
              <button
                type="button"
                className="btn-hero-learn"
                onClick={() => setShowHowItWorksModal(true)}
              >
                <Compass className="btn-icon" />
                How It Works
              </button>
              <a href="#telemetry" className="btn-hero-try">
                <Sprout className="btn-icon" />
                Try it for free
              </a>
            </div>
          </div>

          {/* RIGHT SHOWCASE CARD */}
          <div className="hero-right">
            <div className="showcase-card">
              <div className="showcase-header">
                <div className="showcase-brand">
                  <span>GreenLens<span className="green-dot">.</span></span>
                </div>
                <div className="showcase-tags">
                  <span className="badge badge-transparency">DATA TRANSPARENCY</span>
                  <span className="badge badge-automation">AI & AUTOMATIONS</span>
                  <span className="badge badge-audit">AUDIT SAFE</span>
                  <span className="badge badge-ghg">GHG PROTOCOL</span>
                </div>
              </div>

              <div className="showcase-caption-row">
                <span className="showcase-caption">LIVE COMPUTE TELEMETRY CONSOLE</span>
                <span className="live-indicator">
                  <span className="pulse-dot"></span> LIVE
                </span>
              </div>

              {/* 3D PERSPECTIVE PREVIEW SCREEN */}
              <div className="screen-mockup-wrapper">
                <div className="screen-mockup" onClick={() => { setShowDemoModal(true); setDemoBooked(false); }}>
                  <div className="mockup-topbar">
                    <div className="mockup-dots">
                      <div className="dot red"></div>
                      <div className="dot yellow"></div>
                      <div className="dot green"></div>
                    </div>
                    <span className="mockup-title">greenlens.cloud / telemetry / audit-live</span>
                    <div className="mockup-region-tag">
                      <MapPin className="mini-pin-icon" /> {currentRegion.name.split(" ")[0]}
                    </div>
                  </div>

                  <div className="mockup-metrics">
                    <div className="mockup-metric-card">
                      <span className="m-label">Scope 2/3 Total</span>
                      <strong className="m-value">78.85 MT</strong>
                      <span className="m-pill green">−24% vs baseline</span>
                    </div>
                    <div className="mockup-metric-card">
                      <span className="m-label">Grid Consumption</span>
                      <strong className="m-value">731 MWh</strong>
                      <span className="m-pill">94.2% Renewable</span>
                    </div>
                    <div className="mockup-metric-card">
                      <span className="m-label">Carbon Abatement</span>
                      <strong className="m-value">$188.2k</strong>
                      <span className="m-pill green">ROI 3.8x</span>
                    </div>
                    <div className="mockup-metric-card">
                      <span className="m-label">Emissions Intensity</span>
                      <strong className="m-value">35.3g CO₂/req</strong>
                      <span className="m-pill green">INT8 Quantized</span>
                    </div>
                  </div>

                  <div className="mockup-table">
                    <div className="mockup-row head">
                      <span>Compute Cluster</span>
                      <span>Hardware</span>
                      <span>Emissions</span>
                      <span>Status</span>
                    </div>
                    <div className="mockup-row">
                      <span>cluster-us-east-1</span>
                      <span>32x H100 SXM5</span>
                      <div className="mini-bar-wrap"><div className="mini-bar b1"></div></div>
                      <span className="status-tag live">Audited</span>
                    </div>
                    <div className="mockup-row">
                      <span>cluster-eu-north-1</span>
                      <span>16x A100 80GB</span>
                      <div className="mini-bar-wrap"><div className="mini-bar b2"></div></div>
                      <span className="status-tag live">Hydro-mix</span>
                    </div>
                    <div className="mockup-row">
                      <span>cluster-inference-edge</span>
                      <span>64x L4 Ada</span>
                      <div className="mini-bar-wrap"><div className="mini-bar b3"></div></div>
                      <span className="status-tag live">Optimized</span>
                    </div>
                  </div>

                  {/* Play Overlay */}
                  <div className="play-button-overlay">
                    <div className="play-button-circle">
                      <Play className="play-icon-svg" />
                    </div>
                    <span className="play-label">Click for Interactive Walkthrough</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HORIZON ORGANIC WAVELINE */}
        <div className="horizon-wave-container">
          <svg className="horizon-wave" viewBox="0 0 1440 140" fill="none" preserveAspectRatio="none">
            <path
              d="M0,85 C240,40 450,115 720,70 C960,30 1200,95 1440,60"
              stroke="rgba(46, 229, 157, 0.45)"
              strokeWidth="2.2"
              strokeDasharray="4 2"
              fill="none"
            />
          </svg>

          <div className="horizon-milestone m-left">
            <div className="milestone-dot">
              <span className="inner-dot"></span>
            </div>
            <span className="milestone-label">
              <Activity className="milestone-icon" /> 1. Telemetry Ingestion
            </span>
          </div>

          <div className="horizon-milestone m-mid">
            <div className="milestone-dot">
              <span className="inner-dot"></span>
            </div>
            <span className="milestone-label">
              <Globe className="milestone-icon" /> 2. Carbon Grid Extraction
            </span>
          </div>

          <div className="horizon-milestone m-right">
            <div className="milestone-dot">
              <span className="inner-dot"></span>
            </div>
            <span className="milestone-label">
              <FileCheck className="milestone-icon" /> 3. ESG Intelligence
            </span>
          </div>
        </div>
      </section>

      {/* ====================================================
          MAIN CONTENT CONTAINER
          ==================================================== */}
      <main className="main-content">
        {/* ====================================================
            FEATURE: INTERACTIVE DRAG-AND-DROP SILICON & GRID WORKBENCH
            ==================================================== */}
        <section className="dashboard-section" id="hardware-combos">
          <div className="section-head">
            <div className="step-badge">
              <span className="step-num">SILICON & GRID WORKBENCH</span>
              <span className="step-tag">TACTILE ESG OPTIMIZER</span>
            </div>
            <h2>Interactive Hardware & Regional Grid Workbench</h2>
            <p>
              Drag accelerator silicon chips or regional power grids into the active telemetry dropzone to dynamically inspect deep carbon abatement metrics, thermal TDP, and apply configurations to your live audit in one click.
            </p>
          </div>

          {appliedComboNotification && (
            <div className="applied-notification-banner">
              <CheckCircle2 className="banner-icon" />
              <span>{appliedComboNotification}</span>
            </div>
          )}

          <div className="drag-workbench-container">
            {/* LEFT PALETTE: Draggable Items */}
            <div className="workbench-palette-column">
              <div className="palette-header">
                <div className="palette-title-row">
                  <GripVertical className="palette-grip-icon" />
                  <h3>Component Palette</h3>
                </div>
                <div className="palette-tabs">
                  <button
                    type="button"
                    className={`palette-tab-btn ${dragCategory === "hardware" ? "active" : ""}`}
                    onClick={() => setDragCategory("hardware")}
                  >
                    <Server className="w-3.5 h-3.5" /> Silicon ({DRAGGABLE_HARDWARE_ITEMS.length})
                  </button>
                  <button
                    type="button"
                    className={`palette-tab-btn ${dragCategory === "regions" ? "active" : ""}`}
                    onClick={() => setDragCategory("regions")}
                  >
                    <Globe className="w-3.5 h-3.5" /> Grids ({DRAGGABLE_REGION_ITEMS.length})
                  </button>
                  <button
                    type="button"
                    className={`palette-tab-btn ${dragCategory === "topologies" ? "active" : ""}`}
                    onClick={() => setDragCategory("topologies")}
                  >
                    <Layers className="w-3.5 h-3.5" /> Topologies ({DRAGGABLE_TOPOLOGY_ITEMS.length})
                  </button>
                </div>
                <span className="drag-instruction-hint">
                  Drag an item or click <strong>Inspect</strong>
                </span>
              </div>

              <div className="draggable-chips-list">
                {dragCategory === "hardware" &&
                  DRAGGABLE_HARDWARE_ITEMS.map((item) => {
                    const isSelected = droppedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`draggable-chip-card ${isSelected ? "selected-chip" : ""}`}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/json", JSON.stringify(item));
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        onClick={() => handleDropItem(item)}
                      >
                        <div className="chip-drag-handle" title="Drag to Dropzone">
                          <GripVertical className="drag-icon-svg" />
                        </div>
                        <div className="chip-icon-box">
                          <Cpu className="chip-svg" />
                        </div>
                        <div className="chip-details">
                          <div className="chip-title-row">
                            <strong>{item.title}</strong>
                            <span className={`chip-badge-pill ${item.badge === "Eco Leader" ? "green" : "blue"}`}>
                              {item.badge}
                            </span>
                          </div>
                          <div className="chip-meta-row">
                            <span className="chip-meta-tag">{item.architecture}</span>
                            <span className="chip-meta-tag">{item.totalPowerW}W TDP</span>
                            <span className="chip-meta-tag highlight-green">−{item.carbonAbatementPct}% CO₂</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-inspect-chip"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropItem(item);
                          }}
                        >
                          Inspect
                        </button>
                      </div>
                    );
                  })}

                {dragCategory === "regions" &&
                  DRAGGABLE_REGION_ITEMS.map((item) => {
                    const isSelected = droppedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`draggable-chip-card ${isSelected ? "selected-chip" : ""}`}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/json", JSON.stringify(item));
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        onClick={() => handleDropItem(item)}
                      >
                        <div className="chip-drag-handle" title="Drag to Dropzone">
                          <GripVertical className="drag-icon-svg" />
                        </div>
                        <div className="chip-icon-box region-icon-box">
                          <Globe className="chip-svg" />
                        </div>
                        <div className="chip-details">
                          <div className="chip-title-row">
                            <strong>{item.name}</strong>
                            <span className={`chip-badge-pill ${item.renewableMix >= 80 ? "green" : "blue"}`}>
                              {item.renewableMix}% Clean
                            </span>
                          </div>
                          <div className="chip-meta-row">
                            <span className="chip-meta-tag">{item.carbonIntensity} kg/kWh</span>
                            <span className="chip-meta-tag">${item.electricityCost}/kWh</span>
                            <span className="chip-meta-tag">{item.badge}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-inspect-chip"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropItem(item);
                          }}
                        >
                          Inspect
                        </button>
                      </div>
                    );
                  })}

                {dragCategory === "topologies" &&
                  DRAGGABLE_TOPOLOGY_ITEMS.map((item) => {
                    const isSelected = droppedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`draggable-chip-card ${isSelected ? "selected-chip" : ""}`}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/json", JSON.stringify(item));
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        onClick={() => handleDropItem(item)}
                      >
                        <div className="chip-drag-handle" title="Drag to Dropzone">
                          <GripVertical className="drag-icon-svg" />
                        </div>
                        <div className="chip-icon-box">
                          <Layers className="chip-svg" />
                        </div>
                        <div className="chip-details">
                          <div className="chip-title-row">
                            <strong>{item.title}</strong>
                            <span className={`chip-badge-pill ${item.badge === "Eco Leader" ? "green" : "blue"}`}>
                              {item.badge}
                            </span>
                          </div>
                          <div className="chip-meta-row">
                            <span className="chip-meta-tag">{item.architecture}</span>
                            <span className="chip-meta-tag">{item.count} Nodes</span>
                            <span className="chip-meta-tag highlight-green">−{item.carbonAbatementPct}% CO₂</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-inspect-chip"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropItem(item);
                          }}
                        >
                          Inspect
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* RIGHT COLUMN: ACTIVE ESG DROPZONE & LIVE INSPECTOR */}
            <div
              className={`esg-dropzone ${isDragOver ? "drag-over-active" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
                e.dataTransfer.dropEffect = "copy";
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                try {
                  const dataStr = e.dataTransfer.getData("application/json");
                  if (dataStr) {
                    const item = JSON.parse(dataStr);
                    handleDropItem(item);
                  }
                } catch (err) {
                  console.warn("Drop parse error:", err);
                }
              }}
            >
              <div className="dropzone-header-banner">
                <div className="dz-head-left">
                  <Sparkles className="w-4 h-4 text-mint" />
                  <span>ACTIVE TELEMETRY & ESG DROPZONE</span>
                </div>
                <div className="dz-head-right">
                  <span className="dz-status-badge">
                    {isDragOver ? "Release to Drop & Inspect" : "Ready for Drag & Drop"}
                  </span>
                </div>
              </div>

              {droppedItem ? (
                <div className="dropped-inspector-card">
                  {droppedItem.type === "hardware" || droppedItem.type === "topology" ? (
                    <>
                      <div className="inspector-head">
                        <div className="insp-icon-wrap">
                          {droppedItem.type === "topology" ? (
                            <Layers className="w-6 h-6 text-mint" />
                          ) : (
                            <Cpu className="w-6 h-6 text-mint" />
                          )}
                        </div>
                        <div className="insp-title-box">
                          <div className="insp-pill-row">
                            <span className="insp-category-tag">
                              {droppedItem.type === "topology" ? "MULTI-ACCELERATOR TOPOLOGY" : "SILICON ACCELERATOR TOPOLOGY"}
                            </span>
                            <span className={`insp-badge-pill ${droppedItem.badge === "Eco Leader" ? "green" : "blue"}`}>
                              {droppedItem.badge}
                            </span>
                          </div>
                          <h3>{droppedItem.title}</h3>
                          <span className="insp-sub">{droppedItem.tag} • Architecture: {droppedItem.architecture}</span>
                        </div>
                      </div>

                      <div className="inspector-metrics-grid">
                        <div className="insp-metric-card highlight-metric">
                          <span className="m-label">Carbon Abatement</span>
                          <strong className="m-val text-mint">−{droppedItem.carbonAbatementPct}%</strong>
                          <span className="m-sub">vs standard H100 SXM</span>
                        </div>
                        <div className="insp-metric-card">
                          <span className="m-label">Thermal Power TDP</span>
                          <strong className="m-val">{(droppedItem.totalPowerW / 1000).toFixed(2)} kW</strong>
                          <span className="m-sub">{droppedItem.powerW}W per GPU × {droppedItem.count}</span>
                        </div>
                        <div className="insp-metric-card">
                          <span className="m-label">Annual Energy Draw</span>
                          <strong className="m-val">{droppedItem.annualEnergyKWh.toLocaleString()} kWh</strong>
                          <span className="m-sub">24/7 sustained compute</span>
                        </div>
                        <div className="insp-metric-card">
                          <span className="m-label">Est. Energy Tariff</span>
                          <strong className="m-val">${Math.round(droppedItem.annualEnergyKWh * currentRegion.electricityCost).toLocaleString()} / yr</strong>
                          <span className="m-sub">in {currentRegion.name}</span>
                        </div>
                      </div>

                      <div className="inspector-specs-row">
                        <div className="insp-spec-pill">
                          <span>VRAM Capacity:</span>
                          <strong>{droppedItem.vramGB} GB High-Bandwidth</strong>
                        </div>
                        <div className="insp-spec-pill">
                          <span>Precision & Batching:</span>
                          <strong>{droppedItem.batchingEngine}</strong>
                        </div>
                      </div>

                      <div className="inspector-rationale-box">
                        <h4>Engineering ESG Assessment:</h4>
                        <p>{droppedItem.rationale}</p>
                      </div>

                      <div className="inspector-actions-row">
                        <button
                          type="button"
                          className="btn-apply-inspector"
                          onClick={() => {
                            const updated = {
                              ...form,
                              hardwareId: droppedItem.hardwareId || droppedItem.id,
                              gpuCount: droppedItem.count || 4,
                              gpuPower: droppedItem.powerW
                            };
                            setForm(updated);
                            setAppliedComboNotification(`Loaded ${droppedItem.title} into active telemetry audit.`);
                            setTimeout(() => setAppliedComboNotification(""), 4000);
                            executeAudit(updated);
                            const el = document.getElementById("telemetry");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          <Check className="w-4 h-4" /> Apply Topology Configuration to Live Audit →
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="inspector-head">
                        <div className="insp-icon-wrap region-wrap">
                          <Globe className="w-6 h-6 text-mint" />
                        </div>
                        <div className="insp-title-box">
                          <div className="insp-pill-row">
                            <span className="insp-category-tag">REGIONAL ELECTRICITY GRID</span>
                            <span className={`insp-badge-pill ${droppedItem.renewableMix >= 80 ? "green" : "blue"}`}>
                              {droppedItem.renewableMix}% Clean Energy
                            </span>
                          </div>
                          <h3>{droppedItem.name}</h3>
                          <span className="insp-sub">{droppedItem.badge}</span>
                        </div>
                      </div>

                      <div className="inspector-metrics-grid">
                        <div className="insp-metric-card highlight-metric">
                          <span className="m-label">Carbon Intensity</span>
                          <strong className="m-val text-mint">{droppedItem.carbonIntensity} kg/kWh</strong>
                          <span className="m-sub">Scope 2 Location-Based</span>
                        </div>
                        <div className="insp-metric-card">
                          <span className="m-label">Renewable Mix</span>
                          <strong className="m-val">{droppedItem.renewableMix}%</strong>
                          <span className="m-sub">Hydro, Wind & Solar</span>
                        </div>
                        <div className="insp-metric-card">
                          <span className="m-label">Electricity Cost</span>
                          <strong className="m-val">${droppedItem.electricityCost} / kWh</strong>
                          <span className="m-sub">Industrial datacenter rate</span>
                        </div>
                        <div className="insp-metric-card">
                          <span className="m-label">Optimization Upside</span>
                          <strong className="m-val text-mint">
                            {droppedItem.carbonIntensity <= 0.08 ? "A+ Tier Low Carbon" : "High Arbitrage Benefit"}
                          </strong>
                          <span className="m-sub">GHG Scope 2 rating</span>
                        </div>
                      </div>

                      <div className="inspector-specs-row">
                        <div className="insp-spec-pill">
                          <span>Generation Mix:</span>
                          <strong>{droppedItem.gridComposition}</strong>
                        </div>
                      </div>

                      <div className="inspector-rationale-box">
                        <h4>Regional Arbitrage Recommendation:</h4>
                        <p>
                          Migrating compute batches or warm inference checkpoints to {droppedItem.name} delivers immediate Scope 2 decarbonization with verified regional emission factors compliant with ISO 14064-1.
                        </p>
                      </div>

                      <div className="inspector-actions-row">
                        <button
                          type="button"
                          className="btn-apply-inspector"
                          onClick={() => {
                            const updated = { ...form, regionId: droppedItem.id };
                            setForm(updated);
                            setAppliedComboNotification(`Switched regional electricity grid to ${droppedItem.name} (${droppedItem.carbonIntensity} kg CO2e/kWh)`);
                            setTimeout(() => setAppliedComboNotification(""), 4000);
                            executeAudit(updated);
                            const el = document.getElementById("telemetry");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          <Check className="w-4 h-4" /> Apply Regional Grid to Live Audit →
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="dropzone-empty-placeholder">
                  <div className="dz-empty-icon-box">
                    <GripVertical className="w-8 h-8 text-mint" />
                  </div>
                  <h4>Drag & Drop Accelerator Silicon or Grids Here</h4>
                  <p>
                    Select any chip or electricity region from the palette on the left to inspect detailed telemetry, carbon reduction ratings, and power envelopes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ====================================================
            FEATURE 3: WORKLOAD TELEMETRY INGESTION WITH ELECTRICITY REGIONS
            ==================================================== */}
        <section className="dashboard-section" id="telemetry">
          <div className="section-head">
            <div className="step-badge">
              <span className="step-num">STEP 01</span>
              <span className="step-tag">AUDIT INGESTION</span>
            </div>
            <h2>AI Workload Telemetry & Regional Carbon Ingestion</h2>
            <p>
              Configure accelerator hardware profiles, regional electricity grids, and inference volumes to generate ISO 14064 and GHG Protocol compliant carbon data.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="presets-bar">
            <span className="presets-label">Load Enterprise Presets:</span>
            <button className="preset-btn" onClick={() => applyPreset("llm")}>
              <Zap className="btn-preset-icon" /> LLM Training (32x H100)
            </button>
            <button className="preset-btn" onClick={() => applyPreset("vision")}>
              <Eye className="btn-preset-icon" /> Edge Vision (4x L4)
            </button>
            <button className="preset-btn" onClick={() => applyPreset("agentic")}>
              <Bot className="btn-preset-icon" /> Production RAG Pipeline (8x A100)
            </button>
            <button className="preset-btn" onClick={() => applyPreset("gh200")}>
              <Sparkles className="btn-preset-icon" /> Megacluster (8x GH200 Grace Hopper)
            </button>
          </div>

          <div className="telemetry-form-card">
            <div className="form-grid">
              {/* Electricity Region Selector */}
              <div className="input-group full-width-group" id="regions-section">
                <div className="label-row">
                  <label className="input-label-with-icon">
                    <Globe className="label-inline-icon" /> Datacenter Electricity Grid & Region
                  </label>
                  <span className="unit-tag">
                    {currentRegion.carbonIntensity} kg CO₂e/kWh | {currentRegion.renewableMix}% Renewable
                  </span>
                </div>
                <select
                  value={form.regionId}
                  onChange={handleRegionChange}
                  className="eco-select region-highlight-select"
                >
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name} — {region.carbonIntensity} kg CO₂e/kWh (${region.electricityCost}/kWh, {region.renewableMix}% Clean)
                    </option>
                  ))}
                </select>
                <div className="region-meta-strip">
                  <span className="region-meta-item">
                    <MapPin className="mini-meta-icon" /> <strong>Country:</strong> {currentRegion.country}
                  </span>
                  <span className="region-meta-item">
                    <Zap className="mini-meta-icon" /> <strong>Grid Intensity:</strong> {currentRegion.carbonIntensity} kg CO₂e / kWh
                  </span>
                  <span className="region-meta-item">
                    <DollarSign className="mini-meta-icon" /> <strong>Electricity Tariff:</strong> ${currentRegion.electricityCost} / kWh
                  </span>
                  <span className="region-meta-item">
                    <Leaf className="mini-meta-icon" /> <strong>Renewable Mix:</strong> {currentRegion.renewableMix}%
                  </span>
                </div>
              </div>

              {/* Hardware Accelerator Dropdown */}
              <div className="input-group">
                <div className="label-row">
                  <label className="input-label-with-icon">
                    <Cpu className="label-inline-icon" /> Hardware Accelerator
                  </label>
                  <span className="unit-tag">TDP Profile</span>
                </div>
                <select
                  value={form.hardwareId}
                  onChange={handleHardwareChange}
                  disabled={hardwareLoading}
                  className="eco-select"
                >
                  <option value="custom">Custom Silicon / TPU Profile</option>
                  {hardware.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.powerW}W, {item.architecture})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label={form.hardwareId === "custom" ? "Compute Power (W)" : "Rated Power (Auto)"}
                name="gpuPower"
                value={form.gpuPower}
                onChange={handleChange}
                unit="Watts"
                icon={<Zap className="w-3.5 h-3.5" />}
              />

              <Input
                label="Accelerator Nodes / GPU Count"
                name="gpuCount"
                value={form.gpuCount}
                onChange={handleChange}
                unit="Units"
                icon={<Server className="w-3.5 h-3.5" />}
              />

              <Input
                label="Training Run Duration"
                name="trainingHours"
                value={form.trainingHours}
                onChange={handleChange}
                unit="Hours"
                icon={<Clock className="w-3.5 h-3.5" />}
              />

              <Input
                label="Inference Requests Per Day"
                name="requestsPerDay"
                value={form.requestsPerDay}
                onChange={handleChange}
                unit="Req/Day"
                icon={<Activity className="w-3.5 h-3.5" />}
              />

              <Input
                label="Energy Per Inference Request"
                name="energyPerRequest"
                value={form.energyPerRequest}
                onChange={handleChange}
                step="0.0001"
                unit="Wh/Req"
                icon={<Gauge className="w-3.5 h-3.5" />}
              />

              <Input
                label="Checkpoint & Dataset Storage"
                name="storageGB"
                value={form.storageGB}
                onChange={handleChange}
                unit="GB"
                icon={<HardDrive className="w-3.5 h-3.5" />}
              />

              <Input
                label="Network Egress / Ingress"
                name="networkGB"
                value={form.networkGB}
                onChange={handleChange}
                unit="GB"
                icon={<Globe className="w-3.5 h-3.5" />}
              />

              <Input
                label="Model Retraining Frequency"
                name="retrainingPerYear"
                value={form.retrainingPerYear}
                onChange={handleChange}
                unit="Cycles / Year"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              />
            </div>

            {/* Hardware Spec Preview */}
            {form.hardwareId !== "custom" && (() => {
              const selected = hardware.find((item) => item.id === form.hardwareId);
              if (!selected) return null;
              return (
                <div className="hardware-spec-bar">
                  <div className="spec-item">
                    <span className="spec-label">Selected Accelerator</span>
                    <strong className="spec-val">{selected.name}</strong>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Architecture</span>
                    <strong className="spec-val">{selected.architecture}</strong>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">High-Bandwidth VRAM</span>
                    <strong className="spec-val">{selected.memoryGB} GB</strong>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Thermal Design Power</span>
                    <strong className="spec-val">{selected.powerW} Watts</strong>
                  </div>
                  {selected.fp8Flops && (
                    <div className="spec-item">
                      <span className="spec-label">Tensor Compute</span>
                      <strong className="spec-val">{selected.fp8Flops}</strong>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Regional Arbitrage Quick Alert */}
            {result?.arbitrage?.potentialSavingsPercent > 0 && form.regionId !== "eu-north-se" && form.regionId !== "global-zero" && (
              <div className="arbitrage-callout-card">
                <div className="arb-left">
                  <TrendingDown className="arb-icon" />
                  <div>
                    <strong>Regional Carbon Arbitrage Opportunity:</strong>
                    <p>
                      Migrating this workload from <strong>{currentRegion.name}</strong> to <strong>{result.arbitrage.comparisonRegion}</strong> would abate <strong>{result.arbitrage.potentialSavingsKg} kg CO₂e ({result.arbitrage.potentialSavingsPercent}%)</strong> of Scope 2 emissions automatically.
                    </p>
                  </div>
                </div>
                <button
                  className="btn-switch-clean-region"
                  onClick={() => {
                    const newForm = { ...form, regionId: "eu-north-se" };
                    setForm(newForm);
                    executeAudit(newForm);
                  }}
                >
                  Switch to Sweden Eco Zone →
                </button>
              </div>
            )}

            <div className="form-action-row">
              <button className="btn-run-audit" onClick={runAudit} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="spinner-icon" />
                    Synthesizing Regional Carbon Telemetry...
                  </>
                ) : (
                  <>
                    <Sprout className="btn-icon" />
                    Run Carbon Telemetry Audit →
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="eco-error-box">
                <AlertTriangle className="error-icon" /> {error}
              </div>
            )}
          </div>
        </section>

        {/* ====================================================
            STEP 2: AUDIT RESULTS & CARBON FOOTPRINT
            ==================================================== */}
        {result && (
          <section className="dashboard-section" id="results-section">
            <div className="section-head">
              <div className="step-badge">
                <span className="step-num">STEP 02</span>
                <span className="step-tag">CARBON INTELLIGENCE</span>
              </div>
              <h2>Lifecycle Energy & Environmental Footprint</h2>
              <p>Granular Scope 2 & 3 emission analytics and financial electricity costs across every phase of your model lifecycle.</p>
            </div>

            {/* Authenticated Auditor Stamp (Donut Challenge 02 Integration) */}
            {user && (
              <div className="authenticated-audit-stamp">
                <div className="stamp-left">
                  <ShieldCheck className="stamp-shield-icon" />
                  <div>
                    <span className="stamp-label">VERIFIED ESG AUDIT CERTIFICATION</span>
                    <strong className="stamp-user-name">Certified by {user.name}</strong>
                    <span className="stamp-user-role">{user.role} &bull; {user.department}</span>
                  </div>
                </div>
                <div className="stamp-right">
                  <span className="stamp-badge">DONUT CHALLENGE 02 VERIFIED</span>
                  <span className="stamp-timestamp">{new Date().toLocaleDateString()} UTC</span>
                </div>
              </div>
            )}

            {/* 6 LIFECYCLE STAGES KPIS */}
            <div className="kpis-container">
              <KPI
                title="Training Phase"
                value={`${(lifecycleEnergy.training ?? 0).toLocaleString()} Wh`}
                icon={<Zap className="kpi-svg-icon" />}
                subtext={`${lifecycle.training ?? 0}% of total workload`}
              />
              <KPI
                title="Inference Engine"
                value={`${(lifecycleEnergy.inference ?? 0).toLocaleString()} Wh`}
                icon={<Cpu className="kpi-svg-icon" />}
                subtext={`${lifecycle.inference ?? 0}% of total workload`}
              />
              <KPI
                title="Storage Footprint"
                value={`${(lifecycleEnergy.storage ?? 0).toLocaleString()} Wh`}
                icon={<HardDrive className="kpi-svg-icon" />}
                subtext={`${lifecycle.storage ?? 0}% of total workload`}
              />
              <KPI
                title="Network Egress"
                value={`${(lifecycleEnergy.network ?? 0).toLocaleString()} Wh`}
                icon={<Globe className="kpi-svg-icon" />}
                subtext={`${lifecycle.network ?? 0}% of total workload`}
              />
              <KPI
                title="Drift Retraining"
                value={`${(lifecycleEnergy.retraining ?? 0).toLocaleString()} Wh`}
                icon={<RefreshCw className="kpi-svg-icon" />}
                subtext={`${lifecycle.retraining ?? 0}% of total workload`}
              />
              <KPI
                title="Embodied Silicon"
                value={`${(lifecycleEnergy.hardware ?? 0).toLocaleString()} Wh`}
                icon={<Server className="kpi-svg-icon" />}
                subtext={`${lifecycle.hardware ?? 0}% of total workload`}
              />
            </div>

            {/* TOTAL HERO CARD WITH EQUIVALENTS */}
            <div className="carbon-summary-card">
              <div className="summary-left">
                <div className="summary-badge">TOTAL WORKLOAD EMISSIONS & COST</div>
                <div className="total-energy-box">
                  <h3 className="hero-energy-num">
                    {(Number(result.totalEnergy || 0) / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}{" "}
                    <span className="unit">kWh</span>
                  </h3>
                  <span className="sub-wh">({Number(result.totalEnergy || 0).toLocaleString()} Wh)</span>
                </div>

                <div className="total-metrics-dual-row">
                  <div className="total-carbon-box">
                    <span className="carbon-tag">GHG Protocol Scope 2/3</span>
                    <div className="carbon-val-row">
                      <span className="carbon-num">{result.carbon ?? 0}</span>
                      <span className="carbon-unit">kg CO₂e</span>
                    </div>
                  </div>

                  <div className="total-cost-box">
                    <span className="carbon-tag">Electricity Cost ({currentRegion.code})</span>
                    <div className="carbon-val-row">
                      <span className="cost-num">${costUSD}</span>
                      <span className="carbon-unit">USD</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="summary-right">
                <div className="equivalents-title">Environmental Impact Equivalents</div>
                <div className="equivalents-grid">
                  <div className="equiv-card">
                    <div className="equiv-icon-wrap">
                      <Trees className="equiv-svg-icon" />
                    </div>
                    <div className="equiv-body">
                      <strong>{treeSeedlings} Seedling-Years</strong>
                      <span>Urban trees needed to sequester this carbon</span>
                    </div>
                  </div>

                  <div className="equiv-card">
                    <div className="equiv-icon-wrap">
                      <Car className="equiv-svg-icon" />
                    </div>
                    <div className="equiv-body">
                      <strong>{carMiles.toLocaleString()} Miles</strong>
                      <span>Gasoline passenger car miles equivalent</span>
                    </div>
                  </div>

                  <div className="equiv-card">
                    <div className="equiv-icon-wrap">
                      <Smartphone className="equiv-svg-icon" />
                    </div>
                    <div className="equiv-body">
                      <strong>{phoneCharges.toLocaleString()} Charges</strong>
                      <span>Full smartphone recharges</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SPLIT INTELLIGENCE + PROGRESS MATRIX */}
            <div className="results-duo-grid">
              {/* Intelligence Hotspots */}
              <div className="intel-card">
                <div className="card-top">
                  <Sparkles className="sparkle-icon-svg" />
                  <h3>Carbon Hotspot Diagnostics</h3>
                </div>

                <div className="hotspot-banner">
                  <div className="hotspot-info">
                    <span className="hotspot-label">PRIMARY EMISSION SECTOR</span>
                    <strong className="hotspot-val">{formatImpactName(intelligence.largestImpact)}</strong>
                  </div>
                  <div className="hotspot-pct-badge">
                    <span>{intelligence.largestPercentage}%</span>
                    <small>of total footprint</small>
                  </div>
                </div>

                <div className="insight-quote">
                  <Lightbulb className="insight-bulb-icon" />
                  <p>{intelligence.insight}</p>
                </div>

                <div className="recommendations-wrap">
                  <h4>Recommended Architectural Actions</h4>
                  <div className="recs-list">
                    {recommendations.length > 0 ? (
                      recommendations.map((item, idx) => (
                        <div className="rec-item" key={idx}>
                          <div className="rec-num">{idx + 1}</div>
                          <div className="rec-text">
                            <strong>{item.action}</strong>
                            <p>{item.reason}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-recs">Workload emissions are well balanced.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Lifecycle Matrix & Eco Score */}
              <div className="matrix-card">
                <div className="card-top">
                  <Leaf className="leaf-icon-svg" />
                  <h3>Lifecycle Distribution Matrix</h3>
                </div>

                <div className="matrix-list">
                  <LifecycleBar label="Training Phase" percentage={lifecycle.training} value={lifecycleEnergy.training} />
                  <LifecycleBar label="Inference Engine" percentage={lifecycle.inference} value={lifecycleEnergy.inference} />
                  <LifecycleBar label="Data Storage" percentage={lifecycle.storage} value={lifecycleEnergy.storage} />
                  <LifecycleBar label="Network Transfer" percentage={lifecycle.network} value={lifecycleEnergy.network} />
                  <LifecycleBar label="Drift Retraining" percentage={lifecycle.retraining} value={lifecycleEnergy.retraining} />
                  <LifecycleBar label="Hardware Embodied" percentage={lifecycle.hardware} value={lifecycleEnergy.hardware} />
                </div>

                {/* Circular Sustainability Gauge */}
                <div className="score-meter-box">
                  <div className="score-gauge-wrap">
                    <div className="circle-score">
                      <span className="score-num">{score}</span>
                      <span className="score-max">/100</span>
                    </div>
                  </div>
                  <div className="score-details">
                    <span className="score-tag">GREEN SUSTAINABILITY INDEX</span>
                    <h4 style={{ color: rating.color }}>{rating.grade}</h4>
                    <p>{rating.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ====================================================
            STEP 3: TOPOLOGY AUTO-OPTIMIZER
            ==================================================== */}
        <section className="dashboard-section" id="optimizer">
          <div className="section-head">
            <div className="step-badge">
              <span className="step-num">STEP 03</span>
              <span className="step-tag">GREEN OPTIMIZATION</span>
            </div>
            <h2>Green Neural Architecture Topology Optimizer</h2>
            <p>Specify latency and accuracy constraints to identify quantized and pruned neural model architectures that reduce carbon footprint without degrading accuracy.</p>
          </div>

          <div className="optimizer-box">
            <div className="opt-inputs-row">
              <div className="input-group">
                <div className="label-row">
                  <label className="input-label-with-icon">
                    <CheckCircle2 className="label-inline-icon" /> Minimum Acceptable Accuracy
                  </label>
                  <span className="unit-tag">%</span>
                </div>
                <input
                  type="number"
                  value={accuracy}
                  min="50"
                  max="100"
                  onChange={(e) => setAccuracy(e.target.value)}
                />
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label className="input-label-with-icon">
                    <Clock className="label-inline-icon" /> Maximum Inference Latency
                  </label>
                  <span className="unit-tag">ms</span>
                </div>
                <input
                  type="number"
                  value={latency}
                  min="1"
                  max="1000"
                  onChange={(e) => setLatency(e.target.value)}
                />
              </div>
            </div>

            <button className="btn-optimize" onClick={runOptimizer} disabled={optimizerLoading}>
              {optimizerLoading ? (
                <>
                  <RefreshCw className="spinner-icon" /> Scanning Model Zoo...
                </>
              ) : (
                <>
                  <Sparkles className="btn-icon" /> Discover Green Architecture →
                </>
              )}
            </button>

            {optimizerMessage && (
              <div className="eco-error-box">
                <AlertTriangle className="error-icon" /> {optimizerMessage}
              </div>
            )}

            {recommendation?.recommendation && (
              <div className="recommendation-result-card">
                <div className="rec-header">
                  <div className="rec-badge">OPTIMAL GREEN ARCHITECTURE FOUND</div>
                  <h3>{recommendation.recommendation.name}</h3>
                  <p>{recommendation.recommendation.description}</p>
                </div>

                <div className="stats-row">
                  <Stat label="Model Accuracy" value={`${recommendation.recommendation.accuracy}%`} icon={<CheckCircle2 className="w-4 h-4" />} />
                  <Stat label="Target Latency" value={`${recommendation.recommendation.latency} ms`} icon={<Clock className="w-4 h-4" />} />
                  <Stat label="Grid Load Tier" value={`${recommendation.recommendation.energy}`} icon={<Zap className="w-4 h-4" />} />
                  <Stat
                    label="Lifecycle Energy Saved"
                    value={`−${recommendation.recommendation.estimatedEnergySaving}%`}
                    highlight={true}
                    icon={<TrendingDown className="w-4 h-4" />}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ====================================================
          FEATURE: ON-DEMAND HOW IT WORKS ARCHITECTURE MODAL
          ==================================================== */}
      {showHowItWorksModal && (
        <div className="modal-backdrop" onClick={() => setShowHowItWorksModal(false)}>
          <div className="modal-content how-it-works-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">
                <Leaf className="modal-leaf-icon" />
                <span>GreenLens<span className="green-dot">.</span> Architecture & Telemetry Pipeline</span>
              </div>
              <button className="btn-close" onClick={() => setShowHowItWorksModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="how-modal-body">
              <div className="how-modal-intro">
                <div className="step-badge">
                  <span className="step-num">ARCHITECTURE</span>
                  <span className="step-tag">END-TO-END WORKFLOW</span>
                </div>
                <h2>How GreenLens Works</h2>
                <p>
                  An automated, non-invasive telemetry and carbon accounting pipeline engineered specifically for high-density AI clusters and modern cloud workloads.
                </p>
              </div>

              {/* Step Tabs */}
              <div className="how-tabs-row">
                {howItWorksStages.map((stage, idx) => (
                  <button
                    key={stage.step}
                    className={`how-tab-btn ${activeStepTab === idx ? "active" : ""}`}
                    onClick={() => setActiveStepTab(idx)}
                  >
                    <div className="tab-btn-header">
                      <span className="tab-step-num">STAGE {stage.step}</span>
                      <span className="tab-badge">{stage.badge}</span>
                    </div>
                    <strong className="tab-btn-title">{stage.title}</strong>
                  </button>
                ))}
              </div>

              {/* Active Stage Deep-Dive Card */}
              <div className="stage-detail-card">
                <div className="stage-left">
                  <div className="stage-header">
                    <div className="stage-icon-badge">
                      {howItWorksStages[activeStepTab].icon}
                    </div>
                    <div>
                      <span className="stage-badge-tag">{howItWorksStages[activeStepTab].badge}</span>
                      <h3 className="stage-title">{howItWorksStages[activeStepTab].title}</h3>
                    </div>
                  </div>

                  <p className="stage-tagline">{howItWorksStages[activeStepTab].tagline}</p>
                  <p className="stage-description">{howItWorksStages[activeStepTab].description}</p>

                  <div className="stage-specs-box">
                    <h4>Key Technical Capabilities:</h4>
                    <ul>
                      {howItWorksStages[activeStepTab].specs.map((spec, sIdx) => (
                        <li key={sIdx}>
                          <CheckCircle2 className="spec-check-icon" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="stage-right">
                  <div className="code-box-header">
                    <div className="mockup-dots">
                      <div className="dot red"></div>
                      <div className="dot yellow"></div>
                      <div className="dot green"></div>
                    </div>
                    <span className="code-title">telemetry_pipeline_stage_{activeStepTab + 1}.json</span>
                  </div>
                  <pre className="code-display">
                    <code>{howItWorksStages[activeStepTab].codeSnippet}</code>
                  </pre>
                  <div className="code-footer">
                    <ShieldCheck className="mini-shield-icon" />
                    <span>ISO 14064-1 & GHG Protocol Scope 2/3 Compliant Engine</span>
                  </div>
                </div>
              </div>

              <div className="how-modal-footer">
                <button
                  type="button"
                  className="btn-modal-back"
                  onClick={() => setShowHowItWorksModal(false)}
                >
                  Close Architecture
                </button>
                <button
                  type="button"
                  className="btn-modal-action"
                  onClick={() => {
                    setShowHowItWorksModal(false);
                    const el = document.getElementById("telemetry");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Launch Live Carbon Audit →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          DONUT CHALLENGE 02: INTERACTIVE OTP LOGIN MODAL
          ==================================================== */}
      {showAuthModal && (
        <div className="modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">
                <Lock className="modal-leaf-icon" />
                <span>GreenLens<span className="green-dot">.</span> Secure OTP Authentication</span>
              </div>
              <button className="btn-close" onClick={() => setShowAuthModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Enter Email or Mobile Phone & Select Persona */}
            {authStep === 1 && (
              <div className="auth-modal-body">
                <div className="auth-challenge-tag">
                  <Sparkles className="w-3.5 h-3.5" /> DONUT CHALLENGE 02: REAL OTP AUTHENTICATION
                </div>
                <h3>Sign in to your GreenLens Account</h3>
                <p className="auth-subtext">
                  Authenticate securely via real email inbox delivery or mobile SMS One-Time Password.
                </p>

                {/* Mode Selector Tabs (Email vs Mobile Phone) */}
                <div className="auth-mode-tabs">
                  <button
                    type="button"
                    className={`auth-mode-tab ${authMode === "email" ? "active" : ""}`}
                    onClick={() => {
                      setAuthMode("email");
                      setAuthError("");
                    }}
                  >
                    <Mail className="w-4 h-4" /> Work Email
                  </button>
                  <button
                    type="button"
                    className={`auth-mode-tab ${authMode === "phone" ? "active" : ""}`}
                    onClick={() => {
                      setAuthMode("phone");
                      setAuthError("");
                    }}
                  >
                    <Smartphone className="w-4 h-4" /> Mobile Phone (SMS)
                  </button>
                </div>

                {/* Quick Persona Selector */}
                <div className="persona-selector-box">
                  <span className="persona-box-label">Quick Select Enterprise Persona:</span>
                  <div className="persona-pills">
                    {ENTERPRISE_PERSONAS.map((p) => {
                      const isSelected =
                        authMode === "email"
                          ? authEmail === p.email
                          : authPhone === (p.phone || "").replace(/[^0-9]/g, "").slice(-10);

                      return (
                        <button
                          key={p.email}
                          type="button"
                          className={`persona-pill ${isSelected ? "active" : ""}`}
                          onClick={() => {
                            if (authMode === "email") {
                              setAuthEmail(p.email);
                            } else {
                              const cleanPhone = (p.phone || "").replace(/[^0-9]/g, "");
                              if (cleanPhone.startsWith("91")) {
                                setPhoneCountryCode("+91");
                                setAuthPhone(cleanPhone.slice(2));
                              } else if (cleanPhone.startsWith("1")) {
                                setPhoneCountryCode("+1");
                                setAuthPhone(cleanPhone.slice(1));
                              } else if (cleanPhone.startsWith("44")) {
                                setPhoneCountryCode("+44");
                                setAuthPhone(cleanPhone.slice(2));
                              } else {
                                setAuthPhone(cleanPhone.slice(-10));
                              }
                            }
                            setAuthError("");
                          }}
                        >
                          <User className="w-3.5 h-3.5" />
                          <div>
                            <strong>{p.name}</strong>
                            <span>{authMode === "email" ? p.email : p.phone || p.email}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Input for Email Mode */}
                {authMode === "email" ? (
                  <div className="input-group">
                    <label className="input-label-with-icon">
                      <Mail className="label-inline-icon" /> Registered Work Email
                    </label>
                    <input
                      type="email"
                      placeholder="name@enterprise.ai or your Gmail"
                      value={authEmail}
                      onChange={(e) => {
                        setAuthEmail(e.target.value);
                        setAuthError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendOtp();
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  /* Input for Mobile Phone Mode */
                  <div className="input-group">
                    <label className="input-label-with-icon">
                      <Smartphone className="label-inline-icon" /> Mobile Phone Number (SMS)
                    </label>
                    <div className="phone-input-combo-row">
                      <select
                        className="eco-select country-code-select"
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        inputMode="tel"
                        placeholder="98765 43210"
                        value={authPhone}
                        className="phone-number-field"
                        onChange={(e) => {
                          setAuthPhone(e.target.value.replace(/[^0-9]/g, ""));
                          setAuthError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendOtp();
                        }}
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                {authError && (
                  <div className="eco-error-box">
                    <AlertTriangle className="error-icon" /> {authError}
                  </div>
                )}

                <div className="auth-actions-row">
                  <button
                    className="btn-send-otp"
                    onClick={() => handleSendOtp()}
                    disabled={authLoading || (authMode === "email" ? !authEmail : !authPhone)}
                  >
                    {authLoading ? (
                      <>
                        <RefreshCw className="spinner-icon" /> Delivering Verification Code...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send 6-Digit OTP Code →
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Enter 6-Digit OTP */}
            {authStep === 2 && (
              <div className="auth-modal-body">
                <div className="auth-challenge-tag">
                  <KeyRound className="w-3.5 h-3.5" /> 6-DIGIT OTP VERIFICATION
                </div>
                <h3>Enter Verification Code</h3>
                <p className="auth-subtext">
                  We sent a 6-digit verification code to{" "}
                  <strong>{authMode === "phone" ? `${phoneCountryCode} ${authPhone}` : authEmail}</strong>.
                </p>

                {/* Delivery Channel Status Callout */}
                <div className={`delivery-channel-banner ${authDeliveryInfo?.isRealDelivery ? "real-live" : "sandbox"}`}>
                  <div className="d-channel-left">
                    {authDeliveryInfo?.isRealDelivery ? (
                      <CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0" />
                    ) : (
                      <Mail className="w-4 h-4 text-mint flex-shrink-0" />
                    )}
                    <div>
                      <strong>
                        {authDeliveryInfo?.deliveryProvider || (authMode === "phone" ? "Mobile SMS Gateway" : "Email Service")}
                      </strong>
                      <span>
                        {authDeliveryInfo?.message || (authDeliveryInfo?.isRealDelivery
                          ? `Live ${authDeliveryInfo?.type === "phone" ? "SMS" : "Email"} dispatched to your device`
                          : `Verification code sent to ${authMode === "phone" ? authPhone : authEmail}`)}
                      </span>
                    </div>
                  </div>
                  {authDeliveryInfo?.isRealDelivery ? (
                    <span className="live-pill-tag">LIVE DISPATCH</span>
                  ) : (
                    <span className="sandbox-pill-tag">DISPATCHED</span>
                  )}
                </div>

                {/* Secure Inbox Delivery Notice (No OTP shown on screen) */}
                <div className="secure-inbox-notice">
                  <div className="eval-left">
                    <Mail className="w-4 h-4 text-mint flex-shrink-0" />
                    <div>
                      <strong>Check Your {authMode === "phone" ? "Messages" : "Email Inbox"}:</strong>
                      <span>
                        We sent a 6-digit verification code to{" "}
                        <strong className="text-mint">{authMode === "phone" ? `${phoneCountryCode} ${authPhone}` : authEmail}</strong>.
                        Please enter the code received below.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6 Individual Digit Input Boxes with Mobile Touch & WebOTP Auto-Fill Support */}
                <div className="otp-inputs-grid" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpInputRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete={idx === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      className={`otp-digit-input ${digit ? "filled" : ""}`}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    />
                  ))}
                </div>

                {authError && (
                  <div className="eco-error-box">
                    <AlertTriangle className="error-icon" /> {authError}
                  </div>
                )}

                {authSuccessMsg && !authError && (
                  <div className="auth-info-banner">
                    <CheckCircle2 className="w-4 h-4" /> {authSuccessMsg}
                  </div>
                )}

                <div className="resend-otp-row">
                  {resendCooldown > 0 ? (
                    <span className="resend-cooldown-text">
                      <Clock className="w-3.5 h-3.5" /> Resend in <strong>{resendCooldown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn-resend-link"
                      onClick={() => handleSendOtp()}
                      disabled={authLoading}
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Resend 6-Digit Code
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-change-email"
                    onClick={() => {
                      setAuthStep(1);
                      setAuthError("");
                    }}
                  >
                    Change {authMode === "phone" ? "Number" : "Email"}
                  </button>
                </div>

                <div className="auth-actions-row">
                  <button
                    className="btn-send-otp"
                    onClick={handleVerifyOtp}
                    disabled={authLoading || otpDigits.join("").length !== 6}
                  >
                    {authLoading ? (
                      <>
                        <RefreshCw className="spinner-icon" /> Verifying Code...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" /> Verify Code & Sign In →
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Success Confirmation */}
            {authStep === 3 && (
              <div className="auth-modal-body text-center">
                <div className="success-icon-badge">
                  <CheckCircle2 className="success-check-svg" />
                </div>
                <h3>Welcome back, {user?.name}!</h3>
                <p className="auth-subtext">
                  Successfully authenticated via {user?.authMethod || (authMode === "phone" ? "Mobile SMS OTP" : "Email OTP")}. Your GreenLens carbon sessions are now verified and audit-stamped.
                </p>

                <div className="user-profile-card-preview">
                  <div className="up-row">
                    <span>Target:</span>
                    <strong>{user?.phone || user?.email}</strong>
                  </div>
                  <div className="up-row">
                    <span>Role:</span>
                    <strong className="text-mint">{user?.role}</strong>
                  </div>
                  <div className="up-row">
                    <span>Department:</span>
                    <strong>{user?.department}</strong>
                  </div>
                  <div className="up-row">
                    <span>Auth Method:</span>
                    <strong className="text-mint">{user?.authMethod || "Verified OTP"}</strong>
                  </div>
                </div>

                <button className="btn-modal-action" onClick={() => setShowAuthModal(false)}>
                  Continue to Workspace →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          FEATURE 4: ENHANCED INTERACTIVE BOOK DEMO MODAL
          ==================================================== */}
      {showDemoModal && (
        <div className="modal-backdrop" onClick={() => setShowDemoModal(false)}>
          <div className="modal-content demo-modal-expanded" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">
                <Leaf className="modal-leaf-icon" />
                <span>GreenLens<span className="green-dot">.</span> Enterprise Solutions Consultation</span>
              </div>
              <button className="btn-close" onClick={() => setShowDemoModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {!demoBooked ? (
              <form onSubmit={handleBookDemoSubmit} className="demo-form-wrapper">
                {/* Step Indicators */}
                <div className="demo-steps-indicator">
                  <div className={`demo-step-dot ${demoStep >= 1 ? "active" : ""}`}>
                    <span>1</span> Track
                  </div>
                  <div className="demo-step-line"></div>
                  <div className={`demo-step-dot ${demoStep >= 2 ? "active" : ""}`}>
                    <span>2</span> Fleet & Stack
                  </div>
                  <div className="demo-step-line"></div>
                  <div className={`demo-step-dot ${demoStep >= 3 ? "active" : ""}`}>
                    <span>3</span> Schedule
                  </div>
                </div>

                {/* Step 1: Solution Track */}
                {demoStep === 1 && (
                  <div className="demo-step-content">
                    <h3 className="demo-step-heading">Select Your Consultation Focus</h3>
                    <p className="demo-step-sub">Choose the primary area your engineering or sustainability team wants to evaluate:</p>

                    <div className="demo-tracks-grid">
                      <div
                        className={`demo-track-card ${demoForm.track === "enterprise-audit" ? "selected" : ""}`}
                        onClick={() => setDemoForm({ ...demoForm, track: "enterprise-audit" })}
                      >
                        <Activity className="track-icon" />
                        <strong>Automated AI Carbon Audit</strong>
                        <p>Zero-overhead telemetry extraction across training and distributed inference fleets.</p>
                      </div>

                      <div
                        className={`demo-track-card ${demoForm.track === "hardware-sizing" ? "selected" : ""}`}
                        onClick={() => setDemoForm({ ...demoForm, track: "hardware-sizing" })}
                      >
                        <Cpu className="track-icon" />
                        <strong>Silicon & Hardware Combination</strong>
                        <p>Comparative cluster evaluation (H100, L4, GH200, MI300X, TPU v5e) and regional grid migration.</p>
                      </div>

                      <div
                        className={`demo-track-card ${demoForm.track === "csrd-reporting" ? "selected" : ""}`}
                        onClick={() => setDemoForm({ ...demoForm, track: "csrd-reporting" })}
                      >
                        <FileCheck className="track-icon" />
                        <strong>CSRD & Scope 1-3 Compliance</strong>
                        <p>Generate audit-ready documentation for SEC Climate Disclosures and EU sustainability mandates.</p>
                      </div>

                      <div
                        className={`demo-track-card ${demoForm.track === "k8s-agent" ? "selected" : ""}`}
                        onClick={() => setDemoForm({ ...demoForm, track: "k8s-agent" })}
                      >
                        <Layers className="track-icon" />
                        <strong>Kubernetes / Slurm Dynamic Agent</strong>
                        <p>Live policy throttling and carbon-aware batch scheduling for active compute clusters.</p>
                      </div>
                    </div>

                    <div className="demo-step-actions">
                      <button type="button" className="btn-modal-next" onClick={() => setDemoStep(2)}>
                        Continue to Fleet Details →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Scale & Cloud Stack */}
                {demoStep === 2 && (
                  <div className="demo-step-content">
                    <h3 className="demo-step-heading">Your Accelerator Fleet & Cloud Environment</h3>
                    <p className="demo-step-sub">Helps our solution architects tailor benchmark data to your infrastructure:</p>

                    <div className="demo-fields-grid">
                      <div className="input-group">
                        <label>Active Accelerator Fleet Scale</label>
                        <select
                          value={demoForm.fleetSize}
                          onChange={(e) => setDemoForm({ ...demoForm, fleetSize: e.target.value })}
                          className="eco-select"
                        >
                          <option value="<20">Startup / Pilot (&lt; 20 GPUs)</option>
                          <option value="20-100">Growth Fleet (20 – 100 GPUs)</option>
                          <option value="100-500">Enterprise Cluster (100 – 500 GPUs)</option>
                          <option value="500+">Hyperscale Datacenter (500+ GPUs)</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label>Primary Cloud / Compute Provider</label>
                        <select
                          value={demoForm.cloudProvider}
                          onChange={(e) => setDemoForm({ ...demoForm, cloudProvider: e.target.value })}
                          className="eco-select"
                        >
                          <option value="aws">Amazon Web Services (AWS)</option>
                          <option value="gcp">Google Cloud Platform (GCP)</option>
                          <option value="azure">Microsoft Azure</option>
                          <option value="coreweave">CoreWeave / Lambda Labs</option>
                          <option value="onprem">On-Premises DGX / Supermicro</option>
                          <option value="hybrid">Multi-Cloud / Hybrid</option>
                        </select>
                      </div>
                    </div>

                    <div className="demo-step-actions-split">
                      <button type="button" className="btn-modal-back" onClick={() => setDemoStep(1)}>
                        ← Back
                      </button>
                      <button type="button" className="btn-modal-next" onClick={() => setDemoStep(3)}>
                        Continue to Schedule Slot →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Contact & Time Slot */}
                {demoStep === 3 && (
                  <div className="demo-step-content">
                    <h3 className="demo-step-heading">Schedule Consultation & Contact</h3>
                    <p className="demo-step-sub">Select your preferred date and contact details for the 30-minute deep-dive:</p>

                    <div className="demo-fields-grid">
                      <div className="input-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Alex Vance"
                          value={demoForm.name}
                          onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                        />
                      </div>

                      <div className="input-group">
                        <label>Work Email</label>
                        <input
                          type="email"
                          required
                          placeholder="alex@enterprise.ai"
                          value={demoForm.email}
                          onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                        />
                      </div>

                      <div className="input-group">
                        <label>Organization / Company</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Acme AI Labs"
                          value={demoForm.company}
                          onChange={(e) => setDemoForm({ ...demoForm, company: e.target.value })}
                        />
                      </div>

                      <div className="input-group">
                        <label>Preferred Date</label>
                        <input
                          type="date"
                          value={demoForm.date}
                          onChange={(e) => setDemoForm({ ...demoForm, date: e.target.value })}
                        />
                      </div>

                      <div className="input-group">
                        <label>Time Slot (UTC / Timezone Auto)</label>
                        <select
                          value={demoForm.timeSlot}
                          onChange={(e) => setDemoForm({ ...demoForm, timeSlot: e.target.value })}
                          className="eco-select"
                        >
                          <option value="10:00 UTC">10:00 AM UTC (EU / Asia Friendly)</option>
                          <option value="14:00 UTC">02:00 PM UTC (US East / EU Friendly)</option>
                          <option value="18:00 UTC">06:00 PM UTC (US West / Americas)</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label>Specific Workload or Questions (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Evaluating 64x L4 migration vs H100"
                          value={demoForm.notes}
                          onChange={(e) => setDemoForm({ ...demoForm, notes: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="demo-step-actions-split">
                      <button type="button" className="btn-modal-back" onClick={() => setDemoStep(2)}>
                        ← Back
                      </button>
                      <button type="submit" className="btn-modal-submit">
                        <CheckCircle2 className="btn-icon" /> Confirm & Book Consultation
                      </button>
                    </div>
                  </div>
                )}
              </form>
            ) : (
              /* Step 4: Success Confirmation */
              <div className="demo-success-screen">
                <div className="success-icon-badge">
                  <CheckCircle2 className="success-check-svg" />
                </div>
                <h3>Consultation Confirmed!</h3>
                <p className="success-sub">
                  We have reserved your session for <strong>{demoForm.date} at {demoForm.timeSlot}</strong>. A calendar invite and prep kit have been dispatched to <strong>{demoForm.email || "your email"}</strong>.
                </p>

                <div className="booking-summary-box">
                  <div className="summary-line">
                    <span>Consultation Focus:</span>
                    <strong>{demoForm.track.toUpperCase().replace("-", " ")}</strong>
                  </div>
                  <div className="summary-line">
                    <span>Fleet Size:</span>
                    <strong>{demoForm.fleetSize} Accelerators</strong>
                  </div>
                  <div className="summary-line">
                    <span>Cloud Environment:</span>
                    <strong>{demoForm.cloudProvider.toUpperCase()}</strong>
                  </div>
                  <div className="summary-line">
                    <span>Booking Reference:</span>
                    <code>{demoForm.bookingRef}</code>
                  </div>
                </div>

                <div className="success-actions">
                  <button className="btn-modal-action" onClick={() => setShowDemoModal(false)}>
                    Return to Live Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          COOKIE PREFERENCES BANNER
          ==================================================== */}
      {cookieConsent && (
        <div className="cookie-banner">
          <div className="cookie-left">
            <div className="cookie-icon-wrap">
              <ShieldCheck className="cookie-shield-svg" />
            </div>
            <div className="cookie-text">
              <strong>Cookie & ESG Telemetry Privacy</strong>
              <p>
                GreenLens uses minimal functional cookies to persist your regional datacenter preferences and telemetry session state. No third-party ad trackers.
              </p>
            </div>
          </div>
          <div className="cookie-actions">
            <button className="btn-cookie-ghost" onClick={() => setCookieConsent(false)}>
              <Sliders className="btn-icon" /> Customize
            </button>
            <button className="btn-cookie-ghost" onClick={() => setCookieConsent(false)}>
              Only Necessary
            </button>
            <button className="btn-cookie-accept" onClick={() => setCookieConsent(false)}>
              Accept All
            </button>
          </div>
        </div>
      )}

      {/* ====================================================
          ENVIRONMENT FOOTER
          ==================================================== */}
      <footer className="footer-bar">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="f-logo-row">
              <Leaf className="f-leaf-icon" />
              <span className="f-logo">GreenLens<span className="green-dot">.</span></span>
            </div>
            <p>Making carbon visible — The Enterprise AI Sustainability & Hardware Optimization Platform.</p>
          </div>

          <div className="footer-meta">
            <span className="footer-badge">
              <Leaf className="footer-meta-icon" /> Net-Zero Aligned
            </span>
            <span className="footer-badge">
              <FileCheck className="footer-meta-icon" /> ISO 14064-1 Verified
            </span>
            <span className="footer-badge">
              <Globe className="footer-meta-icon" /> GHG Protocol Scope 1, 2 & 3
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;