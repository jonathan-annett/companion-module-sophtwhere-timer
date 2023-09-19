const timerColors = {};
let timerColorIndex = {};
const choiceArray = [];

const { combineRgb } = require('@companion-module/base');

const actionDef =  {

	setTimerColorDef : {
		name: 'Set Timer Color',
		options: [
				{
				type: 'dropdown',
				label: 'Timer Color Name',
				id: 'timerColorName',
				default: '0',
				tooltip: 'Name of Color in timer screen',
				choices: choiceArray,
				minChoicesForSearch: 0
				},

				{
				id: 'htmlColor',
				type: 'textinput',
				label: 'HTML Color',
				default: "#FFFFFF"
				}, 
			],
		callback: async (event) => {
			const colorName = timerColorIndex[event.options.timerColorName];
			console.log("updating color:",event.options);                                 
			api.send({
				cmd:"setTimerColor",
				name:colorName,
				color:event.options.htmlColor
			});            
				
		}
	},

	updateTimerColors : updateTimerColors,

	presets : {

		
	}

		
};


function updateTimerColors(colors) {
		
	Object.keys(colors).forEach(function(n){
		timerColors[n]= colors[n];
	});
	
	choiceArray.splice(0,choiceArray.length);
	
	timerColorIndex = {};
	Object.keys(actionDefs).filter(function(k){
		return k.startsWith('setTimerColor-');
	}).forEach(function(k){
		delete actionDefs[k];
	});

	Object.keys(timerColors).forEach(function(colorName,id){
		choiceArray.push({id : id.toString(),label:colorName});
		timerColorIndex[id.toString()]=colorName;
		const currentColor =  timerColors[colorName];

		actionDefs['setTimerColor-'+colorName] = {
			name: 'Set Timer Color:'+colorName,
			options: [
					{
						id: 'htmlColor'+colorName,
						type: 'textinput',
						label: 'HTML Color for '+colorName,
						default:currentColor 
				}
			],
			callback: async (event) => {
				api.send({
					cmd:"setTimerColor",
					name:colorName,
					color:event.options['htmlColor'+colorName]
				});            						
			}
		};   
	
	});

	self.setActionDefinitions(actionDefs);

}


module.exports = function (self) {
	actionDef.api = self.api;
	return actionDef;
};

