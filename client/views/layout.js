Template.layout.events({
    'click .logout' : function() {
        Meteor.logout();
        Router.go('home');
    }
});