// czy użytkownik ustawił już sobie imię?
Template.brainSession_modals.hasName = function() {
    var user = Meteor.user();
    return user && user.profile && user.profile.name && user.profile.name.length > 0;
};

Template.brainSession_before.linkForParticipants = function() {
    var brainSessionId = Router.current().params._id;
    return Meteor.absoluteUrl("session/" + brainSessionId);
};

Template.brainSession_before.linkForAdmins = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId);
    if (brainSession) {
        return Meteor.absoluteUrl("session/" + brainSessionId + "/" + brainSession.adminToken);
    }
};

Template.brainSession.round = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId);
    if (brainSession) {
        return brainSession.round;
    }
};

Template.brainSession_start_modal_others_count.othersCount = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId);
    if (brainSession) {
        return brainSession.participants.length - 1;
    }
};

Template.brainSession_chat.messages = function() {
    var brainSessionId = Router.current().params._id;
    return ChatMessages.find({
        session: brainSessionId,
        time: {
            $exists: true
        }
    }, {
        sort: {
            time: 1
        }
    });
};

Template.brainSession_chat.unreadMessagesCount = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId),
        lastChatRead;
    if (brainSession) {
        lastChatRead = 0;
        if (brainSession.chatRead && brainSession.chatRead[Meteor.userId()]) {
            lastChatRead = brainSession.chatRead[Meteor.userId()];
        }
        return ChatMessages.find({
            session: brainSessionId,
            time: {
                $exists: true,
                $gt: lastChatRead
            }
        }, {
            sort: {
                time: 1
            }
        }).count();
    }
};

// numer "arkusza" z ideami (można utożsamiać z numerem kartki z papierowego brainwritingu)
Template.brainSession_ideas_current_round.sheet = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId),
        roundZeroBased = -1 + brainSession.round,
        participantCount = brainSession.participants.length,
        userNo = brainSession.participants.indexOf(Meteor.userId()),
        sheet;
    if (brainSession) {
        sheet = (userNo + roundZeroBased) % participantCount;
        if (roundZeroBased !== Session.get("roundZeroBased")) {
            $("textarea").val('');
        }
        Session.set("roundZeroBased", roundZeroBased);
        return sheet;
    }
};

Template.brainSession_ideas_current_round.ideasPerRound = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId);
    if (brainSession) {
        return _.range(brainSession.ideasPerRound);
    }
};

Template.brainSession_in_progress.timestamp = function() {
    return Math.floor(Session.get("currentTimestamp"));
}

Template.brainSession_in_progress.myIdeas = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId);
    if (brainSession && Meteor.userId()) {
        return {
            count: Ideas.find({
                session: Router.current().params._id,
                author: Meteor.userId()
            }).count(),
            data: Ideas.find({
                session: Router.current().params._id,
                author: Meteor.userId()
            }, {
                limit: Session.get('myIdeasLimit'),
                sort: {
                    ts: -1
                }
            })
        };
    }
}

Template.brainSession_in_progress.othersIdeas = function() {
    if (Session.get('lastIdeasRefresh') === undefined) {
        Session.set('lastIdeasRefresh', Session.get('currentTimestamp'));
    }
    if ((Session.get('currentTimestamp') - Session.get('lastIdeasRefresh')) > CONFIG.OTHERS_IDEAS_INTERVAL) {
        CACHE['othersIdeas'] = false;
        Session.set('lastIdeasRefresh', Session.get('currentTimestamp'));
    }

    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId),
        count, skip;
    if (brainSession && Meteor.userId()) {
        if (!CACHE['othersIdeas']) {
            CACHE['othersIdeas'] = Ideas.find({
                session: Router.current().params._id,
                author: {
                    $not: Meteor.userId()
                },
                ts: {
                    $lt: Math.round(Session.get('lastIdeasRefresh'))
                }
            }, {
                limit: Session.get('othersIdeasLimit'),
                sort: {
                    ts: -1
                }
            });
        }
        return {
            data: CACHE['othersIdeas'],
            refreshesIn: Math.round(Session.get('lastIdeasRefresh') + CONFIG.OTHERS_IDEAS_INTERVAL - Session.get('currentTimestamp'))
        }
    }
}




// Template.brainSession_in_progress.othersIdeas = function() {
//     var brainSessionId = Router.current().params._id,
//         brainSession = BrainSessions.findOne(brainSessionId),
//         count, skip;
//     if (brainSession && Meteor.userId()) {
//         count = Ideas.find({
//             session: Router.current().params._id,
//             author: {
//                 $not: Meteor.userId()
//             }
//         }).count();
//         skip = count % CONFIG.OTHERS_IDEAS_CHUNK;
//         return {
//             count: count,
//             skip: skip,
//             data: Ideas.find({
//                 session: Router.current().params._id,
//                 author: {
//                     $not: Meteor.userId()
//                 }
//             }, {
//                 limit: Session.get('othersIdeasLimit'),
//                 skip: skip,
//                 sort: {
//                     ts: -1
//                 }
//             })
//         };
//     }
// }

Template.brainSession_after.ideas = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId),
        roundZeroBased, participantCount, userNo, sheet,
        ideas;
    if (brainSession && Meteor.userId()) {
        if (!brainSession.closed) {
            roundZeroBased = -1 + brainSession.round,
            participantCount = brainSession.participants.length,
            userNo = brainSession.participants.indexOf(Meteor.userId()),
            sheet = ((userNo + roundZeroBased + participantCount) % participantCount);
            return Ideas.find({
                session: Router.current().params._id,
                round: {
                    $lt: brainSession.round
                },
                sheet: sheet
            }, {
                sort: {
                    round: -1,
                    no: 1
                }
            });
        } else {
            var sort;
            if ('likes' === Session.get('allIdeasSorting')) {
                sort = {
                    likesCount: -1,
                    ts: 1,
                    author: 1,
                }
            } else if ('author' === Session.get('allIdeasSorting')) {
                sort = {
                    author: 1,
                    ts: 1,
                    likesCount: -1
                }
            } else {
                sort = {
                    ts: 1,
                    author: 1,
                    likesCount: -1
                }
            }

            ideas = Ideas.find({
                session: Router.current().params._id
            }, {
                sort: sort
            }).fetch();

            // _.each(ideas, function(el, i, list) {
            //     list[i].author = Meteor.users.findOne(el.author);
            // });

            if ('author' === Session.get('allIdeasSorting')) {

                var ideasByAuthors = [],
                    uniqueAuthors = [];

                // trzeba zindeksować liczbami naturalnymi tablicę z wynikiem, bo
                // inaczej w widoku #each nie iteruje po tej tablicy
                uniqueAuthors = _(ideas).chain().flatten().pluck('author').unique().value()

                _.each(ideas, function(el, i, list) {
                    var authorIndex = uniqueAuthors.indexOf(el.author)
                    if ('undefined' === typeof ideasByAuthors[authorIndex]) {
                        ideasByAuthors[authorIndex] = {};
                    }
                    ideasByAuthors[authorIndex]['author'] = el.author;
                    ideasByAuthors[authorIndex]['data'] = ideasByAuthors[authorIndex]['data'] || [];
                    ideasByAuthors[authorIndex]['data'].push(el);
                });
                return ideasByAuthors;
            }

            if ('likes' === Session.get('allIdeasSorting')) {

                var mostPopularSlots = 12,
                    ideasByLikes = {
                        popular: [],
                        other: []
                    };

                _.each(ideas, function(el, i, list) {
                    if (el.likedBy && el.likedBy.length > 0 && mostPopularSlots > 0) {
                        ideasByLikes.popular.push(el);
                        mostPopularSlots--;
                    } else {
                        ideasByLikes.other.push(el);
                    }
                });
                return ideasByLikes;
            }

            return ideas;
        }
    }
};

Template.brainSession_chat.participants = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId);
    if (brainSession) {
        _.each(brainSession.participants, function(el, i, list) {
            list[i] = Meteor.users.findOne(el);
            if (list[i]) {
                list[i].activity = Activity.findOne({
                    user: el,
                    session: brainSessionId
                });
                if (list[i].activity) {
                    if (list[i].activity.write) {
                        // uznajemy, ze pisze, jesli pisał w ciagu ostatnich 3 sekund
                        list[i].activity.write = (Session.get("currentTimestamp") - list[i].activity.write) < 3;
                    }
                    list[i].activity.ready = (list[i].activity.ready === brainSession.round);
                    return true;
                }
            }
        });
        return brainSession.participants;
    }
};

// liczba sekund do końca rundy
Template.brainSession.timer = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId),
        timerSeconds = getTimerSeconds(),
        brainSessionLengthInSeconds;
    if (brainSession) {
        return {
            seconds: timerSeconds,
            // length: brainSession.roundLength * 60,
            percentage: 100 * timerSeconds / (brainSession.roundLength * 60)
        }
    }
};

Template.brainSession_ideas_current_round.ideas = function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId),
        ideas, count;
    if (brainSession) {
        ideas = Ideas.find({
            session: brainSessionId,
            round: brainSession.round,
            author: Meteor.userId()
        }).fetch();
        count = ideas.length;
        ideas = ideas.concat([{}, {}, {}]);
        return {
            list: ideas.slice(0, CONFIG.IDEAS_PER_ROUND),
            count: count
        };
    }
};


Template.brainSession_modals.rendered = function() {

    Tracker.autorun(function(c) {
        var user = Meteor.user(),
            brainSessionId = Router.current().params._id,
            brainSession = BrainSessions.findOne(brainSessionId);
        // pokazywanie odpowiednich modali na wejściu do sesji
        if (user && brainSession && Session.get('closed-modal') != brainSessionId && !brainSession.round) { // 'closed-modal' => do better!
            // admin
            if (_.indexOf(brainSession.admins, Meteor.userId()) > -1) {
                if (typeof brainSession.title === 'undefined') {
                    $('#admin-setup-modal').modal('show');
                }
            } else {
                // jeśli user jest bez imienia
                if (!user.profile || typeof user.profile.name === 'undefined') {
                    $('#user-welcome-modal').modal('show');
                } else {
                    // if (!brainSession.round && !Session.get('user-waits-modal-ok-clicked')) {
                    //     $('#user-waits-modal').modal('show');
                    // }
                    BrainSessions.update(brainSessionId, {
                        $addToSet: {
                            participantsWhoEntered: Meteor.userId()
                        }
                    });
                }
            }
        }

    });

};

Template.brainSession.rendered = function() {

    // $(window).scroll(function() {
    //     $('#side-col').css({
    //         'margin-top': $('body').scrollTop()
    //     })
    // });

    // ew. TODO:
    // pobrać wpisane idee i umieścić je w textarea
    // czyli obsłużyć przypadek, że ktoś sobie pisze i odświeża stronę w trakcie rundy
    // niech mu się zachowują treści pomysłów

};

// Template.brainSession_timer.rendered = function() {
//     $(".dial").knob(knobSettings);
// };

// var knobSettings = {
//     width: 80,
//     height: 80,
//     displayInput: false,
//     rotation: 'anticlockwise',
//     readOnly: true
// };

// hack, żeby chat był przescrollowany na dół
Template.brainSession_chat.rendered = function() {
    var $chat = $("#chat");
    $chat.scrollTop(9999);
};

Template.brainSession_after.rendered = function() {
    adjustChatTop();
}

Meteor.setInterval(function() {
    var $chat = $("#chat");
    $chat.scrollTop(9999);
}, 1000);