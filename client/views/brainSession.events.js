Template.brainSession.events({
    // zamykanie modala dla admina na początku sesji
    'click #admin-setup-modal-ok': function(event) {
        var userId = Meteor.userId(),
            name = $("#admin-setup-modal-name").val(),
            brainSessionId = Router.current().params._id;
        Meteor.users.update(userId, {
            $set: {
                'profile.name': name
            }
        });

        BrainSessions.update(brainSessionId, {
            $set: {
                title: $("#admin-setup-modal-title").val()
            }
        });

        $("#admin-setup-modal").modal("hide");
    },

    // zamykanie okna powitalnego dla nie-admina
    'click #user-welcome-modal-ok': function(event) {
        var userId = Meteor.userId(),
            name = $("#user-welcome-modal-name").val();
        Meteor.users.update(userId, {
            $set: {
                'profile.name': name
            }
        });
        $('#user-welcome-modal').modal('hide');
    },
    'keyup #user-welcome-modal-name': function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#user-welcome-modal-ok").click();
        }
    },

    // otwieranie okna do edycji imienia
    'click .name-edit-modal-open': function(event) {
        $("#name-edit-modal").modal("show");
        $("#name-edit-modal-name").focus();
    },
    'keyup #name-edit-modal-name': function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#name-edit-modal-ok").click();
        }
    },
    // zmienianie imienia
    'click #name-edit-modal-ok': function(event) {
        var userId = Meteor.userId(),
            name = $("#name-edit-modal-name").val();
        Meteor.users.update(userId, {
            $set: {
                'profile.name': name
            }
        });
        $('#name-edit-modal').modal('hide');
    },

    // otwieranie okna z edycją tytułu i opisu sesji
    'click .session-edit-modal-open': function() {
        $("#session-edit-modal").modal("show");
        $("#session-edit-modal-title").focus();
    },
    // zmienianie tytułu i opisu sesji
    'click #session-edit-modal-ok': function() {
        var brainSessionId = Router.current().params._id;
        BrainSessions.update(brainSessionId, {
            $set: {
                title: $("#session-edit-modal-title").val()
            }
        });
        $('#session-edit-modal').modal('hide');
    },
    'keyup #session-edit-modal-title': function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#session-edit-modal-ok").click();
        }
    },
    // przycisk gotowości na sesję lub następną rundę
    'click #submit-ideas': function(event) {
        var brainSessionId = Router.current().params._id,
            brainSession = BrainSessions.findOne(brainSessionId);
        Meteor.call('upsertActivity', {
            user: Meteor.userId(),
            session: brainSessionId
        }, "ready", brainSession.round);
    },
    // wysłanie wiadomości na chacie
    'submit #chat-send-message': function(event) {
        event.preventDefault();
        var $target = $(event.target),
            $input = $target.find("input"),
            $chat = $("#chat"),
            text = $input.val();
        $input.val("");
        if ('' === text) return;
        ChatMessages.insert({
            session: Router.current().params._id,
            author: Meteor.userId(),
            text: text,
            time: TimeSync.serverTime()
        }, function() {
            $chat.scrollTop(9999);
        });
    },
    // organizator rozpoczyna sesję lub przechodzi do następnej rundy
    'click .next-round': function(event) {
        var brainSessionId = Router.current().params._id,
            brainSession = BrainSessions.findOne(brainSessionId),
            now = Math.floor(TimeSync.serverTime() / 1000),
            force = $(event.target).hasClass('next-round-force');
        if (brainSession) {
            // rozpoczynanie sesji
            if (brainSession.round === 0) {
                BrainSessions.update(brainSessionId, {
                    '$set': {
                        round: 1,
                        roundStart: now,
                        roundEnd: now + (60 * brainSession.roundLength)
                    }
                });
            } else { // następna runda
                if (everybodyIsReady() || force || Session.equals('skipNextRoundWarning', true)) {
                    BrainSessions.update(brainSessionId, {
                        '$set': {
                            roundEnd: now + CONFIG.END_ROUND_DELAY,
                            shortened: true
                        }
                    });
                    $("#round-end-warning-modal").modal('hide');
                    if (Session.equals('skipNextRoundWarning', 'unknown')) {
                        Session.set('skipNextRoundWarning', true);
                    }
                } else { // ostrzeżenie, że nie wszyscy gotowi
                    $("#round-end-warning-modal").modal('show');
                }
            }
        }
    },
    // wycofanie się z kończenia rundy
    'click .next-round-undo': function() {
        var brainSessionId = Router.current().params._id,
            brainSession = BrainSessions.findOne(brainSessionId),
            now = Math.floor(TimeSync.serverTime() / 1000);
        if (brainSession) {
            BrainSessions.update(brainSessionId, {
                '$set': {
                    roundEnd: brainSession.roundStart + (60 * brainSession.roundLength)
                },
                '$unset': {
                    shortened: ""
                }
            });
        }
    },
    //
    'click .skip-next-round-warning-switch': function(event) {
        var $input = $('.skip-next-round-warning-switch input');
        Session.set('skipNextRoundWarning', $input.is(":checked"));
    },
    // organizator kończy sesję - otwarcie okna
    'click .end-session': function() {
        $("#end-session-modal").modal("show");
    },
    // organizator kończy sesję - zamkniecie okna
    'click .end-session-modal-close': function() {
        $("#end-session-modal").modal("hide");
    },
    // organizator kończy sesję
    'click #end-session-modal-ok': function() {
        var brainSessionId = Router.current().params._id,
            brainSession = BrainSessions.findOne(brainSessionId);
        BrainSessions.update(brainSessionId, {
            '$set': {
                closed: true,
            }
        });
        $("#end-session-modal").modal("hide");
    },
    'click .session-links-modal-open': function() {
        $("#session-links-modal").modal("show");
    },
    'click #session-links-modal-show-admin-link': function(event) {
        var $target = $(event.target);
        $target.next().show();
        $target.remove();
    },
    'click #session-links-modal-ok': function() {
        $("#session-links-modal").modal("hide");
    },
    // uczestnik sesji pisze ideę
    'keyup textarea.idea': function(event) {
        var $target = $(event.target),
            $container = $target.closest('[data-round]'),
            brainSessionId = Router.current().params._id;

        Meteor.call('upsertIdea', {
            author: Meteor.userId(),
            no: $target.data('no'),
            session: Router.current().params._id,
            sheet: +$container.attr('data-sheet'),
            round: +$container.attr('data-round'),
            text: $target.val(),
        });
        Meteor.call('upsertActivity', {
            user: Meteor.userId(),
            session: Router.current().params._id
        }, "write");

        Meteor.call('upsertActivity', {
            user: Meteor.userId(),
            session: brainSessionId
        }, "ready", false);
    },
    'click .all-ideas-sorting': function(event) {
        var $target = $(event.target),
            sortBy = $target.data('sortBy');
        Session.set('allIdeasSorting', sortBy);
    },
    'click .idea-box-like': function(event) {
        var ideaId = this._id,
            idea = Ideas.findOne(this._id);
        if (idea) {
            // odejmujemy
            if (idea.likedBy && idea.likedBy.indexOf(Meteor.userId()) > -1) {
                Ideas.update(this._id, {
                    '$pull': {
                        'likedBy': Meteor.userId()
                    },
                    '$inc': {
                        likesCount: -1
                    }
                });
            } else { // dodajemy
                Ideas.update(this._id, {
                    '$addToSet': {
                        'likedBy': Meteor.userId()
                    },
                    '$inc': {
                        likesCount: 1
                    }
                });
            }
        }
    },
    'focus .js-select-text-on-focus': function(event) {
        var $target = $(event.target);
        $target.select();
    },
    'mouseup .js-select-text-on-focus': function(event) {
        return false;
    }
});