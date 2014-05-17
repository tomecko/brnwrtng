Template.invite.brainSession = function() {
    return brainSession = BrainSessions.findOne(Router.current().params._id);
}

Template.invite.rendered = function() {
    $("#session-link").select();
}

Template.invite.events({
    'click #session-link': function(evenmt){
        $(event.target).select();
    }
});

