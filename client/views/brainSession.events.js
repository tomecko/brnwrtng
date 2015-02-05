Template.brainSession.events({
    'click .modal .close': function() {
        Session.set('closed-modal', Router.current().params._id); // TODO: better
    },
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
            },
            $addToSet: {
                participantsWhoEntered: userId
            }
        });

        $("#admin-setup-modal").modal("hide");
        // $("#setup-session-links-modal").modal("show");
    },
    // zamykanie ostatniego okna adminowego
    'click #session-almost-started-modal-ok': function(event) {
        $('#session-almost-started-modal').modal('hide');
        $("#start-brainwriting").tooltip('show');
        Meteor.setTimeout(function() {
            $("#start-brainwriting").tooltip('hide');
        }, 5000);
    },

    // zamykanie okna powitalnego dla nie-admina
    'click #user-waits-modal-ok': function(event) {
        $('#user-waits-modal').modal('hide');
        Session.set('user-waits-modal-ok-clicked', true);
    },


    // zamykanie okna powitalnego dla nie-admina
    'click #user-welcome-modal-ok': function(event) {
        var userId = Meteor.userId(),
            name = $("#user-welcome-modal-name").val(),
            brainSessionId = Router.current().params._id;
        Meteor.users.update(userId, {
            $set: {
                'profile.name': name
            }
        });
        BrainSessions.update(brainSessionId, {
            $addToSet: {
                participantsWhoEntered: userId
            }
        });
        $('#user-welcome-modal').modal('hide');
        $('#user-waits-modal').modal('show');
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
    'keydown #idea-form textarea': function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#idea-form").submit();
        }
        Meteor.call('upsertActivity', {
            user: Meteor.userId(),
            session: Router.current().params._id
        }, "write");
    },
    // wysłanie idei
    'submit #idea-form': function(event) {
        event.preventDefault();
        var $target = $(event.target),
            $textarea = $target.find('textarea'),
            // no = +$target.attr('data-no'),
            ts = +$target.attr('data-ts'),
            text = $textarea.val().trim(),
            brainSessionId = Router.current().params._id,
            brainSession = BrainSessions.findOne(brainSessionId);
        if (!text.length) {
            $textarea.val("");
            return;
        }
        Ideas.insert({
            author: Meteor.userId(),
            session: brainSessionId,
            ts: ts,
            // sheet: +$target.attr('data-sheet'),
            // round: +$target.attr('data-round'),
            // no: no,
            text: text,
        }, function(error, result) {
            if (!error) {
                $textarea.val("");
            }
        });
    },
    // wysłanie wiadomości na chacie
    'submit #chat-send-message': function(event) {
        event.preventDefault();
        var $target = $(event.target),
            $input = $target.find("input"),
            $chat = $("#chat"),
            text = $input.val(),
            query,
            brainSessionId = Router.current().params._id;
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

        // zaktualizowanie timestampu przeczytanej ost. wiadomości
        query = {
            '$set': {}
        };
        query['$set']['chatRead.' + Meteor.userId()] = Math.floor(Session.get("currentTimestamp") * 1000)
        BrainSessions.update(brainSessionId, query);
    },
    'click .go-to-start-modal-2': function(event) {
        $(".start-modal-1").addClass('hidden');
        $(".admin-link").addClass('hidden');
        $(".start-modal-2").removeClass('hidden');
    },
    'click .go-to-start-modal-1': function(event) {
        $(".start-modal-2").addClass('hidden');
        $(".admin-link").addClass('hidden');
        $(".start-modal-1").removeClass('hidden');
    },
    // organizator rozpoczyna sesję lub przechodzi do następnej rundy
    'click .next-round': function(event) {
        var brainSessionId = Router.current().params._id,
            brainSession = BrainSessions.findOne(brainSessionId),
            now = Math.floor(TimeSync.serverTime() / 1000),
            force = $(event.target).hasClass('next-round-force');
        $("#next-round-main").tooltip('hide');
        $("#session-almost-started-modal").modal('hide');
        $("#start-brainwriting").tooltip('hide');
        if (brainSession) {
            // rozpoczynanie sesji
            if (brainSession.round === 0) {
                Session.set('peoplePanel', false);
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
                        Session.set('skipNextRoundWarning', false);
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
    'click .back-to-links-modal': function(event) {
        $("#session-almost-started-modal").modal("hide");
        $("#setup-session-links-modal").modal("show");
    },
    'click #show-links': function(event) {
        var $target = $(event.target);
        $("#links").show();
        $target.remove();
    },
    'click #show-admin-link': function(event) {
        var $target = $(event.target);
        $(".admin-link").removeClass('hidden');
        $target.remove();
    },
    'click #session-links-modal-ok': function() {
        $("#session-links-modal").modal("hide");
    },
    'click #setup-session-links-modal-ok': function() {
        $("#setup-session-links-modal").modal("hide");
        $("#session-almost-started-modal").modal("show");
    },
    // uczestnik sesji pisze ideę
    // 'keyup textarea.idea': function(event) {
    //     var $target = $(event.target),
    //         $container = $target.closest('[data-round]'),
    //         brainSessionId = Router.current().params._id;

    //     Meteor.call('upsertIdea', {
    //         author: Meteor.userId(),
    //         no: $target.data('no'),
    //         session: Router.current().params._id,
    //         sheet: +$container.attr('data-sheet'),
    //         round: +$container.attr('data-round'),
    //         text: $target.val(),
    //     });
    //     Meteor.call('upsertActivity', {
    //         user: Meteor.userId(),
    //         session: Router.current().params._id
    //     }, "write");

    //     Meteor.call('upsertActivity', {
    //         user: Meteor.userId(),
    //         session: brainSessionId
    //     }, "ready", false);
    // },
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
    'click .js-select-text-on-click': function(event) {
        var $target = $(event.currentTarget);
        var range = document.createRange();
        var selection = window.getSelection();
        range.selectNodeContents($target[0]);

        selection.removeAllRanges();
        selection.addRange(range);
    },
    'mouseup .js-select-text-on-focus': function(event) {
        return false;
    },
    'click .my-ideas-show-all': function(event) {
        Session.set('myIdeasLimit', 9999);
    },
    'click .others-ideas-show-all': function(event) {
        Session.set('othersIdeasLimit', 9999);
    },
    'click .my-ideas-show-less': function(event) {
        Session.set('myIdeasLimit', 3);
    },
    'click .others-ideas-show-less': function(event) {
        Session.set('othersIdeasLimit', 9);
    },
    'click .toggle-panel': function(event) {
        var $target = $(event.currentTarget),
            panel = $target.data('panel'),
            brainSessionId = Router.current().params._id,
            query;
        Session.set('panel', Session.get('panel') === panel ? false : panel);

        if (Session.get('panel') === 'chat' || panel === 'chat') {
            query = {
                '$set': {}
            };
            query['$set']['chatRead.' + Meteor.userId()] = Math.floor(Session.get("currentTimestamp") * 1000)
            BrainSessions.update(brainSessionId, query);
        }
    },
    'click .add-1-min': function(event) {
        var brainSessionId = Router.current().params._id,
            brainSession = BrainSessions.findOne(brainSessionId),
            now = Math.floor(TimeSync.serverTime() / 1000);
        if (brainSession) {
            BrainSessions.update(brainSessionId, {
                '$set': {
                    roundEnd: Math.min(now + CONFIG.SESSION_LENGTH * 60, brainSession.roundEnd + 60),
                    timeAddedAt: now
                }
            });
        }
        Session.set("add-1-min", false);
        $("#add-1-min").popover("hide");
    },
    'click .timer-actions .popover': function(event) {
        $("#add-1-min").popover("hide");
        Session.set("add-1-min", true);
    },
    'focus #idea-form textarea': function(event) {
        $("#idea-form").addClass("focused");
    },
    'blur #idea-form textarea': function(event) {
        $("#idea-form").removeClass("focused");
    },
    'click .after-session-alert': function(event) {
        Session.set('afterSessionAlert', false);
    },
});