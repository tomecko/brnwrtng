Router.configure({
    layoutTemplate: 'layout'
});

Router.onBeforeAction('loading');

Router.map(function () {
    
    // strona główna, landing page
    this.route('home', {
        path: '/'
    });

    // pomocniczy/roboczy widok z ostatnimi sesjami
    this.route('last', {
        path: '/last',
    });
    
    // strona, na której organizator sesji zakłada sesję
    this.route('setup', {
        path: '/setup',
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

    // strona sesji
    this.route('brainSession', {
        path: '/session/:_id',
        onBeforeAction: function() {
            // jeśli niezalogowany, to niech się zaloguje na stronie "join"
            if (!Meteor.user() && !Meteor.loggingIn()) {
                console.log('Join before session!');
                Router.go('join', {_id: this.params._id});
            }
            if (Meteor.user()) {
                BrainSessions.update(this.params._id,{
                    '$addToSet' : {
                        participants : Meteor.userId()
                    }
                });
            }
        },
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
        path: '/join/:_id',
        data: function() {
            return {
                id : this.params._id
            }
        }
    });

});