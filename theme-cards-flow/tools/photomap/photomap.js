const map = L.map("map", {
    maxBounds: [
        [-90, -Infinity],
        [90, Infinity]
    ],
    zoomControl: true,
    scrollWheelZoom: false,
    worldCopyJump: true
}).setView([40, 0], 3);

L.tileLayer
    .grayscale("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: 'Map data &copy; <a href="https://openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 14,
        minZoom: 2
    })
    .addTo(map);

L.easyButton('<img src="home.png" with="15" height="15">', function(btn, map) {
    map.setView([20, 0], 3);
}).addTo(map);

var photoLayer = L.photo.cluster().on("click", function(evt) {

    var photo = evt.layer.photo,
        template = '<img src="{url}" width="320"/></a><h3>{album}</h3><p>{description}</p>';

    if (photo.video && !!document
        .createElement("video")
        .canPlayType("video/mp4; codecs=avc1.42E01E,mp4a.40.2")
    ) {
        template = '<video autoplay controls poster="{url}" width="300" height="300"><source src="{video}" type="video/mp4"/></video>';
    }

    evt.layer
        .bindPopup(L.Util.template(template, photo), {
            className: "leaflet-popup-photo",
            minWidth: 240
        })
        .openPopup();
});

reqwest({
    url: "photomap.json",
    success: function(data) {
        photoLayer.add(data.rows).addTo(map);
        map.fitBounds(photoLayer.getBounds());

        // Footer mit Statistik aktualisieren
        var albums = data.rows.map(function(r) { return r.album; });
        var stats = document.getElementById('map-stats');
        if (stats) {
            stats.textContent = 'Fotobuch Peter Siebler \u2022 ' + data.total_rows + ' Orte auf der Karte';
        }
    }
});