const axios = require('axios');
const Match = require('../models/matchModel'); // Local match cache model

// Fetch matches from third-party API
const fetchMatchesFromAPI = async () => {
    try {
        const response = await axios.get('https://rest.entitysport.com/v2/matches/?status=2&token=ec471071441bb2ac538a0ff901abd249');
        console.log(response.data.response, 'matchdata');
        
        
        if (response.status === 200 && response.data.response.items) {
            return response.data.response.items; // Adjust based on the API response
        }
        throw new Error("Failed to fetch matches from third-party API.");
    } catch (error) {
        console.error("Error fetching matches:", error.message);
        throw error;
    }
};

// Cache matches locally
const cacheMatches = async () => {
    try {
        const matches = await fetchMatchesFromAPI();
        for (const match of matches) {
            const existingMatch = await Match.findOne({ matchId: match.match_id });
            if (!existingMatch) {
                await Match.create({
                    matchId: match.match_id,
                    title: match.title,
                    shortTitle: match.short_title,
                    teamA: {
                        name: match.teama.name,
                        shortName: match.teama.short_name,
                        logoUrl: match.teama.logo_url,
                    },
                    teamB: {
                        name: match.teamb.name,
                        shortName: match.teamb.short_name,
                        logoUrl: match.teamb.logo_url,
                    },
                    startTime: match.date_start,
                    venue: {
                        name: match.venue.name,
                        location: match.venue.location,
                    },
                    status: match.status_str,
                });
            }
        }
        console.log("Matches cached successfully.");
    } catch (error) {
        console.error("Error caching matches:", error.message);
    }
};

module.exports = { fetchMatchesFromAPI, cacheMatches };
