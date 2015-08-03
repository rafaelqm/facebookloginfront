(function(){
  var app = angular.module('faceLogin', ['ezfb'])
  .config(function (ezfbProvider) {
    /**
     * Initial setup
     *
     */
    ezfbProvider.setInitParams({
      appId: '303103769718626'
    });
  })

  .controller('MainCtrl', function($scope, ezfb, $window, $location, $http) {

    $scope.success = false;
    $scope.fail = null;

    $scope.user = {};

    $http.defaults.headers.post['Authorization'] = 'Token b76dff0d0c368683bdba1134658b5f559d97ea6f';

    $scope.addUser = function(){
      birthdate = $scope.user.birthdate.toISOString();
      birthdate = birthdate.slice(0, 10);
    

      $http.post('http://127.0.0.1:8000/users/', {facebookid: $scope.user.facebookid, username: $scope.user.username, name: $scope.user.name, gender: $scope.user.gender, birthdate: birthdate}).
      then(function(response) {
        if(response.status == 201 && response.statusText=="CREATED"){
          $scope.success = true;
          $scope.logout();
        }
      }, function(response) {
        console.log(response.data.facebookid[0]);
        if(response.data.facebookid.length){
          $scope.fail = 'Este usuário já foi cadastrado!';
          $scope.logout();
        }
      });
    };
    
    updateLoginStatus(loadApiMe);

    $scope.login = function () {

      $scope.success = false;
      $scope.fail = null;
      /**
       * Calling FB.login with required permissions specified
       * https://developers.facebook.com/docs/reference/javascript/FB.login/v2.0
       */
      ezfb.login(function (res) {
        /**
         * no manual $scope.$apply, I got that handled
         */
        if (res.authResponse) {
          updateLoginStatus(loadApiMe);
        }
      }, {scope: 'email,public_profile'});
    };

    $scope.logout = function () {
      ezfb.logout(function () {
        updateLoginStatus(loadApiMe);
      });
    };



    /**
     * For generating better looking JSON results
     */
    var autoToJSON = ['loginStatus', 'apiMe'];
    angular.forEach(autoToJSON, function (varName) {
      $scope.$watch(varName, function (val) {
        $scope[varName + 'JSON'] = JSON.stringify(val, null, 2);
      }, true);
    });
    
    /**
     * Update loginStatus result
     */
    function updateLoginStatus (more) {
      ezfb.getLoginStatus(function (res) {
        $scope.loginStatus = res;

        (more || angular.noop)();
      });
    }

    function loadApiMe () {
      ezfb.api('/me', function (res) {
        // $scope.apiMe = res;
        var gender=null;
        if(res.gender=='male'){
          gender='M';
        }else if(res.gender=='female'){
          gender='F';
        }

        $scope.user = {
          facebookid: res.id,
          username:res.email,
          name:res.name,
          gender: gender
        };
        
        console.log(res);
      });
    }
  });

  app.directive('userData',function(){
    return {
      restrict:'E',
      templateUrl:'user-data.html'
    };
  });

})();