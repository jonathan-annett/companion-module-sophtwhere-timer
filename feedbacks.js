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
				return (self.getVariableValue('expired') ? '1' : '0') === feedback.options.expiredStatus;				 		 
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
				return (self.getVariableValue('impending') ? '1' : '0') === feedback.options.impendingStatus;				 
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
				return (self.getVariableValue('pausing') ? '1' : '0') === feedback.options.pausedStatus;				 		 
			},
		},

		PauseBackLog: {
			name: 'pausebacklog',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0,128,128),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Which Status?',
					id: 'backlogStatus',
					default: '1',
					choices: [
						{ id: '0', label: 'No Backlog' },
						{ id: '1', label: 'Paused Backlog Exists' },
					],
				},
			],
			callback: (feedback) => {
				const isPausing = self.getVariableValue('pausing');
				const pauseAccumText = self.getVariableValue('pauses') ;
				return ( (pauseAccumText==='0:00' && !isPausing ) ? '0' : '1') === feedback.options.backlogStatus;				 		 
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
