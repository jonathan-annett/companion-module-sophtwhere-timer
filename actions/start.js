const { combineRgb } = require('@companion-module/base');
const { durationOptions, getMsec } = require('./durations');

const stdTimes = [5,10,15,20,25,30,35,40,45,50,55];

const actionDef =  {

	restart : {
		name: 'Restart',
		options: [
		],
		callback: async (event) => {
			actionDef.api.send({
				cmd:"start"
			});
		},
	},

	startNew : {
		name: 'Start New Timer',
		options: JSON.parse(JSON.stringify(durationOptions)),
		callback: async (event) => {
			actionDef.api.send({
				cmd:"start",
				msecs:getMsec (event)
			});
		},
	},


	presets  : {

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

	}
};



stdTimes.forEach(function(mins){
	actionDef.presets[`${mins} Minutes`] =  {
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

actionDef.presets['1 Hour'] =  {
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

actionDef.presets['2 Hours'] =  {
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


module.exports = function (self) {
	actionDef.api = self.api;
	return actionDef;
};

