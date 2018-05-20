pmb_im.services.factory('ConfigService', ['$http', function($http) {

  var ConfigObj = {};
  ConfigObj.baseURL = "http://dr_v2_backend.development.datauy.org";
  ConfigObj.publicURL = "/sites/default/files/";
  return ConfigObj;

}]);
