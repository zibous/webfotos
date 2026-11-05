/**
 * Creates the map gps data for all gallery albums.
 * 
 * Get all _cover.jpg Photos and read the GPS and
 * all data for the map marker.
 * 
 * @uses thumsup.sqlite database
 * 
 */
const Database = require('better-sqlite3'),
    path = require('path'),
    fs = require('fs-extra'),
    // Im Docker-Container: DB unter /output, Ausgabe nach /output/photomap/
    outputDir = process.env.OUTPUT_DIR || '/output',
    settings = {
        "database": path.join(outputDir, 'thumbsup.db'),
        "sql": "select * from files where metadata like '%GPSLatitude%' order by path",
        "options": {},
        "autor": "Peter Siebler",
        "version": "1.0.0",
        "start": new Date(),
        "file": path.join(outputDir, 'photomap', 'photomap.json'),
        "web": {
            "images": "../media/small/",
            "baseurl": ""
        }
    },
    db = new Database(settings.database, settings.options),
    stmt = db.prepare(settings.sql)

var gpsData = {
    "rows": [],
    "time": "",
    "fields": {
        "lat": {
            "type": "number",
            "pgtype": "float8"
        },
        "lng": {
            "type": "number",
            "pgtype": "float8"
        },
        "thumbnail": {
            "type": "string",
            "pgtype": "text"
        },
        "url": {
            "type": "string",
            "pgtype": "text"
        },
        "video": {
            "type": "string",
            "pgtype": "text"
        },
        "caption": {
            "type": "string",
            "pgtype": "text"
        }
    },
    "total_rows": 0,
    "autor": settings.autor,
    "version": settings.version
};

/**
 * simple slug url
 * @param {*} url 
 */
function getPageUrl(url) {
    return url.toString()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * add gps data record 
 * @param {*} d 
 */
function addGPSData(d) {
    if (d.EXIF && d.EXIF.GPSLatitude && d.EXIF.GPSLongitude) {
        var album = d.File.Directory;
        // Pro Album nur einen Marker (das erste Bild mit GPS)
        if (albumsSeen.has(album)) return;
        albumsSeen.add(album);

        var item = {};
        item.lat = d.EXIF.GPSLatitude * ((d.EXIF.GPSLatitudeRef === "S" || d.EXIF.GPSLatitudeRef === "South") ? -1 : 1);
        item.lng = d.EXIF.GPSLongitude * ((d.EXIF.GPSLongitudeRef === "W" || d.EXIF.GPSLongitudeRef === "West") ? -1 : 1);
        item.thumbnail = "'" + settings.web.images + d.SourceFile + "'";
        item.url = settings.web.images + d.SourceFile;
        item.link = "../" + getPageUrl(settings.web.baseurl + album + ".html")
        item.video = false
        item.album = album
        item.caption = d.EXIF.caption || ''
        item.description = d.EXIF.ImageDescription || ''
        gpsData.rows.push(item)
        gpsData.total_rows++;
        console.log('  - ', album)
    }
}

var albumsSeen = new Set();

/**
 *  get the data rows for the gps data
 */
function getGPSData() {
    console.log('✔︎ Start generate ', settings.file)
    for (const fotos of stmt.iterate()) {
        const d = JSON.parse(fotos.metadata)
        addGPSData(d)
    }
    if (gpsData.total_rows) {
        var content = JSON.stringify(gpsData)
        gpsData.time = (new Date() - settings.start) / 1000;
        fs.mkdirsSync(path.dirname(settings.file))
        fs.writeFileSync(settings.file, content)
        console.log('✔︎ End generate ', gpsData.time, "sec,", gpsData.total_rows, "albums, File", settings.file)
    } else {
        console.log('✕ Keine GPS-Daten gefunden')
    }
}

getGPSData()