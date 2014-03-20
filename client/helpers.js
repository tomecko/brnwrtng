Handlebars.registerHelper("debug", function(optionalValue) { 
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

Handlebars.registerHelper("user", function(userId) {
    var user = Meteor.users.findOne(userId);
    if (user) {
        return user.emails[0].address;
    }
});

Handlebars.registerHelper("isSuperuser", function() {
    var brainSessionId = Router.current().params._id,
        brainSession = BrainSessions.findOne(brainSessionId);
    if (Meteor.user() && brainSession) {
        return _.contains(brainSession.superusers, Meteor.userId());
    }
});

Handlebars.registerHelper("inc", function(int) {
    return ++int;
});

Handlebars.registerHelper("formatDate", function(timestamp, format) {
    return moment(timestamp * 1000).format(format);
});

Handlebars.registerHelper("formatDuration", function(secondsTotal) {
    return formatDuration(secondsTotal);
});

Handlebars.registerHelper("_eq", function(arg1, arg2) {
	return arg1 == arg2;
});

Handlebars.registerHelper("_eqq", function(arg1, arg2) {
	return arg1 === arg2;
});

Handlebars.registerHelper("_neq", function(arg1, arg2) {
	return arg1 != arg2;
});

Handlebars.registerHelper("_gt", function(arg1, arg2) {
	return arg1 > arg2;
});

Handlebars.registerHelper("_lt", function(arg1, arg2) {
	return arg1 < arg2;
});

Handlebars.registerHelper("_gte", function(arg1, arg2) {
	return arg1 >= arg2;
});

Handlebars.registerHelper("_lte", function(arg1, arg2) {
	return arg1 <= arg2;
});

Handlebars.registerHelper("_neqq", function(arg1, arg2) {
	return arg1 !== arg2;
});

Handlebars.registerHelper("_or", function(arg1, arg2) {
	return arg1 || arg2;
});

Handlebars.registerHelper("_and", function(arg1, arg2) {
	return arg1 && arg2;
});

Handlebars.registerHelper("_inArray", function(arr, val) {
    if (arr && val) {
        return arr.indexOf(val) >= 0;
    }
});

Handlebars.registerHelper("_len", function(arr) {
    return arr.length;
});

Handlebars.registerHelper("_lenLte", function(arr, len) {
    return arr && (arr.length <= len);
});

Handlebars.registerHelper("_lenGte", function(arr, len) {
    return arr && (arr.length >= len);
});

Handlebars.registerHelper("getPropertyValue", function(obj, property) {
    if(obj && property in obj){
        return obj[property];
    }
});