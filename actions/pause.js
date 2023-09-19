const { combineRgb } = require('@companion-module/base');

const actionDef =  {

	pause : {
		name: 'Pause',
		options: [
			],
		callback: async (event) => {
			actionDef.api.send({
				cmd:"pause"
			});
		},
	},

	undopause : {
		name: 'Undo Pause',
		options: [
			],
		callback: async (event) => {
			actionDef.api.send({
				cmd:"undopause"
			});
		},
	},

	presets : {
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


	}
};


module.exports = function (self) {
	actionDef.api = self.api;
	return actionDef;
};

