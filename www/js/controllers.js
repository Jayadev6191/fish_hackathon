angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope,$ionicPlatform,$timeout, $ionicLoading,$http) {
  $ionicPlatform.ready(function() {
    $scope.currentState = $("#states").val();
    console.log($scope.currentState);

    $("#states").on('change',function(){
        $scope.currentState = this.value;
    });

    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    // Setup the loader
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

    $timeout(function () {
      $ionicLoading.hide();
    }, 4000);


    if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position){
            var coordinates={
              "latitude": position.coords.latitude,
              "longitude": position.coords.longitude
            };
            console.log(coordinates);

            var geocoder = new google.maps.Geocoder();
            var latLng = new google.maps.LatLng(coordinates.latitude, coordinates.longitude);

            geocoder.geocode({'latLng': latLng},function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                      if (results[0]) {
                          var add= results[0].formatted_address ;
                          var value=add.split(",");
                          count=value.length;
                          state=value[count-2].substring(1,3);
                          console.log(state);

                          $('#states option[value='+state+']').prop('selected', true);

                          // var image = "../img/fishpin_minimally_suitable.png";

                          // var icon = {
                          //     url: "../img/fishpin_minimally_suitable.png", // url
                          //     scaledSize: new google.maps.Size(50, 50), // scaled size
                          //     origin: new google.maps.Point(0,0), // origin
                          //     anchor: new google.maps.Point(0, 0) // anchor
                          // };
                          console.log(latLng);
                          var mapOptions = {
                              center: latLng,
                              zoom: 4,
                              mapTypeId: google.maps.MapTypeId.ROADMAP
                          };

                          $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

                          var marker = new google.maps.Marker({
                            position: latLng,
                            map: $scope.map,
                            title: 'You are here!',
                            animation: google.maps.Animation.DROP,
                            draggable: true
                          });

                          $http.get("../data/final.json").then(function(result){
                              console.log(result.data);
                              for(var i=0;i<result.data.length;i++){
                                $scope.dropPin(result.data[i]);
                              }
                          });

                          $scope.dropPin = function(pinData){
                            console.log(pinData);
                            var latLng = new google.maps.LatLng(pinData.latitude, pinData.longitude);
                            var pin;
                            switch(pinData.suitability.toLowerCase()) {
                                case 'minimally suitable':
                                    pin = {
                                          url: "../img/fishpin_minimally_suitable.png", // url
                                          scaledSize: new google.maps.Size(50, 50), // scaled size
                                          origin: new google.maps.Point(0,0), // origin
                                          anchor: new google.maps.Point(0, 0) // anchor
                                    };
                                    break;
                                case 'very suitable':
                                    pin = {
                                          url: "../img/fishpin_very_suitable.png", // url
                                          scaledSize: new google.maps.Size(50, 50), // scaled size
                                          origin: new google.maps.Point(0,0), // origin
                                          anchor: new google.maps.Point(0, 0) // anchor
                                    };
                                    break;
                                case 'suitable':
                                    pin = {
                                          url: '../img/fishpin_suitable.png', // url
                                          scaledSize: new google.maps.Size(50, 50), // scaled size
                                          origin: new google.maps.Point(0,0), // origin
                                          anchor: new google.maps.Point(0, 0) // anchor
                                    };
                                    break;
                                case 'highly suitable':
                                    pin = {
                                          url: '../img/fishpin_highly_suitable.png', // url
                                          scaledSize: new google.maps.Size(50, 50), // scaled size
                                          origin: new google.maps.Point(0,0), // origin
                                          anchor: new google.maps.Point(0, 0) // anchor
                                    };
                                    break;
                                case 'highly suitable':
                                    pin = {
                                          url: '../img/fishpin_not_suitable.png', // url
                                          scaledSize: new google.maps.Size(50, 50), // scaled size
                                          origin: new google.maps.Point(0,0), // origin
                                          anchor: new google.maps.Point(0, 0) // anchor
                                    };
                                    break;
                                default:
                                    break;
                            }
                            var fishPin = new google.maps.Marker({
                              position: latLng,
                              map: $scope.map,
                              animation: google.maps.Animation.DROP,
                              draggable: false,
                              icon:pin
                            });
                          }

                          // $http.get("http://waterservices.usgs.gov/nwis/iv/?format=json&bBox=-89.118042,40.954649,-85.536499,42.423102&startDT=2016-01-01T00:00-0700&endDT=2016-04-23T01:00-0700&parameterCd=00060,00010&siteType=LK,ST&siteStatus=active").then(function(data){
                          //   console.log(data);

                          $http.get("http://waterservices.usgs.gov/nwis/iv/?format=json&bBox=-89.118042,40.954649,-85.536499,42.423102&parameterCd=00060,00010&siteType=LK,ST&siteStatus=active").then(function(data){
                              var timeSeriesArray = data.data.value.timeSeries;
                              var usgsSiteCandidates = {};
                              var viableUsgsSiteCodes = [];

                              for (var i=0; i<timeSeriesArray.length; i++){
                                if (!usgsSiteCandidates[timeSeriesArray[i].sourceInfo.siteName]) {
                                  usgsSiteCandidates[timeSeriesArray[i].sourceInfo.siteName] = [timeSeriesArray[i], {flow: false, temp: false}];
                                }
                                if (timeSeriesArray[i].variable.variableDescription === "Discharge, cubic feet per second") {
                                  usgsSiteCandidates[timeSeriesArray[i].sourceInfo.siteName][1].flow = true;
                                  if (usgsSiteCandidates[timeSeriesArray[i].sourceInfo.siteName][1].flow === true && usgsSiteCandidates[timeSeriesArray[i].sourceInfo.siteName][1].temp === true){
                                    viableUsgsSiteCodes.push(timeSeriesArray[i].sourceInfo.siteCode[0].value);
                                  }
                                }
                                else if (timeSeriesArray[i].variable.variableDescription ===  "Temperature, water, degrees Celsius") {
                                  usgsSiteCandidates[timeSeriesArray[i].sourceInfo.siteName][1].temp = true;
                                  if (usgsSiteCandidates[timeSeriesArray[i].sourceInfo.siteName][1].flow === true && usgsSiteCandidates[timeSeriesArray[i].sourceInfo.siteName][1].temp === true){
                                    viableUsgsSiteCodes.push(timeSeriesArray[i].sourceInfo.siteCode[0].value);
                                  }
                                }
                              } // end for loop
                              console.log(viableUsgsSiteCodes);

                              var obj = {"site_codes":viableUsgsSiteCodes};
                              console.log(JSON.stringify(obj));

                              var abc = {"name":"jay"};

                              $http.post('https://stark-headland-52611.herokuapp.com/getSiteData',JSON.stringify(abc)).then(function(data){
                                console.log(data);
                              });
                            }
                          );

                          // for(var i=0;i<arr.length;i++){
                          //   console.log(arr[i]);
                          //   // $http.get("")
                          // }

                          google.maps.event.addListener($scope.map, 'dragend', function(event) {
                              var new_coordinates = {
                                  "latitude":this.getCenter().lat(),
                                  "longitude": this.getCenter().lng()
                              };

                              console.log(new_coordinates);


                              // $http.get('https://floating-basin-31957.herokuapp.com/').then(function(data){
                              //   // console.log('test');
                              //   // console.log(data);
                              // });

                              // API Call to Dan's Service

                          });
                      }
                      else  {
                          alert("address not found");
                      }
              }
               else {
                  alert("Geocoder failed");
              }
            });

        var USGSUri = 'http://waterservices.usgs.gov/nwis/iv/?format=json&bBox=-83.000000,36.500000,-81.000000,38.500000&parameterCd=00010,00060'

        var determineSpawningSuitability = function(temp, flowSpike, gdd){
          var spawningSuitability = "Unknown";

          if (gdd < 650 || temp < 17) {
            spawningSuitability = "Not suitable";
          }
          else if (gdd < 900){
            if (flowSpike < .7){
              spawningSuitability = "Minimally suitable";
            }
            else if (flowSpike > .7){
              spawningSuitability = "Suitable";
            }
          }
          else if (gdd > 900){
            if (flowSpike < .7){
              spawningSuitability = "Very suitable";
            }
            else if (flowSpike > .7){
              spawningSuitability = "Highly suitable";
            }
          }
          return spawningSuitability;
        }

        var findSitesWithFlowAndTemp = function(measurementSites){

          var sitesWithValidFlowAndTemp = {};
          var sitesWithFlowAndTemp = {};
          for (var i=0; i < measurementSites.length; i++ ){
            var validTemp = false;
            var validFlow = false;
            var temp;
            var flow;

            if (!sitesWithFlowAndTemp[measurementSites[i].sourceInfo.siteName]){
              sitesWithFlowAndTemp[measurementSites[i].sourceInfo.siteName] = measurementSites[i];
            }
            else {
            // Check if either saved site or current site has valid temp
              if (sitesWithFlowAndTemp[measurementSites[i].sourceInfo.siteName].variable && sitesWithFlowAndTemp[measurementSites[i].sourceInfo.siteName].variable.variableName === "Temperature, water, &#176;C" && sitesWithFlowAndTemp[measurementSites[i].sourceInfo.siteName].values && sitesWithFlowAndTemp[measurementSites[i].sourceInfo.siteName].values[0].value && sitesWithFlowAndTemp[measurementSites[i].sourceInfo.siteName].values[0].value[0].value !== "-999999") {
                validTemp = true;
                temp = sitesWithFlowAndTemp[measurementSites[i].sourceInfo.siteName].values[0].value[0].value;
              }
              else if (measurementSites[i].variable.variableName === "Temperature, water, &#176;C" && measurementSites[i].values && measurementSites[i].values[0].value&& measurementSites[i].values[0].value[0].value !== "-999999") {
                validTemp = true;
                temp = measurementSites[i].values[0].value[0].value;
              }

              // Check if either saved site or current site has valid flow
              if (sitesWithFlowAndTemp[measurementSites[i].sourceInfo.siteName].variable.variableName === "Streamflow, ft&#179;/s" && sitesWithFlowAndTemp[measurementSites[i].sourceInfo.siteName].values && sitesWithFlowAndTemp[measurementSites[i].sourceInfo.siteName].values[0].value && sitesWithFlowAndTemp[measurementSites[i].sourceInfo.siteName].values[0].value[0].value !== "-999999") {
                validFlow = true;
                flow = sitesWithFlowAndTemp[measurementSites[i].sourceInfo.siteName].values[0].value[0].value;
              }
              else if (measurementSites[i].variable.variableName === "Streamflow, ft&#179;/s" && measurementSites[i].values && measurementSites[i].values[0].value && measurementSites[i].values[0].value[0].value !== "-999999") {
                validFlow = true;
                flow = measurementSites[i].values[0].value[0].value;
              }

            }

            if (validTemp === true && validFlow === true) {

              sitesWithValidFlowAndTemp[measurementSites[i].sourceInfo.siteName] = {temp: temp, flow: flow}
            }
          } // end for loop
          // console.log("SITES WITH F/T:" + JSON.stringify(sitesWithValidFlowAndTemp))



        }

        var getUSGSData = function(){
          $http.get(USGSUri).then(function(response){
            USGSMeasurementSites = response.data.value.timeSeries;
            console.log(USGSMeasurementSites);

            findSitesWithFlowAndTemp(USGSMeasurementSites);

          }, function(error){
            console.log("ERROR: " + error)
          });
        }

        getUSGSData();
            });
    }

    });

})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
