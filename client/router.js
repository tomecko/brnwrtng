Router.configure({
    layoutTemplate: 'layout'
});

Router.onBeforeAction('loading');

Router.map(function() {

    // strona główna, landing page
    this.route('home', {
        path: '/'
    });

    // strona sesji (w zaleznosci od tego jaki jest token, to bedziemy mieli do czynienia
    // z moderatorem, albo ze zwyklym uzytkownikiem)
    this.route('brainSession', {
        path: '/session/:_id/:token?',
        waitOn: function() {
            return [Meteor.subscribe("brainSessions"), Meteor.subscribe('users')];
        },
        action: function() {
            if (this.ready()) {

                forceLogin(function(userId) {

                    var brainSessionId = Router.current().params._id;

                    // jeśli ktoś podaje token admina, to dopisujemy go do admina
                    if (Router.current().params.token) {
                        var brainSession = BrainSessions.findOne(brainSessionId);
                        if (brainSession) {
                            if (Router.current().params.token === brainSession.adminToken) {
                                BrainSessions.update(brainSessionId, {
                                    $addToSet: {
                                        admins: userId
                                    }
                                });
                                // TO DO: przekierować na ścieżkę bez tokena
                            }
                        }
                    }

                    BrainSessions.update(brainSessionId, {
                        $addToSet: {
                            participants: userId
                        }
                    });

                });

                this.render();

            } else {

                this.render('loading');

            }

        },
        data: function() {
            return BrainSessions.findOne(this.params._id);
        }
    });

});