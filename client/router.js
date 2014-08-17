Router.configure({
    layoutTemplate: 'layout'
});

Router.onBeforeAction('loading');

Router.map(function () {
    
    // strona główna, landing page
    this.route('home', {
        path: '/'
    });

    // strona, na której organizator sesji dostaje linka, którego ma przesłać uczestnikom
    this.route('invite', {
        path: '/invite/:_id',
        data: function() {
            return BrainSessions.findOne(this.params._id);
        },
        waitOn: function(){
            return [Meteor.subscribe("brainSessions")];
        }
    });

    // strona sesji (w zaleznosci od tego jaki jest token, to bedziemy mieli do czynienia
    // z moderatorem, albo ze zwyklym uzytkownikiem
    this.route('brainSession', {
        path: '/session/:_id/:_token',
        data: function() {
            return BrainSessions.findOne(this.params._id);
        },
        waitOn: function(){
            return [Meteor.subscribe("brainSessions")];
        }
    });

    // strona, na której uczestnik sesji (nie organizator) podaje swoje dane,
    // żeby dostać się na stronę sesji
    this.route('join', {
        path: '/join/:_id/:_token',
        data: function() {
            return {
                id : this.params._id,
		token : this.params._token
            }
        }
    });

});
