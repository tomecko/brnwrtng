// dynamika rund
Meteor.setInterval(function() {
    var now = Math.floor(TimeSync.serverTime() / 1000);
    // wpisanie do sesji aktualnego czasu
    Session.set("currentTimestamp", now);
    // ew. odpalenie następnej rundy
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId);
    if (brainSession) {
        if (brainSession.roundEnd < now) {
            BrainSessions.update(brainSessionId, {
                '$set': {
                    round: brainSession.round + 1,
                    roundStart: now,
                    roundEnd: now + (60 * brainSession.roundLength),
                },
                '$unset': {
                    shortened: ""
                }
            });
        }
    }
}, 1000);

// miganie timerem
Meteor.setInterval(function() {
    $(".warn").toggleClass('warn-not-visible');
}, 500);

// aktualizacja tytułu strony
Meteor.setInterval(function() {
    if (Router.current() && "brainSession" == Router.current().route.name) {
        var timerSeconds = getTimerSeconds(),
            brainSessionId = Router.current().params._id,
            brainSession = BrainSessions.findOne(brainSessionId),
            title;

        if (brainSession && brainSession.round > 0 && !brainSession.closed) {
            title = "(" + formatDuration(timerSeconds) + ")";
            title = title + " ROUND " + brainSession.round;
            title = title + " - " + brainSession.title;
        }

        if (title) {
            document.title = title;
        }
    }
}, 1000);