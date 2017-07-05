pmb_im.services.factory('ResiduosService', ['$http','ConfigService', function($http, ConfigService) {

  var baseURL = ConfigService.baseURL + "/datauy/get_residuos_json/";

  return {
    getByStr: function (str) {
      return $http.get(baseURL + str, { params: { } });
    }
  };
}]);
