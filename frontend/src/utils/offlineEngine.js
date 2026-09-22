// Local hardware fallback cache
export const HARDWARE_CACHE = [
    { id: "a100", name: "NVIDIA A100", architecture: "Ampere", memoryGB: 80, powerW: 400 },
    { id: "h100", name: "NVIDIA H100", architecture: "Hopper", memoryGB: 80, powerW: 700 },
    { id: "t4", name: "NVIDIA T4", architecture: "Turing", memoryGB: 16, powerW: 70 }
];

// Offline calculation logic (runs completely in-browser during outages)
export function runOfflineAudit(payload) {
    const power = payload.gpuPower || 300;
    
    const trainingEnergy = payload.trainingHours * power * payload.gpuCount;
    const dailyInferenceEnergy = payload.requestsPerDay * payload.energyPerRequest;
    const annualInferenceEnergy = dailyInferenceEnergy * 365;
    const storageEnergy = payload.storageGB * 0.002 * 8760;
    const networkEnergy = payload.networkGB * 0.06;
    const retrainingEnergy = trainingEnergy * payload.retrainingPerYear;
    const hardwareEnergy = power * 10;

    const totalEnergy = Math.round(trainingEnergy + annualInferenceEnergy + storageEnergy + networkEnergy + retrainingEnergy + hardwareEnergy);
    const carbon = Number(((totalEnergy / 1000) * 0.385).toFixed(2));

    return {
        success: true,
        isOffline: true,
        totalEnergy,
        carbon,
        lifecycleEnergy: {
            training: Math.round(trainingEnergy),
            inference: Math.round(annualInferenceEnergy),
            storage: Math.round(storageEnergy),
            network: Math.round(networkEnergy),
            retraining: Math.round(retrainingEnergy),
            hardware: Math.round(hardwareEnergy)
        },
        lifecycle: {
            training: Math.round((trainingEnergy / totalEnergy) * 100),
            inference: Math.round((annualInferenceEnergy / totalEnergy) * 100),
            storage: Math.round((storageEnergy / totalEnergy) * 100),
            network: Math.round((networkEnergy / totalEnergy) * 100),
            retraining: Math.round((retrainingEnergy / totalEnergy) * 100),
            hardware: Math.round((hardwareEnergy / totalEnergy) * 100)
        },
        intelligence: {
            largestImpact: "training",
            largestPercentage: Math.round((trainingEnergy / totalEnergy) * 100),
            insight: "Offline mode: Estimated lifecycle using local edge parameters.",
            recommendations: [
                { action: "Offline Calculation Enabled", reason: "Data queued locally for cloud reconciliation upon reconnection." }
            ]
        }
    };
}

// Queue audit logs to LocalStorage when offline
export function saveOfflineAudit(payload, result) {
    const queue = JSON.parse(localStorage.getItem("greenlens_offline_queue") || "[]");
    queue.push({
        id: Date.now(),
        payload,
        result,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem("greenlens_offline_queue", JSON.stringify(queue));
}

// Sync pending offline logs when internet recovers
export async function syncOfflineQueue(apiUrl) {
    const queue = JSON.parse(localStorage.getItem("greenlens_offline_queue") || "[]");
    if (queue.length === 0) return 0;

    try {
        const response = await fetch(`${apiUrl}/api/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pendingAudits: queue })
        });

        if (response.ok) {
            const count = queue.length;
            localStorage.setItem("greenlens_offline_queue", "[]");
            return count;
        }
    } catch (err) {
        console.error("Re-sync failed, keeping items queued:", err);
    }
    return 0;
}