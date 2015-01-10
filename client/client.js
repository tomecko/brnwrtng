Session.setDefault('skipNextRoundWarning', 'unknown');
Session.setDefault('allIdeasSorting', 'likes');
Session.setDefault('myIdeasLimit', 3);
Session.setDefault('othersIdeasLimit', 9);
Session.setDefault('peoplePanel', true);

// dynamika rund (TODO: przenieść do plików brainSession)
Meteor.setInterval(function() {
    var now = Math.floor(TimeSync.serverTime() / 1000),
        brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId);
    // wpisanie do sesji aktualnego czasu, jeśli się rozjechał
    if (Math.abs(now - Session.get("currentTimestamp")) > 1) {
        Session.set("currentTimestamp", now);
    }
    if (brainSession) {
        // ew. skończenie sesji, jeśli upłynął czas
        if (brainSession.roundEnd < now) {
            BrainSessions.update(brainSessionId, {
                '$set': {
                    closed: true
                }
            });
            // Session.set('everybodyReady', false);
            // $("#round-end-warning-modal").modal('hide');
            // $("#next-round-main").tooltip('hide');
        }
        if (brainSession.round) {
            $("#user-waits-modal").modal('hide');
        }

        // brzydki hack na ukrycie panelu z uczestnikami na początku sesji
        if (brainSession.round === 1 && !Session.get('peoplePanelHiddenOnSessionStart')) {
            Session.set('peoplePanelHiddenOnSessionStart', true);
            Session.set('peoplePanel', false);
        }

        // pokazywanie podpowiedzi o przedłużaniu sesji
        if (brainSession.roundEnd < (now + CONFIG.END_NEAR_WARNING * 60) & Session.get("add-1-min") !== true) {
            $("#add-1-min").popover("show");
            Session.set("add-1-min", true);
        }

        // // pokazanie tooltipa podpowiedzi, że wszyscy rzekomo gotowi na następną rundę
        // if (everybodyIsReady() && brainSession.round !== Session.get('everybodyReadyRound')) {
        //     $("#next-round-main").tooltip('show');
        //     Session.set('everybodyReadyRound', brainSession.round);
        //     Meteor.setTimeout(function() {
        //         $("#next-round-main").tooltip('hide');
        //     }, 5000);
        // }
    }
}, 800);

// płynny currentTimestamp
Meteor.setInterval(function() {
    Session.set("currentTimestamp", moment().format("x") / 1000);
}, 10);

// // miganie timerem
// Meteor.setInterval(function() {
//     $(".warn").toggleClass('warn-not-visible');
// }, 500);

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

        if (brainSession && brainSession.closed) {
            title = 'brainwrite.it';
            if (brainSession.title) {
                title = title + ' - ' + brainSession.title;
            }
        }

        if (title) {
            document.title = title;
        }
    }
}, 900);