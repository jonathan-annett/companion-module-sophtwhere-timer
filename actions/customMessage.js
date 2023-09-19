const { combineRgb } = require('@companion-module/base');

const actionDef = {


	customMessage : {
		name: 'Display Custom Message',
		options: [
			{
				id: 'text',
				type: 'textinput',
				label: 'Text',
				default: ""
			}, 
			],
		callback: async (event) => {
			actionDef.api.send({
				cmd:"customMessage",
				text:event.options.text
			});

				
		},
	},

	presets : {

		'clearcustom': {
			type: 'button',
			category: 'Messages',
			name: 'Clear Custom Message',
			style: {
				text: 'Clear\n(Remove Message)',
				size: '14',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'customMessage',
							options: {
								text : ""
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		},

		'standbymessage': {
			type: 'button',
			category: 'Messages',
			name: 'Stand By Message',
			style: {
				text: 'Stand By',
				size: '14',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'customMessage',
							options: {
								text : "Stand By"
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		},

		'delayedmessage': {
			type: 'button',
			category: 'Messages',
			name: 'Speaker is Delayed Message',
			style: {
				text: 'Speaker is Delayed',
				size: '14',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'customMessage',
							options: {
								text : "Speaker is Delayed"
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				
			],
		},

		'readytogomessage': {
			type: 'button',
			category: 'Messages',
			name: 'Ready to Start? Message',
			style: {
				text: 'Ready To Start?',
				size: '14',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'customMessage',
							options: {
								text : "Ready to Start?"
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
