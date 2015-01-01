BrainSessions = new Meteor.Collection("brainSessions");
Ideas = new Meteor.Collection("ideas");
Activity = new Meteor.Collection("activity");
ChatMessages = new Meteor.Collection("chatMessages");

CONFIG = {
    END_ROUND_DELAY: 5,
    IDEAS_PER_ROUND: 3,
    SESSION_LENGTH: 2,
    END_NEAR_WARNING: 1,
    OTHERS_IDEAS_CHUNK: 3
};