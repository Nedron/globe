'use strict';

module.exports = function(globe) {

	require('./guildRoutes')(globe);

	var groups = require('./config/groups');

	// endpoints
	var avatars = require('./routes/avatars');
	var bans = require('./routes/bans');
	var friends = require('./routes/friends');
	var messages = require('./routes/messages');
	var reports = require('./routes/messages');
	var tests = require('./routes/tests');
	var tokens = require('./routes/tokens');
	var users = require('./routes/users');
	var moderator = require('./routes/moderator');
	var moderators = require('./routes/moderators');
	var apprentice = require('./routes/apprentice');
	var apprentices = require('./routes/apprentices');

	// middleware
	var checkAdmin = require('./middleware/checkAdmin');
	var checkMod = require('./middleware/checkMod');
	var checkLogin = require('./middleware/checkLogin');
	var rateLimit = require('./middleware/rateLimit');
	var continueSession = require('./middleware/continueSession');
	var loadUser = require('./middleware/loadUser');

	// routes
	globe.get('/avatars/:filename', avatars.get);

	globe.get('/bans', bans.get);
	globe.post('/bans', continueSession, checkMod, rateLimit('post:bans'), bans.post);

	globe.get('/friends', continueSession, friends.get);
	globe.post('/friends', continueSession, friends.post);

	globe.get('/messages', continueSession, messages.get);
	globe.post('/messages', continueSession, rateLimit('post:messages'), messages.post);

	globe.get('/reports', continueSession, checkMod, reports.get);
	globe.post('/reports', continueSession, checkLogin, rateLimit('post:reports'), reports.post);

	globe.get('/tests', tests.get);

	globe.get('/tokens', rateLimit('get:tokens'), tokens.get);
	globe.del('/tokens', tokens.del);

	globe.get('/users', users.get);

	globe.get('/moderators', moderators.get);
	globe.get('/moderators/:userId', loadUser(groups.MOD), moderator.get);
	globe.put('/moderators/:userId', continueSession, checkAdmin, rateLimit('put:moderator'), loadUser(groups.APPRENTICE), moderator.put);
	globe.del('/moderators/:userId', continueSession, checkAdmin, loadUser(groups.MOD), moderator.del);

	globe.get('/apprentices', apprentices.get);
	globe.get('/apprentices/:userId', loadUser(groups.APPRENTICE), apprentice.get);
	globe.put('/apprentices/:userId', continueSession, checkMod, rateLimit('put:apprentice'), loadUser(groups.USER), apprentice.put);
	globe.del('/apprentices/:userId', continueSession, checkMod, loadUser(groups.APPRENTICE), apprentice.del);
};