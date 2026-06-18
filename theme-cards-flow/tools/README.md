

#TOOLS

##FILES
GPSLocation.html, Testcase to render photo locations

saveCover.sh, set cover meta tags
saveGPSData.sh, creates a GPS data list from the selected directory
saveMetadata.sh, extracts all metadata form the selected fotos and save this to a json file
setDate.sh, sample script to update all dates for the selected fotos
updateMetadata.sh, updates the metadata for photos

---



## Folder Date

**Date Format Key:**
YYYY — The year (the first two digits/century can be omitted).
MM — The month of the year, from 1 to 12.
DD — The day of the month, from 1 to 31.
hh — The hour of the day, from 0 to 23.
mm — The number indicating minutes, from 0 to 59.



```bash
> touch -mt 202003130000 /Users/petsie1612/ips_apps/webfotos/photos/2020\ Thailand/Koh\ Phangan
```



### Archiv Fotobuch

MacOS X is Unix so this should work (this work on GNU/Linux)

```bash
## To create a tar.gz archive from a given folder you can use the following command
> tar -zcvf media.tar.gz media

## extract your archiv:
> tar -zxvf media.tar.gz
```



##UPDATE EXIF META DATA

Exiftool is an amazing tool written by Phil Harvey in Perl which can read and write metadata to a number of file formats. It is very powerful and allows to do such things as extracting orientation from JPEG files uploaded to your server by users to rotate generated previews accordingly, as well as appending copyright information to photos using IPTC standard.

[Exiftool Install Info](https://www.npmjs.com/package/node-exiftool)


##Usage
Updates any exif metadata attribute based on the entries.

```node
+ Album
  + cover.jpg  (PHOTO)
  + cover.json (NEW EXIF DATA)
  + FOLDER
    + img1.jpg
    + img2.jpg
    + img2.json
```

The script checks for each photo if there is {Filename} .json. If one of the photos is found, then all EXIF attributes that exist in the json file are transferred.

```node
  // add a PHOTO.json file to the album folder
  // update meta exif data for photos

  >  node updateMeta.js
     Result Updated Foto(s): ......

```

###Sample cover.json for foto cover.jpg 
```json
{
    "Title": "TITLE PHOTOALBUM",
    "ImageDescription": "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...",
    "Artist": "NAME",
    "Copyright": "avatar.jpg",
    "DocumentName": "http://LINK",
    "alldates": "2004:01:31 00:00:00+00:00",
    "City": "CITYNAME",
    "Caption-Abstract": "CAPTION"
}
```


###OPTIONAL UPDATE with bash
```bash
#!/bin/bash
# -----------------------------
# call ./setcover.sh cover.jpg
# -----------------------------
# Info : see https://sno.phy.queensu.ca/~phil/exiftool/faq.html

FILENAME=$1
echo "Update Metadata for $FILENAME"

## -----------------------------------------
## Modify or add the cover card information
## -----------------------------------------
AUTOR="NAME"           ## name autor
AVATAR="avatar.jpg"    ## optional avatar imagage
LINK="https://LINK"    ## optional link (external or internal)

COVERDATE="2004:01:31 00:00:00+00:00"           ## date, used for sorting.    
DESCRIPTION="Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."

exiftool -Artist="$AUTOR" \ 
         -Copyright="$AVATAR" \ 
         -ImageDescription="$DESCRIPTION" \ 
         -DocumentName="$LINK" \ 
         -FileModifyDate="$COVERDATE" \ 
         -DateTimeOriginal="$COVERDATE" \ 
         -CreateDate="$COVERDATE"  \ 
         -alldates="$COVERDATE"  \
         $FILENAME

```

---

####Metadata Types
**EXIF**
The Exchangeable Image File format (commonly called Exif or EXIF) is typically used by camera manufacturers to identify information about the camera's settings used for the photo. It typically includes timestamps, camera make/model, lens settings, and more. 
Details see *ExifTool by Phil Harvey*: [EXIF Tags](https://sno.phy.queensu.ca/~phil/exiftool/TagNames/EXIF.html)

**IPTC**
The International Press Telecommunications Council (IPTC) standardized the metadata format used for recording information related to press images. 
Details see *ExifTool by Phil Harvey*: [IPTC Tags](https://sno.phy.queensu.ca/~phil/exiftool/TagNames/IPTC.html)

**ICC Profile**
The International Color Consortium defined a color-space transformation system using a set of ICC Profiles. These are used to ensure that colors display the way they were intended. 
Details see *ExifTool by Phil Harvey*: [IPTC Tags](https://sno.phy.queensu.ca/~phil/exiftool/TagNames/ICC_Profile.html)


**Get all GPS Data**
Get all GPS Coordinates for the selected photo directory

```bash
## ---------------------------------------
## all GPS Data to one file
## ---------------------------------------
exiftool -ext jpg -ext mp4 -if '($GPSLatitude)' \
         -title  \
         -description \
         -city \
         -gpslatitude \
         -gpslatituderef \
         -gpslongitude \
         -gpslongituderef  \ 
         -createDate  \
         -j -r -n  -c %+.8f \
         DIR > gpsdata.json

## all metadata to one file
exiftool -all -g2 -j -c %+.8f -ext jpg -ext mp4 -r -n  DIR > data.json

## only data with GPS to one file
exiftool -all -g2 -j -c %+.8f -ext jpg -ext mp4 -r -n   -if '($GPSLatitude)' DIR > data.json

## ---------------------------------------
## write to "dir2", keeping dir structure
## ---------------------------------------
exiftool -all \
         -g2 \
         -j \
         -c %+.8f \
         -ext jpg \
         -ext mp4 \
         -r -n -w \
         exifdata/%d%f.json DIR

## Remove all EXIF metadata from the given files:
exiftool -All= file

## Increase time photo taken by 1 hour in directory:
exiftool "-AllDates+=0:0:0 1:0:0" directory

## Decrease time photo taken by 1 day and 2 hours on JPEGs only:
exiftool "-AllDates-=0:0:1 2:0:0" -ext jpg

### Change only DateTimeOriginal by -1.5 hours & do not keep backups:
exiftool -DateTimeOriginal-=1.5 -overwrite_original

## Rename all JPEGs according to a DateTimeOriginal recursively:
exiftool '-filename<DateTimeOriginal' -d %Y-%m-%d_%H-%M-%S%%lc.%%e directory -r -ext jpg

```

see: https://www.mankier.com/1/exiftool#Reading_Examples
