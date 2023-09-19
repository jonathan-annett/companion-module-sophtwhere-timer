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
		api.ip_list = await this.ipsList();

		config.port = config.port || '8088';
		const HTTP_PORT = config.port;

		 

		api.ip_list.forEach(function(ip,ix){
			const current = config[`iface_${ix}`];
			config[`iface_${ip.replace(/\./g,'_')}`] = typeof current==='undefined'? ip ==='127.0.0.1' : current;
		});

		Object.keys(config).forEach(function(key){
			if (key.startsWith('iface_')) {
				const ip =  key.replace(/^iface_/,'').replace(/\_/g,'.');
				if (api.ip_list.indexOf(ip)<0) {
					delete config[key];
				}
			} 
		});

		this.updateStatus(InstanceStatus.Ok);

		this.updateVariableDefinitions(); // export variable definitions
		['resetVariable', 'resetVariables', 'getVariable', 'setVariable', 'vars'].forEach(function(method){
			const fn = UpdateVariableDefinitions[method];
			api[method]= fn;
		});
	
		this.updateActions(); // export actions
		this.updatePresets();// export presets
		this.updateFeedbacks(); // export feedbacks
	
		const setVars = this.setVariableValues.bind(this);
		const checkFeedbacks = this.checkFeedbacks.bind(this);
		const parseVariablesInString = this.parseVariablesInString.bind(this);


		api.config(config,this.get_ips_enabled (true));

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

	
		
	}

	ipsList() {
		const parseVariablesInString = this.parseVariablesInString.bind(this);

		return new Promise(function(resolve,reject){

		
			getIpsList(1);

			function getIpsList(n) {
				n =  n || 1;
				if (n>1) console.log("getting ips from all interfaces...attempt #",n)
				parseVariablesInString('$(internal:all_ip)').then(function(ips){
	
					if (ips.indexOf("$NA") < 0) {
						return resolve ( ips.replace(/\\n/g,'\n').trim().split('\n') );
					}
					if (n>=5) {
						return reject(new Error("tried 5 times to get ip list and gave up"));
					}
					console.log("retrying getIpsList ()");
					setTimeout(getIpsList,2500,n+1);
	
				}).catch(reject);
			}
	

		});


		
	}
		
	
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
		api.config(config,this.get_ips_enabled (true));
	}


	get_ips_enabled (asHost) {
		const config = this.config;
		const iface_enabled = {};
		if (config && api.ip_list) {
			api.ip_list.forEach(function(ip,ix){
				if (config[`iface_${ip.replace(/\./g,'_')}`]) {
					iface_enabled[ asHost ? `${ip}:${config.port}` : ip ]=true;
				}
			});
		}

		return iface_enabled;
	}

	// Return config fields for web config
	getConfigFields() {
		const config = this.config;
		const HTTP_PORT = config ? config.port : '8088';

		const iface_enabled = this.get_ips_enabled () ;

		return [

			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Timer startup links',
				value:
					'Use one of the below links to access the timer',
			},

		].concat(
			(api.ip_list||[]).map(function(ip,ix){
				return {
					type: 'static-text',
					id: `ip_${ix}`,
					width: 12,
					label: `link #${ix+1}`,
					value:  

					iface_enabled [ip] ? 
						`<a href="http://${ip}:${HTTP_PORT}" target="_blank" rel="noopener">http://${ip}:${HTTP_PORT}</a>`
					: `<s>http://${ip}:${HTTP_PORT}</s> is disabled`
				};

			}),

			[
				{
					type: 'static-text',
					id: 'info',
					width: 12,
					label: 'Enable Ips',
					value:
						'allow connection on these ip addresses:',
				},
			],


			(api.ip_list||[]).map(function(ip,ix){
				return {
					type: 'checkbox',
					id: `iface_${ip.replace(/\./g,'_')}`,
					width: 12,
					label: `Enable ip #${ip}`,
					default: ip === '127.0.0.1' ||  iface_enabled[ip]
					};

			}),

			
			[
			{
				type: 'checkbox',
				id: 'redirect_disabled',
				width: 12,
				label: 'Redirect Disabled Ips',
				default: false
			},		

			{
				type: 'textinput',
				id: 'port',
				label: 'HTTP Port',
				width: 4,
				regex: Regex.PORT,
				default : HTTP_PORT
				
			},
		])
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
