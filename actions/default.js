const { durationOptions, getMsec } = require('./durations');
const { combineRgb } = require('@companion-module/base');
const stdTimes = [5,10,15,20,25,30,35,40,45,50,55];
const actionDef = {

	setDefault : {
		name: 'Set Default Time',
		options: JSON.parse(JSON.stringify(durationOptions)),
		callback: async (event) => {
		
			actionDef.api.send({
				cmd:"default",
				msecs:getMsec (event)
			});



		},
	},

	presets : {
		'default': {
			type: 'button',
			category: 'Timer',
			name: 'Default Duration',
			style: {
				text: 'Restart\n$(timer:default)',
				size: '18',
				color: combineRgb(255, 255, 255),
			    bgcolor: combineRgb(0, 0, 0),
	
			},
			steps: [
				{
					down: [
						{
							actionId: 'restart',
							options: {},
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
 
 stdTimes.forEach(function(mins){
	actionDef.presets[`${mins} Minutes Default`] =  {
		 type: 'button',
		 category: 'Default Durations',
		 name: `default${mins}`,
		 style: {
			 text: `${mins} mins`,
			 size: '18',
			 color: combineRgb(255, 255, 255),
			 bgcolor: combineRgb(0, 0, 0),
		 },
		 steps: [
			 {
				 down: [
					 {
						 actionId: 'setDefault',
						 options: {days:0,hours:0,mins:mins,secs:0},
					 },
				 ],
				 up: [],
			 },
		 ]
    };
 });

 actionDef.presets['1 Hour Default'] =  {
	 type: 'button',
	 category: 'Default Durations',
	 name: `default60`,
	 style: {
		 text: `1 hour`,
		 size: '18',
		 color: combineRgb(255, 255, 255),
		 bgcolor: combineRgb(0, 0, 0),
	 },
	 steps: [
		 {
			 down: [
				 {
					 actionId: 'setDefault',
					 options: {days:0,hours:1,mins:0,secs:0},
				 },
			 ],
			 up: [],
		 },
	 ]
 };

 actionDef.presets['2 Hours Default'] =  {
	 type: 'button',
	 category: 'Default Durations',
	 name: `default120`,
	 style: {
		 text: `2 hours`,
		 size: '18',
		 color: combineRgb(255, 255, 255),
		 bgcolor: combineRgb(0, 0, 0),
	 },
	 steps: [
		 {
			 down: [
				 {
					 actionId: 'startNew',
					 options: {days:0,hours:2,mins:0,secs:0},
				 },
			 ],
			 up: [],
		 },
	 ]
 };

module.exports = function (self) {
	actionDef.api = self.api;
	return actionDef;
};
