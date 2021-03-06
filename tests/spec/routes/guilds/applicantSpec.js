'use strict';

var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
mockgoose(mongoose);

var applicant = require('../../../../server/routes/guilds/applicant');
var Guild = require('../../../../server/models/guild');
var User = require('../../../../server/models/user');

describe('routes/guilds/applicant', function() {

	var userId, ownerId, guild;

	beforeEach(function(done) {
		userId = mongoose.Types.ObjectId();
		ownerId = mongoose.Types.ObjectId();
		Guild.create({_id: 'racers'}, function(err, _guild_) {
			guild = _guild_;
			User.create({_id: userId, name: 'aaaa', site: 'j', group: 'u', siteUserId: '123'}, function(err2) {
				done(err || err2);
			});
		});
	});

	afterEach(function() {
		mockgoose.reset();
	});

	//////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////

	describe('put', function() {

		it('should put applicant', function(done) {
			var req = {
				session: {
					_id: userId
				},
				params: {
					guildId: 'racer',
					userId: userId
				},
				guild: guild
			};
			applicant.put(req, {apiOut: function(err, res) {
				expect(res._id).toEqual(userId);
				expect(guild.applicants[0]._id).toEqual(userId);
				done(err);
			}});
		});
	});


	//////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////

	describe('post', function() {

		it('should accept an applicant', function(done) {
			var req = {
				params: {
					guildId: 'racer',
					userId: userId
				},
				query: {
					action: 'accept'
				},
				guild: guild
			};
			applicant.post(req, {apiOut: function(err, res) {
				expect(res).toEqual(null);
				done(err);
			}});
		});
	});


	//////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////

	describe('get', function() {

		var guild;

		beforeEach(function(done) {
			Guild.create({_id: 'cats', applicants: [{_id: userId, name: 'aaaa', site: 'j', group: 'u'}]}, function(err, _guild_) {
				guild = _guild_;
				done(err);
			});
		});

		afterEach(function() {
		});

		it('should return a user if they exist', function(done) {
			var req = {
				params: {
					guildId: 'cats',
					userId: userId
				},
				guild: guild
			};
			applicant.get(req, {apiOut: function(err, res) {
				expect(res._id).toEqual(userId);
				done(err);
			}});
		});
	});


	////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////

	describe('del', function() {

		beforeEach(function(done) {
			Guild.create({_id: 'cats', applicants: [{_id: userId, name: 'aaaa', site: 'j', group: 'u'}]}, function(err, _guild_) {
				guild = _guild_;
				done(err);
			});
		});

		afterEach(function() {
		});

		it('should delete an applicant if they exist', function(done) {
			var req = {
				params: {
					guildId: 'cats',
					userId: userId
				},
				guild: guild
			};
			applicant.del(req, {status: function(code) {
				expect(code).toEqual(204);
				return {send: function(msg) {
					expect(msg).toBeFalsy();
					expect(guild.applicants.length).toBe(0);
					done();
				}};
			}});
		});
	});
});