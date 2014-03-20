Template.setup.events({
    'submit form': function(event){
        event.preventDefault();
        var title = document.getElementById('title').value,
            desc = document.getElementById('desc').value,
            ideasPerRound = document.getElementById('ideasPerRound').value,
            roundLength = document.getElementById('roundLength').value,
            email, user;
    
        newBrainSession = {
            title: title,
            desc: desc,
            ideasPerRound: ideasPerRound,
            roundLength: roundLength,
            createdAt: moment().unix()
        };
        
        // zalogowany organizator od razu tworzy sesję
        if (Meteor.user()) {
            userId = Meteor.user()._id;
            createSession(newBrainSession, userId);
        }
        
        // niezalogowany zaś najpierw...
        if (!Meteor.user()){
            
            email = document.getElementById('email').value;
            user = Meteor.users.findOne({
                "emails.address" : email
            });
            
            // ...loguje się, jeśli ma konto...
            if (user) {
                Meteor.loginWithPassword(email, 'somepassword', function(){
                    createSession(newBrainSession, user._id);
                });
            }
            // ...lub zakłada sobie konto i wtedy dopiero się loguje
            else {
                Meteor.call('addUser', {
                    email: email,
                    password: 'somepassword'
                }, function(error, userId) {
                    Meteor.loginWithPassword(email, 'somepassword', function(){
                        createSession(newBrainSession, userId);
                    });
                });
            }
            
        }
    
    }
});

function createSession(doc, userId) {
    doc.round = 0;
    doc.superusers = [userId];
    doc.participants = [userId];
    BrainSessions.insert(doc,
        function(err, id){
            if (!err) {
                Router.go('brainSession', {_id: id});
            }
        }
    );
}