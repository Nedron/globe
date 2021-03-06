'use strict';

var Apprentice = require('../models/apprentice');
var groups = require('../config/groups');

module.exports = {


	put: function(req, res) {

		Apprentice.count({keeper: req.session._id}, function(err, count) {
			if(err) {
				return res.apiOut(err);
			}
			if(count >= 1) {
				return res.apiOut('Moderators can have at most 1 apprentice');
			}

			req.user.group = groups.APPRENTICE;
			return req.user.save(function(err) {
				if(err) {
					return res.apiOut(err);
				}

				return Apprentice.create({keeper: req.session._id, apprentice: req.user._id}, function(err) {
					res.apiOut(err, req.user.publicData());
				});
			});
		});
	},


	get: function(req, res) {
		return res.apiOut(null, req.user.publicData());
	},


	del: function(req, res) {
		req.user.group = groups.USER;

		return req.user.save(function(err) {
			if(err) {
				return res.apiOut(err);
			}

			return Apprentice.remove({apprentice: req.user._id}, function(err) {
				if(err) {
					return res.apiOut(err);
				}

				res.send(204, null);
			});
		});
	}
};