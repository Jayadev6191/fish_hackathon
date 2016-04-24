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


                          // });


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
