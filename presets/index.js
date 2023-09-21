/*!
 * companion-module-sophtwhere-timer/presets/index.js
 * Copyright(c) 2023 Jonathan Annett
 * MIT Licensed
 */
const { combineRgb } = require('@companion-module/base');
const { splitHMS } = require('../server/splitHMS')
const hmsKeys = Object.keys(splitHMS('0:0'));

module.exports = function (self) {
	const api = self.api;

	const variable_presets = {

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

		'actual_remaining': {
			type: 'button',
			category: 'Actual Time Remaining',
			name: 'Actual Remaining',
			style: {
				text: '$(timer:remain_actual)',
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
		} 

	};

	const presets = {
		...api.presets,
		...variable_presets
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



	self.setPresetDefinitions(presets);


}

/*


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
						text : "$(timer:paused)\nResume\n"
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
				text: 'Remove Pauses',
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
						text : "Remove Pauses\n$(timer:pauses)",
						size: '14'
					},
					options: {
						backlogStatus: '1',
					},
				},
			],
		},
*/
		
/* 'minus1': {
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
							actionId: 'nudge',
							options: {
								hours : 0,
								mins  : 0,
								secs  : 0,
								msecs : '1000',
								addtime : '0'
							},
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
							actionId: 'adjust',
							options: {
								hours : 0,
								mins  : 0,
								secs  : 0,
								msecs : '60000',
								addtime : '0'
							},
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
							actionId: 'adjust',
							options: {
								hours : 0,
								mins  : 0,
								secs  : 0,
								msecs : '60000',
								addtime : '1'
							},
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
							actionId: 'nudge',
							options: {
								hours : 0,
								mins  : 0,
								secs  : 0,
								msecs : '1000',
								addtime : '1'
							},
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
				{
					feedbackId: 'AdjustingDown',
					style: {
						bgcolor: combineRgb(255,255,0),
						color: combineRgb(0, 0, 0),
						text : "$(timer:adjusting_delta) seconds\n(SLOWING)",
						size: '7'
					},
					options: {
						adjusting_downStatus: '1',
					},
				},

				{
					feedbackId: 'AdjustingUp',
					style: {
						bgcolor: combineRgb(0,255,255),
						color: combineRgb(0, 0, 0),
						text : "+$(timer:adjusting_delta) seconds\n(SPEEDING)",
						size: '7'
					},
					options: {
						adjusting_upStatus: '1',
					},
				},
			],
		},

		
		bar : {
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

		'presenter': {
			type: 'button',
			category: 'Display Modes',
			name: 'Toggle Presenter Mode',
			style: {
				text: 'Presenter Mode',
				size: '7',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'presenter',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'ShowPresenter',
					style: {
						bgcolor: combineRgb(0,255,128),
						color: combineRgb(0, 0, 0),
					},
					options: {
						displayStatus: '1',
					},
				},
			],
		},

*/