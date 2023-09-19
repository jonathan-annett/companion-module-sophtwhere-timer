const { combineRgb } = require('@companion-module/base');

const actionDef =  {

	
	presenter : {
		name: 'Toggle Presenter',
		options: [
			],
		callback: async (event) => {
			actionDef.api.send({
				cmd:"presenter"
			});
		},

	},
	presets : {
	 
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

	}
};


module.exports = function (self) {
	actionDef.api = self.api;
	return actionDef;
};
