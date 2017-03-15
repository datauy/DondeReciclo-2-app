pmb_im.services.factory('ConfigService', ['$http', function($http) {

  var ConfigObj = {};
  ConfigObj.baseURL = "http://development.datauy.org/dondereciclo_app";

  return ConfigObj;

}]);
