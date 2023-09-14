const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const { splitHMS } = require('./splitHMS')

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions

		const api = require('./server.js').api;

		api.config(config);

		const setVars = this.setVariableValues.bind(this);

		api.setVariableValues = function (vars) {
			const vars2 = {};
			Object.keys(vars).forEach(function(k){
				const val = vars[k];
				vars2[k]=val;
				if (k==="remain" || k==="elapsed") {
					const extra = splitHMS(val);
					Object.keys(extra).forEach(function(kk){
						vars2[`${k}_${kk}`] = extra[kk];
					});
				}
			});
			setVars(vars2);
		}

		

	 
	}


	
		
	
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
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
					'You can override the default internal port. If you use port 8088, the timer will be accessible http://localhost:8088/\n\nPlease restart Companion after changing and saving the port',
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Internal Port',
				width: 4,
				regex: Regex.PORT,
				value : 8088
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
