angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $ionicPlatform, $cordovaGeolocation, $http) {
  $ionicPlatform.ready(function() {

    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        console.log(position);
        $scope.lat  = position.coords.latitude;
        $scope.long = position.coords.longitude;


        var latLng = new google.maps.LatLng($scope.lat, $scope.long);

        var mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

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

      }, function(err) {
        // error
      });
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
