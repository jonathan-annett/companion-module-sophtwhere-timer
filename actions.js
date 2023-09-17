const { combineRgb } = require('@companion-module/base');
const { splitHMS } = require('./splitHMS')

module.exports = function (self) {

	   
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
            const api = require('./server.js').api;
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
				const api = require('./server.js').api;
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
				const api = require('./server.js').api;
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
				const api = require('./server.js').api;
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
			callback: async (event) => {0
				const api = require('./server.js').api;
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
				const api = require('./server.js').api;
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
				const api = require('./server.js').api;
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
				const api = require('./server.js').api;
				api.send({
					cmd:"time"
				});
			},
		},

	

		minus1 : {
			name: 'subtract 1 second from current timer',
			options: [
				],
			callback: async (event) => {0
				const api = require('./server.js').api;
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
				const api = require('./server.js').api;
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
				const api = require('./server.js').api;
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
				const api = require('./server.js').api;
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
				const api = require('./server.js').api;
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
				const api = require('./server.js').api;
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
				const api = require('./server.js').api;
					 
				
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
					const api = require('./server.js').api;
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

	const hmsKeys = Object.keys(splitHMS('0:0'));
	 
	self.setActionDefinitions(actionDefs)

	const presets = {

		'restart': {
			type: 'button',
			category: 'Timer',
			name: 'Restart',
			style: {
				text: 'Restart',
				size: '18',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'restart',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		},

		
		'default': {
			type: 'button',
			category: 'Timer',
			name: 'Default Duration',
			style: {
				text: 'Restart\n$(timer:default)',
				size: '18',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'restart',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		},


		'pause': {
			type: 'button',
			category: 'Timer',
			name: 'Pause',
			style: {
				text: 'Pause',
				size: '18',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'pause',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'Paused',
					style: {
						bgcolor: combineRgb(0,0,255),
						color: combineRgb(255, 255, 255),
						text : "Paused\n$(timer:paused)"
					},
					options: {
						pausedStatus: '1',
					},
				},
			],
		},

		
		'undopause': {
			type: 'button',
			category: 'Timer',
			name: 'Undo Pause',
			style: {
				text: 'Undo Pause',
				size: '18',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'undopause',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'PauseBackLog',
					style: {
						bgcolor: combineRgb(0,128,128),
						color: combineRgb(255, 255, 255),
						text : "Undo Pause\n$(timer:pauses)",
						size: '14'
					},
					options: {
						backlogStatus: '1',
					},
				},
			],
		},

		'remaining': {
			type: 'button',
			category: 'Time Remaining',
			name: 'Remaining',
			style: {
				text: '$(timer:remain)',
				size: '24',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
					 
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'Expired',
					style: {
						bgcolor: combineRgb(0, 0, 0),
					    color: combineRgb(255, 0, 0),
					},
					options: {
						expiredStatus: '1',
					},
				},
				{
					feedbackId: 'Impending',
					style: {
						bgcolor: combineRgb(0, 0, 0),
					    color: combineRgb(255, 128, 0),
					},
					options: {
						impendingStatus: '1',
					},
				},
			],
		},

		'elapsed': {
			type: 'button',
			category: 'Time Elapsed',
			name: 'Elapsed',
			style: {
				text: '$(timer:elapsed)',
				size: '24',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
					 
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		},

		'paused': {
			type: 'button',
			category: 'Time Paused',
			name: 'Paused',
			style: {
				text: '$(timer:paused)',
				size: '24',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
					 
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		},

		'pauses': {
			type: 'button',
			category: 'Accumulated Pause Time',
			name: 'Pauses',
			style: {
				text: '$(timer:pauses)',
				size: '24',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
					 
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		},


		'endsAt': {
			type: 'button',
			category: 'Timer',
			name: 'Ends At',
			style: {
				text: 'Ends At\n$(timer:endsAt)',
				size: '18',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
					 
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		},

		'startedAt': {
			type: 'button',
			category: 'Timer',
			name: 'Started At',
			style: {
				text: 'Started\n$(timer:startedAt)',
				size: '18',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
					 
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		},		
		
		'minus1': {
			type: 'button',
			category: 'Adjust Timer',
			name: 'Minus1',
			style: {
				text: '- 1 sec',
				size: '18',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'minus1',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		},

		'minus1min': {
			type: 'button',
			category: 'Adjust Timer',
			name: 'Minus1Min',
			style: {
				text: '- 1 min',
				size: '18',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'minus1Min',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		},

		
		'plus1min': {
			type: 'button',
			category: 'Adjust Timer',
			name: 'Plus1Min',
			style: {
				text: '+ 1 min',
				size: '18',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'plus1Min',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		},

		'plus1': {
			type: 'button',
			category: 'Adjust Timer',
			name: 'Plus1',
			style: {
				text: '+ 1 sec',
				size: '18',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'plus1',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		},


		'catchup': {
			type: 'button',
			category: 'Adjust Timer',
			name: 'Catchup to Real Time',
			style: {
				text: 'Realtime',
				size: '14',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'catchup',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		},

		
		'bar': {
			type: 'button',
			category: 'Display Modes',
			name: 'Toggle Progress Bar Display',
			style: {
				text: 'Progress\nBar',
				size: '14',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'bar',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'ShowBarDisplay',
					style: {
						bgcolor: combineRgb(0,255, 0),
						color: combineRgb(0, 0, 0),
					},
					options: {
						displayStatus: '1',
					},
				},
			],
		},

		'time': {
			type: 'button',
			category: 'Display Modes',
			name: 'Toggle Time Of Day Display',
			style: {
				text: 'Time Of Day',
				size: '14',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'time',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'ShowTimeNow',
					style: {
						bgcolor: combineRgb(0,255, 0),
						color: combineRgb(0, 0, 0),
					},
					options: {
						displayStatus: '1',
					},
				},
			],
		},

		'messages': {
			type: 'button',
			category: 'Display Modes',
			name: 'Toggle Last Minute & Time is Up Messages',
			style: {
				text: 'Last Minute\n\nTime is Up',
				size: '7',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'messages',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'ShowMessages',
					style: {
						bgcolor: combineRgb(0,255, 0),
						color: combineRgb(0, 0, 0),
					},
					options: {
						displayStatus: '1',
					},
				},
			],
		},

	};

	hmsKeys.forEach(function(k){
		presets[`Remaining ${k}`]={
			type: 'button',
			category: 'Time Remaining',
			name: `Remaining ${k}`,
			style: {
				text: `$(timer:remain_${k})`,
				size: '18',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
					 
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'Expired',
					style: {
						bgcolor: combineRgb(0, 0, 0),
					    color: combineRgb(255, 0, 0),
					},
					options: {
						expiredStatus: '1',
					},
				},

				{
					feedbackId: 'Impending',
					style: {
						bgcolor: combineRgb(0, 0, 0),
					    color: combineRgb(255, 128, 0),
					},
					options: {
						impendingStatus: '1',
					},
				},
			],
		};
	});

	hmsKeys.forEach(function(k){
		presets[`Elapsed ${k}`]={
			type: 'button',
			category: 'Time Elapsed',
			name: `Elapsed ${k}`,
			style: {
				text: `$(timer:elapsed_${k})`,
				size: '18',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
					 
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		};
	});


   const stdTimes = [5,10,15,20,25,30,35,40,45,50,55];

   stdTimes.forEach(function(mins){
		presets[`${mins} Minutes`] =  {
			type: 'button',
			category: 'Hot Start Buttons',
			name: `start${mins}`,
			style: {
				text: `${mins} mins`,
				size: '18',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(255, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'startNew',
							options: {days:0,hours:0,mins:mins,secs:0},
						},
					],
					up: [],
				},
			]
		};
	});

	presets['1 Hour'] =  {
		type: 'button',
		category: 'Hot Start Buttons',
		name: `start60`,
		style: {
			text: `1 hour`,
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'startNew',
						options: {days:0,hours:1,mins:0,secs:0},
					},
				],
				up: [],
			},
		]
	};

	presets['2 Hours'] =  {
		type: 'button',
		category: 'Hot Start Buttons',
		name: `start120`,
		style: {
			text: `2 hours`,
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'startNew',
						options: {days:0,hours:2,mins:0,secs:0},
					},
				],
				up: [],
			},
		]
	};

	
	stdTimes.forEach(function(mins){
		presets[`${mins} Minutes Default`] =  {
			type: 'button',
			category: 'Default Durations',
			name: `default${mins}`,
			style: {
				text: `${mins} mins`,
				size: '18',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'setDefault',
							options: {days:0,hours:0,mins:mins,secs:0},
						},
					],
					up: [],
				},
			]
		};
	});

	presets['1 Hour Default'] =  {
		type: 'button',
		category: 'Default Durations',
		name: `default60`,
		style: {
			text: `1 hour`,
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'setDefault',
						options: {days:0,hours:1,mins:0,secs:0},
					},
				],
				up: [],
			},
		]
	};

	presets['2 Hours Default'] =  {
		type: 'button',
		category: 'Default Durations',
		name: `default120`,
		style: {
			text: `2 hours`,
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'startNew',
						options: {days:0,hours:2,mins:0,secs:0},
					},
				],
				up: [],
			},
		]
	};


	self.setPresetDefinitions(presets);


}
