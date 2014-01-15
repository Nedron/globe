/**
 * Create a session for a user based on their login status with other sites
 * Returns a token that can be used to continue this session for future requests
 */

(function() {
	'use strict';

	var session = require('../../fns/redisSession');
	var sites = require('../../fns/sites');
	var User = require('../../models/user');

	var facebook = require('auth/facebook');
	var guest = require('auth/guest');
	var jigg = require('auth/jigg');
	var kong = require('auth/kong');


	/**
	 * Find the auth service for a particular site
	 * @param {string} site
	 * @returns {*}
	 */
	var siteToAuth = function(site) {
		var auth;

		if(site === sites.GUEST) {
			auth = guest;
		}
		if(site === sites.JIGGMIN) {
			auth = jigg;
		}
		if(site === sites.FACEBOOK) {
			auth = facebook;
		}
		if(site === sites.KONGREGATE) {
			auth = kong;
		}

		return auth;
	};


	/**
	 * Create a session
	 * @param req
	 * @param res
	 * @returns {*}
	 */
	module.exports = function(req, res) {

		// find the right authenticator
		var auth = siteToAuth(req.body.site);
		if(!auth) {
			return res.apiOut('site not found');
		}

		// use a remote service to verify user information
		auth.authenticate(req.body, function(err, verified) {
			if(err) {
				return res.apiOut(err);
			}

			// save verified data to the database
			User.findByIdAndSave(verified, function(err, user) {
				if(err) {
					return res.apiOut(err);
				}

				// create a session for this user
				session.make(user._id, _.pick(user, 'name', 'site', 'group', 'bannedUntil', 'silencedUntil', 'guildId'), function(err, response, token) {
					if(err) {
						return res.apiOut(err);
					}

					// give the user a token that can be used to access the data in the session
					res.apiOut(null, {token: token});
				});
			});
		});
	};
}());