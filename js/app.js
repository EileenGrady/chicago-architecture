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
  // Papa.parse('data/styles.csv', {
  //   download: true,
  //   header: true,
  //   complete: function(data) {
  //     getDataOut(data) //call this here to pull the data out?
  //   }
  // })

  //create empty arrays to hold values for dropdown filter options
  var architects = []
  var styles = []
  var buildingTypes = []

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
  function addStyleFilter(data, buildingLayer, styleData) {

    // make the selection once
    var dropdown = $('#style-filter');

    //add "All" option
    dropdown.append("<a class='dropdown-item href='#''>all</a>")

    //for each value in styles array
    $.each(styles, function(key, value) {
      // append a new element
      dropdown.append("<a class='dropdown-item' value='"+ key +"' href='#''>" + value + "</a>")  //append new dropdown item
    });

    $('.dropdown-menu a').click(function(e) {
      attributeValue = this.innerHTML;
      // console.log("selected attribute: ", attributeValue);
      filterMap(buildingLayer, attributeValue);
      updateStyleDetails(attributeValue)

    });

  }

  function filterMap(buildingLayer, attributeValue) {
    tempLayers.eachLayer(function(layer) {
      buildingLayer.addLayer(layer)
    });

    tempLayers.clearLayers()

    if (attributeValue != 'all') {
      buildingLayer.eachLayer(function (layer) {
        if(layer.feature.properties['Style'] != attributeValue) {
          tempLayers.addLayer(layer);
          buildingLayer.removeLayer(layer)
        }
      });
    }
};

var styleData = {
  AmericanFourSquare: {
    style: "American Four Square",
    description: "A simple and symmetrical reaction to ornate and decorative Victorian-era styles, often credited as evolving from the Prairie style pioneered by Frank Lloyd Wright. The American Four Square was a popular mail order style and kit home. They typically feature open floor plans, plenty of fireplaces, and a square and symmetrical shape. This style is always two stories tall.",
    url: "https://chicagoarchitecturedata.com/static/images/building_images/647-w-wellington-avenue-1417969718.jpg.800x800_q85_upscale.jpg",
    photoCredit: "John Morris"
  },
  ArtDeco: {
    style: "Art Deco",
    description: "Modern style with emphasis on stark and simple lines, bold colors and shapes, and motifs featuring geometric, floral, or animal designs. Art Deco was part of the modern design movement that shunned excessive ornament to present a look of refinement and elegance.",
    url: "https://chicagoarchitecturedata.com/static/images/building_images/1911-n-western-avenue-1462741534.jpg.800x800_q85_upscale.jpg",
    photoCredit: "John Morris"
  },
  ArtDecoModerne: {
    style: "Art Deco/Moderne",
    description: "Similar to Art Deco, a modernist design that emphasized long horizontal lines, simplicity, rounded corners, and a futuristic feel.",
    url: "https://chicagoarchitecturedata.com/static/images/style_images/art-moderne-1411936832.jpg.600x400_q85_upscale.jpg",
    photoCredit: "John Morris"
  },
  ArtNoveau: {
    style: "Art-Noveau",
    "description": "A modernistic design that served as a precursor to Art Deco. It was a reaction against precise and strictly ordained geometry and emphasis on classical elements. The style represented an experimentation with curved elements, artistic interpretation of everyday elements, and a futuristic look.",
    "url": "https://chicagoarchitecturedata.com/static/images/building_images/1439-w-18th-street-1416700518.jpg.800x800_q85_upscale.jpg",
    "photoCredit": "John Morris"
  },
  Baroque: {
    style: "Baroque"
  },
  Byzantine: {
    style: "Byzantine"
  },
  Celtic: {
    style: "Celtic"
  },
  ChicagoCommercial: {
    style: "Chicago Commercial"
  },
  ChicagoSchool: {
    style: "Chicago School",
    "description": "A broad group of buildings which can be of different architectural styles, built between the 1880s and 1890s. They were typically constructed of steel frame with exterior masonry.",
    "url": "https://chicagoarchitecturedata.com/static/images/building_images/400-e-43rd-street-1413426014.jpg.800x800_q85_upscale.jpg",
    "photoCredit": "John Morris"
  },
  Classical: {
    style: "Classical",
    "description": "Also called Neoclassical or Classical Revival, it's a style based on the architecture of ancient Greece and Rome. Commonly used for churches, schools, and other public buildings during the late 19th and early 20th centuries.",
    "url": "https://chicagoarchitecturedata.com/static/images/building_images/2869-w-cermak-road-1447379539.jpg.800x800_q85_upscale.jpg",
    "photoCredit": "John Morris"
  },
  ClassicalAdamesque: {
    style: "Classical (Adamesque)"
  },
  ClassicalBaroque: {
    style: "Classical (Baroque)"
  },
  ClassicalRenaissance: {
    style: "Classical (Renaissance)"
  },
  ColonialRevival: {
    style: "Colonial Revival"
  },
  Craftsman: {
    style: "Craftsman",
    description: "A style influenced by the bungalow and the Arts and Crafts movement. It has informal floor plans, is usually asymmetrical, and embraced craftsman, honesty in materials, and restrained design. It is often viewed as a reaction to the eccentrically designed Victorian-era styles.",
    url: "https://chicagoarchitecturedata.com/static/images/building_images/319-e-55th-street-1410220223.jpg.800x800_q85_upscale.jpg",
    photoCredit: "John Morris"
  },
  Gothic: {
    style: "Gothic",
    description: "A style influenced by the rising interest in medieval churches of France and Germany, it emphasizes verticality, tall and narrow forms, and decorative ornament.",
    url: "https://chicagoarchitecturedata.com/static/images/building_images/35-w-kinzie-street-1419914142.jpg.800x800_q85_upscale.jpg",
    photoCredit: "John Morris"
  },
  HomesteadHouse: {
    style: "Homestead House"
  },
  Islamic: {
    style: "Islamic"
  },
  Italianate: {
    style: "Italianate",
    description: "A style influenced by Italian villas, Italianate was one of the most popular styles of the Victorian era. It emphasizes verticality, symmetry, and a stately appearance. Usually features large cornice bracketing, and often has curved windowe and stone trim with floral patterns.",
    url: "https://chicagoarchitecturedata.com/static/images/building_images/1249-w-18th-street-1416701813.jpg.800x800_q85_upscale.jpg",
    photoCredit: "John Morris"
  },
  Medieval: {
    style: "Medieval"
  },
  MiddleEastern: {
    style: "Middle Eastern"
  },
  Modern: {
    style: "Modern"
  },
  NeoGrec: {
    style: "Neo-Grec"
  },
  Prarie: {
    style: "Prairie",
    description: "As the name suggests, the Prairie School of architecture originated in the midwest. It is often characterized by flowing horizontal lines and quality and craftsmanship in materials. In part a reaction to disdain for the near total Classical and European styles of the 1893 World's Columbian Exposition, many architects wanted a more organic and American architectural style. It shares many similarities with the Arts and Crafts movement, emphasizing quality handmade materials and not mass produced materials.",
    url: "https://chicagoarchitecturedata.com/static/images/building_images/5757-s-woodlawn-avenue-1418149511.jpg.800x800_q85_upscale.jpg",
    photoCredit: "John Morris"
  },
  QueenAnne: {
    style: "Queen Anne",
    description: "A loosely defined style type, applied broadly to a range of architecture at tail end of the Victorian Era. It is often characterized by eccentric ornament, an asymmetrical layout and footprint, and generally emphasized proportions and trim.",
    url: "https://chicagoarchitecturedata.com/static/images/building_images/2228-n-kedzie-boulevard-1420398479.jpg.800x800_q85_upscale.jpg",
    photoCredit: "John Morris"
  },
  Renaissance: {
    style: "Renaissance"
  },
  Romanesque: {
    style: "Romanesque",
    description: "Style in which buildings and houses consist of tall windows, short columns, and semi-circular angles. Usually features a large front pediment and built from stone or brick.",
    url: "https://chicagoarchitecturedata.com/static/images/building_images/1215-w-18th-street-1416198195.jpg.800x800_q85_upscale.jpg",
    photoCredit: "John Morris"
  },
  SecondEmpire: {
    style: "Second Empire",
    description: "A Victorian-era style that gained popularity during the Second French Empire. The American and Chicago version features traits often seen in other Victorian styles (Italianate and Queen Anne). The most notable distinction is that Second Empire buildings almost always have a mansard roof, and they are usually symmetrical.",
    url: "https://chicagoarchitecturedata.com/static/images/building_images/1501-w-18th-street-1416700121.jpg.800x800_q85_upscale.jpg",
    photoCredit: "John Morris"
  },
  ShingleStyle: {
    style: "Shingle Style"
  },
  SpanishBaroque: {
    style: "Spanish Baroque"
  },
  SpanishRevival: {
    style: "Spanish Revival",
    description: "Popularized in the early 20th century, it shares many traits with Moorish, Romanesque, and Colonial Revival styles. Typically features a terra cotta or clay exterior, with intricately designed ornament, twisted columns, and bas-relief portraits of important figures.",
    url: "https://chicagoarchitecturedata.com/static/images/building_images/100-n-central-park-drive-1446941336.jpg.800x800_q85_upscale.jpg",
    photoCredit: "John Morris"
  },
  Sullivanesque: {
    style: "Sullivanesque",
    description: "A subgroup of the�Prairie Style, the�Sullivanesque�style is named for one of the most important figures in architecture,�Louis Sullivan. The Sullivanesque Style is typically identified by a lack of historical ornament, a low-pitched or flat roof, and geometric forms and shapes. Sullivanesque ornamentation is circular and floral, whereas the other subgroups of the Prairie Style, particularly practiced by Frank Lloyd Wright, are angular and linear in nature.",
    url: "https://chicagoarchitecturedata.com/static/images/building_images/40-e-55th-street-1410219898.jpg.800x800_q85_upscale.jpg",
    photoCredit: "John Morris"
  },
  Tudor: {
    style: "Tudor"
  },
  WorkmansCottage: {
    style: "Workman's Cottage"
  }
}


  function updateStyleDetails(attributeValue) {
    // console.log(styleData);
    // console.log(attributeValue);
    if (attributeValue == 'all') { //if filter set to all
      var styleCard = $('.card-title').text('A map of interesting buildings in Chicago') //keep card title the same as opening page
    } else { //if any other selection is made on the style filter dropdown
      $('.card-title').text(attributeValue) //change the card title text to that attribute, or the style shown on map
    }

    //loop through each style in styleData
    for (var style in styleData) {
      if (attributeValue == 'all') { //if filter set to all
        $('.card-img-top').attr('src','/images/bridgeport-banner.jpg') //keep card image the same as opening page
        $('.card-subtitle').text('') //keep style details blank
      } else if (attributeValue == styleData[style].style) { //if any other selection made that matches a style in styleData
        $('.card-img-top').attr('src', styleData[style].url) //update card image to representative image for selected style
        $('.card-subtitle').text(styleData[style].description) //update style details to details for selected style
        }
    }
  }

})();
