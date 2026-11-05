###############################################################################
# Dockerfile für thumbsup Fotogalerie-Generator
# Basierend auf Node 20 (LTS) mit allen System-Abhängigkeiten
#
# thumbsup v2.18.0 hat bereits eingebaut:
#   - --theme-settings Option (liest JSON-Config für Theme)
#   - settings-Objekt wird ans Template übergeben
#
# Einziger noch nötiger Patch:
#   - src/model/metadata.js → this.all = exiftool
#     (Theme-Helper photoMeta.js braucht Zugriff auf ALLE Exif-Daten)
###############################################################################
FROM node:20-bookworm

LABEL maintainer="Peter Siebler"
LABEL description="thumbsup static photo gallery generator (modified for theme-cards-flow)"

# System-Abhängigkeiten für thumbsup installieren
RUN apt-get update && apt-get install -y --no-install-recommends \
    libimage-exiftool-perl \
    graphicsmagick \
    ffmpeg \
    gifsicle \
    dcraw \
    build-essential \
    python3 \
    && npm install -g thumbsup@2.18.0 \
    && apt-get purge -y --auto-remove build-essential python3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /root/.npm

# NODE_PATH setzen, damit Theme-Helper (photoMeta.js) Zugriff auf
# thumbsup-Dependencies wie fs-extra haben
ENV NODE_PATH=/usr/local/lib/node_modules/thumbsup/node_modules

# Arbeitsverzeichnis
WORKDIR /app

# PATCH: metadata.js - "this.all = exiftool" hinzufügen
COPY patches/patch-metadata.sh ./patches/
RUN chmod +x ./patches/patch-metadata.sh && ./patches/patch-metadata.sh

# Custom Theme kopieren
COPY theme-cards-flow/ ./theme-cards-flow/

# Einstiegspunkt: thumbsup CLI (global installiert)
ENTRYPOINT ["thumbsup"]
CMD ["--help"]
