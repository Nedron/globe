'use strict';

var request = require('request');
var gm = require('gm').subClass({
    imageMagick: true
});
var User = require('../models/user');

var avatars = {};


var sendImg = function(img, res) {
    res.writeHead(200, {
        'Cache-Control': 'public,max-age=86400',
        'Content-Type': 'image/gif'
    });
    return res.end(img, 'binary');
};


/**
 * Load a user's avatar url from mongo, retrieve the image, resize it, and return it
 * @param req
 * @param res
 */
avatars.get = function (req, res) {

    var values = avatars.parseValues(req.params.filename);

    User.findById(values.userId, {
        avatar: true
    }, function (err, user) {
        if (err) {
            return res.apiOut(err);
        }
        if (!user) {
            return res.apiOut('user not found');
        }

        var avatar = user.avatar || 'https://cdn.discordapp.com/attachments/228714350062469120/666144866257862656/5e1bb72d363956f91d747257-48x48.gif';
        
        
        // --> let facebook do the resizing
        if(avatar.indexOf('graph.facebook.com') !== -1) {
            request.get(avatar + '?width=' + values.width + '&height=' + values.height, {encoding: null}, function(err, response, body) {
                if(err) {
                    return res.apiOut(err);
                }
                
                sendImg(body, res);
            });
        }

        
        // --> we do the resizing
        else {
            return gm(avatar).toBuffer(function (err, buffer) {
                if (err) {
                    return res.apiOut(err);
                }

                return avatars.resizeImage(buffer, values.width, values.height, function (err, buffer) {
                    if (err) {
                        return res.apiOut(err);
                    }

                    sendImg(buffer, res);
                });
            });
        }
    });
};


/**
 * Convert userId-50x60.gif to {userId: userId, width:50, height: 60}
 * @param {string} filename
 */
avatars.parseValues = function (filename) {
    var dash = filename.indexOf('-');
    var x = filename.indexOf('x');
    var dot = filename.indexOf('.');

    if (dash === -1 || x === -1 || dot === -1) {
        return {
            userId: filename,
            width: 12,
            height: 12
        };
    }

    return {
        userId: filename.substring(0, dash),
        width: Number(filename.substring(dash + 1, x)),
        height: Number(filename.substring(x + 1, dot))
    };
};


/**
 * Crop and resize an image to try to get it to a particular size
 * Will not scale an image up
 * @param buffer
 * @param targetWidth
 * @param targetHeight
 * @param callback
 */
avatars.resizeImage = function (buffer, targetWidth, targetHeight, callback) {
    gm(buffer).size(function (err, size) {
        if (err) {
            return callback(err);
        }

        var xRatio = targetWidth / size.width;
        var yRatio = targetHeight / size.height;
        var ratio = Math.min(1, Math.max(xRatio, yRatio));
        var resizeWidth = Math.ceil(size.width * ratio);
        var resizeHeight = Math.ceil(size.height * ratio);
        var cropX = Math.max(0, Math.round((resizeWidth - targetWidth) / 2));
        var cropY = Math.max(0, Math.round((resizeHeight - targetHeight) / 2));
        var finalWidth = Math.min(size.width, targetWidth);
        var finalHeight = Math.min(size.height, targetHeight);

        return gm(buffer)
            .resize(resizeWidth, resizeHeight)
            .crop(finalWidth, finalHeight, cropX, cropY)
            .repage(finalWidth, finalHeight, 0, 0)
            .toBuffer(callback);
    });
};


module.exports = avatars;