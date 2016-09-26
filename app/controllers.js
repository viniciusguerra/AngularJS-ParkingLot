//IIFE
(function(){
	'use strict'
	
	angular.module('ParkingLotApp')
	.controller('MetaController', MetaController)
	.controller('PlateBrowserController', PlateBrowserController)
	.controller('PlateRegisterController', PlateRegisterController)
	.controller('PlateDetailController', PlateDetailController)
	.controller('EventModalController', EventModalController);

	MetaController.$inject = ['MetaService', 'hotkeys', '$localStorage', '$scope'];
	function MetaController(MetaService, hotkeys, $localStorage, $scope)
	{
		$scope.storage = $localStorage;

		hotkeys.add({
			combo: 'shift+del',
			callback: function(){
				$scope.WipeArchive();
			}
		});

		this.title = MetaService.companyName;

		$scope.WipeLocalStorage = function(){

			$scope.storage.$reset();

		}

		$scope.WipeArchive = function(){

			delete $scope.storage.archivedPlates;

			$scope.storage.archivedPlates = [];

		}
	}

	PlateBrowserController.$inject = ['PlateManagerService', 'PlateDetailService', '$scope'];
	function PlateBrowserController(PlateManagerService, PlateDetailService, $scope){

		this.detailService = PlateDetailService;

		this.parkingServices = PlateManagerService.$storage.parkingServices;

		this.plateManagerService = PlateManagerService;

		//used for the tab containing all plates
		//avoids having nested ng-repeats, which breaks the table-striped layout
		this.allPlates = PlateManagerService.getAllPlates();

		//used for the archived plates tab
		this.archivedPlates = PlateManagerService.$storage.archivedPlates;		

		//keyword for the search bar
		$scope.searchKeyword;

		//shows the detail page for the selected plate
		this.ShowDetails = function(plate, isArchived){

			PlateDetailService.ShowDetails(plate, isArchived);

		}

		//calculates all due values when loading the controller
		this.plateManagerService.calculateAllDues();
	};

	PlateRegisterController.$inject = ['PlateManagerService', 'PlateFactory', '$location', '$scope', '$timeout'];
	function PlateRegisterController(PlateManagerService, PlateFactory, $location, $scope, $timeout){

		this.parkingServices = PlateManagerService.$storage.parkingServices;

		//creates a plate for registering when loading the controller
		this.plate = PlateFactory.Create();

		this.plateServiceType;

		//used for enabling the plate insertion error alert
		$scope.messageContainer = {
			enabled: false,
			capacity: false,
			id: false
		};

		//timeout for the error alert
		$scope.errorTimeout = 3000;

		//registers a new plate
		this.Register = function(){

			try
			{
				PlateManagerService.addPlate(this.plate, this.plateServiceType);

				delete this.plate;
				delete this.plateServiceType;

				this.plate = PlateFactory.Create();		

				$location.path("/browse");
			}
			//if the insertion fails...
			catch(error)
			{
				$scope.messageContainer.enabled = true;

				//enables the capacity error
				if(error === 'capacity')
				{
					$scope.messageContainer.capacity = true;
				}

				//enables the id already exists error
				if(error === 'id')
				{
					$scope.messageContainer.id = true;
				}

				//disables the error alert after timeout
				$timeout(function() {

					$scope.messageContainer.enabled = false;
			        $scope.messageContainer.capacity = false;
			        $scope.messageContainer.id = false;

			    }, $scope.errorTimeout);
			}
		}
	};

	EventModalController.$inject = ['$uibModalInstance', 'PlateManagerService', 'PlateEventFactory', 'plate', 'existingEvent']
	function EventModalController($uibModalInstance, PlateManagerService, PlateEventFactory, plate, existingEvent){		

		this.eventFactory = PlateEventFactory;

		//plate in which the event will be inserted
		this.plate = plate;

		//properties for binding the date-time picker
		this.entryDate;
		this.exitDate;

		if(existingEvent !== undefined)
		{
			this.entryDate = existingEvent.entryDateTime;
		}

		//toggles for the date pickers
		this.entryDatePickerEnabled;
		this.exitDatePickerEnabled;

		//used for configuring the entry date-time pickers
		this.entryDatePickerOptions = {
		    formatYear: 'yyyy',
		    minDate: new Date(),
		    startingDay: 1
	  	};

	  	this.entryTimePickerOptions = {
	  		'show-meridian': false
	  	};

	  	//used for configuring the exit date-time pickers
		this.exitDatePickerOptions = {
		    formatYear: 'yyyy',
		    minDate: new Date(),
		    startingDay: 1
	  	};

	  	this.exitTimePickerOptions = {
	  		'show-meridian': false,
	  		min: new Date()
	  	};

	  	this.UpdateExitDatePicker = function(){

	  		this.exitDatePickerOptions.minDate = this.entryDate;
	  		this.exitTimePickerOptions.min = this.entryDate;

	  	}

	    //used for toggling the date-time pickers
		this.OpenDatePicker = function(id){

			if(id === 'entry')
			{
				this.entryDatePickerEnabled = true;
			}

			if(id === 'exit')
			{
				this.exitDatePickerEnabled = true;
			}

		}

		//for when the modal is closed with the confirm button, adds new event to plate
		this.Confirm = function(){			

			//if event already exists, update exit time
			if(existingEvent !== undefined)
			{
				for(var i = 0; i < this.plate.events.length; i++)
				{
					if(this.plate.events[i].entryDateTime === this.entryDate)
					{
						this.plate.events[i].exitDateTime = new Date(this.exitDate);
					}
				}
			}
			//if the event doesn't exist, create a new one
			else
			{
				var newEvent = PlateEventFactory.Create();

				newEvent.entryDateTime = new Date(this.entryDate);
				newEvent.exitDateTime = new Date(this.exitDate);

				this.plate.events.push(newEvent);
			}

			//update plate due value with new event
			PlateManagerService.calculateDue(this.plate);

			$uibModalInstance.close('success');
		}

		//for when the modal is dismissed, canceled
		this.Cancel = function(){

			$uibModalInstance.dismiss('cancel');
		}
	}

	PlateDetailController.$inject = ['PlateDetailService', 'PlateManagerService', '$uibModal', '$location'];
	function PlateDetailController(PlateDetailService, PlateManagerService, $uibModal, $location){
		
		this.plateManagerService = PlateManagerService;

		this.plate = PlateDetailService.plate;

		this.isArchived = PlateDetailService.isArchived;

		this.IsExitDateValid = PlateDetailService.IsExitDateValid;

		//shows modal for creation of new event
		this.ShowEventModal = function (size, event){

			var templateUrl;

			if(event !== undefined)
				templateUrl = 'app/view/exitEventModal.html';
			else
				templateUrl = 'app/view/eventModal.html';

		    var modalInstance = $uibModal.open({
	      		animation: true,
		      	ariaLabelledBy: 'modal-title',
		      	ariaDescribedBy: 'modal-body',
	    	  	templateUrl: templateUrl,
		      	controller: 'EventModalController',
		      	controllerAs: 'EventCtrl',
		      	size: size,
		      	resolve: {
		      		plate: function(PlateDetailService){

		      			return PlateDetailService.plate;

		      		},
		      		parkingService: function(PlateManagerService, PlateDetailService){

		      			var service = PlateManagerService.getServiceFromPlate(PlateDetailService.plate);

		      			return service;

		      		},
		      		existingEvent: function(){

		      			return event;

		      		}
		      	}
	    	});

		    //promises for when the modal is closed
	    	modalInstance.result.then(
	    		//confirm promise
    			function (newEvent) {

	    		
		    }, 	//cancel promise
		    	function () {


		    });
		}

		//for removing a plate
		this.RemovePlate = function(){

			this.plateManagerService.removePlate(this.plate);

			$location.path("/browse");
		};

	};	

})();