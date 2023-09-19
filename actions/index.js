/*!
 * companion-module-sophtwhere-timer/actions/index.js
 * Copyright(c) 2023 Jonathan Annett
 * MIT Licensed
 */

module.exports = function (self) {

	const api = self.api;
	   
	const acts = {
	};

	[
		'start',
		'default',
		'pause',
		'bar',
		'time',
		'presenter',
		'messages',
		'adjust',
		'nudge',
		'catchup',
		'customMessage',
		'setTimerColor'

	].forEach(function(x){ acts[x]=require(`./${x}`)(self);});

	const actionDefs = {

		restart      : acts.start.restart,
		startNew     : acts.start.startNew,

		setDefault   : acts.default.setDefault,

		pause        : acts.pause.pause,
		undopause    : acts.pause.undopause,

		bar          : acts.bar.bar,
		time         : acts.time.time,
		presenter    : acts.presenter.presenter,


		messages     : acts.messages.messages,

		nudge         : acts.nudge.nudge,		
		catchup       :  acts.catchup.catchup,
		
		adjust        : acts.adjust.adjust,

		customMessage : acts.customMessage.customMessage,

		setTimerColor : acts.setTimerColor.setTimerColor,
		
	};
    
	
	api.updateTimerColors = acts.setTimerColor.updateTimerColors;
	api.actions = acts;
	api.presets = {};
	Object.keys(api.actions).forEach(function(libName){
		const lib = api.actions[libName];
		if (lib && lib.presets) {
			Object.keys(lib.presets).forEach(function(presetKey){
				if (!!lib.presets[presetKey]) {
					api.presets[presetKey] = lib.presets[presetKey];
				} else {
					console.log('warning:',presetKey,'is already defined, in',libName);
				}
			});			
		}
	});

	self.setActionDefinitions(actionDefs);

	 
}
