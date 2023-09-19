const { combineRgb } = require('@companion-module/base');

const actionDef = {

	catchup  : {
		name: 'Catchup to realtime',
		options: [
			],
		callback: async (event) => {
			actionDef.api.send({
				cmd:"catchup"
			});
		},
	},

	presets : {
		
		catchup : {
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
		}
	},

};

module.exports = function (self) {
	actionDef.api = self.api;
	return actionDef;
};
