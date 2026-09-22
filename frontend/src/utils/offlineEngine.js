// Local hardware fallback cache
export const HARDWARE_CACHE = [
  {
    id: "h100",
    name: "NVIDIA H100 SXM5",
    category: "Data Center GPU",
    architecture: "Hopper",
    memoryGB: 80,
    powerW: 700,
    fp8Flops: "3,958 TFLOPS",
    memoryBandwidth: "3.35 TB/s",
    useCase: "Hyperscale LLM training and high-throughput transformer inference"
  },
  {
    id: "a100",
    name: "NVIDIA A100 80GB",
    category: "Data Center GPU",
    architecture: "Ampere",
    memoryGB: 80,
    powerW: 400,
    fp8Flops: "624 TFLOPS (FP16)",
    memoryBandwidth: "2.0 TB/s",
    useCase: "General distributed AI training and high-memory inference"
  },
  {
    id: "l4",
    name: "NVIDIA L4 Tensor Core",
    category: "Efficient Inference GPU",
    architecture: "Ada Lovelace",
    memoryGB: 24,
    powerW: 72,
    fp8Flops: "485 TFLOPS",
    memoryBandwidth: "300 GB/s",
    useCase: "Hyper-efficient edge vision, audio, and quantized generative inference"
  },
  {
    id: "t4",
    name: "NVIDIA T4",
    category: "Legacy Inference GPU",
    architecture: "Turing",
    memoryGB: 16,
    powerW: 70,
    fp8Flops: "130 TOPS (INT8)",
    memoryBandwidth: "320 GB/s",
    useCase: "Standard production inference and microservice serving"
  },
  {
    id: "gh200",
    name: "NVIDIA GH200 Grace Hopper",
    category: "Superchip Accelerated CPU+GPU",
    architecture: "Hopper + Grace",
    memoryGB: 576,
    powerW: 900,
    fp8Flops: "4,000 TFLOPS",
    memoryBandwidth: "4.0 TB/s unified",
    useCase: "Terabyte-scale embedding lookups and giant LLM inference pipelines"
  },
  {
    id: "mi300x",
    name: "AMD Instinct MI300X",
    category: "Data Center GPU",
    architecture: "CDNA 3",
    memoryGB: 192,
    powerW: 750,
    fp8Flops: "5,220 TFLOPS",
    memoryBandwidth: "5.3 TB/s",
    useCase: "High VRAM density multi-head attention and open-weights clusters"
  },
  {
    id: "tpu-v5e",
    name: "Google TPU v5e",
    category: "Cloud ASIC",
    architecture: "v5e Tensor",
    memoryGB: 16,
    powerW: 175,
    fp8Flops: "393 TFLOPS",
    memoryBandwidth: "819 GB/s",
    useCase: "Cost-optimized large-scale serving and embeddings"
  },
  {
    id: "inf2",
    name: "AWS Inferentia2 (inf2)",
    category: "Cloud ASIC",
    architecture: "NeuronCore-v2",
    memoryGB: 32,
    powerW: 190,
    fp8Flops: "380 TFLOPS",
    memoryBandwidth: "820 GB/s",
    useCase: "Dedicated low-latency, low-wattage AWS cloud inference"
  }
];

// Local electricity regions fallback cache
export const REGIONS_CACHE = [
  {
    id: "us-east-va",
    name: "US East (N. Virginia / PJM)",
    country: "United States",
    code: "US-VA",
    carbonIntensity: 0.380,
    electricityCost: 0.11,
    renewableMix: 28,
    gridComposition: "Gas 42%, Nuclear 30%, Coal 18%, Renewables 10%",
    status: "Standard Cloud Zone"
  },
  {
    id: "us-west-or",
    name: "US West (Oregon / Bonneville Hydro)",
    country: "United States",
    code: "US-OR",
    carbonIntensity: 0.085,
    electricityCost: 0.085,
    renewableMix: 82,
    gridComposition: "Hydro 65%, Wind 17%, Gas 12%, Solar 6%",
    status: "Low Carbon Zone"
  },
  {
    id: "us-central-ia",
    name: "US Central (Iowa / Wind Belt)",
    country: "United States",
    code: "US-IA",
    carbonIntensity: 0.240,
    electricityCost: 0.080,
    renewableMix: 64,
    gridComposition: "Wind 58%, Gas 25%, Coal 12%, Nuclear 5%",
    status: "Renewable Heavy"
  },
  {
    id: "eu-north-se",
    name: "Europe North (Sweden / Hydro-Nuclear)",
    country: "Sweden",
    code: "EU-SE",
    carbonIntensity: 0.025,
    electricityCost: 0.14,
    renewableMix: 96,
    gridComposition: "Hydro 45%, Nuclear 35%, Wind 18%, Bio 2%",
    status: "Ultra-Clean Eco Zone"
  },
  {
    id: "eu-west-de",
    name: "Europe Central (Frankfurt / Germany)",
    country: "Germany",
    code: "EU-DE",
    carbonIntensity: 0.350,
    electricityCost: 0.24,
    renewableMix: 52,
    gridComposition: "Wind/Solar 48%, Coal/Gas 42%, Biomass 10%",
    status: "High Tariff Industrial"
  },
  {
    id: "eu-west-fr",
    name: "Europe West (Paris / France Nuclear)",
    country: "France",
    code: "EU-FR",
    carbonIntensity: 0.052,
    electricityCost: 0.18,
    renewableMix: 92,
    gridComposition: "Nuclear 68%, Hydro 12%, Wind/Solar 14%, Gas 6%",
    status: "Ultra-Low Carbon"
  },
  {
    id: "eu-west-ie",
    name: "Europe West (Dublin / Ireland)",
    country: "Ireland",
    code: "EU-IE",
    carbonIntensity: 0.280,
    electricityCost: 0.22,
    renewableMix: 42,
    gridComposition: "Wind 36%, Gas 50%, Solar 6%, Imports 8%",
    status: "Datacenter Hub"
  },
  {
    id: "ap-east-jp",
    name: "Asia East (Tokyo / Japan Grid)",
    country: "Japan",
    code: "AP-JP",
    carbonIntensity: 0.460,
    electricityCost: 0.21,
    renewableMix: 24,
    gridComposition: "LNG 36%, Coal 28%, Solar/Hydro 22%, Nuclear 14%",
    status: "Thermal-Transition"
  },
  {
    id: "ap-south-in",
    name: "Asia South (Mumbai / India Grid)",
    country: "India",
    code: "AP-IN",
    carbonIntensity: 0.720,
    electricityCost: 0.12,
    renewableMix: 22,
    gridComposition: "Coal 68%, Solar/Wind 20%, Hydro 9%, Nuclear 3%",
    status: "High Carbon Intensity"
  },
  {
    id: "ap-southeast-sg",
    name: "Asia Southeast (Singapore Grid)",
    country: "Singapore",
    code: "AP-SG",
    carbonIntensity: 0.405,
    electricityCost: 0.23,
    renewableMix: 8,
    gridComposition: "Natural Gas 92%, Solar 8%",
    status: "High Cost Natural Gas"
  },
  {
    id: "global-zero",
    name: "24/7 Zero-Carbon PPA (Certified Renewable)",
    country: "Global Direct PPA",
    code: "PPA-100",
    carbonIntensity: 0.000,
    electricityCost: 0.15,
    renewableMix: 100,
    gridComposition: "100% Hourly-Matched Solar, Wind & Geothermal Battery",
    status: "Zero Scope 2 Net"
  }
];

// Offline calculation logic (runs completely in-browser during outages)
export function runOfflineAudit(payload) {
  const power = Number(payload.gpuPower) || 400;
  const count = Number(payload.gpuCount) || 1;
  const regionId = payload.regionId || "us-east-va";
  const selectedRegion = REGIONS_CACHE.find((r) => r.id === regionId) || REGIONS_CACHE[0];

  const trainingEnergy = payload.trainingHours * power * count;
  const dailyInferenceEnergy = payload.requestsPerDay * payload.energyPerRequest;
  const annualInferenceEnergy = dailyInferenceEnergy * 365;
  const storageEnergy = payload.storageGB * 0.1;
  const networkEnergy = payload.networkGB * 0.05;
  const retrainingEnergy = trainingEnergy * payload.retrainingPerYear;
  const hardwareEnergy = power * count * 0.5;

  const totalEnergy = Math.round(
    trainingEnergy +
    annualInferenceEnergy +
    storageEnergy +
    networkEnergy +
    retrainingEnergy +
    hardwareEnergy
  );

  const carbonIntensity = selectedRegion.carbonIntensity;
  const carbon = Number(((totalEnergy / 1000) * carbonIntensity).toFixed(3));
  const costUSD = Number(((totalEnergy / 1000) * selectedRegion.electricityCost).toFixed(2));

  const ultraCleanRegion = REGIONS_CACHE.find((r) => r.id === "eu-north-se") || REGIONS_CACHE[3];
  const ultraCleanCarbon = (totalEnergy / 1000) * ultraCleanRegion.carbonIntensity;
  const carbonSavingsPotential = Math.max(0, carbon - ultraCleanCarbon);
  const carbonSavingsPercent = carbon > 0 ? Number(((carbonSavingsPotential / carbon) * 100).toFixed(1)) : 0;

  const percentage = (val) => (totalEnergy === 0 ? 0 : Number(((val / totalEnergy) * 100).toFixed(1)));

  const lifecycle = {
    training: percentage(trainingEnergy),
    inference: percentage(annualInferenceEnergy),
    storage: percentage(storageEnergy),
    network: percentage(networkEnergy),
    retraining: percentage(retrainingEnergy),
    hardware: percentage(hardwareEnergy)
  };

  const lifecycleEnergy = {
    training: Math.round(trainingEnergy),
    inference: Math.round(annualInferenceEnergy),
    storage: Math.round(storageEnergy),
    network: Math.round(networkEnergy),
    retraining: Math.round(retrainingEnergy),
    hardware: Math.round(hardwareEnergy)
  };

  return {
    success: true,
    isOffline: true,
    region: selectedRegion,
    totalEnergy,
    carbon,
    costUSD,
    arbitrage: {
      comparisonRegion: ultraCleanRegion.name,
      comparisonCarbon: Number(ultraCleanCarbon.toFixed(3)),
      potentialSavingsKg: Number(carbonSavingsPotential.toFixed(2)),
      potentialSavingsPercent: carbonSavingsPercent
    },
    lifecycleEnergy,
    lifecycle,
    intelligence: {
      largestImpact: "training",
      largestPercentage: lifecycle.training,
      insight: `Training accounts for ${lifecycle.training}% of compute emissions in ${selectedRegion.name}. Switching to mixed-precision FP16 or scheduling runs in clean grid hours saves up to 40% carbon.`,
      recommendations: [
        {
          action: "Deploy FP16 / BF16 Mixed Precision",
          reason: "Reduces tensor compute cycle requirements during backward passes."
        },
        {
          action: "Batch Inference Pipeline",
          reason: "Maximizes GPU occupancy and cuts idle baseline power draw."
        },
        {
          action: `Target Low-Carbon Region (${ultraCleanRegion.name})`,
          reason: `Shifting workloads reduces grid carbon intensity from ${selectedRegion.carbonIntensity} to ${ultraCleanRegion.carbonIntensity} kg CO2e/kWh.`
        }
      ]
    }
  };
}

// Enterprise Demo Personas for Donut Challenge 02
export const ENTERPRISE_PERSONAS = [
  {
    email: "lead.architect@enterprise.ai",
    phone: "+1 415 890 4321",
    name: "Dr. Elena Vance",
    role: "ML Infrastructure Architect",
    department: "Enterprise AI Platform Engineering",
    permissions: ["audit:write", "cluster:optimize", "csrd:export"]
  },
  {
    email: "sustainability.auditor@esg-council.org",
    phone: "+44 20 7946 0912",
    name: "Marcus Sterling",
    role: "Lead Sustainability Auditor",
    department: "ESG & Carbon Compliance",
    permissions: ["audit:read", "csrd:sign", "audit:verify"]
  },
  {
    email: "mlops.engineer@greenlens.cloud",
    phone: "+91 98765 43210",
    name: "Aria Chen",
    role: "Green MLOps Specialist",
    department: "Cloud Accelerator Operations",
    permissions: ["audit:write", "cluster:optimize"]
  }
];

// Offline OTP Store
const localOtpStore = new Map();

// Client fallback send OTP (email or phone)
export function simulateOfflineSendOtp(target) {
  const isPhone = !target.includes("@");
  const normalized = isPhone ? target.trim().replace(/[\s()-]/g, "") : target.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  localOtpStore.set(normalized, {
    otp,
    expiresAt,
    attempts: 0,
    isPhone
  });

  return {
    success: true,
    target: normalized,
    type: isPhone ? "phone" : "email",
    expiresAt,
    previewOtp: otp,
    isRealDelivery: false,
    deliveryProvider: isPhone ? "Mobile SMS Sandbox" : "Email Sandbox",
    message: isPhone
      ? `Mobile SMS verification code prepared for ${normalized} (Offline Simulation)`
      : `Verification code sent to ${normalized} (Offline Simulation)`
  };
}

// Client fallback verify OTP (email or phone)
export function simulateOfflineVerifyOtp(target, otp) {
  const isPhone = !target.includes("@");
  const normalized = isPhone ? target.trim().replace(/[\s()-]/g, "") : target.trim().toLowerCase();
  const stored = localOtpStore.get(normalized);

  if (!stored) {
    return {
      success: false,
      message: "No active verification code found."
    };
  }

  if (Date.now() > stored.expiresAt) {
    localOtpStore.delete(normalized);
    return {
      success: false,
      message: "Verification code has expired. Please request a new OTP."
    };
  }

  if (stored.otp !== otp.toString().trim()) {
    stored.attempts += 1;
    return {
      success: false,
      message: `Invalid verification code. ${Math.max(0, 5 - stored.attempts)} attempts remaining.`
    };
  }

  localOtpStore.delete(normalized);

  const persona = ENTERPRISE_PERSONAS.find((p) => (isPhone ? p.phone.replace(/[\s()-]/g, "") === normalized : p.email === normalized)) || {
    email: isPhone ? `${normalized}@mobile.verified` : normalized,
    phone: isPhone ? normalized : null,
    name: isPhone
      ? `Verified Mobile (${normalized.slice(-4)})`
      : normalized.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    role: "Sustainability Infrastructure Engineer",
    department: "ML Operations & ESG Intelligence",
    permissions: ["audit:write", "cluster:optimize", "csrd:export"]
  };

  const user = {
    ...persona,
    authMethod: isPhone ? "Mobile SMS OTP" : "Email OTP",
    authenticatedAt: new Date().toISOString()
  };

  const token = `offline_token_${Date.now()}`;
  return {
    success: true,
    token,
    user,
    message: "OTP verification successful."
  };
}