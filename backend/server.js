const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


// ======================================================
// GREENLENS AI
// SUSTAINABLE AI LIFECYCLE ENGINE
// ======================================================


// ======================================================
// HOME ROUTE
// ======================================================

app.get("/", (req, res) => {

    res.json({
        message: "GreenLens AI Backend is running 🌱"
    });

});


// ======================================================
// HARDWARE DATABASE
// ======================================================

const hardwareProfiles = [

    {
        id: "h100",
        name: "NVIDIA H100",
        category: "Data Center GPU",
        architecture: "Hopper",
        memoryGB: 80,
        powerW: 700,
        useCase: "Large-scale AI training and inference"
    },

    {
        id: "a100",
        name: "NVIDIA A100 80GB",
        category: "Data Center GPU",
        architecture: "Ampere",
        memoryGB: 80,
        powerW: 400,
        useCase: "AI training and inference"
    },

    {
        id: "l4",
        name: "NVIDIA L4",
        category: "Efficient Data Center GPU",
        architecture: "Ada Lovelace",
        memoryGB: 24,
        powerW: 72,
        useCase: "Efficient inference and AI workloads"
    },

    {
        id: "t4",
        name: "NVIDIA T4",
        category: "Data Center GPU",
        architecture: "Turing",
        memoryGB: 16,
        powerW: 70,
        useCase: "Inference and general AI workloads"
    }

];


// ======================================================
// HARDWARE API
// ======================================================

app.get("/api/hardware", (req, res) => {

    res.json({

        success: true,

        hardware: hardwareProfiles

    });

});


// ======================================================
// GREENLENS INTELLIGENCE ENGINE
// ======================================================

function generateInsights(data) {

    const {
        trainingEnergy,
        inferenceEnergy,
        storageEnergy,
        networkEnergy,
        retrainingEnergy
    } = data;


    const total =
        trainingEnergy +
        inferenceEnergy +
        storageEnergy +
        networkEnergy +
        retrainingEnergy;


    if (total === 0) {

        return {

            largestImpact: "none",

            largestPercentage: 0,

            insight:
                "No significant AI workload was detected.",

            recommendations: []

        };

    }


    const impacts = {

        training: trainingEnergy,

        inference: inferenceEnergy,

        storage: storageEnergy,

        network: networkEnergy,

        retraining: retrainingEnergy

    };


    const largest =
        Object.entries(impacts)
            .reduce(

                (best, current) =>

                    current[1] > best[1]
                        ? current
                        : best

            );


    const largestImpact =
        largest[0];


    const largestPercentage =
        Number(

            (
                largest[1] /
                total *
                100

            ).toFixed(1)

        );


    let insight = "";

    let recommendations = [];


    // ==================================================
    // INFERENCE
    // ==================================================

    if (largestImpact === "inference") {

        insight =
            `Inference is the largest lifecycle impact, accounting for approximately ${largestPercentage}% of total energy.`;

        recommendations = [

            {

                action:
                    "Use model quantization",

                reason:
                    "INT8 or other lower-precision inference can reduce computational requirements."

            },

            {

                action:
                    "Batch inference requests",

                reason:
                    "Processing multiple requests together can improve accelerator utilization."

            },

            {

                action:
                    "Use an energy-efficient inference accelerator",

                reason:
                    "Inference workloads can often run on lower-power hardware than training hardware."

            }

        ];

    }


    // ==================================================
    // TRAINING
    // ==================================================

    else if (largestImpact === "training") {

        insight =
            `Training is the largest lifecycle impact, accounting for approximately ${largestPercentage}% of total energy.`;

        recommendations = [

            {

                action:
                    "Use mixed-precision training",

                reason:
                    "FP16 or BF16 can reduce computational requirements compared with FP32."

            },

            {

                action:
                    "Use early stopping",

                reason:
                    "Stopping training when validation performance stops improving avoids unnecessary computation."

            },

            {

                action:
                    "Optimize hyperparameter experiments",

                reason:
                    "Reducing unnecessary training runs can lower total training energy."

            }

        ];

    }


    // ==================================================
    // RETRAINING
    // ==================================================

    else if (largestImpact === "retraining") {

        insight =
            `Retraining is the largest lifecycle impact, accounting for approximately ${largestPercentage}% of total energy.`;

        recommendations = [

            {

                action:
                    "Reduce retraining frequency",

                reason:
                    "Retrain when model performance or data drift requires it instead of using an unnecessarily frequent schedule."

            },

            {

                action:
                    "Use incremental training",

                reason:
                    "Updating an existing model can require less computation than training from scratch."

            },

            {

                action:
                    "Monitor model drift",

                reason:
                    "Trigger retraining based on measurable model degradation."

            }

        ];

    }


    // ==================================================
    // STORAGE
    // ==================================================

    else if (largestImpact === "storage") {

        insight =
            `Storage is the largest lifecycle impact, accounting for approximately ${largestPercentage}% of total energy.`;

        recommendations = [

            {

                action:
                    "Remove unused datasets and checkpoints",

                reason:
                    "Unused data and model checkpoints create unnecessary long-term storage requirements."

            },

            {

                action:
                    "Compress datasets",

                reason:
                    "Compression can reduce the amount of storage required."

            },

            {

                action:
                    "Apply data retention policies",

                reason:
                    "Automatically removing obsolete data prevents unnecessary long-term storage."

            }

        ];

    }


    // ==================================================
    // NETWORK
    // ==================================================

    else if (largestImpact === "network") {

        insight =
            `Networking is the largest lifecycle impact, accounting for approximately ${largestPercentage}% of total energy.`;

        recommendations = [

            {

                action:
                    "Reduce data transfer",

                reason:
                    "Sending less data between services reduces network infrastructure usage."

            },

            {

                action:
                    "Cache frequently requested results",

                reason:
                    "Caching can eliminate repeated network requests."

            },

            {

                action:
                    "Compress API responses",

                reason:
                    "Smaller payloads reduce data transfer requirements."

            }

        ];

    }


    return {

        largestImpact,

        largestPercentage,

        insight,

        recommendations

    };

}


// ======================================================
// AI LIFECYCLE AUDIT API
// ======================================================

app.post("/api/audit", (req, res) => {

    try {

        const {

            trainingHours = 0,

            gpuPower = 0,

            gpuCount = 1,

            hardwareId = null,

            requestsPerDay = 0,

            energyPerRequest = 0,

            storageGB = 0,

            networkGB = 0,

            retrainingPerYear = 0

        } = req.body;


        // ==================================================
        // INPUT VALIDATION
        // ==================================================

        const values = [

            trainingHours,

            gpuPower,

            gpuCount,

            requestsPerDay,

            energyPerRequest,

            storageGB,

            networkGB,

            retrainingPerYear

        ];


        const invalidInput =
            values.some(

                value =>
                    typeof value !== "number" ||
                    !Number.isFinite(value) ||
                    value < 0

            );


        if (invalidInput) {

            return res.status(400).json({

                success: false,

                message:
                    "All audit values must be valid non-negative numbers."

            });

        }


        // ==================================================
        // SELECT HARDWARE
        // ==================================================

        let selectedHardware = null;


        if (hardwareId && hardwareId !== "custom") {

            selectedHardware =
                hardwareProfiles.find(

                    hardware =>
                        hardware.id === hardwareId

                );


            if (!selectedHardware) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Selected hardware was not found."

                });

            }

        }


        // ==================================================
        // DETERMINE GPU POWER
        // ==================================================

        let effectiveGpuPower =
            gpuPower;


        if (selectedHardware) {

            effectiveGpuPower =
                selectedHardware.powerW;

        }


        // ==================================================
        // TOTAL GPU POWER
        // ==================================================

        const totalGpuPower =
            effectiveGpuPower *
            gpuCount;


        // ==================================================
        // TRAINING ENERGY
        // ==================================================

        const trainingEnergy =
            trainingHours *
            totalGpuPower;


        // ==================================================
        // INFERENCE ENERGY
        // ==================================================

        const inferenceEnergy =
            requestsPerDay *
            365 *
            energyPerRequest;


        // ==================================================
        // STORAGE ENERGY
        // ==================================================

        /*
          Prototype assumption:

          0.1 Wh per GB-year
        */

        const storageEnergy =
            storageGB *
            0.1;


        // ==================================================
        // NETWORK ENERGY
        // ==================================================

        /*
          Prototype assumption:

          0.05 Wh per GB transferred
        */

        const networkEnergy =
            networkGB *
            0.05;


        // ==================================================
        // RETRAINING ENERGY
        // ==================================================

        const retrainingEnergy =
            trainingEnergy *
            retrainingPerYear;


        // ==================================================
        // HARDWARE OPERATIONAL IMPACT
        // ==================================================

        /*
          Prototype hardware allocation.

          This is NOT embodied carbon.

          A future version will model:
          - hardware lifetime
          - utilization
          - manufacturing impact
          - embodied carbon
        */

        const hardwareEnergy =
            totalGpuPower *
            0.5;


        // ==================================================
        // TOTAL ENERGY
        // ==================================================

        const totalEnergy =

            trainingEnergy +

            inferenceEnergy +

            storageEnergy +

            networkEnergy +

            retrainingEnergy +

            hardwareEnergy;


        // ==================================================
        // CARBON
        // ==================================================

        /*
          Prototype carbon intensity:

          0.7 kg CO2e / kWh

          This will later become
          region-specific grid data.
        */

        const carbonIntensity =
            0.7;


        const carbon =

            (totalEnergy / 1000) *
            carbonIntensity;


        // ==================================================
        // LIFECYCLE PERCENTAGES
        // ==================================================

        const percentage = (value) => {

            if (totalEnergy === 0) {

                return 0;

            }

            return Number(

                (
                    value /
                    totalEnergy *
                    100

                ).toFixed(2)

            );

        };


        const lifecycle = {

            training:
                percentage(trainingEnergy),

            inference:
                percentage(inferenceEnergy),

            storage:
                percentage(storageEnergy),

            network:
                percentage(networkEnergy),

            retraining:
                percentage(retrainingEnergy),

            hardware:
                percentage(hardwareEnergy)

        };


        // ==================================================
        // FIND BIGGEST IMPACT
        // ==================================================

        const impacts = {

            training: trainingEnergy,

            inference: inferenceEnergy,

            storage: storageEnergy,

            network: networkEnergy,

            retraining: retrainingEnergy,

            hardware: hardwareEnergy

        };


        const biggestImpact =

            Object.entries(impacts)
                .reduce(

                    (largest, current) =>

                        current[1] >
                        largest[1]

                            ? current

                            : largest

                );


        // ==================================================
        // RUN GREENLENS INTELLIGENCE
        // ==================================================

        const intelligence =
            generateInsights({

                trainingEnergy,

                inferenceEnergy,

                storageEnergy,

                networkEnergy,

                retrainingEnergy

            });


        // ==================================================
        // SEND RESULT
        // ==================================================

        res.json({

            success: true,


            hardware: selectedHardware
                ? {

                    id:
                        selectedHardware.id,

                    name:
                        selectedHardware.name,

                    powerW:
                        selectedHardware.powerW,

                    memoryGB:
                        selectedHardware.memoryGB,

                    gpuCount

                }
                : {

                    id: "custom",

                    name: "Custom GPU",

                    powerW:
                        effectiveGpuPower,

                    memoryGB: null,

                    gpuCount

                },


            assumptions: {

                carbonIntensity:
                    `${carbonIntensity} kg CO2e/kWh`,

                storageEnergy:
                    "0.1 Wh/GB-year",

                networkEnergy:
                    "0.05 Wh/GB",

                hardwareImpact:
                    "Prototype operational allocation"

            },


            units: {

                energy: "Wh",

                carbon: "kg CO2e"

            },


            lifecycleEnergy: {

                training:
                    Math.round(trainingEnergy),

                inference:
                    Math.round(inferenceEnergy),

                storage:
                    Math.round(storageEnergy),

                network:
                    Math.round(networkEnergy),

                retraining:
                    Math.round(retrainingEnergy),

                hardware:
                    Math.round(hardwareEnergy)

            },


            totalEnergy:
                Math.round(totalEnergy),


            carbon:
                Number(
                    carbon.toFixed(3)
                ),


            lifecycle,


            biggestImpact: {

                category:
                    biggestImpact[0],

                energy:
                    Math.round(
                        biggestImpact[1]
                    ),

                percentage:
                    percentage(
                        biggestImpact[1]
                    )

            },


            intelligence

        });

    }


    catch (error) {

        console.error(error);


        res.status(500).json({

            success: false,

            message:
                "Unable to calculate sustainability audit."

        });

    }

});


// ======================================================
// ARCHITECTURE DATABASE
// ======================================================

const architectures = [

    {

        name:
            "A100 FP32 - Large Model",

        accuracy: 98,

        latency: 120,

        energy: 100,

        description:
            "High accuracy architecture with high energy consumption."

    },


    {

        name:
            "A100 FP16 - Optimized Model",

        accuracy: 97,

        latency: 90,

        energy: 65,

        description:
            "Mixed precision architecture that reduces compute energy."

    },


    {

        name:
            "L4 INT8 - Efficient Model",

        accuracy: 95,

        latency: 60,

        energy: 35,

        description:
            "Quantized architecture designed for efficient inference."

    },


    {

        name:
            "L4 INT8 + Batching",

        accuracy: 94,

        latency: 45,

        energy: 25,

        description:
            "Quantization and batching for highly efficient inference."

    }

];


// ======================================================
// ARCHITECTURE OPTIMIZER
// ======================================================

app.post("/api/recommend", (req, res) => {

    try {

        const {

            accuracy = 95,

            latency = 100

        } = req.body;


        if (

            typeof accuracy !== "number" ||

            typeof latency !== "number" ||

            !Number.isFinite(accuracy) ||

            !Number.isFinite(latency)

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Accuracy and latency must be valid numbers."

            });

        }


        const validArchitectures =

            architectures.filter(

                architecture =>

                    architecture.accuracy >=
                    accuracy &&

                    architecture.latency <=
                    latency

            );


        if (
            validArchitectures.length === 0
        ) {

            return res.json({

                success: true,

                recommendation: null,

                alternatives: [],

                message:
                    "No architecture satisfies the selected constraints."

            });

        }


        const recommendation =

            validArchitectures.reduce(

                (best, current) =>

                    current.energy <
                    best.energy

                        ? current

                        : best

            );


        const baselineEnergy =
            100;


        const energySaving =

            (

                (
                    baselineEnergy -
                    recommendation.energy
                )
                /
                baselineEnergy

            ) * 100;


        res.json({

            success: true,


            recommendation: {

                ...recommendation,

                estimatedEnergySaving:
                    Math.round(
                        energySaving
                    )

            },


            alternatives:
                validArchitectures

        });

    }


    catch (error) {

        console.error(error);


        res.status(500).json({

            success: false,

            message:
                "Unable to optimize architecture."

        });

    }

});


// ======================================================
// SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(

    PORT,

    "0.0.0.0",

    () => {

        console.log(

            `GreenLens AI backend running on port ${PORT}`

        );

    }

);
