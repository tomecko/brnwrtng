Template.join.events({
    'submit form': function(event){
        event.preventDefault();
	var id = $(event.target).data('id');
        var userName = document.getElementById('user-name').value;

        Meteor.call('addUser', {
            username: userName,
            password: 'somepassword'
        }, function() {
            Meteor.loginWithPassword(userName, 'somepassword', function() {
                var id = Router.current().params._id;
		var token = Router.current().params._token;

                BrainSessions.update(id, {
                    '$addToSet' : {
                        participants : Meteor.user()._id
                    }
                });
                Router.go('brainSession', {_id: id, _token: token});
            });
        });
    }
});
