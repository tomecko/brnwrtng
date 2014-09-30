Session.setDefault('skipNextRoundWarning', 'unknown');
Session.setDefault('allIdeasSorting', 'round');

// dynamika rund
Meteor.setInterval(function() {
    var now = Math.floor(TimeSync.serverTime() / 1000),
        brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId);
    // wpisanie do sesji aktualnego czasu
    Session.set("currentTimestamp", now);
    if (brainSession) {
        // ew. odpalenie następnej rundy
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
            Session.set('everybodyReady', false);
            $("#round-end-warning-modal").modal('hide');
        }
        // pokazanie tooltipa podpowiedzi, że wszyscy rzekomo gotowi na następną rundę
        if (everybodyIsReady() && brainSession.round !== Session.get('everybodyReadyRound')) {
            $(".next-round").tooltip('show');
            Session.set('everybodyReadyRound', brainSession.round);
            Meteor.setTimeout(function() {
                $(".next-round").tooltip('hide');
            }, 5000);
        }
    }
}, 900);

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
}, 900);