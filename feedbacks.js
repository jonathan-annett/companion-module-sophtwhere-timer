const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
	 
	self.setFeedbackDefinitions({

		Expired: booleanFeedback (
			'expired',
			combineRgb(0, 0, 0),
			combineRgb(255, 0, 0),
			'Running',
			'Expired'), 
		
		Impending:  booleanFeedback (
			'impending',
			combineRgb(0, 0, 0),
			combineRgb(255, 128, 0),
			'More than a minute remaining',
			'Less than a minute remaining'),
		
		Paused:  booleanFeedback (
			'paused',
			combineRgb(0,0,255),
			combineRgb(0, 0, 0),
			'Timer is Running',
			'Timer is Paused',
			'pausing'
		),

		AdjustingDown:  booleanFeedback (
			'adjusting_down',
			combineRgb(255,255,0),
			combineRgb(0, 0, 0),
			'Timer is Running',
			'Timer is Slowing down to match real time'
		),

		AdjustingUp:  booleanFeedback (
			'adjusting_up',
			combineRgb(0,255,255),
			combineRgb(0, 0, 0),
			'Timer is Running',
			'Timer is Speeding Up to match real time'
		),


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
				const isPausing      = self.getVariableValue('pausing');
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



	 	
	});

		
	function booleanFeedback (name,bgcolor,color,offText,onText,varName,func) {
		const def = {};
		const nameLower = name.toLowerCase();
		const FeedbackName = name.charAt(0).toUpperCase()+nameLower.substring(1); 
		const optionStateName =  nameLower+'Status';
		varName = varName || nameLower;

		return {
			name : nameLower,

			type: 'boolean',

			defaultStyle: {
				bgcolor: bgcolor,
				color: color
			},

			options: [
				{
					type: 'dropdown',
					label: 'Which Status?',
					id:optionStateName,
					default: '1',
					choices: [
						{ id: '0', label: offText },
						{ id: '1', label: onText },
					],
				}
			],
			callback: func || function (feedback) {
				return ( self.getVariableValue(varName) ? '1' : '0') === feedback.options[optionStateName];				 		 
			},

			
			

		};

	}
}

