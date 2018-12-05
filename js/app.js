(function() {

  var map = L.map('map', {
    zoomSnap: .1,
    center: [41.862458, -87.635606],
    zoom: 11,
    zoomControl: false
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
    })
    .on('error', function(e) {
      console.log(e.error[0].message);
    })

  //create empty arrays to hold values for dropdown filter options
  var architects = []
  var styles = []
  var buildingTypes = []

  function drawMap(data) {
    // create Leaflet object and add to map
    var buildingLayer = L.geoJson(data, {

      style: function(feature) {
        return {
          color: "blue"
        }
      },

      onEachFeature: function(feature, layer) {
        var props = feature.properties

        //empty string to hold popup info
        var popup = ""

        //if building has a name, use that as popup header, then append address to next line
        if (props.buildingName) {
          popup += "<b>" + props.buildingName + "</b><br>" + props.Address + "<br>"
          //if building does not have name, use address as popupheader
        } else {
          popup += "<b>" + props.Address + "</b><br>"
        }

        //append buidling style to popup
        popup += "Primary Style: " + props.Style + "<br>"

        //if building has an architect listed, append to popup
        if (props.architect) {
          popup += "Architect: " + props.architect + "<br>"
        }

        //if building has year built listed, append to popup
        if (props.yearBuilt) {
          popup += "Year Built: " + props.yearBuilt + "<br>"
        }

        //if building had buidling type listed, append to popup
        if (props.buildingType) {
          popup += "Building Type: " + props.buildingType
        }

				// bind popup to layer
				layer.bindPopup(popup, {
				});

        //if array for architect filter doesn't already have architect from a building in it, add to array
        if (!architects.includes(props.architect)) architects.push(props.architect)
        architects.sort();

        //if array for style filter doesn't already have stylet from a building in it, add to array
        if (!styles.includes(props.Style)) styles.push(props.Style)
        styles.sort();

        //if array for buildingType filter doesn't already have buildingType from a building in it, add to array
        if (!buildingTypes.includes(props.buildingType)) buildingTypes.push(props.buildingType)
        buildingTypes.sort();
}

    }).addTo(map);

    addStyleFilter(data);
  }

  //function to populate style filter dropdown with values from styles
  function addStyleFilter(data) {
    console.log(data);
    // make the selection once
    var dropdown = $('#style-filter');
    //for each value in styles array
    $.each(styles, function(key, value) {
      // append a new element
      dropdown.append("<a class='dropdown-item' value='"+ key +"' href='#''>" + value + "</a>")  //append new dropdown item
    });

    $('#style-filter').click(function(e) {
      attributeValue = $(this).val();
      filterMap(data, attributeValue);
      console.log("something changed");
      console.log(buildingLayer);

    });

  }

  function filterMap(buildingLayer, attributeValue, layer) {
    buildingLayer.eachLayer(function (layer) {
      console.log(buildingLayer.feature.properties);
//       if (layer.feature.properties != attributeValue) {
//         map.removeLayer(layer)
//       }
});
}

})();
