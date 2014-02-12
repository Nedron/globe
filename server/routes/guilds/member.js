'use strict';

var Guild = require('../../models/guild');

module.exports = {


	get: function(req, res) {
		var member = req.guild.getMember(req.params.userId);
		if(!member) {
			return res.status(404).send('Member not found');
		}

		return res.apiOut(null, member);
	},


	put: function(req, res) {
		if(req.guild.join !== Guild.OPEN) {
			return res.apiOut('This guild is not accepting open joins');
		}

		return req.guild.addMember(req.params.userId, function(err) {
			return res.apiOut(err, req.guild.getMember(req.params.userId));
		});
	}

};