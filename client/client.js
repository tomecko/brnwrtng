// wpisanie do sesji aktualnego czasu
Meteor.setInterval(function() {
    Session.set("currentTimestamp", Math.floor(TimeSync.serverTime() / 1000));
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
}, 500);
