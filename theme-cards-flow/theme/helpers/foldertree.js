/*
 *  get the navigation menu for the current gallery
 */

"use strict";

var results = [];

/**
 *  @call foldertree album 'navi.json'
 *        foldertree album settings.navigation
 */
module.exports = (jsonObj, filename) => {
    const fs = require('fs');
    // console.log(jsonObj)
    albumdata(jsonObj.albums);
    if (results && results.length) {
        var jsonContent = JSON.stringify(results, null, 4);
        fs.writeFile(filename, jsonContent, 'utf8', function(err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File " + filename);
                return console.log(err);
            }
        });
    }
}

/**
 * get all album data
 * @param {*} data 
 */
function albumdata(data) {
    data.forEach(function(obj) {
        var d = {};
        d.title = obj.title;
        d.basename = obj.basename;
        d.url = obj.url;
        d.image = obj.files[0].output.thumbnail.path;
        d.summary = obj.summary;
        d.depth = obj.depth;
        results.push(d);
        if (obj.albums && obj.albums.length > 0) {
            albumdata(obj.albums);
        }
    })
}