import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:5000";

function Input({ label, name, value, onChange, type = "number", step = "any" }) {
    return (
        <div className="input-group">
            <label>{label}</label>
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

function KPI({ title, value, icon }) {
    return (
        <div className="kpi-card">
            <div className="kpi-icon">{icon}</div>
            <div>
                <p>{title}</p>
                <h3>{value}</h3>
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
                <span>{label}</span>
                <strong>{safePercentage}%</strong>
            </div>
            <div className="lifecycle-track">
                <div
                    className="lifecycle-fill"
                    style={{ width: `${Math.min(Math.max(safePercentage, 0), 100)}%` }}
                />
            </div>
            <small>{safeValue} Wh</small>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="stat">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

function App() {
    const [form, setForm] = useState({
        trainingHours: 100,
        gpuPower: 300,
        gpuCount: 1,
        hardwareId: "custom",
        requestsPerDay: 10000,
        energyPerRequest: 0.001,
        storageGB: 500,
        networkGB: 1000,
        retrainingPerYear: 2
    });

    const [hardware, setHardware] = useState([]);
    const [hardwareLoading, setHardwareLoading] = useState(true);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [accuracy, setAccuracy] = useState(95);
    const [latency, setLatency] = useState(100);

    const [recommendation, setRecommendation] = useState(null);
    const [optimizerLoading, setOptimizerLoading] = useState(false);
    const [optimizerMessage, setOptimizerMessage] = useState("");

    useEffect(() => {
        const loadHardware = async () => {
            try {
                setHardwareLoading(true);
                const response = await fetch(`${API_URL}/api/hardware`);
                if (!response.ok) throw new Error(`Hardware API returned ${response.status}`);
                const data = await response.json();
                if (!data.success) throw new Error(data.message || "Hardware database could not be loaded.");
                setHardware(Array.isArray(data.hardware) ? data.hardware : []);
            } catch (err) {
                console.error("Hardware loading error:", err);
                setHardware([]);
            } finally {
                setHardwareLoading(false);
            }
        };

        loadHardware();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: Number(value) }));
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

    const runAudit = async () => {
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const payload = {
                trainingHours: Number(form.trainingHours),
                gpuPower: Number(form.gpuPower),
                gpuCount: Number(form.gpuCount),
                hardwareId: form.hardwareId === "custom" ? null : form.hardwareId,
                requestsPerDay: Number(form.requestsPerDay),
                energyPerRequest: Number(form.energyPerRequest),
                storageGB: Number(form.storageGB),
                networkGB: Number(form.networkGB),
                retrainingPerYear: Number(form.retrainingPerYear)
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
            setError(err.message || "Unable to connect to backend engine.");
        } finally {
            setLoading(false);
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
        } catch (err) {
            setOptimizerMessage(err.message || "Unable to run architecture optimizer.");
        } finally {
            setOptimizerLoading(false);
        }
    };

    const formatImpactName = (name) => {
        if (!name) return "None";
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const lifecycleEnergy = result?.lifecycleEnergy || {};
    const lifecycle = result?.lifecycle || {};
    const intelligence = result?.intelligence || {
        largestImpact: result?.biggestImpact?.category || "none",
        largestPercentage: result?.biggestImpact?.percentage || 0,
        insight: "Lifecycle calculation complete.",
        recommendations: []
    };
    const recommendations = Array.isArray(intelligence.recommendations) ? intelligence.recommendations : [];

    const calculateScore = () => {
        if (!result) return 0;
        const energy = Number(result.totalEnergy) || 0;
        if (energy <= 1000) return 95;
        if (energy <= 5000) return 85;
        if (energy <= 10000) return 75;
        if (energy <= 25000) return 65;
        return 50;
    };

    return (
        <div className="app">
            {/* NAV */}
            <nav className="navbar">
                <div className="nav-container">
                    <div className="brand">
                        <div className="brand-icon">⚛️</div>
                        <div>
                            <h2>OrbitScale</h2>
                            <span>AI Sustainability Intelligence</span>
                        </div>
                    </div>
                    <div className="nav-status">
                        <span className="status-dot" />
                        Engine Online
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">🌌 Deep-Space AI Auditor</div>
                    <h1>
                        Measure the environmental <span>impact of AI.</span>
                    </h1>
                    <p>
                        OrbitScale analyzes training, inference, storage, networking, hardware, and retraining to identify where your AI system consumes resources across its lifecycle.
                    </p>
                </div>
            </section>

            <main className="container">
                {/* CONFIGURATION */}
                <section className="section-card">
                    <div className="section-header">
                        <span className="section-label">STEP 01</span>
                        <h2>AI Workload Telemetry</h2>
                        <p>Configure hardware and runtime metrics for complete lifecycle auditing.</p>
                    </div>

                    <div className="form-grid">
                        <div className="input-group">
                            <label>Hardware Accelerator</label>
                            <select value={form.hardwareId} onChange={handleHardwareChange} disabled={hardwareLoading}>
                                <option value="custom">Custom Accelerator</option>
                                {hardware.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} — {item.powerW} W
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label={form.hardwareId === "custom" ? "Compute Power (W)" : "Compute Power (W) — Auto"}
                            name="gpuPower"
                            value={form.gpuPower}
                            onChange={handleChange}
                        />

                        <Input label="Number of Nodes/GPUs" name="gpuCount" value={form.gpuCount} onChange={handleChange} />
                        <Input label="Training Duration (Hours)" name="trainingHours" value={form.trainingHours} onChange={handleChange} />
                        <Input label="Inferences Per Day" name="requestsPerDay" value={form.requestsPerDay} onChange={handleChange} />
                        <Input label="Energy Per Inference (Wh)" name="energyPerRequest" value={form.energyPerRequest} onChange={handleChange} step="0.0001" />
                        <Input label="Data Storage (GB)" name="storageGB" value={form.storageGB} onChange={handleChange} />
                        <Input label="Network Transfer (GB)" name="networkGB" value={form.networkGB} onChange={handleChange} />
                        <Input label="Retraining Cycles / Year" name="retrainingPerYear" value={form.retrainingPerYear} onChange={handleChange} />
                    </div>

                    {form.hardwareId !== "custom" && (() => {
                        const selected = hardware.find((item) => item.id === form.hardwareId);
                        if (!selected) return null;
                        return (
                            <div className="hardware-info">
                                <div>
                                    <span>Hardware</span>
                                    <strong>{selected.name}</strong>
                                </div>
                                <div>
                                    <span>Architecture</span>
                                    <strong>{selected.architecture}</strong>
                                </div>
                                <div>
                                    <span>VRAM</span>
                                    <strong>{selected.memoryGB} GB</strong>
                                </div>
                                <div>
                                    <span>TDP</span>
                                    <strong>{selected.powerW} W</strong>
                                </div>
                            </div>
                        );
                    })()}

                    <button className="primary-button" onClick={runAudit} disabled={loading}>
                        {loading ? "Computing Lifecycle Telemetry..." : "Run Telemetry Audit →"}
                    </button>

                    {error && <div className="error-box">⚠️ {error}</div>}
                </section>

                {/* RESULTS */}
                {result && (
                    <section className="results-section">
                        <div className="section-header">
                            <span className="section-label">TELEMETRY BREAKDOWN</span>
                            <h2>Lifecycle Energy & Footprint</h2>
                        </div>

                        <div className="kpi-grid">
                            <KPI title="Training" value={`${lifecycleEnergy.training ?? 0} Wh`} icon="⚡" />
                            <KPI title="Inference" value={`${lifecycleEnergy.inference ?? 0} Wh`} icon="🧠" />
                            <KPI title="Storage" value={`${lifecycleEnergy.storage ?? 0} Wh`} icon="💾" />
                            <KPI title="Network" value={`${lifecycleEnergy.network ?? 0} Wh`} icon="🌐" />
                            <KPI title="Retraining" value={`${lifecycleEnergy.retraining ?? 0} Wh`} icon="🔄" />
                            <KPI title="Hardware" value={`${lifecycleEnergy.hardware ?? 0} Wh`} icon="🖥️" />
                        </div>

                        <div className="total-card">
                            <div>
                                <span>TOTAL LIFECYCLE ENERGY</span>
                                <h2>
                                    {Number(result.totalEnergy || 0).toLocaleString()} <small>Wh</small>
                                </h2>
                            </div>
                            <div className="carbon-stat">
                                <span>CARBON FOOTPRINT EQUIVALENT</span>
                                <strong>{result.carbon ?? 0} kg CO₂e</strong>
                            </div>
                        </div>

                        <div className="intelligence-card">
                            <div className="intelligence-heading">
                                <div className="ai-icon">✦</div>
                                <h2>Intelligence Hotspots</h2>
                            </div>
                            <div className="impact-highlight">
                                <div>
                                    <span>PRIMARY SECTOR</span>
                                    <strong>{formatImpactName(intelligence.largestImpact)}</strong>
                                </div>
                                <div className="impact-percentage">
                                    <strong>{intelligence.largestPercentage}%</strong>
                                    <span>of total energy</span>
                                </div>
                            </div>
                            <div className="insight-box">💡 {intelligence.insight}</div>

                            <div className="recommendations">
                                <h3>Recommended Architectural Fixes</h3>
                                <div className="recommendation-grid">
                                    {recommendations.length > 0 ? (
                                        recommendations.map((item, index) => (
                                            <div className="recommendation-card" key={index}>
                                                <div className="recommendation-number">{index + 1}</div>
                                                <strong>{item.action}</strong>
                                                <p>{item.reason}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No critical actions required.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lifecycle-card">
                            <div className="section-header">
                                <span className="section-label">DISTRIBUTION MATRIX</span>
                                <h2>Lifecycle Phase Weighting</h2>
                            </div>
                            <div className="lifecycle-list">
                                <LifecycleBar label="Training Phase" percentage={lifecycle.training} value={lifecycleEnergy.training} />
                                <LifecycleBar label="Inference Engine" percentage={lifecycle.inference} value={lifecycleEnergy.inference} />
                                <LifecycleBar label="Data Storage" percentage={lifecycle.storage} value={lifecycleEnergy.storage} />
                                <LifecycleBar label="Network Transfer" percentage={lifecycle.network} value={lifecycleEnergy.network} />
                                <LifecycleBar label="Drift Retraining" percentage={lifecycle.retraining} value={lifecycleEnergy.retraining} />
                                <LifecycleBar label="Hardware Lifecycle" percentage={lifecycle.hardware} value={lifecycleEnergy.hardware} />
                            </div>
                        </div>

                        <div className="score-card">
                            <div>
                                <span className="section-label">RATING</span>
                                <h2>Sustainability Index</h2>
                                <p>Overall system score calculated against total grid consumption.</p>
                            </div>
                            <div className="score-circle">
                                {calculateScore()}
                                <span>/100</span>
                            </div>
                        </div>
                    </section>
                )}

                {/* OPTIMIZER */}
                <section className="optimizer-card">
                    <div className="section-header">
                        <span className="section-label">STEP 02</span>
                        <h2>Topology Auto-Optimizer</h2>
                        <p>Set constraint boundaries for accuracy and latency to locate optimal neural models.</p>
                    </div>

                    <div className="optimizer-inputs">
                        <div className="input-group">
                            <label>Minimum Accuracy (%)</label>
                            <input
                                type="number"
                                value={accuracy}
                                min="0"
                                max="100"
                                onChange={(e) => setAccuracy(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Maximum Latency (ms)</label>
                            <input
                                type="number"
                                value={latency}
                                min="0"
                                onChange={(e) => setLatency(e.target.value)}
                            />
                        </div>
                    </div>

                    <button className="secondary-button" onClick={runOptimizer} disabled={optimizerLoading}>
                        {optimizerLoading ? "Scanning Neural Models..." : "Discover Optimal Architecture →"}
                    </button>

                    {optimizerMessage && <div className="error-box">⚠️ {optimizerMessage}</div>}

                    {recommendation?.recommendation && (
                        <div className="architecture-result">
                            <h3>{recommendation.recommendation.name}</h3>
                            <p>{recommendation.recommendation.description}</p>
                            <div className="architecture-stats">
                                <Stat label="Accuracy" value={`${recommendation.recommendation.accuracy}%`} />
                                <Stat label="Latency" value={`${recommendation.recommendation.latency} ms`} />
                                <Stat label="Grid Load" value={`${recommendation.recommendation.energy}`} />
                                <Stat label="Energy Saved" value={`${recommendation.recommendation.estimatedEnergySaving}%`} />
                            </div>
                        </div>
                    )}
                </section>
            </main>

            <footer>
                <strong>OrbitScale AI</strong> — Engineered for next-gen green neural computing.
            </footer>
        </div>
    );
}

export default App;