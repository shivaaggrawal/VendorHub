const express = require("express");
const router  = express.Router();
const { getPersonalised, getSimilar } = require("../controllers/recommendation.controller");
const { optionalVerifyToken } = require("../middleware/auth.middleware");


router.get("/", optionalVerifyToken, getPersonalised);


router.get("/similar/:productId", getSimilar);

module.exports = router;
