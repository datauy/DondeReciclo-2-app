pmb_im.services.factory('ConfigService', ['$http', function($http) {

  var ConfigObj = {};
  ConfigObj.baseURL = "http://dondereciclo.development.datauy.org";

  return ConfigObj;

}]);
