'use strict';
module.exports = {
	get: function(req, res) {
		res.apiOut(null, {'alive': 33});
	}
};
