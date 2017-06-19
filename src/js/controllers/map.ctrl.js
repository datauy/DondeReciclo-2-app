pmb_im.controllers.controller('MapController', ['$scope', '$sce', '_',
  '$cordovaFile',
  '$cordovaGeolocation',
  '$compile',
  '$state',
  '$stateParams',
  '$ionicModal',
  '$ionicPopup',
  'leafletData',
  'ConfigService',
  'ContactService',
  'PMBService',
  'LocationsService',
  'ContainerService',
  'MapService',
  'FaqService',
  'CategoriesService',
  'AuthService',
  'UserService',
  'DBService',
  '$timeout',
  '$location',
  'ErrorService',
  '$ionicSlideBoxDelegate',
  '$ionicScrollDelegate',
  'PopUpService',
  '$ionicPlatform',
  'ConnectivityService',
  '$cordovaInAppBrowser',
  '$interval',
  '$cordovaKeyboard',
  function(
    $scope,
    $sce,
    _,
    $cordovaFile,
    $cordovaGeolocation,
    $compile,
    $state,
    $stateParams,
    $ionicModal,
    $ionicPopup,
    leafletData,
    ConfigService,
    ContactService,
    PMBService,
    LocationsService,
    ContainerService,
    MapService,
    FaqService,
    CategoriesService,
    AuthService,
    UserService,
    DBService,
    $timeout,
    $location,
    ErrorService,
    $ionicSlideBoxDelegate,
    $ionicScrollDelegate,
    PopUpService,
    $ionicPlatform,
    ConnectivityService,
    $cordovaInAppBrowser,
    $interval,
    $cordovaKeyboard
  ) {

      /**
     * Once state loaded, get put map on scope.
     */
    $scope.featureReports = {};
    $scope.baseURL = ConfigService.baseURL;
    $scope.user_cached_image = "";
    $scope.report_detail_id = null;
    $scope.one_value_popup = null;
    $scope.abuse_name = null;
    $scope.abuse_email = null;
    $scope.abuse_subject = null;
    $scope.abuse_message = null;

    $scope.actualSliderIndex=0;

    $scope.$on("$ionicView.beforeEnter", function() {
      DBService.initDB();
      $scope.set_network_events();
      $scope.find_me();
      $scope.walkthrough();
    });

    $ionicPlatform.onHardwareBackButton(function() {
       e.stopPropagation();
       $scope.hide_special_divs;
    });

    $scope.openWebsite = function(url) {
      var options = {
                location: 'no',
                clearcache: 'yes',
                toolbar: 'no'
            };

     $cordovaInAppBrowser.open(url, '_blank', options)
          .then(function(event) {
            // success
          })
          .catch(function(event) {
            // error
        });
    }

    $scope.set_network_events = function() {
      $scope.create_online_map();
      $scope.addPinsLayer();
      $scope.map.center = {
          lat: -34.901113,
          lng: -56.164531,
          zoom: 18
        };
    };

    $scope.create_online_map = function(){
      if($scope.map!=null){
        return false;
      }
      $scope.map = {
        defaults: {
          tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          minZoom: 10,
          maxZoom: 18,
          zoomControlPosition: 'topleft',
        },
        markers: {},
        events: {
          map: {
            enable: ['context'],
            logic: 'emit'
          }
        }
      };
    };

    $scope.clickOnMenuIcon = function(){
      var linesmenu = document.getElementById("nav-icon-lines");
      var expanded_menu = document.getElementById("expanded_menu");
      $scope.toggleClassOnElement(linesmenu,"open");
      $scope.toggleClassOnElement(expanded_menu,"open");
    };


    var Location = function() {
      if (!(this instanceof Location)) return new Location();
      this.lat = "";
      this.lng = "";
      this.name = "";
    };

  $scope.toggleClassOnElement = function (element, className){
    if (!element || !className){
        return;
    }
    var classString = element.className, nameIndex = classString.indexOf(className);
    if (nameIndex == -1) {
        classString += ' ' + className;
    }
    else {
        classString = classString.substr(0, nameIndex) + classString.substr(nameIndex+className.length);
    }
    element.className = classString;
  };

  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
    $scope.actualSliderIndex = $ionicSlideBoxDelegate.currentIndex();
  };

  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
    $scope.actualSliderIndex = $ionicSlideBoxDelegate.currentIndex();
  };


    $scope.scrollMe = function(anchor_id){
      $location.hash(anchor_id);
      var handle  = $ionicScrollDelegate.$getByHandle('content');
      handle.anchorScroll();
    }

    $scope.set_active_option = function(buttonid) {
      return false;
    }

    $scope.hide_special_divs = function(){
      var container_details = document.getElementById("container_details");
      if(container_details){
        container_details.className = "";
      }
      var navback = document.getElementById("navigation_back");
      if(navback){
        navback.className = "hidden";
      }
      var navigation_menu = document.getElementById("navigation_menu");
      if(navigation_menu){
        navigation_menu.className = "";
      }
    }


    $scope.addMapControls = function() {
      return false;
    };

    $scope.startReportFromCrosshairs = function(){
    }

    $scope.addPinsLayer = function() {
      if($scope.jsonLayer!=null){
        return false;
      }
      var baseURL = ConfigService.baseURL;
        onEachFeature = function(feature, layer) {
          var html, reportId, descripcion;
          if (feature.properties) {
            layer.on('click', function(e) {
                $scope.selected_container = ContainerService.build(e.target.feature.properties);
                $scope.selected_container.setLatLng(e.target.feature.geometry.coordinates[1],e.target.feature.geometry.coordinates[0]);
                //console.log($scope.selected_container);
                var containerDetails = document.getElementById("container_details");
                containerDetails.className = "open";
                var backMenu = document.getElementById("navigation_back");
                backMenu.className="";
                var menu = document.getElementById("navigation_menu");
                menu.className = "hidden";
                $scope.goToCenter($scope.selected_container.lon,$scope.selected_container.lat);

            });
          }
        }

        l = new L.LayerJSON({
          url: baseURL + "/datauy/get_containers_json/" + "{bbox}",
          locAsGeoJSON: true,
          minShift: 5,
          //updateOutBounds: false,
          precision: 10,
          onEachFeature: onEachFeature
        });


      leafletData.getMap().then(function(map) {
        if($scope.jsonLayer!=null){
          map.removeLayer($scope.jsonLayer);
        }
        $scope.jsonLayer = l;
        map.addLayer(l);
      });

      $scope.lastMarkerLayer = null;


      l.on('dataloaded', function(e) { //show loaded data!
        $scope.reports = e.data.features;
      });


      l.on('layeradd', function(e) {
        e.layer.eachLayer(function(_layer) {
          var icon = "/img/pin-container.svg";
          if(_layer.feature.properties.pin_url){
            icon = _layer.feature.properties.pin_url;
          }
          var markerIcon = L.icon({
            iconUrl: baseURL + icon,
            iconSize: [29, 34],
            iconAnchor: [8, 8],
            popupAnchor: [0, -8]
          });
          _layer.setIcon(markerIcon);
          if ($scope.featureReports[_layer.feature.properties.GID] === undefined) {
            $scope.featureReports[_layer.feature.properties.GID] = _layer;
          }
        });

      });
    };

    $scope.goToCenter = function(longTo,latTo){
      var posOptions = {timeout: 5000, enableHighAccuracy: true};
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
                var latFrom  = position.coords.latitude;
                var longFrom = position.coords.longitude;
                $scope.getRoad(latFrom,longFrom,latTo,longTo);
                //$scope.map.markers.now.openPopup();
              }, function(err) {
                //Move a little the map center because the map view is smaller (report list is displayed)
                latTo = latTo - 0.0006;
                MapService.centerMapOnCoords(latTo,longTo,17);
                //ErrorService.show_error_message_popup("No hemos podido geolocalizarlo. ¿Tal vez olvidó habilitar los servicios de localización en su dispositivo?")
              });
    };

    $scope.lastRoad = null;

    $scope.nav_back = function(){
      $scope.hide_special_divs();
      if($scope.lastRoad!=null){
        $scope.lastRoad.spliceWaypoints(0, 2);
        leafletData.getMap().then(function(map) {
          map.removeControl($scope.lastRoad)
          $scope.lastRoad=null;
        });
      }
    }

    $scope.walkthrough = function(){
      if($scope.walkthrough_modal!=null){
        return false;
      }
      var doneWalkthrough = DBService.getDoneWalkthrough();
      doneWalkthrough.then(function (doc) {
        if(doc.status!=null && doc.status=="done"){
          //Ya lo vió una vez
          //$scope.openWalkThroughModal();
        }else{
          $scope.openWalkThroughModal();
        }
      }).catch(function (err) {
        $scope.openWalkThroughModal();
      });
    }

    $scope.walkthroughFromMenu = function(){
      $scope.closeMainMenu();
      $scope.openWalkThroughModal();
    }

    $scope.openWalkThroughModal = function(){
      $ionicModal.fromTemplateUrl('templates/walkthrough.html', {
        scope: $scope,
        hardwareBackButtonClose: false,
        animation: 'slide-in-up',
        //focusFirstInput: true
      }).then(function(modal) {
          $scope.walkthrough_modal = modal;
          $scope.walkthrough_modal.show();
      });
    }

    $scope.finishWalkthrough = function(){
      $scope.walkthrough_modal.hide();
      $scope.walkthrough_modal.remove();
      DBService.saveDoneWalkthrough();
    }

    $scope.subject = "Feedback";

    $scope.openAboutProyect = function(){
      $scope.main_menu_modal.hide();
      $scope.main_menu_modal.remove();
      $ionicModal.fromTemplateUrl('templates/sobre_proyecto.html', {
        scope: $scope,
        hardwareBackButtonClose: true,
        animation: 'none',
        //focusFirstInput: true
      }).then(function(modal) {
          $scope.item_modal = modal;
          $scope.item_modal.show();
      });
    }

    $scope.openContact = function(){
      if($scope.item_modal!=null){
        $scope.item_modal.hide();
        $scope.item_modal.remove();
      }
      $scope.main_menu_modal.hide();
      $scope.main_menu_modal.remove();
      $ionicModal.fromTemplateUrl('templates/contact.html', {
        scope: $scope,
        hardwareBackButtonClose: true,
        animation: 'none',
        //focusFirstInput: true
      }).then(function(modal) {
          $scope.item_modal = modal;
          $scope.item_modal.show();
      });
    }

    $scope.openContactSuccess = function(){
      $scope.item_modal.hide();
      $scope.item_modal.remove();
      $ionicModal.fromTemplateUrl('templates/contact_success.html', {
        scope: $scope,
        hardwareBackButtonClose: true,
        animation: 'none',
      }).then(function(modal) {
          $scope.item_modal = modal;
          $scope.item_modal.show();
      });
    }

    $scope.send_contact_request = function(){
      var name = document.getElementById("contact_nombre");
      var email = document.getElementById("contact_email");
      var subject = document.getElementById("contact_select");
      var message = document.getElementById("contact_mensaje");
      var errorLabel = document.getElementById("contact_error_label");
      if(ErrorService.check_field(name,"notNull",errorLabel)&&
        ErrorService.check_field(email,"notNull",errorLabel)&&
        ErrorService.check_field(email,"email",errorLabel)&&
        ErrorService.check_field(subject,"select",errorLabel)&&
        ErrorService.check_field(message,"notNull",errorLabel)){
        ContactService.send_contact(name.value,email.value,subject[subject.selectedIndex].value,message.value).then(function (response) {
          if(ErrorService.http_data_response_is_successful_ajax(response)){
            $scope.openContactSuccess();
          };
        });
      }else{
        var errorContainer = document.getElementById("contact_error");
        errorContainer.className = "contact_error";
      }
    }

    $scope.openMainMenuFromItem = function(){
      $scope.item_modal.hide();
      $scope.item_modal.remove();
      $ionicModal.fromTemplateUrl('templates/main_menu.html', {
        scope: $scope,
        hardwareBackButtonClose: true,
        animation: 'none',
        //focusFirstInput: true
      }).then(function(modal) {
          $scope.main_menu_modal = modal;
          $scope.main_menu_modal.show();
      });
    }

    $scope.openMainMenu = function(){
      $ionicModal.fromTemplateUrl('templates/main_menu.html', {
        scope: $scope,
        hardwareBackButtonClose: true,
        animation: 'none',
        //focusFirstInput: true
      }).then(function(modal) {
          $scope.main_menu_modal = modal;
          $scope.main_menu_modal.show();
      });
    }

    $scope.closeMainMenu = function(){
      $scope.main_menu_modal.hide();
      $scope.main_menu_modal.remove();
    }

    $scope.getRoad = function(LatFrom,LongFrom,latTo,longTo){
      leafletData.getMap().then(function(map) {
        map.closePopup();
        var markerIcon = L.icon({
          iconUrl: "./img/me.svg",
          iconSize: [29, 34],
          iconAnchor: [8, 8],
          popupAnchor: [0, -8]
        });
        if($scope.now_marker!=null){
          map.removeLayer($scope.now_marker);
        }
        $scope.now_marker = L.marker([LatFrom, LongFrom], {icon: markerIcon}).addTo(map);
        if($scope.lastRoad!=null){
          $scope.lastRoad.spliceWaypoints(0, 2);
          map.removeControl($scope.lastRoad)
          $scope.lastRoad=null;
        }
        $scope.lastRoad = L.Routing.control({
          waypoints: [
            L.latLng(LatFrom,LongFrom),
            L.latLng(latTo,longTo)
          ],
          language:"es",
          router: L.Routing.mapbox('pk.eyJ1IjoibGl0b3hwZXJhbG9jYSIsImEiOiJjajNhdHUzbTMwMTQwMnFwaGRidmc2emZ5In0.dED4D4_LBjRc-sGa5zt5Yg'),
          createMarker: function (i, start, n){
            return null;
          },
          lineOptions: {
             styles: [{color: '#4c4c4c', opacity: 1, weight: 5}]
          },
          fitSelectedRoutes: false
        }).addTo(map);
        //Move a little the map center because the map view is smaller (report list is displayed)
        latTo = latTo - 0.0008;
        MapService.centerMapOnCoords(latTo,longTo,17);
      });
    }

    // Suggestion
    $scope.model = [];
    $scope.externalModel = [];
    $scope.selectedItems = [];
    $scope.preselectedSearchItems = [];
    $scope.clickedValueModel = "";
    $scope.removedValueModel = "";

    $scope.itemsRemoved = function(callback) {
      $scope.removedValueModel = callback;
    };

    $scope.user_options = function(){
      var menu = document.getElementById("user-options-menu");
      if(menu.style.display=="block"){
        menu.style.display = "none";
      }else{
        var name = UserService.name;
        if(name==null){
          //No esta logueado
          $scope.show_anonymous_menu();
        }else{
          //Está logueado
          $scope.show_user_menu();
        }
      }
    }

    $scope.show_anonymous_menu = function(){
      var menu = document.getElementById("user-options-menu");
      var html = "<div id='auth_options'><div class='nonauth-link' ng-click='show_login_modal()'>Iniciar sesión</div>";
      html = html + "<div class='nonauth-link' ng-click='show_sign_up_modal()'>Registrarse</div></div>";
      menu.innerHTML = html;
      $compile(menu)($scope); //<---- recompilation
      menu.style.height = '120px';
      menu.style.width = '150px';
      menu.style.display = "block";
    }

    $scope.show_user_menu = function(){
      var menu = document.getElementById("user-options-menu");
      var html = UserService.name + "<div id='auth_options'><div class='user-logged-link' ng-click='show_edit_profile_modal()'>Mi perfil</div>";
      html = html + "<div class='user-logged-link' ng-click='list_offline_reports_menu()'>Reportes pendientes</div>";
      html = html + "<div class='user-logged-link' ng-click='sign_out()'>Cerrar sesión</div></div>";
      menu.innerHTML = html;
      $compile(menu)($scope); //<---- recompilation
      menu.style.height = '160px';
      menu.style.width = '200px';
      menu.style.display = "block";
    };

    $scope.create_field_array = function(name,type,value){
      var field = new Array();
      field.name = name;
      field.type = type;
      field.value = value;
      return field;
    };

    $scope.sign_in = function(email, password){
      if(ConnectivityService.isOnline()){
        document.getElementById("spinner-inside-modal").style.display = "block";
        var fields = new Array();
        fields.push($scope.create_field_array("Email","email",email));
        fields.push($scope.create_field_array("Contraseña","notNull",password));
        if(ErrorService.check_fields(fields,"error_container")){
          AuthService.sign_in(password, email).then(function(resp) {
            if(ErrorService.http_response_is_successful(resp,"error_container")){
              UserService.save_user_data(resp.data.name, email, password, resp.data.identity_document, resp.data.phone, resp.data.picture_url);
              DBService.saveUser(resp.data.name,email,password,resp.data.identity_document,resp.data.phone,resp.data.picture_url);
              //$scope.set_user_picture(1);
              document.getElementById("spinner-inside-modal").style.display = "none";
              $scope.close_login_modal();
              //$scope.check_user_logged();
              $scope.set_user_picture(1);
            }else{
              document.getElementById("spinner-inside-modal").style.display = "none";
            }
          }, function(resp) {
            //console.log(err);
            //alert("Error en sign_in");
            document.getElementById("spinner-inside-modal").style.display = "none";
            ErrorService.show_error_message("error_container",resp.statusText);
          });
        }else{
          document.getElementById("spinner-inside-modal").style.display = "none";
        }

      }else{
        PopUpService.show_alert("Sin conexión a internet","Para iniciar sesión debe estar conectado a internet");
      }
    }

    $scope.sign_in_ajax = function(email, password){
      AuthService.sign_in(password, email).then(function(resp) {
        if(ErrorService.http_response_is_successful_ajax(resp)){
          UserService.save_user_data(resp.data.name, email, password, resp.data.identity_document, resp.data.phone, resp.data.picture_url);
          DBService.saveUser(resp.data.name,email,password,resp.data.identity_document,resp.data.phone,resp.data.picture_url);
          $scope.set_user_picture(1);
          return 1;
        }else{
          return 0;
        }

      }, function(resp) {
        //console.log(err);
        //ErrorService.show_error_message_popup(resp.statusText);
        return 0;
      });
    }

    $scope.sign_out = function(){
      UserService.erase_user_data();
      DBService.eraseUser();
      document.getElementById("spinner").style.display = "none";
      $scope.set_user_picture(0);
      document.getElementById("user-options-menu").style.display="none";
    }


    $scope.check_user_logged = function(){
      return false;
    }

    $scope.set_offline_user = function(){
    }



    $scope.set_user_picture = function(hasPhoto){
    }

    $scope.search_street = function(){
      $scope.hide_special_divs();
      document.getElementById("search-textbox").parentNode.click();
    }

    $scope.find_me = function(){
        $scope.set_active_option("button-find-me");
        $scope.hide_special_divs();
        var posOptions = {timeout: 10000, enableHighAccuracy: true};
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
                /*$scope.map.center.lat  = position.coords.latitude;
                $scope.map.center.lng = position.coords.longitude;
                LocationsService.save_new_report_position(position.coords.latitude,position.coords.longitude);*/
                var zoom = 18;
                var markerIcon = L.icon({
                  iconUrl: "./img/me.svg",
                  iconSize: [29, 34],
                  iconAnchor: [8, 8],
                  popupAnchor: [0, -8]
                });

                leafletData.getMap().then(function(map) {
                  if($scope.now_marker!=null){
                    map.removeLayer($scope.now_marker);
                  }
                  $scope.now_marker = L.marker([position.coords.latitude, position.coords.longitude], {icon: markerIcon}).addTo(map);
                  MapService.centerMapOnCoords(position.coords.latitude,position.coords.longitude,zoom);
                });
              }, function(err) {
                //ErrorService.show_error_message_popup("No hemos podido geolocalizarlo. ¿Tal vez olvidó habilitar los servicios de localización en su dispositivo?")
              });

          };

      var Location = function() {
        if ( !(this instanceof Location) ) return new Location();
        this.lat  = "";
        this.lng  = "";
        this.name = "";
      };

  }
]);
