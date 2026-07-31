---
title: "Fotobuch"
date: 2019-08-12T18:46:10
description: ""
type: "post"
image: "posts/fotobuch/Fotobuch.jpg"
author: "Peter Siebler"
categories:
  - "Linux"
tags:
  - "Anwendung"
  - "Webanwendung"
  - "Github"
---

## Fotobuch thumbsup
Einfaches erstellen eines Fotobuches (Bilder, Videos). Erstellt eine Webgallerie aus Fotos und Videos die in einem Ordner gespeichert.
Thumbnails und mehrere Auflösungen, mobilfreundliche Website mit anpassbaren Themen. Alle verschachtelten Ordner werden zu separaten Alben
zusammengefasst.
<!--more-->

### Anforderungen

Thumbsup benötigt folgendes:
```ini
  Node.js: brew install node
  exiftool: brew install exiftool
  GraphicsMagick: brew install graphicsmagick

 ## Optional

  FFmpeg to process videos: brew install ffmpeg
  Gifsicle to process animated GIFs: brew install gifsicle
  dcraw to process RAW photos: brew install dcraw
  ImageMagick for HEIC support (needs to be compiled with --with-heic)
````

<hr style="margin-bottom: 4rem">

## Einfache Installation
Weitere Informationen zum Projekt findest Du beim:<br>
{{< linkbutton "https://bitbucket.org/peter_siebler/theme-cards-flow/src/master/" "BITBUCKET Projekt..." "bitbucket" >}}

```bash
## first create a photoapp folder
mkdir -p ~/photoapp
cd ~/photoapp

## install the theme
git clone https://bitbucket.org/peter_siebler/theme-cards-flow.git

## install tools
brew install exiftool
brew install graphicsmagick
brew install ffmpeg
brew install gifsicle
brew install dcraw

# install thumbsup in the current photoapp folder
npm --save install https://github.com/thumbsup/thumbsup.git
```

## Docker Installation

```bash

#!/bin/bash
# ------------------------------------------
#
# ------------------------------------------
IDu=$(id -u) # UID saves the user id in the IDu variable
IDg=$(id -g) # GID saves the user group in the IDg variable

# all application settings ------------------
CURRENTURL="http://$HOSTNAME.$(dnsdomainname)"
DOCKER_TIMEZONE="Europa/Berlin"
APPSDATA=$PWD${DOCKER_APPSDIR}${CONTAINERLABEL}

## create application folder -----------------
mkdir -p ${APPSDATA}

echo "Try to remove previuos installation ${CONTAINERLABEL}..."
docker stop ${DOCKERIMAGE} && docker rm ${DOCKERIMAGE}

echo "Install Docker container ${CONTAINERLABEL}."
docker run -t \
    -v $DOCKERDIR/thumbsup:/output \
    -v $DATADIR/temp:/input:ro  \
    -v /etc/localtime:/etc/localtime \
    -u $PUID:$PGID  \
    ghcr.io/thumbsup/thumbsup thumbsup --input /input --output /output
echo "Docker container ${CONTAINERLABEL} ready."
echo "Run WEBGUI: ${CURRENTURL}:${DOCKER_PIHOLE_WEBPORT}"
```

## Beispiel Fotobuch

{{< gallery >}}
  {{< image-dir >}}
{{< /gallery >}}


{{< notice note >}}
  &raquo; https://github.com/thumbsup/thumbsup<br>
  &raquo; https://thumbsup.github.io/docs/2-installation/docker/<br>
  &raquo; https://bitbucket.org/peter_siebler/theme-cards-flow/src/master/thumbsup/<br>
  &raquo;  https://bitbucket.org/peter_siebler/theme-cards-flow/src/master/<br>
  &raquo; https://bitbucket.org/peter_siebler/theme-cards-flow/src/master/tools/photomap/<br>
{{< /notice >}}