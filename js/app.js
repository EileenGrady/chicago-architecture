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

  // $.getJSON((Papa.parse('data/chicago-architecture.csv', {
  //     download: true,
  //     header: true,
  //     complete: function(data) {
  //
  //     console.log('data: ', data);
  //     drawMap(data)
  //
  //     }
  //   })

    // use omnivore to load the CSV data
    omnivore.csv('data/chicago-architecture.csv')
      .on('ready', function(e) {
        drawMap(e.target.toGeoJSON());
      })
      .on('error', function(e) {
        console.log(e.error[0].message);
      })


  function drawMap(data) {

    // create Leaflet object with geometry data and add to map
    var dataLayer = L.geoJson(data, {
      // style: function(feature) {
      //   return {
      //     color: 'black',
      //     weight: 1,
      //     fillOpacity: 1,
      //     fillColor: '#1f78b4'
      //   };
      // }
    }).addTo(map);
  }


})();
