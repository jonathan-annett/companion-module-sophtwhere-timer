const { combineRgb } = require('@companion-module/base');
const actionDef = {

	bar : {
		name: 'Toggle Bar Display',
		options: [
			],
		callback: async (event) => {0
			actionDef.api.send({
				cmd:"bar"
			});
		},
	},

	presets : {

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
	}
		
};

module.exports = function (self) {
	actionDef.api = self.api;
	return actionDef;
};
