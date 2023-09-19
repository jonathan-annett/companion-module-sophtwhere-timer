const { combineRgb } = require('@companion-module/base');
const actionDef = {

	messages : {
		name: 'Toggle Messages Display',
		options: [
			],
		callback: async (event) => {
			actionDef.api.send({
				cmd:"messages"
			});
		},
	},

	presets : {


		'messages': {
			type: 'button',
			category: 'Messages',
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


	}
};




module.exports = function (self) {
	actionDef.api = self.api;
	return actionDef;
};
