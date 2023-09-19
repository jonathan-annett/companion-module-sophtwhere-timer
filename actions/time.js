const { combineRgb } = require('@companion-module/base');

const actionDef =  {

	time : {
		name: 'Toggle Time Of Day Display',
		options: [
			],
		callback: async (event) => {
			actionDef.api.send({
				cmd:"time"
			});
		},
	},

	presets : {

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

	}
		
};


module.exports = function (self) {
	actionDef.api = self.api;
	return actionDef;
};

