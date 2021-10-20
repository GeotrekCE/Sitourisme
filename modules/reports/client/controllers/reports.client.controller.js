'use strict';

angular.module('reports').controller('ReportsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Reports',
  'Socket',
  function ($scope, $stateParams, $location, Authentication, Reports, Socket) {
    Socket.on('reportsEvent', function (data) {
      console.log(data);
    });

    //$scope.authentication = Authentication;
    //
    //$scope.create = function () {
    //	var report = new Reports({
    //		title: this.title,
    //		content: this.content
    //	});
    //	report.$save(function (response) {
    //		$location.path('reports/' + response._id);
    //
    //		$scope.title = '';
    //		$scope.content = '';
    //	}, function (errorResponse) {
    //		$scope.error = errorResponse.data.message;
    //	});
    //};
    //
    //$scope.remove = function (report) {
    //	if (report) {
    //		report.$remove();
    //
    //		for (var i in $scope.reports) {
    //			if ($scope.reports[i] === report) {
    //				$scope.reports.splice(i, 1);
    //			}
    //		}
    //	}
    //	else {
    //		$scope.report.$remove(function () {
    //			$location.path('reports');
    //		});
    //	}
    //};
    //
    //$scope.update = function () {
    //	var report = $scope.report;
    //
    //	report.$update(function () {
    //		$location.path('reports/' + report._id);
    //	}, function (errorResponse) {
    //		$scope.error = errorResponse.data.message;
    //	});
    //};
    //
    //$scope.find = function () {
    //	$scope.reports = Reports.query();
    //};
    //
    //$scope.findOne = function () {
    //	$scope.report = Reports.get({
    //		reportId: $stateParams.reportId
    //	});
    //};
  }
]);
