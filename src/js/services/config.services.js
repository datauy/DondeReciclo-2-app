pmb_im.services.factory('ConfigService', ['$http', function($http) {

  var ConfigObj = {};
  ConfigObj.baseURL = "http://dondereciclo.datauy.org";

  return ConfigObj;

}]);
