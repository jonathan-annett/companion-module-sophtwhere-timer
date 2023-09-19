module.exports = async function (self) {

	
	const slotcount = 30;
	const setValues = {};
	
	const variable_defs = [

		{ variableId: 'expired', name: 'timer expired',      default : false},
		{ variableId: 'impending', name: 'timer impending',  default : false  },
		{ variableId: 'pausing', name: 'timer is pausing',   default : false  },

		{ variableId: 'adjusting_up', name: 'timer is speeding up to match target' , default : false },
		
		{ variableId: 'adjusting_down', name: 'timer is slowing down to match target' , default : false },

		{ variableId: 'adjusting_delta', name: 'timer adjustment delta' , default : 0 },
		{ variableId: 'remain_actual', name: 'actual time remaining' , default : '0:00'  },

		
		
		{ variableId: 'remain',          name: 'remaining'  ,           default : '0:00' },
		{ variableId: 'remain_h',        name: 'remaining h'  ,         default : '' },
		{ variableId: 'remain_hh',       name: 'remaining hh' ,         default : '00' },
		{ variableId: 'remain_m',        name: 'remaining m' ,          default : ''  },
		{ variableId: 'remain_mm',       name: 'remaining mm' ,         default : '00' },
		{ variableId: 'remain_s',        name: 'remaining s' ,          default : ''  },
		{ variableId: 'remain_ss',       name: 'remaining ss' ,         default : '00' },
		{ variableId: 'remain_h_mm_ss',  name: 'remaining h:mm:ss' ,    default : '0:00:00' },
		{ variableId: 'remain_hh_mm_ss', name: 'remaining hh:mm:ss' ,   default : '00:00:00' },		
		{ variableId: 'remain_m_ss',     name: 'remaining m:ss' ,       default : '0:00' },
		{ variableId: 'remain_mm_ss',    name: 'remaining mm:ss' ,      default : '00:00' },
		

		{ variableId: 'remain_hours',    name: 'remaining hours' ,      default : '0' },
		{ variableId: 'remain_minutes',  name: 'remaining minutes' ,    default : '0' },
		{ variableId: 'remain_seconds',  name: 'remaining seconds' ,    default : '0' },
	

		{ variableId: 'elapsed',          name: 'elapsed'  ,            default : '0:00' },
		{ variableId: 'elapsed_h',        name: 'elapsed h'  ,          default : '' },
		{ variableId: 'elapsed_hh',       name: 'elapsed hh'  ,         default : '00' },
		{ variableId: 'elapsed_m',        name: 'elapsed m'  ,          default : '' },
		{ variableId: 'elapsed_mm',       name: 'elapsed mm'  ,         default : '00' },
		{ variableId: 'elapsed_s',        name: 'elapsed s' ,           default : ''  },
		{ variableId: 'elapsed_ss',       name: 'elapsed ss'  ,         default : '00' },
		{ variableId: 'elapsed_h_mm_ss',  name: 'elapsed h:mm:ss' ,     default : '0:00:00'  },
		{ variableId: 'elapsed_hh_mm_ss', name: 'elapsed hh:mm:ss' ,    default : '00:00:00'  },		
		{ variableId: 'elapsed_m_ss',     name: 'elapsed m:ss'  ,       default : '0:00' },
		{ variableId: 'elapsed_mm_ss',    name: 'elapsed mm:ss',        default : '00:00'},

		{ variableId: 'elapsed_hours',    name: 'elapsed hours' ,       default : '0'},
		{ variableId: 'elapsed_minutes',  name: 'elapsed minutes' ,     default : '0' },
		{ variableId: 'elapsed_seconds',  name: 'elapsed seconds' ,     default : '0' },
		
		{ variableId: 'default',          name: 'default' ,             default : '10:00'  },
		{ variableId: 'startedAt',        name: 'started at' ,          default : '' },
		{ variableId: 'endsAt',           name: 'ends at' ,             default : ''  },

		{ variableId: 'showtimenow',      name: 'Show Time Now'  ,      default : '0' },
		{ variableId: 'showmessages',     name: 'Show Messages' ,       default : '0'  },	
		{ variableId: 'showbar',          name: 'Show Bar'   ,          default : '0'},	
		{ variableId: 'showpresenter',	  name: 'Show Presenter Mode',  default : '0' },	

		{ variableId: 'paused',           name: 'paused',               default : '0:00' },

		{ variableId: 'pauses',           name: 'Accumulated pause time',default : '0:00' },
 
		{ variableId: 'item_count',       name: 'Slots Used Count' ,    default : 0 },
		
	]
	
	const variables_list = variable_defs.map(function(v){
		const id = v.variableId,def = v.default;
		if (typeof def!=='undefined') {
			setValues[id]=def;
		}
		return { variableId: id, name: v.name  };
	});

	for (let i = 1; i < slotcount;i++) {
		const varid=`item_start_${i}`;
		variables_list.push({ variableId:varid , name: `Item ${i} Start Time`  });
		setValues[varid]='';
	}


	for (let i = 1; i < slotcount;i++) {
		const varid=`item_name_${i}`;
		variables_list.push({ variableId:varid , name: `Item ${i} Name`  });
		setValues[varid]='';
	}

	for (let i = 1; i < slotcount;i++) {
		const varid=`item_duration_${i}`;
		variables_list.push({ variableId: varid, name: `Item ${i} Duration`  });
		setValues[varid]='';
	}

	self.setVariableDefinitions(variables_list);
	self.setVariableValues(setValues);
}
