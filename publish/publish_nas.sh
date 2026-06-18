#!/bin/sh

HOST=fotobuch.nas
SOURCE_DIR=./fotobooks/www/fotobuch/
TARGET_DIR=/volume1/web/fotobuch/

echo "Start sync fotobuch local NAS: ${SOURCE_DIR} to ${TARGET_DIR}"
rsync -rltzuv --progress --delete ${SOURCE_DIR} ${HOST}:${TARGET_DIR}

echo "End sync fotobuch"
exit 0
