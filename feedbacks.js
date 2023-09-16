const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
	 
	self.setFeedbackDefinitions({
		Expired: {
			name: 'expired',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 0),
				color: combineRgb(255, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Which Status?',
					id: 'expiredStatus',
					default: '1',
					choices: [
						{ id: '0', label: 'Running' },
						{ id: '1', label: 'Expired' },
					],
				},
			],
			callback: (feedback) => {
				const hasExpired = self.getVariableValue('expired') ? '1' : '0';
				return hasExpired === feedback.options.expiredStatus;				 
			},
		},

		Impending: {
			name: 'impending',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 0),
				color: combineRgb(255, 128, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Which Status?',
					id: 'impendingStatus',
					default: '1',
					choices: [
						{ id: '0', label: 'Running' },
						{ id: '1', label: 'Impending' },
					],
				},
			],
			callback: (feedback) => {
				const hasExpired = self.getVariableValue('impending') ? '1' : '0';
				return hasExpired === feedback.options.impendingStatus;				 
			},
		},

		Paused: {
			name: 'paused',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0,0,255),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Which Status?',
					id: 'pausedStatus',
					default: '1',
					choices: [
						{ id: '0', label: 'Running' },
						{ id: '1', label: 'Paused' },
					],
				},
			],
			callback: (feedback) => {
				const isPaused = Number(self.getVariableValue('pausedMsec')) === 0 ? '0' : '1';
				return isPaused === feedback.options.pausedStatus;				 
			},
		},


		ShowTimeNow: {
			name: 'Show Time Now',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0,255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Which Status?',
					id: 'displayStatus',
					default: '1',
					choices: [
						{ id: '0', label:  "Don't Display Time Now" },
						{ id: '1', label: 'Display Time Now' },
					],
				},
			],
			callback: (feedback) => {
				return self.getVariableValue('showtimenow') === feedback.options.displayStatus;				 
			},
		},

		ShowBarDisplay: {
			name: 'Show Countdown Bar',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0,255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Which Status?',
					id: 'displayStatus',
					default: '1',
					choices: [
						{ id: '0', label: "Don't Display Countdown Bar" },
						{ id: '1', label: 'Display Countdown Bar' },
					],
				},
			],
			callback: (feedback) => {
				return self.getVariableValue('showbar') === feedback.options.displayStatus;				 
			},
		},

		ShowMessages: {
			name: 'Show Messages (Last Minute/Time is Up)',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0,255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Which Status?',
					id: 'displayStatus',
					default: '1',
					choices: [
						{ id: '0', label:  "Don't Display Messages" },
						{ id: '1', label: 'Display Messages' },
					],
				},
			],
			callback: (feedback) => {
				return self.getVariableValue('showmessages') === feedback.options.displayStatus;					 
			},
		}



	 	
	})
}
