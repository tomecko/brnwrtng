getTimerSeconds = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId),
        roundLengthSeconds;
    if (brainSession) {
        roundLengthSeconds = 60 * brainSession.roundLength;
        if (0 == brainSession.round) {
            return roundLengthSeconds;
        }
        return _.max([0, _.min([
            roundLengthSeconds,
            brainSession.roundEnd - Math.floor(Session.get("currentTimestamp"))
        ])]);
    }
}

formatDuration = function(secondsTotal) {
    var hours, minutes, seconds, result = "";
    if (secondsTotal < 0) {
        secondsTotal = -secondsTotal;
        result = "-";
    }
    hours = parseInt(secondsTotal / 3600) % 24;
    minutes = parseInt(secondsTotal / 60) % 60;
    seconds = secondsTotal % 60;

    result = result + (hours > 0 ? (hours < 10 ? "0" + hours : hours) + ":" : '') + (minutes < 10 && hours > 0 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
    return result;
}

getRandomString = function(length) {
    var text = "",
        possible = "0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

forceLogin = function(callback) {

    // zarejestrowanie i zalogowanie, jeśli ktoś nie jest zalogowany
    if (!Meteor.user()) {

        var username = "guest_" + getRandomString(5);

        Meteor.call('addUser', {
            username: username,
            password: 'somepassword'
        }, function(error, userId) {
            if (userId) {
                Meteor.loginWithPassword(username, 'somepassword');
                callback(userId);
            }
        });

    }
    // a jeśli jest zalogowany, to tworzymy sesję
    else {
        callback(Meteor.userId());
    }

}

isSuperuser = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId);

    if (brainSession && Meteor.userId()) {
        return _.indexOf(brainSession.admins, Meteor.userId()) > -1;
    }
}

everybodyIsReady = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId),
        currentRoundIdeasCount;
    if (brainSession) {
        currentRoundIdeasCount = Ideas.find({
            session: brainSessionId,
            round: brainSession.round
        }).count();
        return currentRoundIdeasCount == brainSession.participants.length * CONFIG.IDEAS_PER_ROUND
    }
}

adjustChatTop = function() {
    newTop = Math.max(0, 100 - $(document).scrollTop() + ($("#progress-bar").length ? 15 : 0)) + 'px';
    $("#chat-col").css("top", newTop);
}