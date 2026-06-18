#!/bin/sh

HOST=fotobuch.server
SOURCE_DIR=/docker/webfotos/fotobooks/www/fotobuch/
TARGET_DIR=/var/www/fotobuch/

echo "Start sync fotobuch EXTERNAL SERVER: ${SOURCE_DIR} to ${TARGET_DIR}"
rsync -rltzuv --progress --delete ${SOURCE_DIR} ${HOST}:${TARGET_DIR}

echo "End sync fotobuch"
exit 0
