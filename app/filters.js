//IIFE
(function(){
	'use strict'
	
	angular.module('ParkingLotApp')
	.filter('GetParkingService', ['PlateManagerService', function(PlateManagerService){
		return function(type){
			return PlateManagerService.getParkingService(type);
		}
	}])	
	.filter('Capitalize', function(){
		return function(string){
			return string.charAt(0).toUpperCase() + string.slice(1);
		};
	});

})();