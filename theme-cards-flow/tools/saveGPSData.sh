#!/bin/bash

## ./saveGPSdata.sh ../../tmp2  ./GPS/data.json


SOURCE=$1
TARGET=$2

FILES=" -ext jpg -ext mp4 "
PARAMS=" -j -r -n  -c %+.8f -lang de "

echo "Scanning: $SOURCE, write metadata to $TARGET" 

exiftool $FILES  \
		-if '($GPSLatitude)' \
		-filename \
		-GPSDateTime \
		-GPSLatitude \
		-GPSLatitudeRef \
		-GPSLongitude \
		-GPSLongitudeRef   \
		-GPSAltitude \
		-GPSAltitudeRef \
		-title  \
		-artist \
		-description \
		-city \
		-country \
		-countrycode \
		-createdate \
		-comment  \
		-keywords  \
		-make  \
		-model \
        $PARAMS \
        $SOURCE > $TARGET
				 
				 
echo "All well done..."