
const express = require("express");
const {
    getProfile,
    getMatches,
} = require("./players.controller");

const router = express.Router();

router.get("/profile", getProfile);
router.get("/matches", getMatches);

module.exports = router;
