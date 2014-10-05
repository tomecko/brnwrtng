Meteor.methods({
    upsertIdea: function(idea) {
        check(idea.author, String);
        check(idea.no, Number);
        check(idea.round, Number);
        check(idea.session, String);
        check(idea.sheet, Number);
        check(idea.text, String);

        return Ideas.upsert({
            author: idea.author,
            no: idea.no,
            session: idea.session,
            sheet: idea.sheet,
            round: idea.round
        }, {
            $set: {
                text: idea.text
            }
        });
    },
    upsertActivity: function(activity, field, value) {
        check(activity.user, String);
        check(activity.session, String);
        check(field, String);

        // jeśli nie podano wartości, zapisujemy timestamp
        if ('undefined' == typeof value) {
            value = moment().unix();
        }

        var query = {
            '$set': {}
        };
        query['$set'][field] = value;

        return Activity.upsert({
            session: activity.session,
            user: activity.user
        }, query);
    },
    addUser: function(user) {
        var userId = Accounts.createUser(user);
        return userId;
    }
});