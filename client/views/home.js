Template.home.events({
    'click .js-create-session': function(event) {

        // zeby nie bylo wielu sesji ;)
        event.preventDefault();

        forceLogin(function(userId) {

            // domyslne wartosci
            var brainwritingSession = {
                ideasPerRound: 3,
                roundLength: 3,
                createdAt: Math.floor(TimeSync.serverTime() / 1000),
                round: 0,
                adminToken: getRandomString(9), // losujemy sobie token, ktorego posiadacz bedzie moderatorem
                admins: [userId],
                participants: [userId]
            };

            // tworzenie sesji
            BrainSessions.insert(brainwritingSession,
                function(err, id) {
                    // przekierowanie na stronę sesji
                    if (!err) {
                        Router.go('brainSession', {
                            _id: id
                        });
                    }
                }
            );

        });

    }
});