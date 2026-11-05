#!/bin/bash

## ./saveAllMetadata.sh ../../tmp2  tmp2/meta

SOURCE=$1
TARGET=$2

echo "Scanning: $SOURCE, write data to $TARGET" 
exiftool -all -g2 -j -c %+.8f -ext jpg -ext mp4 -r -n -w $TARGET/%d%f.json $SOURCE
echo "All well done..."