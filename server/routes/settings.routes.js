const express = require("express");
const router = express.Router();
const { getTimerSettings } = require("../controllers/settings.controller");

router.get("/timer", getTimerSettings);

module.exports = router;
