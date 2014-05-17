UI.registerHelper("debug", function(optionalValue) { 
  console.log("========================================");
  console.log("Current Context");
  console.log("====================");
  console.log(this);

  if (optionalValue) {
    console.log("Value"); 
    console.log("===================="); 
    console.log(optionalValue); 
  } 
  console.log("");
});

UI.registerHelper("user", function(userId) {
    var user = Meteor.users.findOne(userId);
    if (user) {
        return user.emails[0].address;
    }
});

UI.registerHelper("isSuperuser", function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId);
    if (Meteor.user() && brainSession) {
        return _.contains(brainSession.superusers, Meteor.userId());
    }
});

UI.registerHelper("absoluteUrl", function() {
    return Meteor.absoluteUrl().slice(0, - 1);;
});

UI.registerHelper('getBrainSessionPath', function(id) {
    return Router.path('brainSession', {
        _id: id
    });
});

UI.registerHelper("currentUserEmail", function() {
    return Meteor.user().emails[0].address;
});

UI.registerHelper("convertMinutesToSeconds", function(mins) {
    return mins*60;
});

UI.registerHelper("emailHelper", function(user) {
	if (user.emails) return user.emails[0].address;
});

UI.registerHelper("inc", function(int) {
    return ++int;
});

UI.registerHelper("nlToBreak", function(str) {
    return str.replace(/\n/g, '<br />');;
});

UI.registerHelper("formatDate", function(timestamp, format) {
    return moment(timestamp * 1000).format(format);
});

UI.registerHelper("formatDuration", function(secondsTotal) {
    return formatDuration(secondsTotal);
});

UI.registerHelper("_eq", function(arg1, arg2) {
	return arg1 == arg2;
});

UI.registerHelper("_eqq", function(arg1, arg2) {
	return arg1 === arg2;
});

UI.registerHelper("_neq", function(arg1, arg2) {
	return arg1 != arg2;
});

UI.registerHelper("_gt", function(arg1, arg2) {
	return arg1 > arg2;
});

UI.registerHelper("_lt", function(arg1, arg2) {
	return arg1 < arg2;
});

UI.registerHelper("_gte", function(arg1, arg2) {
	return arg1 >= arg2;
});

UI.registerHelper("_lte", function(arg1, arg2) {
	return arg1 <= arg2;
});

UI.registerHelper("_neqq", function(arg1, arg2) {
	return arg1 !== arg2;
});

UI.registerHelper("_or", function(arg1, arg2) {
	return arg1 || arg2;
});

UI.registerHelper("_and", function(arg1, arg2) {
	return arg1 && arg2;
});

UI.registerHelper("_inArray", function(arr, val) {
    if (arr && val) {
        return arr.indexOf(val) >= 0;
    }
});

UI.registerHelper("_len", function(arr) {
    return arr.length;
});

UI.registerHelper("_lenLte", function(arr, len) {
    return arr && (arr.length <= len);
});

UI.registerHelper("_lenGte", function(arr, len) {
    return arr && (arr.length >= len);
});

UI.registerHelper("getPropertyValue", function(obj, property) {
    if(obj && property in obj){
        return obj[property];
    }
});