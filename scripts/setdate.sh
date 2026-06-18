#!/bin/bash

## exiftool -json test.jpg > test.json

newDate="1978:07:08 10:30:00+00:00"
find . -name "*.jpg" -exec exiftool -FileModifyDate="${newDate}" -DateTimeOriginal="${newDate}" -CreateDate="${newDate}" {} \;

newDate="1978:07:08 00:00:00+00:00"
find . -name "_cover*.jpg" -exec exiftool -FileModifyDate="${newDate}" -DateTimeOriginal="${newDate}" -CreateDate="${newDate}" {} \;