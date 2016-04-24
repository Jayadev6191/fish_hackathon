angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope,$ionicPlatform,$cordovaGeolocation,$timeout, $ionicLoading) {
  $ionicPlatform.ready(function() {
    $scope.currentState = $("#states").val();
    console.log($scope.currentState);

    $("#states").on('change',function(){
        $scope.currentState = this.value;
    });

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


                          var mapOptions = {
                              center: latLng,
                              zoom: 8,
                              mapTypeId: google.maps.MapTypeId.ROADMAP
                          };

                          var image = "../img/asian_carp.png";

                          $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

                          var marker = new google.maps.Marker({
                            position: latLng,
                            map: $scope.map,
                            title: 'You are here!',
                            animation: google.maps.Animation.DROP,
                            draggable: true
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

            // deferred.resolve(coordinates);
            });
    }

    var posOptions = {timeout: 10000, enableHighAccuracy: false};
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
