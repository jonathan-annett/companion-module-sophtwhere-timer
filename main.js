const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts  = require('./upgrades');
const UpdateActions   = require('./actions');
const UpdatePresets   = require('./presets');
const UpdateFeedbacks = require('./feedbacks');
const UpdateVariableDefinitions = require('./variables');
const { splitHMS }    = require('./server/splitHMS');
const { api }         = require('./server/server');

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config;
		this.api = api;
		
		this.updateStatus(InstanceStatus.Ok);
		this.updateActions(); // export actions
		this.updatePresets();// export presets
		this.updateFeedbacks(); // export feedbacks
		this.updateVariableDefinitions(); // export variable definitions

		const setVars = this.setVariableValues.bind(this);
		const checkFeedbacks = this.checkFeedbacks.bind(this);
		const parseVariablesInString = this.parseVariablesInString.bind(this);

		getIpsList(function(ips){

			api.ip_list = ips;
			api.config(config);

			api.setVariableValues = function (vars) {
				const vars2 = {};
				Object.keys(vars).forEach(function(k){
					const val = vars[k];
					if (val!==undefined) { 
						vars2[k]=val;
						if (k==="remain" || k==="elapsed" ) {
							const extra = splitHMS(val);
							Object.keys(extra).forEach(function(kk){
								vars2[`${k}_${kk}`] = extra[kk];
							});
						}
					}
				});
				setVars(vars2);
				checkFeedbacks();
			};


		

		});


			
		function getIpsList(cb,n) {
			n =  n || 1;
			console.log("getting ips from all interfaces...attempt #",n)
			parseVariablesInString('$(internal:all_ip)').then(function(ips){

				if (ips.indexOf("$NA") < 0) {
					return cb ( ips.replace(/\\n/g,'\n').trim().split('\n') );
				}
				if (n>=5) {
					return console.log("tried 5 times to get ip list and gave up");
				}
				console.log("retrying getIpsList ()");
				setTimeout(getIpsList,2500,cb,n+1);

			}).catch(function(err){
				console.log("err",err);
			});
		}

		
		
	}

		
	
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
		api.config(config,true);
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
		UpdateActions(this);
	}

	updatePresets() {
		UpdatePresets(this);
	}

	updateFeedbacks() {
		UpdateFeedbacks(this);
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this);
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts);
