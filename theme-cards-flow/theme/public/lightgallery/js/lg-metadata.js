/**
 * Metadata Plugin for lightGallery 2.x
 * Displays EXIF metadata and a Leaflet map in a side panel.
 *
 * @version 2.0.0
 * @author Peter Siebler
 * @license MIT
 */
!function(root, factory) {
  "object" == typeof exports && "undefined" != typeof module
    ? module.exports = factory()
    : "function" == typeof define && define.amd
      ? define(factory)
      : (root = "undefined" != typeof globalThis ? globalThis : root || self).lgMetadata = factory();
}(this, function() {
  "use strict";

  var defaults = {
    metatitle: 'Foto Information',
    mapheadline: 'Aufnahmeort',
    metakeys: {}
  };

  var LgMetadata = function(instance) {
    this.core = instance;
    this.settings = Object.assign({}, defaults, this.core.settings);
    this.photodata = [];
    this.geodata = null;
    this.metafile = null;
    this.leafletAvailable = (typeof L !== 'undefined');
    this.map = null;
    this.marker = null;
    this.element = null;
  };

  LgMetadata.prototype.init = function() {
    var _this = this;
    try {
    // In LG 2.x, this.core.outer is the .lg-outer element (already a DOM node via lgQuery)
    var outer = this.core.outer;
    // If outer is an lgQuery object, get the first element
    if (outer && outer.get) {
      outer = outer.get();
    }

    // Build panel HTML
    var panel = document.createElement('div');
    panel.className = 'lg-metadata-panel lg-metadata-hidden';
    panel.innerHTML =
      '<div class="lg-metadata-topbar">' +
        '<h3>' + this.settings.metatitle + '</h3>' +
        '<span class="lg-metadata-close lg-icon"></span>' +
      '</div>' +
      '<div class="lg-metadata-body">' +
        '<h3 class="lg-metadata-map-title">' + this.settings.mapheadline + '</h3>' +
        '<div class="lg-metadata-map"></div>' +
        '<div class="lg-metadata-content"></div>' +
      '</div>';

    outer.appendChild(panel);
    this.element = panel;

    // Add info toggle button to toolbar
    var toolbar = outer.querySelector('.lg-toolbar');
    if (!toolbar && outer.firstElementChild) {
      toolbar = outer.firstElementChild.querySelector('.lg-toolbar');
    }
    if (toolbar) {
      var infoBtn = document.createElement('button');
      infoBtn.type = 'button';
      infoBtn.setAttribute('aria-label', 'Toggle metadata');
      infoBtn.className = 'lg-icon lg-metadata-toggle';
      infoBtn.innerHTML = '&#9432;';
      var closeBtn = toolbar.querySelector('.lg-close');
      if (closeBtn) {
        toolbar.insertBefore(infoBtn, closeBtn);
      } else {
        toolbar.appendChild(infoBtn);
      }
      infoBtn.addEventListener('click', function() {
        _this.toggle();
      });
    }

    // Close button in panel
    panel.querySelector('.lg-metadata-close').addEventListener('click', function() {
      _this.hide();
    });

    // Update on slide change
    this.core.LGel.on('lgAfterSlide', function() {
      _this.update();
    });

    // Init Leaflet map
    if (this.leafletAvailable) {
      var mapEl = panel.querySelector('.lg-metadata-map');
      this.map = L.map(mapEl, {
        zoom: 13,
        center: [0, 0],
        scrollWheelZoom: false,
        fadeAnimation: false,
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
            minZoom: 2
          })
        ]
      });
      this.marker = L.marker([0, 0]).addTo(this.map);
      panel.querySelector('.lg-metadata-map-title').style.display = 'none';
      mapEl.style.display = 'none';
    }

    // Initial update
    this.update();
    } catch(e) { console.error('lgMetadata init error:', e); }
  };

  LgMetadata.prototype.toggle = function() {
    var _this = this;
    this.element.classList.toggle('lg-metadata-hidden');
    if (!this.element.classList.contains('lg-metadata-hidden') && this.map) {
      setTimeout(function() { _this.map.invalidateSize(); }, 300);
    }
  };

  LgMetadata.prototype.hide = function() {
    this.element.classList.add('lg-metadata-hidden');
  };

  LgMetadata.prototype.update = function() {
    var _this = this;
    this.photodata = [];
    this.geodata = null;

    // Get the original DOM element that triggered the gallery
    var triggerEl = null;
    if (this.core.items && this.core.items.length > this.core.index) {
      triggerEl = this.core.items[this.core.index];
    }

    // Fallback: try galleryItems
    var dataset = {};
    if (triggerEl) {
      var attrs = triggerEl.attributes;
      for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].name.indexOf('data-') === 0) {
          var key = attrs[i].name.slice(5).replace(/-([a-z])/g, function(m, c) { return c.toUpperCase(); });
          dataset[key] = attrs[i].value;
        }
      }
    }

    // Check for geodata
    this.geodata = this.getGeo(dataset);

    // Check for metafile (external JSON)
    this.metafile = dataset.metafile || null;

    if (this.metafile) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', this.metafile, false);
        xhr.send();
        if (xhr.status === 200) {
          var result = JSON.parse(xhr.responseText);
          var m = result[0];
          if (m && typeof m === 'object') {
            var geoFromFile = {};
            var keys = Object.keys(m);
            for (var si = 0; si < keys.length; si++) {
              var sectionKey = keys[si];
              var section = m[sectionKey];
              if (typeof section === 'object' && section !== null) {
                _this.photodata.push({ label: _this.decamelize(sectionKey, ' '), deep: 0, value: null, key: sectionKey });
                var fieldKeys = Object.keys(section);
                for (var fi = 0; fi < fieldKeys.length; fi++) {
                  var fieldKey = fieldKeys[fi];
                  _this.photodata.push({ label: _this.decamelize(fieldKey, ' '), deep: 1, value: section[fieldKey], key: fieldKey });
                  if (fieldKey.toLowerCase().indexOf('gps') === 0) {
                    geoFromFile[fieldKey.toLowerCase()] = section[fieldKey];
                  }
                }
              }
            }
            if (Object.keys(geoFromFile).length > 0) {
              this.geodata = this.getGeo(geoFromFile);
            }
          }
        }
      } catch (e) { /* ignore */ }
    }

    // Add data-* attributes as metadata (if no metafile)
    if (!this.metafile) {
      var metakeys = this.settings.metakeys || {};
      var dataKeys = Object.keys(dataset);
      var firstItem = true;
      for (var di = 0; di < dataKeys.length; di++) {
        var dkey = dataKeys[di];
        var value = dataset[dkey];
        if (!value) continue;
        var keytext = this.getKey(dkey, metakeys);
        if (keytext && firstItem && dataset.metasection) {
          this.photodata.push({ label: dataset.metasection, deep: 0, value: null, key: 'metasection' });
        }
        if (keytext && value) {
          this.photodata.push({ label: keytext, deep: 1, value: value, key: dkey });
          firstItem = false;
        }
      }
    }

    this.renderData();
  };

  LgMetadata.prototype.getKey = function(key, metakeys) {
    var ignore = ['src', 'exthumbimage', 'metafile', 'subHtml', 'filename', 'metasection', 'html'];
    if (ignore.indexOf(key) >= 0) return null;
    if (key.indexOf('lg') === 0) return null;
    if (key.indexOf('jg') === 0) return null;
    if (metakeys[key]) return metakeys[key];
    return key;
  };

  LgMetadata.prototype.renderData = function() {
    var html = '';
    var lastLabel = '';
    for (var i = 0; i < this.photodata.length; i++) {
      var item = this.photodata[i];
      if (item.deep === 0) {
        html += '<h4 class="lg-metadata-section">' + item.label + '</h4>';
      }
      if (item.deep === 1 && item.value) {
        if (item.label !== lastLabel) {
          html += '<div class="lg-metadata-row"><label>' + item.label + '</label><span>' + item.value + '</span></div>';
        } else {
          html += '<div class="lg-metadata-row"><label></label><span>' + item.value + '</span></div>';
        }
        lastLabel = item.label;
      }
    }

    this.element.querySelector('.lg-metadata-content').innerHTML = html;

    // Map handling
    if (this.leafletAvailable && this.map) {
      var mapEl = this.element.querySelector('.lg-metadata-map');
      var mapTitle = this.element.querySelector('.lg-metadata-map-title');
      if (this.geodata) {
        mapTitle.style.display = '';
        mapEl.style.display = '';
        this.map.setView(this.geodata, 13);
        this.marker.setLatLng(this.geodata);
        var map = this.map;
        setTimeout(function() { map.invalidateSize(); }, 100);
      } else {
        mapTitle.style.display = 'none';
        mapEl.style.display = 'none';
      }
    }
  };

  LgMetadata.prototype.getGeo = function(data) {
    var lat = data.gpslatitude || data.GPSLatitude || data.gpsLatitude;
    var lng = data.gpslongitude || data.GPSLongitude || data.gpsLongitude;
    if (lat && lng) {
      var latVal = this.parseDMS(lat);
      var lngVal = this.parseDMS(lng);
      var latRef = data.gpslatituderef || data.GPSLatitudeRef || data.gpsLatitudeRef || '';
      var lngRef = data.gpslongituderef || data.GPSLongitudeRef || data.gpsLongitudeRef || '';
      if (latRef === 'S' || latRef === 'South') latVal *= -1;
      if (lngRef === 'W' || lngRef === 'West') lngVal *= -1;
      if (latVal !== 0 || lngVal !== 0) return [latVal, lngVal];
    }
    return null;
  };

  LgMetadata.prototype.parseDMS = function(input) {
    if (Array.isArray(input) && input.length === 3) {
      return input[0] + input[1] / 60 + input[2] / 3600;
    }
    var n = parseFloat(input);
    return isNaN(n) ? 0 : n;
  };

  LgMetadata.prototype.decamelize = function(str, separator) {
    separator = separator || ' ';
    return str
      .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
      .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2');
  };

  LgMetadata.prototype.destroy = function() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  };

  return LgMetadata;
});
