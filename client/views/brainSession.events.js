Template.brainSession.events({
    // przycisk gotowości na sesję lub następną rundę
    'click .ready' : function(event) {
        var brainSessionId = Router.current().params._id,
            brainSession = BrainSessions.findOne(brainSessionId),
            $target = $(event.target),
            ready = $target.data('ready'),
            newValue = ready ? brainSession.round : false;
        Meteor.call('upsertActivity',{
            user: Meteor.userId(),
            session: brainSessionId
        }, "ready", newValue);
    },
    // wysłanie wiadomości na chacie
    'submit #chat-send-message' : function(event) {
        event.preventDefault();
        var $target = $(event.target),
            $input = $target.find("input"),
            $chat = $("#chat"),
            text = $input.val();
        $input.val("");
        ChatMessages.insert({
            session: Router.current().params._id,
            author: Meteor.userId(),
            text: text,
            time: moment().unix()
        }, function(){
            $chat.scrollTop(9999);
        });
    },
    // organizator przechodzi do następnej rundy
    'click .next-round' : function() {
        var brainSessionId = Router.current().params._id,
            brainSession = BrainSessions.findOne(brainSessionId),
            nextRound = 1 + brainSession.round;
        BrainSessions.update(brainSessionId,{
            '$set' : {
                round: nextRound,
                roundStart: moment().unix()
            }
        });
    },
    // organizator kończy sesję
    'click .end-session' : function() {
        var brainSessionId = Router.current().params._id,
            brainSession = BrainSessions.findOne(brainSessionId);
        BrainSessions.update(brainSessionId,{
            '$set' : {
                closed: true,
            }
        });
    },
    // uczestnik sesji pisze ideę
    'keyup textarea': function(event){
        var $target = $(event.target),
            $container = $target.closest('[data-round]');
        Meteor.call('upsertIdea',{
            author: Meteor.userId(),
            no: $target.data('no'),
            session: Router.current().params._id,
            sheet: +$container.attr('data-sheet'),
            round: +$container.attr('data-round'),
            text: $target.val(),
        });
        Meteor.call('upsertActivity',{
            user: Meteor.userId(),
            session: Router.current().params._id
        }, "write");
    }
});