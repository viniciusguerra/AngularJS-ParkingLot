//IIFE
(function(){
	'use strict'
	
	angular.module('ParkingLotApp')
	.config(function($routeProvider){

		$routeProvider.when("/browse", {
			templateUrl: "app/view/browse.html"
		});

		$routeProvider.when("/register",{
			templateUrl: "app/view/register.html"
		});

		$routeProvider.when("/details",{
			templateUrl: "app/view/details.html"
		})

		$routeProvider.otherwise({
			redirectTo: '/browse'
		});

	});

})();