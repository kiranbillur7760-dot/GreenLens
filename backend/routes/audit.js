const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {
  const {
    trainingHours = 0,
    gpuPower = 0,
    gpuCount = 1,
    requestsPerDay = 0,
    energyPerRequest = 0,
    storageGB = 0,
    networkGB = 0,
    retrainingPerYear = 0,
    regionId = "us-east-va"
  } = req.body;

  const trainingEnergy = trainingHours * (gpuPower * gpuCount);
  const inferenceEnergy = requestsPerDay * 365 * energyPerRequest;
  const storageEnergy = storageGB * 0.1;
  const networkEnergy = networkGB * 0.05;
  const retrainingEnergy = trainingEnergy * retrainingPerYear;
  const hardwareEnergy = (gpuPower * gpuCount) * 0.5;

  const totalEnergy =
    trainingEnergy +
    inferenceEnergy +
    storageEnergy +
    networkEnergy +
    retrainingEnergy +
    hardwareEnergy;

  // Default region intensity
  const carbonIntensity = 0.380;
  const carbon = (totalEnergy / 1000) * carbonIntensity;

  res.json({
    success: true,
    trainingEnergy: Math.round(trainingEnergy),
    inferenceEnergy: Math.round(inferenceEnergy),
    storageEnergy: Math.round(storageEnergy),
    networkEnergy: Math.round(networkEnergy),
    retrainingEnergy: Math.round(retrainingEnergy),
    hardwareEnergy: Math.round(hardwareEnergy),
    totalEnergy: Math.round(totalEnergy),
    carbon: Number(carbon.toFixed(3))
  });
});

module.exports = router;