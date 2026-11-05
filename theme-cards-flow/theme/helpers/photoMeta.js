/*
 *  get the meta data for a foto
 *  @call: photoMeta meta
 */
"use strict"

const path = require('path')
const fs = require('fs-extra')

var vars = {
    "attr": {},
    "metafileName": null,
    "debug": false
}

module.exports = (meta, config) => {

    vars = {
        "attr": {},
        "metafileName": null
    }

    if (meta) {

        // defined css class
        vars.attr['class'] = 'albumList'

        if (!isEmpty(meta.caption)) {
            // add this for the lightgallery
            checkMeta('data-sub-html', meta.caption.trim())
        }

        // 1st check if we have a metafile  
        if (meta.all && meta.all.SourceFile && config.copyMetaFiles && config.copyMetaFiles.source) {
            vars.metafileName = copyMetaFiles(meta, config)
            if (vars.metafileName != null) {
                vars.attr['data-metafile'] = vars.metafileName
            }
        }

        // 2nd check if we have a to create the metadata file 
        if (vars.metafileName == null && config.writeMetaData && config.writeMetaData.target) {
            if (config.writeMetaData && config.writeMetaData.target) {
                vars.metafileName = writeMetadata(meta.all, config)
                if (vars.metafileName != null) {
                    vars.attr['data-metafile'] = vars.metafileName
                }
            }
        }

        //3rd add the data attributes to the photo element
        getPhotodata(meta, config)

    }
    return (Object.keys(vars.attr).map(key => key + '="' + vars.attr[key]).join('" ')) + '" '
}

/**
 * build the data attributes for the current photo
 * currently only the data from exif !!
 * @param {*} meta 
 */
function getPhotodata(meta, config) {
    var d = meta.exif,
        keydata = [];
    if (vars.metafileName == null && d) {
        if (config && config.metadata) {
            keydata = config.metadata;
        } else {
            // fallback if no metadata keys found
            keydata = [
                "DateTimeOriginal", // Original-Datum / -Uhrzeit
                "Model", // Kamerabezeichnung
                "Make", // Kameraherstellers
                "FNumber", // Blendenzahl f/2.8
                "ExposureTime", // Belichtungszeit 1/80 sec.
                "ISO", // ISO Wert
                "FocalLength", // Brennweite         
                "GPSLatitude", // GPS-Breite
                "GPSLatitudeRef", // GPS-Breiten Referenz    
                "GPSLongitude", // GPS-Länge
                "GPSLongitudeRef" // GPS-Längen Referenz    
            ]
        }
        checkMeta('data-metasection', config.metadatatitle || "Details")
        for (const key of keydata) {
            checkMeta('data-' + key, d[key])
        }
    }
}

/**
 * check and add meta data attribute
 * @param {*} name 
 * @param {*} v 
 */
function checkMeta(name, v) {
    var metaval = isEmpty(v) == false ? v : null
    if (metaval) vars.attr[name] = metaval
}

/**
 * deploy the json metafile to the output folder
 * 
 * if there is a meta.json file in the photo directory, 
 * then this will be deployed
 * 
 * @param {*} meta 
 * @param {*} config 
 */
function copyMetaFiles(meta, config) {
    const filename = meta.all.SourceFile.replace(".", "-") + ".json"
    const sourceFile = config.copyMetaFiles.source + filename
    const targetFile = config.copyMetaFiles.target + filename
    try {
        fs.copySync(sourceFile, targetFile)
    } catch (e) {
        // console.error("    ✕︎ " + "Cannot write file ", filename)
        return null
    }
    if (vars.debug)
        console.log('    ✔︎ copyMetaFiles:', sourceFile)
    return 'media/large/' + filename

}

function isEmpty(val) {
    return (val === null || val === "" || typeof val === "undefined");
}

/**
 * helper method to parse the settings properties
 * for the metadata
 * @param {*} obj 
 * @param {*} parse 
 */
function parseObjectProperties(obj, parse) {
    for (var k in obj) {
        if (typeof obj[k] === 'object' && obj[k] !== null) {
            parse({ "label": k, deep: 0 })
            parseObjectProperties(obj[k], parse)
        } else if (obj.hasOwnProperty(k)) {
            parse({ "label": k, "field": obj[k], deep: 1 })
        }
    }
}

/**
 * get all metadata fields for the json file, mapped
 * with the settings meta fields.
 *
 * Optional if no meta fields are defined, all meta data
 * will be returned
 * 
 * @param {*} data 
 * @param {*} fields 
 */
function mapMetaData(data, fields) {

    var d = {},
        section = null,
        f = []

    // first check if we can find metatags 
    if (fields && fields.metatags) {
        parseObjectProperties(fields.metatags, function(prop) {
            try {
                if (prop.deep === 0) {
                    section = prop.label
                    d[section] = {}
                }
                if (prop.deep === 1) {
                    f = prop.field.split('.')
                    d[section][prop.label] = data[f[0]][f[1]]
                }
            } catch (e) {}
        })
        if (d) {
            return JSON.stringify(new Array(d))
        }
        return null;
    }
    // all metadata, because we have no settings
    return JSON.stringify(data)
}

/**
 * write the metda data to the file
 * Creates the defined metadata from the meta.all data and 
 * copies it into the defined folder
 * 
 * @see: theme-settings.json file
 * @param {*} data 
 */
function writeMetadata(data, config) {
    const filename = config.writeMetaData.target + data.SourceFile.replace('.', '_') + '.json'
    const webfile = config.writeMetaData.linkpath + filename.split(config.writeMetaData.linkpath)[1]
    try {
        var content = mapMetaData(data, config.writeMetaData)
        if (content) {
            fs.mkdirsSync(path.dirname(filename))
            fs.writeFileSync(filename, content)
        }
    } catch (e) {
        console.error("    ✕︎ " + "Cannot write file ", filename)
        return null
    }
    if (vars.debug)
        console.log('    ✔︎ writeMetadata:', webfile)
    return webfile
}