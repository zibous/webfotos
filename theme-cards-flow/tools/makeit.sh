#!/bin/bash

function mainScript() {
    clear
    echo "${scriptName}"
   
    echo "-----------------------------------------"
    echo "Aktivierung Node Version: nvm use stable"
    echo "-----------------------------------------"
    echo "Node Version:" 
    node -v

    echo "Erstelle Fotobuch:"
    ## thumbsup --config fotobuch.json
    theme-cards-flow/node_modules/thumbsup/bin/thumbsup.js  --config $fotoconfig.json

    ## erstelle Map Data
    echo "Erstelle Karten Daten:"
    cd theme-cards-flow/tools/gps
    node index.js

    cd ../../

    echo "-----------------------------------------"
    echo "Fertig...."
    echo "-----------------------------------------"
}

# Print usage
usage() {
  echo -n "${scriptName} [OPTION]... [FILE]..."
}

# Run your script
scriptName=$(basename "$0")
fotoconfig=fotobuch

mainScript
