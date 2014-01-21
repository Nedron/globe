'use strict';

var isName = require('../../validators/isName');
var isSite = require('../../validators/isSite');
var isGroup = require('../../validators/isGroup');

var NameDisplayDoc = {
	name: {
		type: String,
		validate: isName,
		required: true
	},
	site: {
		type: String,
		validate: isSite,
		required: true
	},
	group: {
		type: String,
		validate: isGroup,
		required: true
	}
};

module.exports = NameDisplayDoc;