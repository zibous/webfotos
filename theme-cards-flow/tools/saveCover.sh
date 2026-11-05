#!/bin/bash
# -----------------------------
# call ./setcover.sh cover.jpg
# -----------------------------
fileName=$1
echo $fileName

## -----------------------------------------
## Modify or add the cover card information
## ----------------------------------------
AUTOR="AUTORNAME"                           ## name autor
AVATAR="avatar.jpg"                         ## optional avatar imagage
LINK="https://DOMAIN"                       ## optional link (external or internal)

COVERDATE="2004:01:31 00:00:00+00:00"           ## date, used for sorting.    
DESCRIPTION="Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."

exiftool -Artist="$AUTOR"  \
         -Copyright="$AVATAR" \
         -ImageDescription="$DESCRIPTION" \
         -DocumentName="$LINK" \
         -FileModifyDate="$COVERDATE" \
         -alldates="$COVERDATE"  $fileName

