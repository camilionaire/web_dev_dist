function initMap() {
  const bounds = new google.maps.LatLngBounds();
  const markersArray = [];
  const map = new google.maps.Map(document.getElementById("map"), {
    // center: { lat: 45.56, lng: -122.66 }, // pdx
    center: origin1,
    zoom: 10,
  });
  // initialize services
  const geocoder = new google.maps.Geocoder();
  const service = new google.maps.DistanceMatrixService();
  searchServ = new google.maps.places.PlacesService(map);
  const doSearch = document.getElementById("search_button");

  doSearch.onclick = function () {
    alert("BUTTON CLICKED!!!!");
  };
  // build request
  const qRequest = {
    query: "ice cream",
    fields: ["name", "geometry", "formatted_adress"],
  };

  const searchArray = [];
  searchServ.findPlaceFromQuery(qRequest, (results, status) => {
    if (status == google.maps.places.PlacesService.OK && results) {
      for (let i = 0; i < results.length; i++) {
        // createMarker(results[i]);
        searchArray.push(results[i].geometry.location);
      }
      // map.setCenter(results[0].geometry.location);
      map.setCenter(origin1);
    }
  });

  const origin1 = { lat: 45.56373, lng: -122.66293 }; // my house
  const destinationA = "1615 NE Killingsworth St, Portland, OR 97211";
  const destinationB = "2035 NE Alberta St, Portland, OR 97211";
  const request = {
    origins: [origin1], // took out , origin2
    // destinations: [destinationA, destinationB],
    destinations: searchArray,
    travelMode: google.maps.TravelMode.WALKING, // chang from DRIVING
    unitSystem: google.maps.UnitSystem.IMPERIAL, // ch from METRIC
    avoidHighways: false,
    avoidTolls: false,
  };

  // put request on page
  document.getElementById("request").innerText = JSON.stringify(
    request,
    null,
    2
  );
  // get distance matrix response
  service.getDistanceMatrix(request).then((response) => {
    // put response
    document.getElementById("response").innerText = JSON.stringify(
      response,
      null,
      2
    );

    // show on map
    const originList = response.originAddresses;
    const destinationList = response.destinationAddresses;

    deleteMarkers(markersArray);

    const showGeocodedAddressOnMap = (asDestination) => {
      const handler = ({ results }) => {
        map.fitBounds(bounds.extend(results[0].geometry.location));
        markersArray.push(
          new google.maps.Marker({
            map,
            position: results[0].geometry.location,
            label: asDestination ? "D" : "O",
          })
        );
      };
      return handler;
    };

    for (let i = 0; i < originList.length; i++) {
      const results = response.rows[i].elements;

      geocoder
        .geocode({ address: originList[i] })
        .then(showGeocodedAddressOnMap(false));

      for (let j = 0; j < results.length; j++) {
        geocoder
          .geocode({ address: destinationList[j] })
          .then(showGeocodedAddressOnMap(true));
      }
    }
  });
}

function deleteMarkers(markersArray) {
  for (let i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(null);
  }

  markersArray = [];
}

window.initMap = initMap;
