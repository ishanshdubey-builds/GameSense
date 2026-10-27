
const express = require("express");
const {
    getProfile,
    getMatches,
    getMatchDetails,
} = require("./players.controller");

const router = express.Router();

router.get("/profile", getProfile);
router.get("/matches", getMatches);
router.get("/match/:matchId", getMatchDetails);

module.exports = router;

