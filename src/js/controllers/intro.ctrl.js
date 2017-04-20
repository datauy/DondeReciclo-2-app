pmb_im.controllers.controller('IntroCtrl', ['$scope', '$state',
  '$cordovaGeolocation',
  '$stateParams',
  '$ionicPlatform',
  '$ionicPopup',
  'LocationsService',
  'DBService',
  function($scope, $state, $cordovaGeolocation, $stateParams, $ionicPlatform, $ionicPopup, LocationsService, DBService) {

  var db = DBService.initDB();
  db.info().then(console.log.bind(console));

  $scope.geolocate = function() {
      var located = false;
      /*setTimeout(function(){
        if(!located){
          $state.go("app.map");
        }
      }, 4000);*/
      ionic.Platform.ready(function() {
        var device = ionic.Platform.device();
        //alert(device.platform);
        var posOptions = {timeout: 3500, enableHighAccuracy: true, maximumAge:60000};
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
            //alert("salio por el true");
            located = true;
            LocationsService.save_initial_position(position);
            $state.go("app.map");
          }, function(err) {
            // error
            //alert("salio por el error");
            $state.go("app.map");
          });
      });

    };

   $scope.$on('$ionicView.enter', function(){ //This is fired twice in a row
       $scope.geolocate();
   });

  }
]);
