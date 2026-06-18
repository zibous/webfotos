# @thumbsup/theme-card-flow

[![NPM](https://img.shields.io/npm/v/@thumbsup/theme-flow.svg?style=flat)](https://www.npmjs.com/package/@thumbsup/theme-flow)
[![Travis CI](https://travis-ci.org/thumbsup/theme-flow.svg?branch=master)](https://travis-ci.org/thumbsup/theme-flow)


##PHOTO META DATA

**see fotoMeta.js**: used with mediaitem to add the data section

![Lightgallery Metadata view](../../docs/photo_metadata.png)

###Requirement

####1. Theme
Currently this plugin will only work with the theme "theme-card-flow". 

####2. Modify the Thumbsup metadata.js
This change is necessary because in the default case only the EXIF data is available. 
With this modification, all data of the photo will be delivered and can be processed.

```javascript
  ...
  class Metadata {
  constructor(exiftool, picasa, opts) {
      // standardise metadata
      this.date = getDate(exiftool)
      this.caption = caption(exiftool)
      this.keywords = keywords(exiftool, picasa)
      this.video = video(exiftool)
      this.animated = animated(exiftool)
      this.rating = rating(exiftool)
      this.favourite = favourite(picasa)
      const size = dimensions(exiftool)
      this.width = size.width
      this.height = size.height
      this.exif = opts ? (opts.embedExif ? exiftool.EXIF : undefined) : undefined
      
      ////////////////////////////////////////////////////////
      this.all = exiftool // <--- Add this to get all metadata
      ////////////////////////////////////////////////////////

          // metadata could also include fields like
          //  - lat = 51.5
          //  - long = 0.12
          //  - country = "England"
          //  - city = "London"
          //  - aperture = 1.8
  }
  ...
}
```

####3. Themes settings
see below (Copy Metadata.json, Copy / Create Metadata.json)

**album.hbs** 
To use the metadata layer, add the css and javascript files to the main template.

```javascript
    <head>
        .....    
        ## all css files
        <link rel="stylesheet prefetch"  href="{{relative 'public/lightgallery/css/lg-exif.min.css'}}" /> 
        .....
    </head>
    <body>
        ...
        /* 
           Settings for lightGallery 
        */
        $("#media").lightGallery({
           controls: true,
           loop : true,
           download: false,
           counter: false,
           videojs: true,
           videoMaxWidth: "2000px",
           /*set the title for the meta data view*/
           metatitle: "Foto Information",
           mapheadline: "Aufnahmeort",
           /*
              translate default meta from data section
              attributename, label || grouplabel  
           */
           metakeys: { 'filename': 'Dateiname', 
                       'sub-html':'Beschreibung',
                       'datetimeoriginal':'Aufnahme Datum',                         
                       'make':'Kamera',
                       'model':'Kamera',
                       'city':'Stadt',                         
                       'gpslongitude':'Längengrad',
                       'gpslongituderef':'Längengrad',
                       'gpslatitude':'Breitengrad',
                       'gpslatituderef':'Breitengrad',
                       'shutterspeedvalue':'Verschlusszeit',
                       'isospeedratings':'Kamera Einstellung',                         
                       'iso':'Kamera Einstellung',
                       'focallength':'Kamera Einstellung',                        
                       'exposuretime':'Kamera Einstellung',
                       'fnumber':'Kamera Einstellung' },
           exThumbImage: 'data-exthumbimage'
        });
        
        ## all javascripts
        ....
        <script src="{{relative 'public/lightgallery/js/lg-metadata.js'}}"></script>
    </body>    
```

---

#How to create the metadata for the lightgallery metadata view

![Lightgallery Metadata view](../../docs/photometadata_script.png)

**1. Default**
If no --theme-settings are used the metadataview shows all form the "data-*" attributes.

```json
config.json
	{
	    "input": "PATH TO OUTPUT",
	    "output": "./fotobuch",
	    "title": "Fotobuch AUTOR",
	    "include-raw-photos": false,
	    "photo-quality": 90,
	    "thumb-size": 360,
	    "large-size": 1200,
	    "embed-exif": true,
	    "sort-albums-by": "title",
	    "sort-albums-direction": "desc",
	    "theme-path": "PROJECTFOLDER/theme-cards-flow/theme",
	    "theme-settings": "PATH TO PROPERTYFILE.json"
	    "cleanup": true
	}
```

**Optional define metadata attributes**
```json
theme-settings.json
   {
       "metadatatitle": "Details",
       "metadata": [
            "DateTimeOriginal",
            "Artist",
            "Model",
            "Make",
            "FileSource",
            "FNumber",
            "ExposureTime",
            "ISO",
            "FocalLength",
            "GPSLatitude",
            "GPSLatitudeRef",
            "GPSLongitude",
            "GPSLongitudeRef"
        ],     
    ...
   } 
```
---

**2. Copy Metadata.json files from the photo album folder**
If  "**--theme-settings**" are used and the settings holds a  "**copyMetaFiles**" section,
all metafile.json files will be copied to the media folder. For this case the
photo metafile.json will be used to render the metaview data. Optional all additional 
"data-*" attributes will be rendered too.

You can create the metadata.json files with "exiftools" and a simple bash script.
[see](../../tools/README.md) tools/saveMetadata.sh


```json
## config.json
   {
       ....
       ## use the theme-settings 
       "theme-settings": "PATH TO THEME-SETTINGS.JSON",
       ...
   }

## theme-settings.json
   {
       ....
       "copyMetaFiles": {
           "source": "PATH TO PHOTOS FOLDER",
           "target": "PATH TO MEDIAFOLDER/media/large/"
       },
       ...
   }
```
---

**3. Copy / Create Metadata.json data from the photo album folder**
If both "**copyMetaFiles**" and "**writeMetaData**" are set, then it is first checked whether metadaten.json exists in the album. 
If this is the case, then this is copied - otherwise, the metadata will be read from the photo and saved as metdata.json in the defined destination folder.

```json
## config.json
   {
        ....
        ## use the theme-settings 
        "theme-settings": "PATH TO THEME-SETTINGS.JSON",
        ...
   }

## Metadata as data-attributes 
###theme-settings.json 
{
    ....
    
    ## copy metadata.json
    "copyMetaFiles": {
        "source": "./photos/",
        "target": "./fotobuch/media/large/"
    },

    ## OR Create metadata.json
    "writeMetaData": {
        "target": "./fotobuch/media/large/",
        "linkpath": "media/large/",
        "metatags": {
            "Allgemein": {
                "Dateiname": "File.Filename",
                "Album": "File.Directory",
                "Beschreibung": "Image.Description",
                "Fotograf": "Author.Artist"
            },
            "Foto": {
                "Fotoapperat": "EXIF.Model",
                "Marke": "EXIF.Make",
                "Bildgröße": "Composite.ImageSize",
                "Auflösung": "Composite.Megapixels",
                "Blende": "Composite.ShutterSpeed",
                "Belichtung": "Composite.LightValue",
                "ISO": "EXIF.ISO",
                "Focus": "EXIF.FocalLength",
                "Belichtungsdauer": "EXIF.ExposureTime"
            },
            "Geografie": {
                "Datum/Uhrzeit": "Composite.GPSDateTime",
                "GPSLatitude": "Composite.GPSLatitude",
                "GPSLongitude": "Composite.GPSLongitude",
                "Höhe": "Composite.GPSAltitude",
                "Land": "Composite.Country",
                "Stadt": "Composite.City"

            }
        }
    }
}
```

---
# Information for helpers
---
**cover.js***: checks home or album / galllery cover 
**foldertree.js**: experimental - build navigation tree
**showdata.js**: develop debugger for templating
