pmb_im.services.factory('ProgramaService', ['$http', 'leafletData','ConfigService', function($http, leafletData, ConfigService) {

  var baseURL = ConfigService.baseURL + "/sites/default/files/json/programas.json";


  /**
   * Constructor, with class name
   */
  function Programa(_data) {
    angular.extend(this, _data);
  }

  Programa.getAll = function(){
    return $http.get(baseURL, { params: {}});
  }

  Programa.getById = function(id){
    var url = baseURL + id;
    return $http.get(url).then(function(result){
              return result;
    });
  }

    return Programa;

}]);
