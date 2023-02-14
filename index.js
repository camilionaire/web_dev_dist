function initMap() {
  const bounds = new google.maps.LatLngBounds();
  const markersArray = [];
  const map = new google.maps.Map(document.getElementById("map"), {
    // center: { lat: 55.53, lng: 9.4 },
    center: { lat: 45.56, lng: -122.66 },
    zoom: 10,
  });
  // initialize services
  const geocoder = new google.maps.Geocoder();
  const service = new google.maps.DistanceMatrixService();
  const iSearch = "ice cream";
  // i dunno why this isn't working down below here...
  //   const searchBox = new google.maps.places.SearchBox(iSearch);
  const doSearch = document.getElementById("search_button");

  doSearch.onclick = function () {
    alert("BUTTON CLICKED!!!!");
  };
  // build request
  //   const origin1 = { lat: 55.93, lng: -3.118 };
  const origin1 = { lat: 45.56373, lng: -122.66293 };
  const destinationA = "1615 NE Killingsworth St, Portland, OR 97211";
  const destinationB = "2035 NE Alberta St, Portland, OR 97211";
  const request = {
    origins: [origin1], // took out , origin2
    destinations: [destinationA, destinationB],
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
