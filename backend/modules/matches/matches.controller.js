function testMatch(req, res) {
    const matchData = req.body;

    if(
        !matchData || typeof matchData !== "object" || Array.isArray(matchData)
    ){
        return res.status(400).json({
            success: false,
            message: "Please send a Json object",
        });
    }

    const { kills } = matchData;

    if(!Number.isFinite(kills) || kills < 0){
        return res.status(400).json({
            success: false,
            message:"Kills must be a non -negative number",
        });
    }
    
    return res.status(200).json({
        success: true,
        message: "Match data received successfully",
        data: matchData,
    });
}

module.exports = { testMatch };