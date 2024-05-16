const express = require("express");
const router = express.Router();
const { registerService } = require("../controllers/registerController");

// register service to spin up a docker container for it
router.post("/service", async (req, res) => {
  try {
    const { repoUrl } = req.body;

    const serviceUrl = await registerService(repoUrl);

    res.status(201).json({ serviceUrl });
  } catch (error) {
    console.error("Error registering service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
