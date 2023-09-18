const { combineRgb } = require('@companion-module/base');
const { splitHMS } = require('./server/splitHMS')

module.exports = function (self) {

	const api = self.api;
	   
    const timerColors = {};
	let timerColorIndex = {};
    const choiceArray = [];
    const setTimerColorDef = {
        name: 'Set Timer Color',
        options: [
            	{
                type: 'dropdown',
                label: 'Timer Color Name',
                id: 'timerColorName',
                default: '0',
                tooltip: 'Name of Color in timer screen',
                choices: choiceArray,
                minChoicesForSearch: 0
                },

                {
                id: 'htmlColor',
                type: 'textinput',
                label: 'HTML Color',
                default: "#FFFFFF"
                }, 
            ],
        callback: async (event) => {
            const colorName = timerColorIndex[event.options.timerColorName];
            console.log("updating color:",event.options);                                 
            api.send({
                cmd:"setTimerColor",
                name:colorName,
                color:event.options.htmlColor
            });            
                
        }
    };   

	const actionDefs = {

	
		restart : {
			name: 'Restart',
			options: [
			],
			callback: async (event) => {0
				api.send({
					cmd:"start"
				});
			},
		},

		startNew : {
			name: 'Start New Timer',
			options: [
				{
					id: 'days',
					type: 'number',
					label: 'Days',
					default: 0,
					min: 0,
					max: 365,
				},
				{
					id: 'hours',
					type: 'number',
					label: 'Hours',
					default: 0,
					min: 0,
					max: 23,
				},
				{
					id: 'mins',
					type: 'number',
					label: 'Minutes',
					default: 10,
					min: 0,
					max: 59,
				},
				{
					id: 'secs',
					type: 'number',
					label: 'Seconds',
					default: 0,
					min: 0,
					max: 59,
				}, 
			],
			callback: async (event) => {0
				let tally = event.options.days;
				tally = (tally * 24) + event.options.hours;
				tally = (tally * 60) + event.options.mins;
				tally = (tally * 60) + event.options.secs;


				api.send({
					cmd:"start",
					msecs:tally * 1000
				});



			},
		},

		setDefault : {
			name: 'Set Default Time',
			options: [
				{
					id: 'days',
					type: 'number',
					label: 'Days',
					default: 0,
					min: 0,
					max: 365,
				},
				{
					id: 'hours',
					type: 'number',
					label: 'Hours',
					default: 0,
					min: 0,
					max: 23,
				},
				{
					id: 'mins',
					type: 'number',
					label: 'Minutes',
					default: 10,
					min: 0,
					max: 59,
				},
				{
					id: 'secs',
					type: 'number',
					label: 'Seconds',
					default: 0,
					min: 0,
					max: 59,
				}, 
			],
			callback: async (event) => {0
				let tally = event.options.days;
				tally = (tally * 24) + event.options.hours;
				tally = (tally * 60) + event.options.mins;
				tally = (tally * 60) + event.options.secs;


				api.send({
					cmd:"default",
					msecs:tally * 1000
				});



			},
		},

		pause : {
			name: 'Pause',
			options: [
				],
			callback: async (event) => {
				api.send({
					cmd:"pause"
				});
			},
		},

		undopause : {
			name: 'Undo Pause',
			options: [
				],
			callback: async (event) => {0
				api.send({
					cmd:"undopause"
				});
			},
		},

		bar : {
			name: 'Toggle Bar Display',
			options: [
				],
			callback: async (event) => {0
				api.send({
					cmd:"bar"
				});
			},
		},

		time : {
			name: 'Toggle Time Of Day Display',
			options: [
				],
			callback: async (event) => {0
				api.send({
					cmd:"time"
				});
			},
		},

		presenter : {
			name: 'Toggle Presenter',
			options: [
				],
			callback: async (event) => {0
				api.send({
					cmd:"presenter"
				});
			},

		},

	

		minus1 : {
			name: 'subtract 1 second from current timer',
			options: [
				],
			callback: async (event) => {0
				api.send({
					cmd:"minus1"
				});
			},
		},


		plus1 : {
			name: 'add 1 second to current timer',
			options: [
				],
			callback: async (event) => {0
				api.send({
					cmd:"plus1"
				});
			},
		},
		

		minus1Min : {
			name: 'subtract 1 minute from current timer',
			options: [
				],
			callback: async (event) => {0
				api.send({
					cmd:"minus1Min"
				});
			},
		},

		
		plus1Min : {
			name: 'add 1 minute to current timer',
			options: [
				],
			callback: async (event) => {0
				api.send({
					cmd:"plus1Min"
				});
			},
		},

		catchup  : {
			name: 'Catchup to realtime',
			options: [
				],
			callback: async (event) => {0
				api.send({
					cmd:"catchup"
				});
			},
		},

		messages : {
			name: 'Toggle Messages Display',
			options: [
				],
			callback: async (event) => {0
				api.send({
					cmd:"messages"
				});
			},
		},

		customMessage : {
			name: 'Display Custom Message',
			options: [
				{
					id: 'text',
					type: 'textinput',
					label: 'Text',
					default: ""
				}, 
				],
			callback: async (event) => {0
				api.send({
					cmd:"customMessage",
					text:event.options.text
				});

				 
			},
		},


		setTimerColor : setTimerColorDef,
		
	};
    
    function updateTimerColors(colors) {
         
        Object.keys(colors).forEach(function(n){
            timerColors[n]= colors[n];
        });
       
        choiceArray.splice(0,choiceArray.length);
		
		timerColorIndex = {};
		Object.keys(actionDefs).filter(function(k){
			return k.startsWith('setTimerColor-');
		}).forEach(function(k){
			delete actionDefs[k];
		});

        Object.keys(timerColors).forEach(function(colorName,id){
            choiceArray.push({id : id.toString(),label:colorName});
			timerColorIndex[id.toString()]=colorName;
			const currentColor =  timerColors[colorName];

			actionDefs['setTimerColor-'+colorName] = {
				name: 'Set Timer Color:'+colorName,
				options: [
						{
							id: 'htmlColor'+colorName,
							type: 'textinput',
							label: 'HTML Color for '+colorName,
							default:currentColor 
					}
				],
				callback: async (event) => {
					api.send({
						cmd:"setTimerColor",
						name:colorName,
						color:event.options['htmlColor'+colorName]
					});            						
				}
			};   
		
        });

		self.setActionDefinitions(actionDefs);

    }

	self.api.updateTimerColors = updateTimerColors;

	self.setActionDefinitions(actionDefs);

}
