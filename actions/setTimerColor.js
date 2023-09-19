const timerColors = {};
let timerColorIndex = {};
const choiceArray = [];
let setActionDefinitions = function(){ console.log("warning setActionDefinitions() not defined")};
const timerColorBatches = {};
let definingTheme;

const { combineRgb,splitRgb } = require('@companion-module/base');

function compColorToHtmlColor(color) {
	const rgb =  splitRgb(color);
	return `#${
		 rgb.r.toString(16).padStart(2,'0')  }${
		 rgb.g.toString(16).padStart(2,'0')  }${
		 rgb.b.toString(16).padStart(2,'0') }`;
		 
}



const actionDef =  {

	setTimerColor : {
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
				type: 'colorpicker',
				label: 'HTML Color',
				default:  combineRgb(255, 255, 255)
				}
				 
			],
		callback: async (event) => {

			const theme = definingTheme ?  timerColorBatches [ definingTheme ] : false;
			const colorName =  timerColorIndex[event.options.timerColorName];
			const colorValue = compColorToHtmlColor(event.options.htmlColor);
			if ( theme ) {
				theme [colorName] = colorValue;
				console.log("added",colorName,"=",colorValue,"for",definingTheme,"theme:",{theme});
			} else {
				actionDef.api.send({
					cmd:"setTimerColor",
					name: colorName, 
					color: colorValue
				});    
			}

		          
				
		}
	},

	BeginColorTheme : {
		name: 'Begin Color Theme',
		options: [ 
			{
				id: 'theme',
				type: 'textinput',
				label: 'Theme Name',
				default:  'defaultTheme'
			}
		 ],
		callback: async (event) => {
			definingTheme = event.options.theme;
			timerColorBatches [ definingTheme ]  = {};	
			console.log("started",definingTheme);
			 		
		}
	},
	EndColorTheme : {
		name: 'End Color Theme',
		options: [ 
			 
		 ],
		callback: async (event) => {
			if (definingTheme && timerColorBatches [ definingTheme ]) {
				actionDef.api.send({
					cmd:"setTimerColors",
					colors:timerColorBatches [ definingTheme ]
				}); 
			}
			definingTheme=undefined;
		}
	},

	 
	updateTimerColors : updateTimerColors,

	presets : {
		
		'whiteonblack': encodeThemePreset('whiteonblack','White On Black',{
			'main-background' : combineRgb(0,0,0),
			'remain-running'  : combineRgb(255,255,255),
			'remain-running-expired' : combineRgb(255,0,0),
			'remain-running-impending': combineRgb(255,255,0),
			'progress-bar' : combineRgb(255,255,0),
			'progress-bar-background': combineRgb(255,255,0)
		}),
		
		'blackonwhite':encodeThemePreset('blackonwhite','Black On White',{
			'main-background' :  combineRgb(255,255,255),
			'remain-running'  : combineRgb(0,0,0),
			'remain-running-expired' : combineRgb(255,0,0),
			'remain-running-impending': combineRgb(255,255,0),
			'progress-bar' : combineRgb(255,255,0),
			'progress-bar-background': combineRgb(255,255,0)
		})
		
	}

		
};


function encodeThemePreset(themeId,name,colors) {
	//const themeId = name.replace(/\s/g,'').toLowerCase();
	const preset =  {
		type: 'button',
		category: 'Color Themes',
		name: name,
		style: {
			text: name,
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),

		},
		steps: [
			{
				down: [

					{
						actionId: 'BeginColorTheme',
						options: {
							 'theme' : themeId
						},
					},
					
				],
				up: [],
			},
		],
		feedbacks: [
			
		],
	};

	Object.keys(colors).forEach(function(nm){
		const entry = {
			actionId: 'setTimerColor-'+nm,
			options: {
			}
		}
		entry.options ['htmlColor-'+nm ] = colors[nm];
		preset.steps[0].down.push (entry);
	});
	preset.steps[0].down.push ({
		actionId: 'EndColorTheme',
		options: {
		},
	});

	return preset;
}

function updateTimerColors(colors) {
		

 

	Object.keys(colors).forEach(function(n){
		const {color,hexColor,colorName} = colors[n];
		const X = hexColor.replace(/^\#/,'').split('');
		const [r,g,b] = X.length >= 6 ? [ X[0]+X[1], X[2]+X[3], X[4]+X[5] ].map(function(h){return Number.parseInt(h,16)}) : [255,255,255];
		
		timerColors[n] = {rgb:combineRgb(r,g,b),color,hexColor,colorName};
	});
	
	choiceArray.splice(0,choiceArray.length);
	
	timerColorIndex = {};
	Object.keys(actionDef.api.actionDefs).filter(function(k){
		return k.startsWith('setTimerColor-');
	}).forEach(function(k){
		delete actionDef.api.actionDefs[k];
	});

	Object.keys(timerColors).forEach(function(colorName,id){
		choiceArray.push({id : id.toString(),label:colorName});
		timerColorIndex[id.toString()]=colorName;
		const currentColor =  timerColors[colorName].rgb;

		actionDef.api.actionDefs['setTimerColor-'+colorName] = {
			name: 'Set Timer Color:'+colorName,
			options: [
					{
						id: 'htmlColor-'+colorName,
						type: 'colorpicker',
						label: 'HTML Color for '+colorName,
						default:currentColor 
				}
			],
			callback: async (event) => {

				const theme = definingTheme ?  timerColorBatches [ definingTheme ] : false;
				const colorValue = compColorToHtmlColor(event.options['htmlColor-'+colorName]) 
				if ( theme ) {
					theme [colorName] = colorValue;
					console.log("added",colorName,"=",colorValue,"for",definingTheme,"theme:",{theme});
				} else {

					actionDef.api.send({
						cmd:"setTimerColor",
						name: colorName,
						color: colorValue
					});            						
				}
			}
		};   
	
	});

	setActionDefinitions(actionDef.api.actionDefs);

}


module.exports = function (self) {
	actionDef.api = self.api;
	setActionDefinitions = self.setActionDefinitions.bind(self);
	return actionDef;
};

