// TODO: napisać sensowne publikowanie danych

Meteor.publish("users", function () {
    return Meteor.users.find({}, {
        fields: {
            emails : 1
        }
    });
});

Meteor.publish("brainSessions", function () {
    return BrainSessions.find({});
});

Meteor.publish("ideas", function () {
    return Ideas.find({});
});

Meteor.publish("activity", function () {
    return Activity.find({});
});

Meteor.publish("chatMessages", function () {
    return ChatMessages.find({});
});