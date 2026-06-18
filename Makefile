# ##############################################################################
# Makefile für thumbsup Fotogalerie (Docker)
#
# Verwendung:  make help
#
# Album generieren:
#   make album NAME=testalbum
#   make album NAME=fotobuch
# ##############################################################################

.PHONY: build album photomap preview shell check clean rebuild help

.DEFAULT_GOAL := help

# Album-Name (Standard: testalbum)
NAME ?= testalbum

# Docker Image bauen
build:
	docker compose build

# Docker Image komplett neu bauen (ohne Cache)
rebuild:
	docker compose build --no-cache

# Album generieren (fotobooks/NAME/ → fotobooks/www/NAME/)
album:
	@echo "============================================"
	@echo " Album: $(NAME)"
	@echo " Input:  fotobooks/$(NAME)/"
	@echo " Output: fotobooks/www/$(NAME)/"
	@echo "============================================"
	@echo ""
	ALBUM=$(NAME) docker compose run --rm --entrypoint bash thumbsup -c '\
		echo "→ Merge Configs..." && \
		node /scripts/merge-config.js /defaults /album/album.json /config && \
		echo "→ Generiere Galerie..." && \
		thumbsup --config /config/config.json'
	@$(MAKE) photomap NAME=$(NAME)

# Karten Daten generieren
photomap:
	@echo ""
	@echo "→ Erstelle Karten Daten für $(NAME)..."
	ALBUM=$(NAME) docker compose run --rm --entrypoint bash thumbsup -c '\
		mkdir -p /output/photomap && \
		node /app/theme-cards-flow/tools/photomap/index.js && \
		cp /app/theme-cards-flow/tools/photomap/photomap.css /output/photomap/ && \
		cp /app/theme-cards-flow/tools/photomap/photomap.js /output/photomap/ && \
		cp /app/theme-cards-flow/tools/photomap/home.png /output/photomap/ && \
		sed -e "s|../../theme/public/leaflet/|../public/leaflet/|g" \
		    /app/theme-cards-flow/tools/photomap/index.html > /output/photomap/index.html'
	@echo "✔ Karten Seite erstellt: fotobooks/www/$(NAME)/photomap/"

# Vorschau im Browser (Port 8080)
preview:
	@echo "→ http://10.1.1.119:8080/$(NAME)/fotobuch/"
	@echo "  Beenden mit Ctrl+C"
	@cd fotobooks/www && python3 -m http.server 8080

# Container Shell öffnen
shell:
	ALBUM=$(NAME) docker compose run --rm --entrypoint bash thumbsup

# Systemtools und Patch prüfen
check:
	@ALBUM=$(NAME) docker compose run --rm --entrypoint bash thumbsup -c '\
		echo "=== Versionen ===" && \
		echo "node:          $$(node -v)" && \
		echo "thumbsup:      $$(thumbsup --version 2>/dev/null || echo unknown)" && \
		echo "exiftool:      $$(exiftool -ver)" && \
		echo "graphicsmagick: $$(gm version | head -1)" && \
		echo "ffmpeg:        $$(ffmpeg -version 2>&1 | head -1)" && \
		echo "" && \
		echo "=== Patch ===" && \
		grep -q "this.all = exiftool" /usr/local/lib/node_modules/thumbsup/src/model/metadata.js \
			&& echo "✔ metadata.js patch aktiv" \
			|| echo "✕ metadata.js patch FEHLT"'

# Generierte Galerie eines Albums löschen
clean:
	rm -rf fotobooks/www/$(NAME)/*
	@echo "✔ fotobooks/www/$(NAME)/ geleert"

publish_nas:
	bash ./publish/publish_nas.sh

publish_server:
	bash ./publish/publish.sh

# Hilfe
help:
	@echo ""
	@echo "  thumbsup Fotogalerie - Befehle"
	@echo "  ==============================="
	@echo ""
	@echo "  make build              Docker Image bauen"
	@echo "  make rebuild            Image neu bauen (ohne Cache)"
	@echo "  make album NAME=xxx     Album generieren"
	@echo "  make photomap NAME=xxx  Nur Karten-Daten generieren"
	@echo "  make preview            Webserver starten (Port 8080)"
	@echo "  make shell NAME=xxx     Container Shell öffnen"
	@echo "  make check              Versionen und Patch prüfen"
	@echo "  make clean NAME=xxx     Album-Output löschen"
	@echo "  make help               Diese Hilfe"
	@echo ""
	@echo "  Beispiel:"
	@echo "    make album NAME=fotobuch"
	@echo "    make preview"
	@echo ""
