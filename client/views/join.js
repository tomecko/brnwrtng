Template.join.events({
    'submit form': function(event){
        event.preventDefault();
        var email = document.getElementById('email').value,
            id = $(event.target).data('id');

        Meteor.call('addUser', {
            email: email,
            password: 'somepassword'
        }, function() {
            Meteor.loginWithPassword(email, 'somepassword', function() {
                BrainSessions.update(id,{
                    '$addToSet' : {
                        participants : Meteor.user()._id
                    }
                })
                Router.go('brainSession', {id: id});
            });
        });
        
    }
});
