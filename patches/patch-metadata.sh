#!/bin/bash
###############################################################################
# Patch: metadata.js - Fügt "this.all = exiftool" hinzu
#
# Das theme-cards-flow Theme benötigt Zugriff auf ALLE exiftool-Metadaten
# über meta.all im photoMeta.js Helper. Die Standard-thumbsup-Version
# liefert nur ausgewählte Felder.
#
# thumbsup ist global installiert unter /usr/local/lib/node_modules/thumbsup/
###############################################################################

# Global installiertes thumbsup finden
METADATA_FILE=$(find /usr/local/lib/node_modules/thumbsup -name "metadata.js" -path "*/model/metadata.js" 2>/dev/null | head -1)

if [ -z "$METADATA_FILE" ]; then
    echo "ERROR: metadata.js not found in global thumbsup installation!"
    echo "Searching in /usr/local/lib/node_modules/thumbsup/..."
    find /usr/local/lib/node_modules/thumbsup -name "*.js" | head -20
    exit 1
fi

echo "Found: $METADATA_FILE"

# Prüfen ob der Patch bereits angewendet wurde
if grep -q "this.all = exiftool" "$METADATA_FILE"; then
    echo "✔ metadata.js patch already applied"
    exit 0
fi

# Füge "this.all = exiftool" nach der Zeile mit "this.exif = " ein
sed -i 's/this.exif = opts ? (opts.embedExif ? exiftool.EXIF : undefined) : undefined/this.exif = opts ? (opts.embedExif ? exiftool.EXIF : undefined) : undefined\n    this.all = exiftool/' "$METADATA_FILE"

if grep -q "this.all = exiftool" "$METADATA_FILE"; then
    echo "✔ metadata.js patched successfully (added this.all = exiftool)"
else
    echo "ERROR: Failed to patch metadata.js"
    echo "Content around exif line:"
    grep -n "this.exif" "$METADATA_FILE"
    exit 1
fi
