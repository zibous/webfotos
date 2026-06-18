"use strict";
module.exports = (config, text) => {
    /*
     see config.json
     ...
     "translate": {
        "photos": "Fotos",
        "photo": "Foto",
        "albums": "Alben",
        "album": "FoAlbumto",
        "videos": "Filme",
        "video": "Film"
    }
    ...
    <div class="summary">{{translate @root.settings summary}}</div>
    ...
    */
    try {
        Object.entries(config.translate).forEach(([key, value]) => {
            text = text.replace(key, value)
        });
    } catch (e) {}
    return text
}