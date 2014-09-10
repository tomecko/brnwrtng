Template.brainSession.events({
    // otwieranie okna do edycji imienia
    'click .user-setup-modal-open' : function(event) {
        $("#user-setup-modal").modal("show");  
    },
    // zmienianie imienia
    'click #user-setup-modal-ok' : function(event) {
        var userId = Meteor.userId(),
            name = $("#user-setup-modal-name").val();
        Meteor.users.update(userId,{
            $set: {
                'profile.name' : name
            }
        });
        $('#user-setup-modal').modal('hide');
    },
    // otwieranie okna z edycją tytułu i opisu sesji
    'click .session-setup-modal-open' : function() {
        $("#session-setup-modal").modal("show");
    },
    // zmienianie tytułu i opisu sesji
    'click #session-setup-modal-ok' : function(event) {
        var brainSessionId = Router.current().params._id;
        BrainSessions.update(brainSessionId,{
            $set: {
                title: $("#session-setup-modal-title").val(),
                desc: $("#session-setup-modal-desc").val()
            }
        });
        $('#session-setup-modal').modal('hide');
    },
    // przycisk gotowości na sesję lub następną rundę
    'click #submit-ideas' : function(event) {
        var brainSessionId = Router.current().params._id,
            brainSession = BrainSessions.findOne(brainSessionId);
        Meteor.call('upsertActivity',{
            user: Meteor.userId(),
            session: brainSessionId
        }, "ready", brainSession.round);
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
            time: TimeSync.serverTime()
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
    'keyup textarea.idea': function(event){
        var $target = $(event.target),
            $container = $target.closest('[data-round]'),
            brainSessionId = Router.current().params._id;
    
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
        
        Meteor.call('upsertActivity',{
            user: Meteor.userId(),
            session: brainSessionId
        }, "ready", false);
    }
});