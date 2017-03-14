pmb_im.controllers.controller('MapController', ['$scope', '$sce', '_',
  '$cordovaCamera',
  '$cordovaFile',
  '$cordovaGeolocation',
  '$compile',
  '$state',
  '$stateParams',
  '$ionicModal',
  '$ionicPopup',
  'leafletData',
  'ConfigService',
  'PMBService',
  'LocationsService',
  'ReportService',
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
  '$cordovaNetwork',
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
    $cordovaCamera,
    $cordovaFile,
    $cordovaGeolocation,
    $compile,
    $state,
    $stateParams,
    $ionicModal,
    $ionicPopup,
    leafletData,
    ConfigService,
    PMBService,
    LocationsService,
    ReportService,
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
    $cordovaNetwork,
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

    $scope.$on("$ionicView.beforeEnter", function() {

      DBService.initDB();
      if(ConnectivityService.isOnline()){
        $scope.check_user_logged();
      }else{
        $scope.set_offline_user();
      }
      $scope.set_network_events();
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
      if(ionic.Platform.isWebView()){
        $scope.$on('$cordovaNetwork:online', function(event, networkState){
          $scope.check_user_logged();
          $scope.addPinsLayer();
          $scope.create_online_map();
        });
        $scope.$on('$cordovaNetwork:offline', function(event, networkState){
          $scope.create_offline_map();
          $scope.set_offline_user();
        });
      }
      else {
        window.addEventListener("online", function(e) {
          $scope.check_user_logged();
          $scope.addPinsLayer();
          $scope.create_online_map();
        }, false);
        window.addEventListener("offline", function(e) {
          $scope.create_offline_map();
          $scope.set_offline_user();
        }, false);
      }
    };

    $scope.create_offline_map = function(){
      $scope.map = {
          defaults: {
            tileLayer: './offline_tiles/{z}/{x}/{y}.png',
            //minZoom: 12,
            minZoom: 16,
            maxZoom: 16,
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

    $scope.create_online_map = function(){
      $scope.map = {
        defaults: {
          tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
          minZoom: 12,
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

    $scope.$on("$ionicView.afterEnter", function() {
      //document.getElementById("spinner").style.display = "none";
      document.getElementById("foot_bar").style.display = "block";
      if(ConnectivityService.isOnline()){
        $scope.create_online_map();
        $scope.addPinsLayer();
        //$scope.addMapControls();
      }else{
        $scope.create_offline_map();
      }

        $scope.map.center = {
          lat: -34.901113,
          lng: -56.164531,
          zoom: 14
        };
    });

    var Location = function() {
      if (!(this instanceof Location)) return new Location();
      this.lat = "";
      this.lng = "";
      this.name = "";
    };


  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };

  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };


  $scope.image = null;

  $scope.addImage = function(isFromAlbum, isUserPhoto) {

    $scope.isUserPhoto = isUserPhoto;

    var source = Camera.PictureSourceType.CAMERA;
    var fix_orientation = true;
    var save_to_gallery = true;
    if(isFromAlbum==1){
      source = Camera.PictureSourceType.PHOTOLIBRARY;
      fix_orientation = false;
      save_to_gallery = false;
    }

    var options = {
      quality: 90,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: source,
      allowEdit: false,
      correctOrientation : fix_orientation,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: save_to_gallery,
      targetWidth: 350,
      targetHeight: 350
    };


    $cordovaCamera.getPicture(options).then(function(imageData) {
      onImageSuccess(imageData);

      function onImageSuccess(fileURI) {
        //alert(fileURI);
        window.FilePath.resolveNativePath(fileURI, function(result) {
          // onSuccess code
          //alert(result);
          fileURI = 'file://' + result;
          if(result.startsWith("file://")){
            fileURI = result;
          }
          if($scope.isUserPhoto==1){
            //UserService.add_photo(fileURI);
            $scope.profile.picture_url = fileURI;
          }else{
            $scope.report.file = fileURI;
          }
          $scope.imgURI = fileURI;
          //createFileEntry(fileURI);
        }, function(error) {
          alert("Error resolveNativePath" + error);
        });

      }

      function createFileEntry(fileURI) {
        window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
      }

      // 5
      function copyFile(fileEntry) {
        var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
        var newName = makeid() + name;

        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
            fileEntry.copyTo(
              fileSystem2,
              newName,
              onCopySuccess,
              fail
            );
          },
          fail);
      }

      // 6
      function onCopySuccess(entry) {
        $scope.$apply(function() {
          $scope.image = entry.nativeURL;
        });
      }

      function fail(error) {

      }

      function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
      }

    }, function(err) {
      //console.log(err);
    });
  };

  $scope.urlForImage = function() {
    var imageURL = "http://placehold.it/200x200";
    if ($scope.image) {
      var name = $scope.image.substr($scope.image.lastIndexOf('/') + 1);
      imageURL = cordova.file.dataDirectory + name;
    }
    //console.log("ImageURL = " + imageURL);
    return imageURL;
  };


    $scope.help = function() {
      if(ConnectivityService.isOnline()){
        document.getElementById("spinner").style.display = "block";
        $scope.set_active_option('button-faq');
        $scope.hide_special_divs();
        FaqService.all().success(function (response) {
          $scope.faq = $sce.trustAsHtml(response);
          document.getElementById("spinner").style.display = "none";
          $ionicModal.fromTemplateUrl('templates/faq.html', {
            scope: $scope,
            hardwareBackButtonClose: false,
            animation: 'slide-in-up',
            //focusFirstInput: true
          }).then(function(modal) {
              $scope.faq_modal = modal;
              $scope.faq_modal.show().then(function(){
                var element = angular.element( document.querySelector( '#faq-container-div' ) );
                var compiled = $compile(element.contents())($scope);
              })
            });
        })
      }else{
        PopUpService.show_alert("Sin conexión a internet","Para ver la ayuda debe estar conectado a internet");
      }

    }

    $scope.scrollMe = function(anchor_id){
      $location.hash(anchor_id);
      var handle  = $ionicScrollDelegate.$getByHandle('content');
      handle.anchorScroll();
    }

    $scope.close_faq_modal = function(){
      $scope.faq_modal.hide();
      $scope.faq_modal.remove();
    }

    $scope.set_active_option = function(buttonid) {
      document.getElementById("button-report").className = "option-inactive";
      document.getElementById("button-list-reports").className = "option-inactive";
      document.getElementById("button-faq").className = "option-inactive";
      document.getElementById("button-find-me").className = "option-inactive";
      document.getElementById(buttonid).className = "option-active";
    }

    $scope.hide_special_divs = function(){
      document.getElementById("report-list-scroll").style.display = "none";
      document.getElementById("offline-report-list-container").style.display = "none";
      document.getElementById("user-options-menu").style.display="none";
      document.getElementById('map_crosshair').style.display = "none";
      document.getElementById('map_crosshair_button').style.display = "none";
    }

    /**
     * Center map on user's current position
     */
    $scope.locate = function() {

      $cordovaGeolocation
        .getCurrentPosition()
        .then(function(position) {
          $scope.map.center.lat = position.coords.latitude;
          $scope.map.center.lng = position.coords.longitude;
          $scope.map.center.zoom = 15;

          $scope.map.markers.now = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            message: "You Are Here",
            focus: true,
            draggable: false
          };

        }, function(err) {
          // error
          //console.log("Location error!");
          //console.log(err);
        });

    };


    $scope.addMapControls = function() {

      document.getElementById('map_crosshair').style.display = "block";
      document.getElementById('map_crosshair_button').style.display = "block";

    };

    $scope.startReportFromCrosshairs = function(){
      leafletData.getMap().then(function(map) {
        var latlon = map.getCenter();
        LocationsService.save_new_report_position(latlon.lat,latlon.lng);
        $scope.new_report(1);
        //console.log(latlon);
      });
    }

    $scope.addPinsLayer = function() {
      var baseURL = ConfigService.baseURL;
        buildPopup = function(data, marker) {
          var reportId = data[3],
            descripcion = data[4];

          var html = '<a class="text report-link" ng-click="viewReportDetails(' + reportId + ')"><p>' + descripcion + '</p></a>';
          return html;


        },

        onEachFeature = function(feature, layer) {
          // does this feature have a property named popupContent?
          var html, reportId, descripcion;
          if (feature.properties) {
            reportId = feature.properties.id;
            descripcion = feature.properties.title;
            html = '<a class="text report-link" ng-click="viewReportDetails(' + reportId + ')"><p>' + descripcion + '</p></a>';
            var compiled = $compile(html)($scope);
            layer.bindPopup(compiled[0]);
          }
        },

        l = new L.LayerJSON({
          url: baseURL + "/ajax_geo?bbox={bbox}" /*"ajax_geo?bbox={bbox}"*/ ,
          locAsGeoJSON: true /*locAsArray:true*/,
          onEachFeature: onEachFeature
        });

      leafletData.getMap().then(function(map) {
        map.addLayer(l);
      });


      l.on('dataloaded', function(e) { //show loaded data!
        $scope.reports = e.data.features;
      });


      l.on('layeradd', function(e) {
        e.layer.eachLayer(function(_layer) {
          var markerIcon = L.icon({
            iconUrl: baseURL + "/" + _layer.feature.properties.pin_url,
            iconSize: [29, 34],
            iconAnchor: [8, 8],
            popupAnchor: [0, -8]
          });
          _layer.setIcon(markerIcon);
          if ($scope.featureReports[_layer.feature.properties.id] === undefined) {
            $scope.featureReports[_layer.feature.properties.id] = _layer;
          }
        });

      });
    };

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

    $scope.show_edit_profile_modal = function(){
      //Cargar el modal con la info del usuario logueado y con el submit a edit_profile_ok
      $scope.profile = new Array();
      $scope.profile.email = UserService.email;
      $scope.profile.password = "";
      $scope.profile.fullname = UserService.name;
      $scope.profile.new_email = UserService.email;
      $scope.profile.id_doc = UserService.identity_document;
      $scope.profile.telephone = UserService.phone;
      $scope.profile.picture_url = null;
      if(UserService.picture_url!=null){
        $scope.actual_photo = UserService.picture_url;
        if($scope.actual_photo=="url(./img/icon-user-anonymous.png)"){
          $scope.actual_photo = "./img/icon-user-anonymous.png";
        }
        $ionicModal.fromTemplateUrl('templates/edit_profile_with_photo.html', {
            scope: $scope,
            hardwareBackButtonClose: false,
            animation: 'slide-in-up',
            //focusFirstInput: true
          }).then(function(modal) {
              document.getElementById("user-options-menu").style.display="none";
              $scope.edit_profile_modal = modal;
              document.getElementById("foot_bar").style.display = "none";
              $scope.edit_profile_modal.show();
          });
      }else{
        $scope.actual_photo = null;
        $ionicModal.fromTemplateUrl('templates/edit_profile.html', {
            scope: $scope,
            hardwareBackButtonClose: false,
            animation: 'slide-in-up',
            //focusFirstInput: true
          }).then(function(modal) {
              $scope.hide_special_divs();
              $scope.edit_profile_modal = modal;
              document.getElementById("foot_bar").style.display = "none";
              $scope.edit_profile_modal.show();
          });
      }
    }

    $scope.close_edit_profile_modal = function(){
      //Cargar el modal con la info del usuario logueado y con el submit a update_user
      document.getElementById("foot_bar").style.display = "block";
      $scope.edit_profile_modal.hide();
      $scope.edit_profile_modal.remove();
    }

    $scope.edit_profile_ok = function(){
      $scope.edit_profile(UserService.email,UserService.password,$scope.profile.fullname,$scope.profile.new_email,$scope.profile.id_doc,$scope.profile.telephone,$scope.profile.picture_url);
    }

    $scope.edit_profile = function(email,password, fullname, new_email, id_doc, user_phone, user_picture_url){
      if(ConnectivityService.isOnline()){
        document.getElementById("spinner-inside-modal").style.display = "block";
        var fields = new Array();
        fields.push($scope.create_field_array("Correo electrónico","email",new_email));
        //fields.push($scope.create_field_array("Contraseña","notNull",password));
        fields.push($scope.create_field_array("Cédula de Identidad","iddoc_uy",id_doc));
        fields.push($scope.create_field_array("Nombre y apellido","two_words",fullname));
        if(ErrorService.check_fields(fields,"error_container")){
          var edit_request = AuthService.edit_user(email,password, fullname, new_email, id_doc, user_phone, user_picture_url);
          if(user_picture_url==null || user_picture_url==""){
            edit_request.success(function(data, status, headers,config){
              document.getElementById("sent_label").innerHTML = "Enviado: 100%";
              //console.log(data);
              if(ErrorService.http_data_response_is_successful(data,"error_container")){
                UserService.save_user_data(data.name, data.email, password, data.identity_document, data.phone, data.picture_url);
                document.getElementById("spinner-inside-modal").style.display = "none";
                $scope.close_edit_profile_modal();
                $scope.check_user_logged();
              }else{
                document.getElementById("spinner-inside-modal").style.display = "none";
              }
            })
            .error(function(data, status, headers,config){
              ErrorService.show_error_message("error_container",status);
              document.getElementById("spinner-inside-modal").style.display = "none";
            })
          }else{
            edit_request.then(function(result) {
              var data = JSON.parse(result.response);
              if(ErrorService.http_data_response_is_successful(data,"error_container")){
                UserService.save_user_data(data.name, data.email, password, data.identity_document, data.phone, data.picture_url);
                document.getElementById("spinner-inside-modal").style.display = "none";
                $scope.close_edit_profile_modal();
                $scope.check_user_logged();
              }else{
                document.getElementById("spinner-inside-modal").style.display = "none";
              }
            }, function(error) {
              var alert = "Código: " + error.code;
              alert = alert + " Origen: " + error.source;
              alert = alert + " Destino: " + error.target;
              alert = alert + " http_status: " + error.http_status;
              alert = alert + " Body: " + error.body;
              alert = alert + " Exception: " + error.exception;
              ErrorService.show_error_message("error_container","Hubo un error en el envío: " + alert);
              document.getElementById("spinner-inside-modal").style.display = "none";
            }, function(progress) {
                $timeout(function() {
                  $scope.uploadProgress = (progress.loaded / progress.total) * 100;
                  document.getElementById("sent_label").innerHTML = "Enviado: " + Math.round($scope.uploadProgress) + "%";
                });
            });
          }
        }else{
          document.getElementById("spinner-inside-modal").style.display = "none";
        }
      }else{
        PopUpService.show_alert("Sin conexión a internet","Para editar su perfil debe estar conectado a internet");
      }
    }


    $scope.show_login_modal = function(){
      //Cargar el modal con el form de login y ahi llama al sign_in
      $scope.nonauth = new Array();
      $scope.nonauth.email = "";
      $scope.nonauth.password = "";
      $ionicModal.fromTemplateUrl('templates/log_in.html', {
          scope: $scope,
          hardwareBackButtonClose: false,
          animation: 'slide-in-up',
          //focusFirstInput: true
        }).then(function(modal) {
            $scope.hide_special_divs();
            $scope.login_modal = modal;
            document.getElementById("foot_bar").style.display = "none";
            $scope.login_modal.show();
        });
    }

    $scope.login_ok = function(){
      $scope.sign_in($scope.nonauth.email,$scope.nonauth.password);
    }

    $scope.close_login_modal = function(){
      document.getElementById("foot_bar").style.display = "block";
      $scope.login_modal.hide();
      $scope.login_modal.remove();
    }



    $scope.show_sign_up_modal = function(){
      //cargar el modal con el form de sign_up y de ahi llamar al sign_up
      $scope.newuser = new Array();
      $scope.newuser.email = "";
      $scope.newuser.password = "";
      $scope.newuser.fullname = "";
      $scope.newuser.id_doc = "";
      $scope.newuser.telephone = "";
      $ionicModal.fromTemplateUrl('templates/sign_up.html', {
          scope: $scope,
          hardwareBackButtonClose: false,
          animation: 'slide-in-up',
          //focusFirstInput: true
        }).then(function(modal) {
            $scope.hide_special_divs();
            $scope.sign_up_modal = modal;
            document.getElementById("foot_bar").style.display = "none";
            $scope.sign_up_modal.show();
        });
    }

    $scope.close_sign_up_modal = function(){
      document.getElementById("foot_bar").style.display = "block";
      $scope.sign_up_modal.hide();
      $scope.sign_up_modal.remove();
    }

    $scope.sign_up = function(email,fullname,password, id_doc, user_phone){
      if(ConnectivityService.isOnline()){
        document.getElementById("spinner-inside-modal").style.display = "block";
        var fields = new Array();
        fields.push($scope.create_field_array("Correo electrónico","email",email));
        fields.push($scope.create_field_array("Contraseña","notNull",password));
        fields.push($scope.create_field_array("Cédula de Identidad","iddoc_uy",id_doc));
        fields.push($scope.create_field_array("Nombre y apellido","two_words",fullname));
        if(ErrorService.check_fields(fields,"error_container")){
          AuthService.create_user(email,fullname,password, id_doc, user_phone).then(function(resp) {
            if(ErrorService.http_response_is_successful(resp,"error_container")){
              UserService.save_user_data(fullname, email, password, id_doc, user_phone,null);
              //$scope.set_user_picture(1);
              document.getElementById("spinner-inside-modal").style.display = "none";
              $scope.close_sign_up_modal();
              var alertPopup = $ionicPopup.alert({
               title: "Usuario creado con éxito",
               template: resp.data.message
              });
              alertPopup.then(function(res) {
                //return false;
              });
              //$scope.check_user_logged();
            }else{
              document.getElementById("spinner-inside-modal").style.display = "none";
            }
          }, function(resp) {
            document.getElementById("spinner-inside-modal").style.display = "none";
            ErrorService.show_error_message("error_container",resp.statusText);
          });
        }else{
          document.getElementById("spinner-inside-modal").style.display = "none";
        }
      }else{
        PopUpService.show_alert("Sin conexión a internet","Para iniciar registrarse debe estar conectado a internet");
      }
    }

    $scope.sign_up_ok = function(){
      $scope.sign_up($scope.newuser.email,$scope.newuser.fullname,$scope.newuser.password,$scope.newuser.id_doc,$scope.newuser.telephone);
    }

    $scope.check_user_logged = function(){
      var name = UserService.name;
      if(name==null){
          //Si Hay un usuario guardado
          var user = DBService.getUser();
          user.then(function (doc) {
            if(doc.name!=null && doc.name!="" && doc.name!="undefined"){
              $scope.sign_in_ajax(doc.email, doc.password);
            }else{
              $scope.set_user_picture(0);
            }
          }).catch(function (err) {
            $scope.set_user_picture(0);
          });
      }else{
        //Está logueado
        if(UserService.picture_url==null || UserService.picture_url==""){
          //El usuario no tiene foto definida
          $scope.set_user_picture(0);
        }else{
          //El usuario tiene foto
          $scope.set_user_picture(1);
        }
      }
    }

    $scope.set_offline_user = function(){
      var name = UserService.name;
      if(name==null){
          //Si Hay un usuario guardado
          var user = DBService.getUser();
          user.then(function (doc) {
            if(doc.name!=null && doc.name!="" && doc.name!="undefined"){
              //$scope.sign_in_ajax(doc.email, doc.password);
              UserService.save_user_data(doc.name, doc.email, doc.password, doc.identity_document, doc.phone, doc.picture_url);
            }else{
              $scope.set_user_picture(0);
            }
          }).catch(function (err) {
            $scope.set_user_picture(0);
          });
      }else{
        //Está logueado
        if(UserService.picture_url==null || UserService.picture_url==""){
          //El usuario no tiene foto definida
          $scope.set_user_picture(0);
        }else{
          //El usuario tiene foto
          $scope.set_user_picture(1);
        }
      }
    }



    $scope.set_user_picture = function(hasPhoto){
      var picture = document.getElementById("user_picture");
      if(hasPhoto==0){
        //picture.style.backgroundImage = "url(./img/icon-user-anonymous.png)";
        $scope.user_cached_image="./img/icon-user-anonymous.png";
      }else{
        if(UserService.picture_url!=null && UserService.picture_url!=""){
          //alert(UserService.picture_url);
          $scope.user_cached_image=UserService.picture_url;
          //picture.style.backgroundImage = "url(" + UserService.picture_url + ")";
        }else{
          //picture.style.backgroundImage = "url(./img/icon-user-anonymous.png)";
          $scope.user_cached_image="./img/icon-user-anonymous.png";
        }
      }

    }

    $scope.find_me = function(){
        $scope.set_active_option("button-find-me");
        $scope.hide_special_divs();
        var posOptions = {timeout: 10000, enableHighAccuracy: true};
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
                $scope.map.center.lat  = position.coords.latitude;
                $scope.map.center.lng = position.coords.longitude;
                LocationsService.save_new_report_position(position.coords.latitude,position.coords.longitude);
                if(ConnectivityService.isOnline()){
                  $scope.map.center.zoom = 18;
                }else{
                  $scope.map.center.zoom = 16;
                }
                $scope.map.markers.now = {
                  lat:position.coords.latitude,
                  lng:position.coords.longitude,
                  message: "<p align='center'>Te encuentras aquí <br/> <a ng-click='new_report(1);'>Iniciar reporte en tu posición actual</a></p>",
                  focus: true,
                  draggable: false,
                  getMessageScope: function() { return $scope; }
                };
                //$scope.map.markers.now.openPopup();
              }, function(err) {
                // error
                //console.log("Location error!");
                //console.log(err);
                ErrorService.show_error_message_popup("No hemos podido geolocalizarlo. ¿Tal vez olvidó habilitar los servicios de localización en su dispositivo?")
              });

          };

      var Location = function() {
        if ( !(this instanceof Location) ) return new Location();
        this.lat  = "";
        this.lng  = "";
        this.name = "";
      };



      /**
       * Detect user long-pressing on map to add new location
       */
      $scope.$on('leafletDirectiveMap.contextmenu', function(event, locationEvent){
        $scope.hide_special_divs();
        LocationsService.save_new_report_position(locationEvent.leafletEvent.latlng.lat,locationEvent.leafletEvent.latlng.lng);
        $scope.new_report(1);
      });


  }
]);
