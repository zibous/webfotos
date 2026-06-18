#!/bin/bash

## ./saveMetadata.sh ../../tmp2  tmp2/meta/detail

SOURCE=$1
TARGET=$2

FILES=" -ext jpg -ext mp4 "
PARAMS=" -j -r -n  -c %+.8f -lang de "

echo "Scanning: $SOURCE, write data to $TARGET" 

exiftool $FILES  \
        -FileName \
        -title  \
        -artist \
        -description \
        -createdate \
        -comment  \
        -keywords  \
        -copyright  \
        -copyrightNotice \
        -make  \
        -model \
        -SourceResolution \
        -ShutterSpeedValue \
        -FNumber  \
        -ExposureTime  \
        -ISOSpeedRatings  \
        -FocalLength  \
        -LightValue \
        -LensModel  \
        -FileSize  \
        -CreateDate \
        -FileType \
        -CanonModelID \
        -LensID \
        -Artist \
        -Quality \
        -RecordMode \
        -Compression \
        -ExposureMode \
        -ExposureTime \
        -Aperture \
        -ISO \
        -FocalLength \
        -HyperfocalDistance \
        -Flash \
        -WhiteBalance \
        -DriveMode \
        -FocusMode \
        -AFAreaMode \
        -NumAFPoints \
        -ValidAFPoints \
        -AspectRatio \
        -ColorTemperature \
        -PictureStyle \
        -ColorSpace \
        -ImageSize \
        -Megapixels \
        -city \
        -country \
        -countrycode \
        -GPSLatitude \
        -GPSLatitudeRef \
        -GPSLongitude \
        -GPSLongitudeRef   \
        -GPSAltitude \
        -GPSAltitudeRef \
        $PARAMS \
        -w $TARGET/%d%f.json $SOURCE
echo "All well done..."