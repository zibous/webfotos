/*
 *  check the type for the cover
 *  cover album
 */
"use strict";
module.exports = album => {
    return (album.title == 'Home' && album.files.length == 0);
}