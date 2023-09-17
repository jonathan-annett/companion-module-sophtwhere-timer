const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const { splitHMS } = require('./server/splitHMS')


class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		this.api = require('./server/server.js').api;

		this.updateStatus(InstanceStatus.Ok)
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions

		

		this.api.config(config);

		const setVars = this.setVariableValues.bind(this);
		const checkFeedbacks = this.checkFeedbacks.bind(this);

		
		 
		this.api.setVariableValues = function (vars) {
			const vars2 = {};
			Object.keys(vars).forEach(function(k){
				const val = vars[k];
				vars2[k]=val;
				if (k==="remain" || k==="elapsed" ) {
					const extra = splitHMS(val);
					Object.keys(extra).forEach(function(kk){
						vars2[`${k}_${kk}`] = extra[kk];
					});
				}

			});
			setVars(vars2);
			checkFeedbacks();
		}
	 
	}


	
		
	
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
		this.api.config(config,true);
	}

	// Return config fields for web config
	getConfigFields() {
		return [

			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value:
					'Use the link on the help page to open the timer window',
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'HTTP Port',
				width: 4,
				regex: Regex.PORT,
				default : '8088'
				
			},
		]
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
