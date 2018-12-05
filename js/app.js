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

  //I want to use this data to update the side panel with details about the architecture style when a user selects one from the dropdown
  //Not sure how to pull the data out of this function to use though
  //use papaparse to load styles.csv
  Papa.parse('data/styles.csv', {
    download: true,
    header: true,
    complete: function(styles) {
      console.log(styles)
      updateStyleDetails(styles) //call this here to pull the data out?
    }
  })

  //create empty arrays to hold values for dropdown filter options
  var architects = [];
  var styles = [];
  var buildingTypes = [];

  // empty layerGroup to hold markers we remove with filter
  var tempLayers = L.layerGroup();

  function drawMap(data) {
    // create Leaflet object and add to map
    var buildingLayer = L.geoJson(data, {

      // pointToLayer: function(feature, latlng) {
      //   var icon = L.icon({
      //     iconUrl: "MAKI/building-11.svg",
      //     iconSize: 30
      //     // tooltipAnchor: [0, -15] // Center of your icon is [0,0]
      //   });
      // },

      onEachFeature: function(feature, layer) {
        var props = feature.properties

        //empty string to hold popup info
        var popup = ""

        //if building has a name, use that as popup header, then append address to next line
        if (props.buildingName) {
          popup += "<h6>" + props.buildingName + "</h6><br>" + props.Address + "<br>"
          //if building does not have name, use address as popupheader
        } else {
          popup += "<h6>" + props.Address + "</h6><br>"
        }

        //append building style to popup
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

        //if array for style filter doesn't already have style from a building in it, add to array
        if (!styles.includes(props.Style)) styles.push(props.Style)
        styles.sort();

        //if array for buildingType filter doesn't already have buildingType from a building in it, add to array
        if (!buildingTypes.includes(props.buildingType)) buildingTypes.push(props.buildingType)
        buildingTypes.sort();
}

    }).addTo(map);

    addStyleFilter(data, buildingLayer);
  }

  //function to populate style filter dropdown with values from styles
  function addStyleFilter(data, buildingLayer) {
    console.log(data);
    // make the selection once
    var dropdown = $('#style-filter');

    // add an "All" option
    dropdown.append("<a class='dropdown-item href='#''>all</a>")
    //for each value in styles array
    $.each(styles, function(key, value) {
      // append a new element
      dropdown.append("<a class='dropdown-item href='#''>" + value + "</a>")  //append new dropdown item
    });

    $('.dropdown-menu a').click(function(e) {

      // we can use the HTML of the anchor to match to the feature's Style prop
      attributeValue = this.innerHTML
      
      console.log("selected attribute: ", attributeValue);
      
      filterMap(buildingLayer, attributeValue);


    });

  }

  function filterMap(buildingLayer, attributeValue) {
   
    // kinda hacky, but first add all tempLayer's layers back to buildingLayer
    tempLayers.eachLayer(function(layer) {
      buildingLayer.addLayer(layer)
    });

    // remove all layers from tempLayers
    tempLayers.clearLayers()

    // if user hasn't selected all
    if(attributeValue != 'all') {
      // loop through the building's layers
      buildingLayer.eachLayer(function (layer) { //loop through each layer
        // if the style isn't the selected one
        if(layer.feature.properties['Style'] != attributeValue) {
          // add the layer to tempLayers layerGroup
          tempLayers.addLayer(layer);
          // remove the layer from the buildings layerGroup
          buildingLayer.removeLayer(layer)
        }
      });
    }
}

  function updateStyleDetails(styles, attributeValue){
    //match the attribute value to a style in the styles object
    //create new HTML element
    //append (or replace the existing one?) it to the side panel
    //then call within the addStyleFilter function so that it updates when a user selects a style
  }

})();
