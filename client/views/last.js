Template.last.recentBrainSessions = function() {
    var recentBrainSessions = BrainSessions.find({},{
        limit: 5,
        sort: {
            createdAt: -1
        }
    });
    return recentBrainSessions;
}
