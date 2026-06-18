#!/bin/bash

## .setdate.sh 2004:01:31 00:00:00+00:00 *.jpg

newDate=$1
filter=$2

find . -name "$filter" -exec exiftool -FileModifyDate="${newDate}" -DateTimeOriginal="${newDate}" -CreateDate="${newDate}" {} \;
