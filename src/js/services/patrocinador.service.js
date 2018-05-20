pmb_im.services.factory('PatrocinadorService', ['$http', 'leafletData','ConfigService', function($http, leafletData, ConfigService) {

  var baseURL = ConfigService.baseURL + "/sites/default/files/json/patrocinadores.json";


  /**
   * Constructor, with class name
   */
  function Patrocinador(_data) {
    angular.extend(this, _data);
  }

  Patrocinador.getAll = function(){
    return $http.get(baseURL, { params: {}});
  }

  Patrocinador.getById = function(id){
    var url = baseURL + id;
    return $http.get(url).then(function(result){
              return result;
    });
  }

    return Patrocinador;

}]);
