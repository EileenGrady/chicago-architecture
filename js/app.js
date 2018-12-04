(function() {

  var map = L.map('map', {
    zoomSnap: .1,
    center: [41.862458, -87.635606],
    zoom: 11
  });

  var tiles = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
  });

  tiles.addTo(map);

  // use omnivore to load the CSV data
  omnivore.csv('data/chicago-architecture.csv')
    .on('ready', function(e) {
      drawMap(e.target.toGeoJSON());
      console.log(e);
    })
    .on('error', function(e) {
      console.log(e.error[0].message);
    })



  function drawMap(data) {
    // create Leaflet object and add to map
        console.log(data);
    var buildings = L.geoJson(data, {
      onEachFeature: function(feature, layer) {
        var props = feature.properties
        var popup = ""
        if (props.buildingName) {
          popup += "<b>" + props.buildingName + "</b><br>" + props.Address + "<br>"
        } else {
          popup += "<b>" + props.Address + "</b><br>"
        }
        popup += "Primary Style: " + props.Style + "<br>"
        if (props.architect) {
          popup += "Architect: " + props.architect + "<br>"
        }
        if (props.yearBuilt) {
          popup += "Year Built: " + props.yearBuilt + "<br>"
        }
        if (props.buildingType) {
          popup += "Building Type: " + props.buildingType
        }

				// bind a tooltip to layer with county-specific information
				layer.bindPopup(popup, {
				});
}
    }).addTo(map);
  }


})();
