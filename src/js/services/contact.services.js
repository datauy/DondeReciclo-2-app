pmb_im.services.factory('ContactService', ['$http', 'ConfigService', function($http, ConfigService) {

  var baseURL = ConfigService.baseURL + "/datauy/contact/";

  return {
    send_contact: function (name, email, subject, message) {
      return $http.get(baseURL + name + "/" + email + "/" + subject + "/" + message, { params: { } });
    }

  };
}]);
