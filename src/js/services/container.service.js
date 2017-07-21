pmb_im.services.factory('ContainerService', ['$http', 'leafletData','ConfigService', function($http, leafletData, ConfigService) {

  var baseURL = ConfigService.baseURL + "/datauy/get_containers_json/" + "all";


  /**
   * Constructor, with class name
   */
  function Container(_data) {
    angular.extend(this, _data);
  }

  Container.getAll = function(){
    return $http.get(baseURL, { params: {}});
  }

  Container.getById = function(id){
    var url = baseURL + id;
    return $http.get(url).then(function(result){
              return result;
    });
  }


  Container._default = function(){
    var _data = {
      lat: 0,
      lon: 0,
      title: null,
      detail: null,
      may_show_name: 1,
      category: null,
      phone: null,
      pc: '',
      file: null,
      name: null,
      email: null,
      submit_sign_in: 1,
      password_sign_in: null,
      remember_me:1
    };
    return new Container(_data);
  };

    Container._all = [];
    Container.current = {};
    Container._new = function(){
      /*Report.current = Report._default();
      return Report.current;*/
      return Container._default();
    };



    /**
     * Static method, assigned to class
     * Instance ('this') is not available in static context
     */
    Container.build = function(_data) {
      return new Container(_data);
    };

    Container.prototype.setLatLng = function (lat,lng) {
      this.lat = lat;
      this.lon = lng;
    };

    /**
     * Return the constructor function
     */
    return Container;

}]);
