// czy użytkownik ustawił już sobie imię?
Template.brainSession.hasName = function() {
    var user = Meteor.user();
    return user && user.profile && user.profile.name && user.profile.name.length > 0;
};

Template.brainSession_info.linkForParticipants = function() {
    var brainSessionId = Router.current().params._id;
    return Meteor.absoluteUrl("session/"+brainSessionId);
};

Template.brainSession_info.linkForAdmins = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId);
    if (brainSession) {
        return Meteor.absoluteUrl("session/"+brainSessionId+"/"+brainSession.adminToken);
    }
};

Template.brainSession_chat.messages = function() {
    var brainSessionId = Router.current().params._id;
    return ChatMessages.find({
        session: brainSessionId,
        time: {
            $exists: true
        }
    }, {
        sort : {time: 1}
    });
};

// numer "arkusza" z ideami (można utożsamiać z numerem kartki z papierowego brainwritingu)
Template.brainSession_ideas_current_round.sheet = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId),
        roundZeroBased = -1 + brainSession.round,
        participantCount = brainSession.participants.length,
        userNo = brainSession.participants.indexOf(Meteor.user()._id);
    if (brainSession) {
        $("textarea").val('');
        return (userNo + roundZeroBased) % participantCount;
    }
};

Template.brainSession_ideas_current_round.ideasPerRound = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId);
    if (brainSession) {
        return _.range(brainSession.ideasPerRound);
    }
};

Template.brainSession_ideas.ideas = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId),
        roundZeroBased, participantCount, userNo, sheet,
        ideas;
    if (brainSession && Meteor.userId()) {
        if (!brainSession.closed) {
            roundZeroBased = -1 + brainSession.round,
            participantCount = brainSession.participants.length,
            userNo = brainSession.participants.indexOf(Meteor.userId()),
            sheet = ((userNo + roundZeroBased + participantCount) % participantCount);
            return Ideas.find({
                session: Router.current().params._id,
                round: {$lt: brainSession.round},
                sheet: sheet
            }, {
                sort : {
                    round : -1,
                    no: 1
                }
            });
        } else {
            ideas = Ideas.find({
                session: Router.current().params._id
            }, {
                sort : {
                    round : 1,
                    no: 1
                }
            }).fetch();
            _.each(ideas, function(el, i, list){
                list[i].author = Meteor.users.findOne(el.author);
            });
            return ideas;
        }
    }
};

Template.brainSession_participants.participants = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId);
    if (brainSession) {
        _.each(brainSession.participants, function(el, i, list){
            list[i] = Meteor.users.findOne(el);
            if (list[i]) {
                list[i].activity = Activity.findOne({
                    user: el, 
                    session: brainSessionId
                });
                if (list[i].activity) {
                    if (list[i].activity.write) {
                        // uznajemy, ze pisze, jesli pisał w ciagu ostatnich 3 sekund
                        list[i].activity.write = (Session.get("currentTimestamp")-list[i].activity.write) < 3;
                    }
                    list[i].activity.ready = (list[i].activity.ready === brainSession.round);
                    return true;
                }
            }
        });
        return brainSession.participants;
    }
};

// liczba sekund do końca rundy
Template.brainSession_timer.timerSeconds = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId),
        timerSeconds = getTimerSeconds(),
        brainSessionLengthInSeconds;
    if (brainSession) {
        brainSessionLengthInSeconds = brainSession.roundLength*60;
        knobSettings.max = brainSessionLengthInSeconds
        $('.dial')
            .trigger('configure', knobSettings)
            .val(brainSessionLengthInSeconds - timerSeconds)
            .trigger('change');
    }
    return getTimerSeconds();
};


Template.brainSession.rendered = function() {
    
    this.autorun(function (c) {
        var user = Meteor.user();
        if (user) {
            if (!(user.profile && user.profile.name && user.profile.name.length > 0)) {
                $('#user-setup-modal').modal('show');
            }
        }
    });
    
    // TODO:
    // pobrać wpisane idee i umieścić je w textarea
    // czyli obsłużyć przypadek, że ktoś sobie pisze i odświeża stronę w trakcie rundy
    // niech mu się zachowują treści pomysłów
    
};

// hack, żeby chat był przescrollowany na dół
Template.brainSession_chat.rendered = function() {
    var $chat = $("#chat");
    $chat.scrollTop(9999);
};

Template.brainSession_timer.rendered = function() {
    $(".dial").knob(knobSettings);
};

var knobSettings = {
    width: 80,
    height: 80,
    displayInput: false,
    rotation: 'anticlockwise'
};
