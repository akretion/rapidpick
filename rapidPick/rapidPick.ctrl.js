'use strict';
angular.module('starter')
.controller('RapidPickCtrl', ['$scope', '$state', '$stateParams', '$ionicLoading', 'jsonRpc', 'Print', '$timeout', function ($scope, $state, $stateParams, $ionicLoading, jsonRpc, Print, $timeout) {

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.logs = [];
    $ionicLoading.show({
      template:'Chargement'
    });
  
    $scope.form = { reference: null}

    $scope.initSearch();

    $ionicLoading.hide();
    window.jsonRpc = jsonRpc;
  });

  $scope.scan = function () {
    $scope.pick = null;
    $scope.error = null;
    var ref = $scope.form.reference;

    if (!ref)
      return;

    $scope.logs.unshift('Recherche ' + ref);

    $ionicLoading.show({
      template:'Chargement'
    });


    jsonRpc.call('stock.picking.out', 'get_picking_info', [ref])
    .then(function (x) {
      $scope.pick = x;
      if (!x) {
        $scope.logs.unshift(ref + " introuvable");
        return console.log('introuvable');
      }

      $scope.pick.reference = $scope.form.reference;
      if ($scope.pick.is_letter) {
        console.log("c une lettre, faut afficher une popop");
      } else {
        $scope.logs.unshift(ref + " impression...");
        jsonRpc.call('stock.picking.out', 'validate_and_print_picking', [$scope.pick.picking_id])
        .then(function () {
              $scope.logs.unshift(ref + " imprimé");

        });
      }
      if ($scope.pick.is_cn23) {
        console.log("c un export, afficher un message");
      }
    }).then($scope.initSearch).catch(function (x) {
      console.log('erreur survenue');
      $scope.logs.unshift(x);
    }).finally($ionicLoading.hide);

  };

  $scope.validate = function() {
    var ref = $scope.form.reference;

    $scope.logs.unshift(ref +' ' + $scope.pick.letter + " impression...");
    jsonRpc.call('stock.picking.out', 'validate_and_print_picking', [$scope.pick.picking_id, $scope.pick.letter]).then(function (x) {
      $scope.logs.unshift(ref +' ' + $scope.pick.letter + " imprimé");
    });

  };

  $scope.initSearch = function () {
    $scope.form = {};
    $timeout(function () {
          var f = document.getElementById('search');
      f.focus();
       console.log(document.activeElement);

    },500);

  }

  $scope.print = function() {
    Print.print({ payload:"yea" })
  }
  $scope.clearLogs = function () {
    $scope.logs = [];
  }

}]);
