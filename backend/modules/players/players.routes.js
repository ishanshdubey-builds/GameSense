
const express = require("express");
const {
    getProfile,
    getMatches,
    getMatchDetails,
} = require("./players.controller");
const {
    getMatchCoaching,
} = require("../matches/aiCoach.controller");

const router = express.Router();

router.get("/profile", getProfile);
router.get("/matches", getMatches);
router.get("/match/:matchId", getMatchDetails);
router.get("/match/:matchId/coach", getMatchCoaching);

module.exports = router;

