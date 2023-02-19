function initMap() {
  var searchArray = [];
  const bounds = new google.maps.LatLngBounds();
  const markersArray = [];
  const origin1 = { lat: 45.56373, lng: -122.66293 }; // my house
  const map = new google.maps.Map(document.getElementById("map"), {
    // center: { lat: 45.56, lng: -122.66 }, // pdx
    center: origin1,
    zoom: 10,
  });
  // initialize services
  const geocoder = new google.maps.Geocoder();
  const service = new google.maps.DistanceMatrixService();
  var searchServ = new google.maps.places.PlacesService(map);
  const doSearch = document.getElementById("search_button");

  doSearch.onclick = function () {
    alert("BUTTON CLICKED!!!!");
    console.log("button clicked");
  };
  // build request
  const qRequest = {
    location: origin1,
    radius: "1600",
    type: ["park"],
  };
  // const qRequest = {
  //   query: "ice cream",
  //   fields: ["name", "geometry", "formatted_address"],
  //   locationBias: { radius: 2000, center: origin1 },
  // };

  // searchServ.nearbySearch(qRequest, callback); // could have function callback

  searchServ.nearbySearch(qRequest, (results, status) => {
    console.log("did a search somewhere's...");
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      let n = Math.min(10, results.length);
      console.log(n);
      for (let i = 0; i < n; i++) {
        // createMarker(results[i]);
        console.log("hello there");
        searchArray.push(results[i].geometry.location);
      }
      // map.setCenter(results[0].geometry.location);
      map.setCenter(origin1);
    } else {
      console.log("SOMETHING WENT HORRIBLY WRONG!!!");
    }
    // const destinationA = "2035 NE Alberta St, Portland, OR 97211";
    // const destinationB = "1615 NE Killingsworth St, Portland, OR 97211";
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
      // document.getElementById("response").innerText = JSON.stringify(
      //   response,
      //   null,
      //   2
      // );

      // show on map
      const originList = response.originAddresses;
      const destinationList = response.destinationAddresses;
      const distances = response.rows[0].elements;
      var aString = "";
      for (let i = 0; i < destinationList.length; ++i) {
        aString += destinationList[i] + "\n";
      }
      var anotherString = "";
      for (let i = 0; i < distances.length; ++i) {
        anotherString +=
          "text (imp):" +
          distances[i].distance.text +
          "\tfeet (val):" +
          distances[i].distance.value +
          "\n";
      }
      document.getElementById("response").innerText =
        "\n looked for: \n" +
        JSON.stringify(qRequest, null, 2) +
        "\noriginAddresses:  \n" +
        response.originAddresses[0] +
        "\n" +
        "\ndestinationAddresses:" +
        "\n" +
        aString +
        "\nall the distances:\n" +
        anotherString;

      deleteMarkers(markersArray);

      const showGeocodedAddressOnMap = (asDestination, i) => {
        const handler = ({ results }) => {
          map.fitBounds(bounds.extend(results[0].geometry.location));
          markersArray.push(
            new google.maps.Marker({
              map,
              position: results[0].geometry.location,
              label: asDestination ? i.toString() : "O",
            })
          );
        };
        return handler;
      };

      for (let i = 0; i < originList.length; i++) {
        const results = response.rows[i].elements;

        geocoder
          .geocode({ address: originList[i] })
          .then(showGeocodedAddressOnMap(false, i + 1));

        for (let j = 0; j < results.length; j++) {
          geocoder
            .geocode({ address: destinationList[j] })
            .then(showGeocodedAddressOnMap(true, j + 1));
        }
      }
    });
  });
}

function deleteMarkers(markersArray) {
  for (let i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(null);
  }

  markersArray = [];
}

window.initMap = initMap;
