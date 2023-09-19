const { durationOptions, getMsec } = require('./durations');
const { combineRgb } = require('@companion-module/base');
const stdTimes = [5,10,15,20,25,30,35,40,45,50,55];
const actionDef = {

	setDefault : {
		name: 'Set Default Time',
		options: JSON.parse(JSON.stringify(durationOptions)),
		callback: async (event) => {
		
			actionDef.api.send({
				cmd:"default",
				msecs:getMsec (event)
			});



		},
	},

	presets : {
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

	}
};




module.exports = function (self) {
	actionDef.api = self.api;
	return actionDef;
};
