//IIFE
(function(){
	'use strict'
	
	angular.module('ParkingLotApp')
	.factory('PlateFactory', PlateFactory)
	.factory('ParkingServiceFactory', ParkingServiceFactory)
	.factory('PlateEventFactory', PlateEventFactory);

	function PlateFactory()
	{
		//Plate prototype
		this.Plate = function Plate(){
			this.id = '';
			this.due = 0;
			this.events = [];
		};

		this.Create = function(){
			return new this.Plate();
		}

		return this;		
	}

	function PlateEventFactory()
	{
		//PlateEvent prototype
		this.PlateEvent = function PlateEvent(){

			this.entryDateTime = new Date(0);
			
			this.exitDateTime = new Date(0);
		};

		this.Create = function(){
			return new this.PlateEvent();
		}

		return this;
	}

	function ParkingServiceFactory()
	{
		//ParkingService prototype
		this.ParkingService = function ParkingService(){
			this.type = '';
			this.description = '';
			this.capacity = 0;
			this.price = 0;
			this.plates = [];
		};

		this.Create = function(){
			return new this.ParkingService();
		}

		return this;	
	}	

})();