import { useCallback, useEffect, useState } from "react";
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
  Cpu,
  DollarSign,
  Eye,
  FileCheck,
  Gauge,
  Globe,
  HardDrive,
  Layers,
  Leaf,
  Lightbulb,
  MapPin,
  Play,
  RefreshCw,
  Server,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Sprout,
  TrendingDown,
  Trees,
  X,
  Zap
} from "lucide-react";
import "./App.css";
import { HARDWARE_CACHE, REGIONS_CACHE, runOfflineAudit } from "./utils/offlineEngine";

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

const FALLBACK_COMBOS = {
  llm: {
    title: "Large Language Model (70B+ Fine-Tuning & Inference)",
    baselineGPU: "NVIDIA H100 SXM5",
    baselineCount: 32,
    baselineTDP: 22400,
    baselineAnnualKWh: 196224,
    combinations: [
      {
        id: "combo-eco",
        title: "Ultra-Efficient Quantized Tier",
        category: "Lowest Carbon Footprint",
        tag: "Eco Leader",
        hardwareId: "l4",
        hardwareName: "NVIDIA L4 Tensor Core",
        gpuCount: 64,
        perGpuPowerW: 72,
        totalPowerW: 4608,
        annualEnergyKWh: 40366,
        carbonReductionPct: 79.4,
        vramCapacityGB: 1536,
        estAnnualCost: Math.round(40366 * 0.11),
        rationale: "INT8 / FP8 quantized model partition across distributed L4 nodes cuts aggregate power draw by 79% while preserving serving throughput.",
        architecture: "Ada Lovelace",
        batchingStrategy: "Dynamic Continuous Batching (vLLM)",
        recommendedFor: "High-volume 7B to 70B quantized production inference."
      },
      {
        id: "combo-balanced",
        title: "High-Bandwidth Balanced Supercluster",
        category: "Optimal Performance / Watt",
        tag: "Best Balance",
        hardwareId: "a100",
        hardwareName: "NVIDIA A100 80GB",
        gpuCount: 16,
        perGpuPowerW: 400,
        totalPowerW: 6400,
        annualEnergyKWh: 56064,
        carbonReductionPct: 71.4,
        vramCapacityGB: 1280,
        estAnnualCost: Math.round(56064 * 0.11),
        rationale: "16x A100 80GB with FP16 flash attention matches throughput of larger unoptimized clusters at one third the energy profile.",
        architecture: "Ampere",
        batchingStrategy: "PagedAttention + FlashAttention-2",
        recommendedFor: "Mixed fine-tuning cycles and low-latency inference."
      },
      {
        id: "combo-throughput",
        title: "Unified Memory Megacluster",
        category: "Maximum Throughput & VRAM",
        tag: "Peak Throughput",
        hardwareId: "gh200",
        hardwareName: "NVIDIA GH200 Grace Hopper",
        gpuCount: 8,
        perGpuPowerW: 900,
        totalPowerW: 7200,
        annualEnergyKWh: 63072,
        carbonReductionPct: 67.8,
        vramCapacityGB: 4608,
        estAnnualCost: Math.round(63072 * 0.11),
        rationale: "8x GH200 superchips provide 4.6 TB of unified coherent memory with 900 GB/s NVLink-C2C bandwidth, eliminating pipeline bubbles.",
        architecture: "Grace Hopper Superchip",
        batchingStrategy: "Tensor Parallelism + Zero Redundancy",
        recommendedFor: "Full-precision 100B+ frontier models and massive context windows."
      }
    ]
  },
  vision: {
    title: "Computer Vision & Multimodal Perception",
    baselineGPU: "NVIDIA A100 80GB",
    baselineCount: 8,
    baselineTDP: 3200,
    baselineAnnualKWh: 28032,
    combinations: [
      {
        id: "combo-vision-eco",
        title: "Edge Vision Specialized Node",
        category: "Lowest Carbon Footprint",
        tag: "Eco Leader",
        hardwareId: "l4",
        hardwareName: "NVIDIA L4 Tensor Core",
        gpuCount: 4,
        perGpuPowerW: 72,
        totalPowerW: 288,
        annualEnergyKWh: 2522,
        carbonReductionPct: 91.0,
        vramCapacityGB: 96,
        estAnnualCost: Math.round(2522 * 0.11),
        rationale: "4x L4 units leverage 4th-gen Tensor Cores and optical flow accelerators for 120 FPS video analytics at under 300 Watts total.",
        architecture: "Ada Lovelace",
        batchingStrategy: "TensorRT INT8 Precision Engine",
        recommendedFor: "Real-time edge video processing, OCR, and segmentation."
      },
      {
        id: "combo-vision-cloud",
        title: "Cloud ASIC Vision Pipeline",
        category: "Optimal Performance / Watt",
        tag: "Cloud Native",
        hardwareId: "inf2",
        hardwareName: "AWS Inferentia2 (inf2)",
        gpuCount: 4,
        perGpuPowerW: 190,
        totalPowerW: 760,
        annualEnergyKWh: 6657,
        carbonReductionPct: 76.2,
        vramCapacityGB: 128,
        estAnnualCost: Math.round(6657 * 0.11),
        rationale: "Hardware-optimized NeuronCores provide sustained high throughput on Vision Transformers (ViT) with lowest cloud host overhead.",
        architecture: "NeuronCore-v2",
        batchingStrategy: "Neuron SDK Dynamic Batching",
        recommendedFor: "Scalable cloud vision APIs and batch image embeddings."
      },
      {
        id: "combo-vision-high",
        title: "High-Bandwidth Spatial Training Cluster",
        category: "Maximum Training Speed",
        tag: "Rapid Convergence",
        hardwareId: "a100",
        hardwareName: "NVIDIA A100 80GB",
        gpuCount: 4,
        perGpuPowerW: 400,
        totalPowerW: 1600,
        annualEnergyKWh: 14016,
        carbonReductionPct: 50.0,
        vramCapacityGB: 320,
        estAnnualCost: Math.round(14016 * 0.11),
        rationale: "4x A100 nodes with high HBM2e bandwidth speed up high-resolution 4K diffusion and video generation workloads.",
        architecture: "Ampere",
        batchingStrategy: "Distributed Data Parallel (DDP)",
        recommendedFor: "Training 3D NeRFs, video generative models, and multi-camera pipelines."
      }
    ]
  },
  agentic: {
    title: "Autonomous Agent & RAG Knowledge Pipeline",
    baselineGPU: "NVIDIA A100 80GB",
    baselineCount: 16,
    baselineTDP: 6400,
    baselineAnnualKWh: 56064,
    combinations: [
      {
        id: "combo-agent-eco",
        title: "Hybrid CPU-GPU Sparse Node",
        category: "Lowest Carbon Footprint",
        tag: "Eco Leader",
        hardwareId: "tpu-v5e",
        hardwareName: "Google TPU v5e",
        gpuCount: 8,
        perGpuPowerW: 175,
        totalPowerW: 1400,
        annualEnergyKWh: 12264,
        carbonReductionPct: 78.1,
        vramCapacityGB: 128,
        estAnnualCost: Math.round(12264 * 0.11),
        rationale: "TPU v5e pods provide highly efficient embedding generation, vector search matching, and lightweight re-ranking at minimal power.",
        architecture: "TPU v5e Matrix Core",
        batchingStrategy: "JAX / XLA Graph Optimization",
        recommendedFor: "Continuous RAG index updates and semantic vector search."
      },
      {
        id: "combo-agent-balanced",
        title: "Dual Tier Reasoning & Tool Engine",
        category: "Optimal Performance / Watt",
        tag: "Best Balance",
        hardwareId: "l4",
        hardwareName: "NVIDIA L4 (x8) + Host Co-Processor",
        gpuCount: 8,
        perGpuPowerW: 72,
        totalPowerW: 576,
        annualEnergyKWh: 5045,
        carbonReductionPct: 91.0,
        vramCapacityGB: 192,
        estAnnualCost: Math.round(5045 * 0.11),
        rationale: "Disaggregates reasoning steps across quantized L4 nodes with speculative decoding, lowering token generation power by 90%.",
        architecture: "Ada Lovelace Speculative",
        batchingStrategy: "Speculative Decoding + KV-Cache Offload",
        recommendedFor: "Multi-agent workflows, code interpreters, and tool invocation loops."
      },
      {
        id: "combo-agent-dense",
        title: "Massive Context Co-Processor",
        category: "Maximum Throughput & VRAM",
        tag: "High Context",
        hardwareId: "mi300x",
        hardwareName: "AMD Instinct MI300X",
        gpuCount: 4,
        perGpuPowerW: 750,
        totalPowerW: 3000,
        annualEnergyKWh: 26280,
        carbonReductionPct: 53.1,
        vramCapacityGB: 768,
        estAnnualCost: Math.round(26280 * 0.11),
        rationale: "192 GB VRAM per accelerator holds massive 1M+ token context windows entirely in ultra-fast HBM3 without KV cache eviction.",
        architecture: "CDNA 3",
        batchingStrategy: "ROCm vLLM + Flash-Attention",
        recommendedFor: "Long-document synthesis, legal discovery, and repository-wide code analysis."
      }
    ]
  }
};

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

  // Hardware Combination Suggester State
  const [workloadType, setWorkloadType] = useState("llm");
  const [combosData, setCombosData] = useState(FALLBACK_COMBOS.llm);
  const [combosLoading, setCombosLoading] = useState(false);
  const [appliedComboNotification, setAppliedComboNotification] = useState("");

  // How It Works Explorer State
  const [activeStepTab, setActiveStepTab] = useState(0);

  // Neural Optimizer State
  const [accuracy, setAccuracy] = useState(92);
  const [latency, setLatency] = useState(85);
  const [recommendation, setRecommendation] = useState(null);
  const [optimizerLoading, setOptimizerLoading] = useState(false);
  const [optimizerMessage, setOptimizerMessage] = useState("");

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

  // Fetch Hardware Combinations whenever workload type or region changes
  const loadHardwareCombinations = useCallback(async (type = workloadType, region = form.regionId) => {
    setCombosLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/hardware-combinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workloadType: type, regionId: region })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.targetWorkload) {
          setCombosData(data.targetWorkload);
          return;
        }
      }
    } catch (err) {
      console.warn("Hardware combinations fallback triggered:", err);
    } finally {
      setCombosLoading(false);
    }

    setCombosData(FALLBACK_COMBOS[type] || FALLBACK_COMBOS.llm);
  }, [workloadType, form.regionId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleRegionChange = (event) => {
    const regionId = event.target.value;
    setForm((prev) => ({ ...prev, regionId }));
    loadHardwareCombinations(workloadType, regionId);
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

  // Apply Hardware Combination into Audit
  const applyHardwareCombination = (combo) => {
    const updatedForm = {
      ...form,
      hardwareId: combo.hardwareId,
      gpuCount: combo.gpuCount,
      gpuPower: combo.perGpuPowerW
    };
    setForm(updatedForm);
    setAppliedComboNotification(`Applied ${combo.gpuCount}x ${combo.hardwareName} combination to telemetry audit.`);

    setTimeout(() => {
      setAppliedComboNotification("");
    }, 5000);

    executeAudit(updatedForm);

    const el = document.getElementById("telemetry");
    if (el) el.scrollIntoView({ behavior: "smooth" });
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

  const formatImpactName = (name) => {
    if (!name) return "None";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const currentRegion = regions.find((r) => r.id === form.regionId) || regions[0];
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
      codeSnippet: `// GreenLens Telemetry Packet Sample\n{\n  "timestamp": "2026-09-22T11:15:00Z",\n  "cluster_id": "us-east-h100-node-4",\n  "accelerator": "NVIDIA H100 SXM5",\n  "avg_power_draw_w": 684.2,\n  "memory_used_gb": 74.8,\n  "tensor_core_util": "94.2%",\n  "active_job_id": "llm-pretrain-v4"\n}`
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
            <a href="#how-it-works" className="nav-link">
              How It Works
            </a>
            <a href="#hardware-combos" className="nav-link highlight-link">
              <Sparkles className="link-icon-svg" /> Hardware Combos
            </a>
            <a href="#telemetry" className="nav-link">
              Carbon Audit
            </a>
            <a href="#regions-section" className="nav-link">
              Regional Grids
            </a>
            <a href="#optimizer" className="nav-link">
              Topology Optimizer
            </a>
          </div>

          <div className="nav-actions">
            <button className="btn-book-demo" onClick={() => { setShowDemoModal(true); setDemoBooked(false); }}>
              <Calendar className="btn-icon" />
              Book Consultation
            </button>
            <a href="#telemetry" className="btn-try-free">
              <Sprout className="btn-icon" />
              Start Free Audit
            </a>
          </div>
        </div>
      </nav>

      {/* ====================================================
          HERO SECTION
          ==================================================== */}
      <section className="hero-section" id="hero">
        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-pill-badge">
              <Leaf className="pill-leaf-icon" />
              <span>AI Sustainability & Lifecycle Intelligence Platform</span>
            </div>

            <h1 className="hero-title">
              GreenLens<span className="green-dot">.</span>
            </h1>
            <div className="hero-tagline-wrap">
              <span className="hero-tagline">Making carbon visible<span className="cursor-blink">.</span></span>
            </div>

            <p className="hero-description">
              Reveal the emissions your AI workloads keep hidden — GreenLens automatically extracts high-resolution, model-level carbon data directly from your training and inference pipelines in seconds, not months.
            </p>

            <p className="hero-subtext">
              Discover how GreenLens turns raw compute telemetry into world-class carbon intelligence with multi-region electricity matching and hardware combination optimization.
            </p>

            <div className="hero-buttons">
              <a href="#how-it-works" className="btn-hero-learn">
                <Compass className="btn-icon" />
                Explore How It Works
              </a>
              <a href="#hardware-combos" className="btn-hero-combos">
                <Sparkles className="btn-icon" />
                Suggest Best Hardware
              </a>
              <a href="#telemetry" className="btn-hero-try">
                <Sprout className="btn-icon" />
                Run Live Audit
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
            FEATURE 1: INTERACTIVE HOW IT WORKS ARCHITECTURE
            ==================================================== */}
        <section className="dashboard-section" id="how-it-works">
          <div className="section-head">
            <div className="step-badge">
              <span className="step-num">ARCHITECTURE</span>
              <span className="step-tag">END-TO-END WORKFLOW</span>
            </div>
            <h2>How GreenLens Works</h2>
            <p>
              An automated, non-invasive telemetry and carbon accounting pipeline engineered specifically for high-density AI clusters and modern cloud workloads.
            </p>
          </div>

          <div className="how-it-works-container">
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
          </div>
        </section>

        {/* ====================================================
            FEATURE 2: HARDWARE COMBINATION SUGGESTER & ARCHITECT
            ==================================================== */}
        <section className="dashboard-section" id="hardware-combos">
          <div className="section-head">
            <div className="step-badge">
              <span className="step-num">AI ARCHITECT</span>
              <span className="step-tag">SILICON OPTIMIZATION</span>
            </div>
            <h2>Best Possible Hardware Combination Suggester</h2>
            <p>
              Compare optimal multi-accelerator hardware topologies across NVIDIA, AMD, Google TPU, and AWS Inferentia silicon. Calculate energy savings and apply configurations to your audit in one click.
            </p>
          </div>

          {appliedComboNotification && (
            <div className="applied-notification-banner">
              <CheckCircle2 className="banner-icon" />
              <span>{appliedComboNotification}</span>
            </div>
          )}

          <div className="combos-control-panel">
            <div className="workload-selector-group">
              <span className="selector-label">Target Workload Profile:</span>
              <div className="selector-buttons">
                <button
                  className={`workload-btn ${workloadType === "llm" ? "active" : ""}`}
                  onClick={() => {
                    setWorkloadType("llm");
                    loadHardwareCombinations("llm", form.regionId);
                  }}
                >
                  <Bot className="btn-icon" />
                  LLM Fine-Tuning & Serving (70B+)
                </button>
                <button
                  className={`workload-btn ${workloadType === "vision" ? "active" : ""}`}
                  onClick={() => {
                    setWorkloadType("vision");
                    loadHardwareCombinations("vision", form.regionId);
                  }}
                >
                  <Eye className="btn-icon" />
                  Computer Vision & Multimodal
                </button>
                <button
                  className={`workload-btn ${workloadType === "agentic" ? "active" : ""}`}
                  onClick={() => {
                    setWorkloadType("agentic");
                    loadHardwareCombinations("agentic", form.regionId);
                  }}
                >
                  <Sparkles className="btn-icon" />
                  Agentic & RAG Search Pipeline
                </button>
              </div>
            </div>

            <div className="combos-region-indicator">
              <MapPin className="mini-pin-icon" />
              <span>Calculated with <strong>{currentRegion.name}</strong> grid tariffs (${currentRegion.electricityCost}/kWh)</span>
            </div>
          </div>

          {combosLoading ? (
            <div className="combos-loading-box">
              <RefreshCw className="spinner-icon" />
              <span>Synthesizing optimal multi-accelerator topologies...</span>
            </div>
          ) : combosData ? (
            <div className="combos-grid">
              {combosData.combinations.map((combo) => (
                <div key={combo.id} className={`combo-card ${combo.tag === "Eco Leader" ? "featured-eco" : ""}`}>
                  {combo.tag === "Eco Leader" && (
                    <div className="combo-ribbon">
                      <Leaf className="ribbon-icon" /> MAXIMUM GREEN EFFICIENCY
                    </div>
                  )}

                  <div className="combo-card-header">
                    <div className="combo-category-row">
                      <span className="combo-category">{combo.category}</span>
                      <span className={`combo-pill ${combo.tag === "Eco Leader" ? "green" : "blue"}`}>{combo.tag}</span>
                    </div>
                    <h3 className="combo-card-title">{combo.title}</h3>
                    <div className="combo-hardware-name">
                      <Server className="hw-icon" />
                      <strong>{combo.gpuCount}x {combo.hardwareName}</strong>
                    </div>
                  </div>

                  <div className="combo-metrics-grid">
                    <div className="c-metric">
                      <span className="c-label">Carbon Abatement</span>
                      <strong className="c-value highlight-green">−{combo.carbonReductionPct}%</strong>
                      <span className="c-sub">vs standard cluster</span>
                    </div>
                    <div className="c-metric">
                      <span className="c-label">Total Thermal TDP</span>
                      <strong className="c-value">{(combo.totalPowerW / 1000).toFixed(2)} kW</strong>
                      <span className="c-sub">{combo.perGpuPowerW}W per node</span>
                    </div>
                    <div className="c-metric">
                      <span className="c-label">Annual Energy Draw</span>
                      <strong className="c-value">{combo.annualEnergyKWh.toLocaleString()} kWh</strong>
                      <span className="c-sub">Continuous run</span>
                    </div>
                    <div className="c-metric">
                      <span className="c-label">Est. Electricity Cost</span>
                      <strong className="c-value">${combo.estAnnualCost.toLocaleString()}</strong>
                      <span className="c-sub">in {currentRegion.code}</span>
                    </div>
                  </div>

                  <div className="combo-specs-strip">
                    <div className="combo-spec">
                      <span className="cs-label">Architecture</span>
                      <span className="cs-val">{combo.architecture}</span>
                    </div>
                    <div className="combo-spec">
                      <span className="cs-label">VRAM Capacity</span>
                      <span className="cs-val">{combo.vramCapacityGB} GB Total</span>
                    </div>
                    <div className="combo-spec">
                      <span className="cs-label">Batch Strategy</span>
                      <span className="cs-val">{combo.batchingStrategy}</span>
                    </div>
                  </div>

                  <p className="combo-rationale">{combo.rationale}</p>

                  <div className="combo-recommended-for">
                    <span className="rec-badge-label">Best Suited For:</span>
                    <p>{combo.recommendedFor}</p>
                  </div>

                  <button
                    className="btn-apply-combo"
                    onClick={() => applyHardwareCombination(combo)}
                  >
                    <Check className="btn-icon" />
                    Apply This Combination to Audit →
                  </button>
                </div>
              ))}
            </div>
          ) : null}
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