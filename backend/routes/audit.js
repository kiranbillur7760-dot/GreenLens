const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {
    const {
        trainingHours,
        gpuPower,
        requestsPerDay,
        energyPerRequest,
        storageGB,
        networkGB,
        retrainingPerYear
    } = req.body;

    const trainingEnergy = trainingHours * gpuPower;

    const inferenceEnergy =
        requestsPerDay * 365 * energyPerRequest;

    const storageEnergy =
        storageGB * 0.1;

    const networkEnergy =
        networkGB * 0.05;

    const retrainingEnergy =
        trainingEnergy * retrainingPerYear;

    const totalEnergy =
        trainingEnergy +
        inferenceEnergy +
        storageEnergy +
        networkEnergy +
        retrainingEnergy;

    const carbonIntensity = 0.7;

    const carbon =
        totalEnergy * carbonIntensity;

    res.json({
        trainingEnergy: Math.round(trainingEnergy),
        inferenceEnergy: Math.round(inferenceEnergy),
        storageEnergy: Math.round(storageEnergy),
        networkEnergy: Math.round(networkEnergy),
        retrainingEnergy: Math.round(retrainingEnergy),
        totalEnergy: Math.round(totalEnergy),
        carbon: Math.round(carbon)
    });
});

module.exports = router;