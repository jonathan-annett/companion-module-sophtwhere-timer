const { combineRgb } = require('@companion-module/base');
const { durationOptions, getMsec } = require('./durations');

const actionDef =  {

	nudge : {
		name: 'nudge current timer',
		options:  [
			{
				type: 'dropdown',
				label: 'Add or Subtract Time?',
				id: 'addtime',
				default: '1',
				choices: [
					{ id: '0', label: 'Subtract Time' },
					{ id: '1', label: 'Add Time' },
				]
			}
		].concat(
			JSON.parse(JSON.stringify(durationOptions)).slice(1)
		),
		callback: async (event) => {
			actionDef.api.send({
				cmd: "nudge",
				msecs  : getMsec (event),
				addtime : event.options.addtime === '1' 
			});
		},
	},


	presets : {
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

	}


};



module.exports = function (self) {
	actionDef.api = self.api;
	return actionDef;
};

