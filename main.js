/*!
 * companion-module-sophtwhere-timer/main.js
 * Copyright(c) 2023 Jonathan Annett
 * MIT Licensed
 */

const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades');
const UpdateActions = require('./actions');
const UpdatePresets = require('./presets');
const UpdateFeedbacks = require('./feedbacks');
const UpdateVariableDefinitions = require('./variables');
const { splitHMS } = require('./server/splitHMS');
const { api } = require('./server');
const bootTimes = require('./server/comp-boot-starts');

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config, isFirstInit) {
		const self = this;

		//console.log({init:{isFirstInit,config}});
		
		self.config = config;
		config.port = config.port || '8088';
		self.api = api;
		api.ip_list = [];
		const HTTP_PORT = config.port;

	
		config.updateChecks = config.updateChecks === "once" ?  "never" : config.updateChecks;

		self.updateStatus(InstanceStatus.Ok);

		self.ipsList().then(processIpList).catch(function(err){
			console.log("silently ignoring",err);
		});



		function processIpList(ip_list) {

			bootTimes.on('change', function (firstRunSinceBoot, lastBoot) {

				console.log({init:{firstRunSinceBoot, lastBoot}});
				const api = self.api;
				api.ip_list = ip_list;

				Object.keys(config).forEach(function (key) {
					if (key.startsWith('iface_')) {
						const ip = key.replace(/^iface_/, '').replace(/\_/g, '.');
						console.log(key, "decodes to ip", ip);
						if (api.ip_list.indexOf(ip) < 0) {
							delete config[key];
							console.log("deleting", key);
						}
					}
				});

				ip_list.forEach(function (ip) {
					const key = `iface_${ip.replace(/\./g, '_')}`;
					if (typeof config[key] === 'undefined') config[key] = true;
				});

				

				self.updateVariableDefinitions(); // export variable definitions
				['resetVariable', 'resetVariables', 'getVariable', 'setVariable', 'vars'].forEach(function (method) {
					const fn = UpdateVariableDefinitions[method];
					api[method] = fn;
				});

				self.updateActions(); // export actions
				self.updatePresets();// export presets
				self.updateFeedbacks(); // export feedbacks

				api.setVariableValues = function (vars) {
					const vars2 = {};
					Object.keys(vars).forEach(function (k) {
						const val = vars[k];
						if (val !== undefined) {
							vars2[k] = val;
							if (k === "remain" || k === "elapsed") {
								const extra = splitHMS(val);
								Object.keys(extra).forEach(function (kk) {
									vars2[`${k}_${kk}`] = extra[kk];
								});
							}
						}
					});
					self.setVariableValues(vars2);
					self.checkFeedbacks();
				};


				api.config(self,config, self.get_ips_enabled(true), firstRunSinceBoot).then(function (res) {
					console.log("api.config has returned:", res);
					self.saveConfig();
				}).catch(function (err) {
					console.log("caught in api.config :", err);
				});
			});
		}




	}



	ipsList() {
		const parseVariablesInString = this.parseVariablesInString.bind(this);

		return new Promise(function (resolve, reject) {


			getIpsList(1);

			function getIpsList(n) {
				n = n || 1;
				if (n > 1) console.log("getting ips from all interfaces...attempt #", n)
				parseVariablesInString('$(internal:all_ip)').then(function (ips) {

					if (ips.indexOf("$NA") < 0) {
						return resolve(ips.replace(/\\n/g, '\n').trim().split('\n'));
					}
					if (n >= 5) {
						return reject(new Error("tried 5 times to get ip list and gave up"));
					}
					console.log("retrying getIpsList ()");
					setTimeout(getIpsList, 2500, n + 1);

				}).catch(reject);
			}


		});



	}


	// When module gets deleted
	async destroy() {

		this.log('debug', 'destroy');
		if (api) {
			await api.shutdownServer();
		}
	}

	async configUpdated(config) {
		this.config = config
		return await api.config(this,config, this.get_ips_enabled(true), false);
	}


	get_ips_enabled(asHost) {
		const config = this.config;
		const iface_enabled = {};
		if (config && api.ip_list) {
			api.ip_list.forEach(function (ip, ix) {
				if (config[`iface_${ip.replace(/\./g, '_')}`]) {
					iface_enabled[asHost ? `${ip}:${config.port}` : ip] = true;
				}
			});
		}
		return iface_enabled;
	}

	// Return config fields for web config
	getConfigFields() {
		const config = this.config;
		const HTTP_PORT = config ? config.port : '8088';

		const iface_enabled = this.get_ips_enabled();

		return [

			{
				type: 'textinput',
				id: 'port',
				label: 'HTTP Port',
				width: 4,
				regex: Regex.PORT,
				default: HTTP_PORT

			},
		].concat(


			[
				{
					type: 'static-text',
					id: 'info',
					width: 12,
					label: 'Enable Ips',
					value:

						`Choose what interface addreses to allow connections on
					You'll have an address for each physical network adapter, as well as one that associated with your computer's "localhost" or "home" (127.0.0.1)
					`.split('\n').map(function (line) { return line.trim() }).join('<br>\n'),


				},
			],


			(api.ip_list || []).map(function (ip, ix) {
				return {
					id: `iface_${ip.replace(/\./g, '_')}`,
					type: 'checkbox',
					width: 12,
					label: `Enable ip #${ip}`,
					default: true,
					tooltip: `turn this off to redirect/block requests made to ${ip}`
				};
			}),


			[
				{
					type: 'checkbox',
					id: 'redirect_disabled',
					width: 12,
					label: 'Redirect Disabled Ips',
					default: false,
					tooltip: 'If you have at least 1 enabled external interface,\nrequests to any disabled interface will redirect to one of the enabled interfaces\nPro Tip:if you enable this, and have just 1 interface address enabled, requests to localhost on the Companion computer will be redirected to that interface'
				},


				{
					type: 'checkbox',
					id: 'allow_ws',
					width: 12,
					label: 'Use Websocket',
					default: false,
					tooltip: 'turn this off to used long polling instead of Websocket',
					isVisible: (options) => {
						options.allow_ws = false;
						return false;

					},
					isVisibleData: {

					}
				},

				{
					type: 'static-text',
					id: 'info',
					width: 12,
					label: 'Timer startup links',
					value: `
					You can use one of the below links to access the timer
					You'll have a link for each physical network adapter, as well as one that associated with your computer's "localhost" or "home" (127.0.0.1)
					`.split('\n').map(function (line) { return line.trim() }).join('<br>\n'),
				},
			],

			(api.ip_list || []).map(function (ip, ix) {
				const cfg = {
					type: 'static-text',
					isVisible: function (options, data) {
						return typeof data === 'string' ? options[data] : true;
					},
					id: `ip_${ix}`,
					width: 12,
					label: `link #${ix + 1}`,
					value:

						iface_enabled[ip] ?
							`<a href="http://${ip}:${HTTP_PORT}" target="_blank" rel="noopener">http://${ip}:${HTTP_PORT}</a>`
							: `<s>http://${ip}:${HTTP_PORT}</s> is disabled`
				};
				return cfg;

			}),



			[

				{
					id: 'updateChecks',
					type: 'dropdown',
					label: `Auto Updates${ 
						
						  api.updateInfo ? ` (v ${
							
							api.updateInfo.version.installed
						
						} installed${api.updateInfo.changed ? 
							  `, v ${api.updateInfo.version.online} ${api.updateInfo.updateNeeded?'':'- a downgrade'}` : 
							  
							  ', no updates available'})` 
							  
							 
							  	  : ''
					
					}`,
					choices: [
						{ id: 'never', label: 'No Update Checks' },

						{ id: 'always', label: `Check For Updates On Startup${api.updateInfo && api.updateInfo.changed && api.updateInfo.updateNeeded ? ` * v ${api.updateInfo.version.online} is available *` : ''}` },
						{ id: 'once', label: 'Check For updates now, (Click Save, then open connection page again)' },

						api.updateInfo && api.updateInfo.changed && api.updateInfo.updateNeeded  ? {
							id: config.updateChecks === 'always' ? 'doUpdateNow_always' : 'doUpdateNow_once', label: `Upgrade from ${api.updateInfo.version.installed} to ${api.updateInfo.version.online} , (Click Save to install)`
						} : null,

						api.updateInfo && api.updateInfo.changed && !api.updateInfo.updateNeeded && api.updateInfo.changed  ? {
							 
							id: config.updateChecks === 'always' ? 'doUpdateNow_always' : 'doUpdateNow_once', label: `Downgrade from ${api.updateInfo.version.installed} to ${api.updateInfo.version.online} , (Click Save to install)`
						} : null


					].filter(function (x) { return x !== null; }),
					default: 'never',
					isVisible: function (options, data) {
						if ([
							'never', 'always', 'once', 'doUpdateNow_always', 'doUpdateNow_once'

						].indexOf(options.updateChecks) < 0) {
							options.updateChecks = 'never';
						}
						return true;
					}
				}
			]

		)
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
