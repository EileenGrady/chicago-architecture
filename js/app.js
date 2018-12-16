(function() {

  var map = L.map('map', {
    zoomSnap: .1,
    center: [41.862458, -87.635606],
    zoom: 11,
    zoomControl: false,
    minZoom: 9
  });

  //create new mapPane for labels
  map.createPane('labels');

  //set z-index of label pane higher than layer so will show above
  map.getPane('labels').style.zIndex = 650;
  //so label pane won't register clicks, therefore blocking any buildings underneath a user tries to click on
  map.getPane('labels').style.pointerEvents = 'none';

  // Adding Voyager Basemap
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png', {
    maxZoom: 18
  }).addTo(map);

  // Adding Voyager Labels
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png', {
    maxZoom: 18,
    pane: 'labels' //define which pane the labels is part of
  }).addTo(map);

  //create user interaction that finds user location on map when button is pressed
  //declare myLocation first as null
  var myLocation = null

  //select locate button, leaflet .locate function when button is pressed
  $('#locate-me').on('click', function() {
    map.locate({setView: true, maxZoom: 16});
  });

  //define icon to be used for user location
  var locationIcon = L.icon({
    iconUrl: "icons/marker-15.svg",
    iconSize: 30,
  });

  //bind popup at user location that says, "you are here"
  function onLocationFound(e) {
    //if button has already been pressed and a myLocation marker exists, remove it first
    if (myLocation != null) {
      map.removeLayer(myLocation)
    }
    //then add a new marker showing current user location and "you are here" popup
    myLocation = L.marker(e.latlng, {
      icon: locationIcon
    }).addTo(map).bindPopup("<p><strong>You are here.</strong></p>",{offset: new L.Point(0, -8)}).openPopup(); //add offset to have popup appear directly above marker
  }

  //move map to the location found when button is clicked
  map.on('locationfound', onLocationFound);

  // use omnivore to load the CSV data
  omnivore.csv('data/chicago-architecture.csv')
    .on('ready', function(e) {
      drawMap(e.target.toGeoJSON());
    })
    .on('error', function(e) {
      console.log(e.error[0].message);
    })

  //create empty array to hold values for dropdown filter options
  var styles =[]

  //declare empty LayerGroup that will hold temporary layers to be removed during style filter
  var tempLayers = L.layerGroup();

  //define icon to use for buildings
  var buildingIcon = L.icon({
    iconUrl: "icons/building-alt1-15.svg",
    iconSize: 15,
    tooltipAnchor: [0, -15] // Center of your icon is [0,0]
  });

  //define icon to use during mouseover event for user affordance
  var hoverIcon = L.icon({
    iconUrl: "icons/building-hover.svg",
    iconSize: 15,
    tooltipAnchor: [0, -15] // Center of your icon is [0,0]
  });

  function drawMap(data) {
    // create Leaflet object and add to map
    var buildingLayer = L.geoJson(data, {

      // pointToLayer: function(feature, latlng) {
      //   return L.marker(latlng, {
      //     icon:buildingIcon
      //   });
      // },

      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          // opacity: 1,
          weight: 1,
          radius: 6,
          // color: getColor(feature.properties.Style),
          color: "#737373",
          fillColor: getColor(feature.properties.Style),
          fillOpacity: .7
        })
      },

      onEachFeature: function(feature, layer) {

        //change icon color when mouseover
        layer.on('mouseover', function() {
          // layer.setIcon(hoverIcon);
          layer.setStyle({
            color: "#66ffff",
            fillColor: "#66ffff"
          })
        });

        //change icon color back when mouseout
        layer.on('mouseout', function () {
          // layer.setIcon(buildingIcon);
          layer.setStyle({
            // color: getColor(feature.properties.Style),
            color: "#737373",
            fillColor: getColor(feature.properties.Style)
          })
        });

        var props = feature.properties

        //empty string to hold popup info
        var popup = ""

        //if building has a name, use that as popup header, then append address to next line
        if (props.buildingName) {
          popup += "<h1>" + props.buildingName + "</h1><p>" + props.Address + "</p>"
          //if building does not have name, use address as popupheader
        } else {
            popup += "<h1>" + props.Address + "</h1>"
        }

        //append building style to popup
        popup += "<p>Style: " + props.Style + "</p>"

        //if building has an architect listed, append to popup
        if (props.architect) {
          popup += "<p>Designed by " + props.architect + "</p>"
        }

        //if building has year built listed, append to popup
        if (props.yearBuilt) {
          popup += "<p>Built in " + props.yearBuilt + "</p>"
        }

        //if building had buidling type listed, append to popup
        if (props.buildingType) {
          popup += "<p>Building Type: " + props.buildingType + "</p>"
        }

        //append building photo (linked to accompanying page for building on chicagoarchitecturedata.com) and photo credit to popup
        popup +=
        "<a href = ' " +
        props.webLink +
        " ' target = '_blank'>" +
        "<img class = popup src=' " +
        props.imageLink +
        "'></a><h6>Photo Credit: " +
        "<a href = ' " +
        props.photoCreditLink +
        " ' target = '_blank'>" +
        props.photoCredit +
        "</h6>"

  			// bind popup to layer
  			layer.bindPopup(popup, {
          keepInView: true //pans map to show full popup if extends past screen
  			});

        //if array for style filter doesn't already have style from a building in it, add to array
        if (!styles.includes(props.Style)) styles.push(props.Style)
        styles.sort();

      }

    }).addTo(map);

    map.fitBounds(buildingLayer.getBounds()); //fit map bounds to buildingLayer extent
    map.setZoom(map.getZoom() - .1); //zoom back out a bit to capture entirety of icons

    drawLegend();

    addStyleFilter(data, buildingLayer);
  }

  function getColor(style) {
    if (style == 'Gothic' || style == 'Tudor' || style == 'Eastlake' || style == 'Queen Anne' || style == 'Second Empire') {
      return "#66c2a5"
    } else if (style == 'Italianate' || style == 'Classical' || style == 'Romanesque' || style == 'Second Renaissance Revival' || style == 'Neo-Grec') {
      return "#fc8d62"
    } else if (style == "Prairie" || style == "Craftsman" || style == "Bungalow") {
      return "#8da0cb"
    } else if (style == 'Chicago School' || style == 'Sullivanesque') {
      return "#e78ac3"
    } else if (style == 'Art Deco' || style == 'Art Deco/Moderne' || style == 'Modern') {
      return "#a6d854"
    } else if (style == 'Unclassified Style') {
      return "#ffd92f"
    }
  }

  var styleGroups = {
    VictorianStyle: {
      group: "Victorian Styles",
      styles: "Gothic, Tudor, Queen Anne, Eastlake, Second Empire",
      color: "#66c2a5"
    },
    ClassicStyle: {
      group: "Classic Styles",
      styles: "Italianate, Classical, Romanesque, Second Renaissance Revival, Neo-Grec",
      color: "#fc8d62"
    },
    ArtsAndCrafts: {
      group: "Arts and Crafts",
      color: "#8da0cb"
    },
    Chicago: {
      group: "Chicago Styles",
      color: "#e78ac3"
    },
    Modernism: {
      group: "Modernism",
      styles: "Art Deco, Art Deco/Moderne, Modern",
      color: "#a6d854"
    },
    Unclassified: {
      group: "Unclassified Style",
      color: "#ffd92f"
    }
  }

  function drawLegend() {
    var legend = L.control({
      position: 'bottomright'
    });
    legend.onAdd = function() {
      var div = L.DomUtil.create('div', 'legend');
      div.innerHTML = "<h5>Buildings by Style Group</h5>";
      for (var style in styleGroups) {

        var color = styleGroups[style].color

        var group = styleGroups[style].group

        div.innerHTML +=
          '<span style="background:' + color + '"></span> ' +
          '<label>' + group + '</label><br>';
      }

      return div
    };
    legend.addTo(map);
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

    //assign click event to dropdown filter, call filterMap and updateStyleDetails when dropdown selection made
    $('.dropdown-menu a').click(function(e) {
      attributeValue = this.innerHTML;
      // console.log("selected attribute: ", attributeValue);
      filterMap(buildingLayer, attributeValue);
      updateStyleDetails(attributeValue)
    });
  }

  //define function that filters map based on style when dropdown selection made
  function filterMap(buildingLayer, attributeValue) {
    tempLayers.eachLayer(function(layer) {
      buildingLayer.addLayer(layer)
    });

    tempLayers.clearLayers()

    //if selection is anything other than all, if the feature's style is not the one selected, add it to tempLayers then remove from buildingLayer
    if (attributeValue != 'all') {
      buildingLayer.eachLayer(function (layer) {
        if(layer.feature.properties['Style'] != attributeValue) {
          tempLayers.addLayer(layer);
          buildingLayer.removeLayer(layer)
        }
      });
    };

    map.fitBounds(buildingLayer.getBounds()); //fit bounds of map to buildings of selected style
    map.setZoom(map.getZoom() - .4); //zoom out a bit to capture entirety of icons
  };

  //object that holds info used to update side panel
  var styleData = {
    AmericanFourSquare: {
      style: "American Four Square",
      description: "A simple and symmetrical reaction to ornate and decorative Victorian-era styles, often credited as evolving from the Prairie style pioneered by Frank Lloyd Wright. The American Four Square was a popular mail order style and kit home. They typically feature open floor plans, plenty of fireplaces, and a square and symmetrical shape. This style is always two stories tall.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/647-w-wellington-avenue-1417969718.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#8dd3c7"
    },
    ArtDeco: {
      style: "Art Deco",
      description: "Modern style with emphasis on stark and simple lines, bold colors and shapes, and motifs featuring geometric, floral, or animal designs. Art Deco was part of the modern design movement that shunned excessive ornament to present a look of refinement and elegance.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/1911-n-western-avenue-1462741534.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#ffffb3"
    },
    ArtDecoModerne: {
      style: "Art Deco/Moderne",
      description: "Similar to Art Deco, a modernist design that emphasized long horizontal lines, simplicity, rounded corners, and a futuristic feel.",
      url: "https://chicagoarchitecturedata.com/static/images/style_images/art-moderne-1411936832.jpg.600x400_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#bebada"
    },
    ArtNoveau: {
      style: "Art-Noveau",
      description: "A modernistic design that served as a precursor to Art Deco. It was a reaction against precise and strictly ordained geometry and emphasis on classical elements. The style represented an experimentation with curved elements, artistic interpretation of everyday elements, and a futuristic look.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/1439-w-18th-street-1416700518.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#fb8072"
    },
    Bungalow: {
      style: "Bungalow",
      description: "A single story detached house, typically featuring a hipped roof with dormer. Although many were frame built, most Chicago bungalows are constructed of brick, and frequently feature a large front porch or sunroom.",
      url: "https://chicagoarchitecturedata.com/static/images/assessor_images/13041130160000.jpg",
      photoCredit: "Cook County Assessor Photo",
      photoCreditLink: "http://www.cookcountyassessor.com/",
      color: "#80b1d3"
    },
    ChicagoSchool: {
      style: "Chicago School",
      description: "A broad group of buildings which can be of different architectural styles, built between the 1880s and 1890s. They were typically constructed of steel frame with exterior masonry.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/400-e-43rd-street-1413426014.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#fdb462"
    },
    Classical: {
      style: "Classical",
      description: "Also called Neoclassical or Classical Revival, it's a style based on the architecture of ancient Greece and Rome. Commonly used for churches, schools, and other public buildings during the late 19th and early 20th centuries.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/2869-w-cermak-road-1447379539.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#b3de69"
    },
    Craftsman: {
      style: "Craftsman",
      description: "A style influenced by the bungalow and the Arts and Crafts movement. It has informal floor plans, is usually asymmetrical, and embraced craftsman, honesty in materials, and restrained design. It is often viewed as a reaction to the eccentrically designed Victorian-era styles.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/319-e-55th-street-1410220223.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#fccde5"
    },
    Eastlake: {
      style: "Eastlake",
      description: "Also known as the Stick Style, this form of building features elaborate woodwork and ornament. It was named after Charles Eastlake, an architect who advocated the use of wooden decoration and trim.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/921-w-armitage-avenue-1414213067.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#d9d9d9"
    },
    Egyptian: {
      style: "Egyptian",
      description: "Often considered a branch of the Art Deco style, the arrival of Egyptian Revival architecture in the early 20th century was a result of the 1922 discovery of Tutankhamun's tomb. Because most building projects across Chicago and the nation came to a halt after the Wall Street Crash of 1929, its popularity lasted only a few years, and there aren't many surviving buildings in this style.",
      url: "https://chicagoarchitecturedata.com/static/images/style_images/egyptian-1416072813.jpg.600x400_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#bc80bd"
    },
    Gothic: {
      style: "Gothic",
      description: "A style influenced by the rising interest in medieval churches of France and Germany, it emphasizes verticality, tall and narrow forms, and decorative ornament.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/35-w-kinzie-street-1419914142.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#ccebc5"
    },
    Italianate: {
      style: "Italianate",
      description: "A style influenced by Italian villas, Italianate was one of the most popular styles of the Victorian era. It emphasizes verticality, symmetry, and a stately appearance. Usually features large cornice bracketing, and often has curved window and stone trim with floral patterns.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/1249-w-18th-street-1416701813.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#ffed6f"
    },
    Modern: {
      style: "Modern",
      description: "Emerging in the first half of the 20th century, modern architecture was guided by the idea that form should follow function. The style rejected ornament in favor of minimalism, and embraced innovative building materials of the time including glass, steel, and reinforced concrete.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/1634-w-polk-street-1447725744.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#ffed6f"
    },
    NeoGrec: {
      style: "Neo-Grec",
      description: "A Neoclassical revival style of the mid-to-late 19th century. This style aligns with the American Renaissance, a period characterized by renewed national self-confidence. ",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/3325-s-giles-avenue-1413257433.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#ffed6f"
    },
    Prarie: {
      style: "Prairie",
      description: "The Prairie School of architecture originated in the Midwest and is often characterized by flowing horizontal lines, and quality materials. Partly a reaction to disdain for the Classical and European styles of the 1893 World's Columbian Exposition, many architects wanted a more organic and American architectural style. It shares many similarities with the Arts and Crafts movement, emphasizing quality handmade materials over mass produced materials.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/5757-s-woodlawn-avenue-1418149511.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#ffed6f"
    },
    QueenAnne: {
      style: "Queen Anne",
      description: "A loosely defined style type, applied broadly to a range of architecture at tail end of the Victorian Era. It is often characterized by eccentric ornament, an asymmetrical layout and footprint, and generally emphasized proportions and trim.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/2228-n-kedzie-boulevard-1420398479.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#ffed6f"
    },
    Romanesque: {
      style: "Romanesque",
      description: "Style in which buildings and houses consist of tall windows, short columns, and semi-circular angles. Usually features a large front pediment and built from stone or brick.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/1215-w-18th-street-1416198195.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#ffed6f"
    },
    SecondEmpire: {
      style: "Second Empire",
      description: "A Victorian-era style that gained popularity during the Second French Empire. The American and Chicago version features traits often seen in other Victorian styles (Italianate and Queen Anne). The most notable distinction is that Second Empire buildings almost always have a mansard roof, and they are usually symmetrical.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/1501-w-18th-street-1416700121.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#ffed6f"
    },
    SecondRenaissanceRevival: {
      style: "Second Renaissance Revival",
      description: "Second Renaissance Revival is similar to Greco-Roman classical styles with columns, round arches, and decorative cornice. Usually each floor uniquely decorated.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/2342-n-kedzie-boulevard-1416692301.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#ffed6f"
    },
    SpanishRevival: {
      style: "Spanish Revival",
      description: "Popularized in the early 20th century, it shares many traits with Moorish, Romanesque, and Colonial Revival styles. Typically features a terra cotta or clay exterior, with intricately designed ornament, twisted columns, and bas-relief portraits of important figures.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/100-n-central-park-drive-1446941336.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#ffed6f"
    },
    Sullivanesque: {
      style: "Sullivanesque",
      description: "A subgroup of the Prairie Style, the Sullivanesque style is named for an important figure in archictecture, Louis Sullivan. This style is typically identified by a lack of historical ornament, a low-pitched or flat roof, and geometric forms and shapes. Sullivanesque ornamentation is circular and floral, whereas the other subgroups of the Prairie Style, particularly practiced by Frank Lloyd Wright, are angular and linear in nature.",
      url: "https://chicagoarchitecturedata.com/static/images/building_images/40-e-55th-street-1410219898.jpg.800x800_q85_upscale.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#ffed6f"
    },
    Tudor: {
      style: "Tudor",
      description: "This style was very popular in the US in the early 1900s and is based on buildings built during the Tudor dynasty. Made of brick or stone and embellished with decorative half-timbering, these buildings often feature steep gabled roofs and elaborate chimneys.",
      url: "https://chicagoarchitecturedata.com/static/images/assessor_images/13024200380000.jpg",
      photoCredit: "Cook County Assessor Photo",
      photoCreditLink: "http://www.cookcountyassessor.com/",
      color: "#ffed6f"
    },
    uncategorized: {
      style: "Unclassified Style",
      description: "These buildings are currently unclassified.",
      url: "/images/bridgeport-banner.jpg",
      photoCredit: "John Morris",
      photoCreditLink: "http://john-morris.com/",
      color: "#ffed6f"
    }
  }

  //create clone of side panel to be used to revert side panel back to default if user selects all from style filter dropdown
  var defaultClone = $('#style-card').clone();

  function updateStyleDetails(attributeValue) {
    //if filter set to all, revert side panel back to default
    if (attributeValue == 'all') {
      $('#style-card').replaceWith(defaultClone);
    }
    //loop through each style in styleData
    for (var style in styleData) {
      if (attributeValue == styleData[style].style) { //if any other selection made that matches a style in styleData
        $('.card-img-top').attr('src', styleData[style].url) //update card image to representative image for selected style
        $('.photo-credit-link').attr('href', styleData[style].photoCreditLink)//update photoCredit link for representative image for selected style
        $('.photo-credit-link').text(styleData[style].photoCredit) //update photoCredit for representative image for selected style
        $('.card-title').text(styleData[style].style) //update card title with selected style
        $('.card-subtitle').text(styleData[style].description) //update style details to details for selected style
      }
    }
  }

})();
