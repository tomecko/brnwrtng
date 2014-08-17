Template.home.events({
    'click #create-brainwriting': function(event) {

	// zeby nie bylo wielu sesji ;)
        event.preventDefault();

	// losujemy sobie token - identyfikator ktorego posiadacz bedzie moderatorem
	var token = ('000000000' + Math.floor((Math.random() * 999999999) + 1)).slice(9);

	// tworzymy sesje z domyslnymi wartosciami
	var brainwritingSession = {
            title: 'brainwriting title',
            desc: 'brainwriting description',
            ideasPerRound: 5,
            roundLength: 5,
            createdAt: moment().unix(),
	    round: 0,
	    token: token
        };

    	BrainSessions.insert(brainwritingSession,
            function(err, id){
                if (!err) {
                    Router.go('join', {_id: id, _token: token});
                }
            }
        );
    }
});
