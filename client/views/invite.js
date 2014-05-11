Template.invite.rendered = function() {
    $("#session-link").select();
}

Template.invite.events({
    'click #session-link': function(evenmt){
        $(event.target).select();
    }
});

