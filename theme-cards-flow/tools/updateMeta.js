const fs = require('fs');
const path = require('path');
const exiftool = require('node-exiftool')
const ep = new exiftool.ExiftoolProcess()

/**
 * helper file exists
 * @param {string} file 
 */
function fileExists(file) {
    try {
        const stat = fs.lstatSync(file);
        return stat.isFile();
    } catch (err) {
        return false;
    }
}
/**
 * Update the meta data from the json file
 * @param {string} file 
 * @param {string} metafile 
 */
function updateMeta(file, metafile) {
    var metadata = JSON.parse(fs.readFileSync(metafile));
    return ep
        .open()
        .then(() => ep.writeMetadata(file, metadata, ['overwrite_original', 'charset filename=utf8', 'codedcharacterset=utf8']))
        .catch((err) => {
            console.error(err)
        })
        .then(() => ep.close())
        .then(() => console.log('Updated Foto: ' + file))
}

/**
 * Check all Meta data for all fotos
 * @param {string} dir 
 * @param {string} pattern 
 */
var checkMetaData = function(dir, pattern) {
    var results = [];
    fs.readdirSync(dir).forEach(function(dirInner) {
        dirInner = path.resolve(dir, dirInner);
        var stat = fs.statSync(dirInner);
        if (stat.isDirectory()) {
            results = results.concat(checkMetaData(dirInner, pattern));
        }
        if (stat.isFile() && dirInner.endsWith(pattern)) {
            var f = dirInner.replace(pattern, ".json");
            if (fileExists(f)) {
                updateMeta(dirInner, f)
            }
            results.push(dirInner);
        }
    });
    return results;
};

var files = checkMetaData('../../tmp2', '.jpg');
// console.log(files);