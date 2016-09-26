//IIFE
(function(){
	'use strict'
	
	angular.module('ParkingLotApp')
	.config(Config)
	.constant('uiDatetimePickerConfig', {
        dateFormat: 'dd-MM-yyyy HH:mm',
        defaultTime: '00:00:00',
        html5Types: {
            date: 'dd-MM-yyyy',
            'datetime-local': 'dd-MM-yyyyTHH:mm:ss.sss',
            'month': 'MM-yyyy'
        },
        initialPicker: 'date',
        reOpenDefault: false,
        enableDate: true,
        enableTime: true,
        buttonBar: {
            show: true,
            now: {
                show: true,
                text: 'Now'
            },
            today: {
                show: true,
                text: 'Today'
            },
            clear: {
                show: false,
                text: 'Clear'
            },
            date: {
                show: true,
                text: 'Date'
            },
            time: {
                show: true,
                text: 'Time'
            },
            close: {
                show: true,
                text: 'Close'
            }
        },
        closeOnDateSelection: false,
        closeOnTimeNow: false,
        appendToBody: false,
        altInputFormats: [],
        ngModelOptions: { },
        saveAs: false,
        readAs: false,
    });

	Config.$inject = ['PlateManagerServiceProvider', 'MetaServiceProvider'];
	function Config(PlateManagerServiceProvider, MetaServiceProvider)
	{
		//Parking Lot Name
		var name = 'Estacionamento Lipsum';

		//mensal service definition
		var mensal = {
			type: "Mensal",
			description: "Custo de R$100,00 ao mês, limite de 3 clientes",
			capacity: 3,
			price: 100,
			plates: []
		};

		//rotativo service definition
		var rotativo = {
			type: "Rotativo",
			description: "Custo de 10 reais à hora, limite de 7 clientes",
			capacity: 7,
			price: 10,
			plates: []
		}

		var services = [];

		services.push(mensal);
		services.push(rotativo);	

		var dueCalculators = {
			"Mensal": function(plate, service){

				//this service charges by month
				var due;

				var months = [];

				//counts different months
				for(var i = 0; i < plate.events.length; i++)
				{
					//gets entry and exit months (numbered 1 to 12)
					var entryDate = new Date(plate.events[i].entryDateTime);
					var exitDate = new Date(plate.events[i].exitDateTime);

					var entryMonth = entryDate.getMonth() + 1;
					var exitMonth = exitDate.getMonth() + 1;

					//if there is no exit month, charge for the entry month
					if(exitDate.getTime() === 0 || isNaN(exitDate.getTime()))
					{
						if(!months.find(function(value){
							return entryMonth === value;
						}))
						{
							months.push(entryMonth);
							continue;
						}
					}

					//if the event spans many months, charge for them all
					if(entryMonth !== exitMonth)
					{
						for(var j = 0; j <= exitMonth - entryMonth; j++)
						{
							if(!months.find(function(value){
								return value === entryMonth + j;
							}))
							{
								months.push(entryMonth + j);
								continue;
							}
						}
					}
					//if the event spans one month, charge for it
					else
					{
						if(!months.find(function(value){

							return value === exitMonth

						}))
						{
							months.push(exitMonth);
						}
					}
				}

				due = months.length * service.price;						

				plate.due = due;
			},
			"Rotativo": function(plate, service){

				//this service charges by hour
				var due = 0;

				//for each event
				for(var i = 0; i < plate.events.length; i++)
				{		
					var toDate, fromDate;

					toDate = new Date(plate.events[i].exitDateTime);

					fromDate = new Date(plate.events[i].entryDateTime);

					if(toDate.getTime() === 0 || isNaN(toDate.getTime()))
						continue;

					//multiply the service price by the elapsed parking hours
					//36e5 is the scientific notation for 3600000
					//dividing miliseconds by this gives a value in hours
					var value = (Math.abs(toDate.getTime() - fromDate.getTime()) / 36e5) * service.price;

					due += value;
				}

				plate.due = due;
			}
		};

		PlateManagerServiceProvider.defaults.parkingServices = services;
		PlateManagerServiceProvider.defaults.dueCalculators = dueCalculators;

		MetaServiceProvider.defaults.companyName = name;
	}

})();