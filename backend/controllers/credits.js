const CREDITS_PER_REQUEST = 1;
let totalUsedThisSession = 0;

const trackCredits = (count) => {
    totalUsedThisSession += count * CREDITS_PER_REQUEST;
};

const getCredits = (req, res) => {
    res.status(200).json({
        status: true,
        usedThisSession: totalUsedThisSession,
        creditsPerRequest: CREDITS_PER_REQUEST,
        note: 'ZenRows does not expose a usage API. Check your dashboard at app.zenrows.com for total usage.',
    });
};

module.exports = { getCredits, trackCredits };