pmb_im.services.factory('NewsService', ['$http', 'ConfigService', function($http, ConfigService) {

  var baseURL = ConfigService.baseURL + "/datauy/news";

  return {
    all: function () {
      return $http.get(baseURL, { params: {}})
    }
  };
}]);
