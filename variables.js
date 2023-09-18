module.exports = async function (self) {
	self.setVariableDefinitions([

		{ variableId: 'expired', name: 'timer expired'  },
		{ variableId: 'impending', name: 'timer impending'  },
		{ variableId: 'pausing', name: 'timer is pausing'  },

		{ variableId: 'adjusting_up', name: 'timer is speeding up to match target'  },
		
		{ variableId: 'adjusting_down', name: 'timer is slowing down to match target'  },

		{ variableId: 'adjusting_delta', name: 'timer adjustment delta'  },
		{ variableId: 'remain_actual', name: 'actual time remaining'  },

		
		
		{ variableId: 'remain', name: 'remaining'  },
		{ variableId: 'remain_h', name: 'remaining h'  },
		{ variableId: 'remain_hh', name: 'remaining hh'  },
		{ variableId: 'remain_m',  name: 'remaining m'  },
		{ variableId: 'remain_mm', name: 'remaining mm'  },
		{ variableId: 'remain_s',  name: 'remaining s'  },
		{ variableId: 'remain_ss', name: 'remaining ss'  },
		{ variableId: 'remain_h_mm_ss', name: 'remaining h:mm:ss'  },
		{ variableId: 'remain_hh_mm_ss', name: 'remaining hh:mm:ss'  },		
		{ variableId: 'remain_m_ss', name: 'remaining m:ss'  },
		{ variableId: 'remain_mm_ss', name: 'remaining mm:ss'  },
		

		{ variableId: 'remain_hours',   name: 'remaining hours'  },
		{ variableId: 'remain_minutes', name: 'remaining minutes'  },
		{ variableId: 'remain_seconds', name: 'remaining seconds'  },
	

		{ variableId: 'elapsed',    name: 'elapsed'  },
		{ variableId: 'elapsed_h',  name: 'elapsed h'  },
		{ variableId: 'elapsed_hh', name: 'elapsed hh'  },
		{ variableId: 'elapsed_m',  name: 'elapsed m'  },
		{ variableId: 'elapsed_mm', name: 'elapsed mm'  },
		{ variableId: 'elapsed_s',  name: 'elapsed s'  },
		{ variableId: 'elapsed_ss', name: 'elapsed ss'  },
		{ variableId: 'elapsed_h_mm_ss', name: 'elapsed h:mm:ss'  },
		{ variableId: 'elapsed_hh_mm_ss', name: 'elapsed hh:mm:ss'  },		
		{ variableId: 'elapsed_m_ss', name: 'elapsed m:ss'  },
		{ variableId: 'elapsed_mm_ss', name: 'elapsed mm:ss'  },
		{ variableId: 'elapsed_hours', name: 'elapsed hours'  },
		{ variableId: 'elapsed_minutes', name: 'elapsed minutes'  },
		{ variableId: 'elapsed_seconds', name: 'elapsed seconds'  },
		
		{ variableId: 'default',   name: 'default'  },
		{ variableId: 'startedAt', name: 'started at'  },
		{ variableId: 'endsAt',    name: 'ends at'  },

		{ variableId: 'showtimenow',   name: 'Show Time Now'  },
		{ variableId: 'showmessages',  name: 'Show Messages'  },	
		{ variableId: 'showbar',       name: 'Show Bar'  },	
		{ variableId: 'showpresenter',	   name: 'Show Presenter Mode'  },	

		{ variableId: 'paused', name: 'paused'  },
		{ variableId: 'pauses', name: 'Accumulated pause time'  },
		
	])
}
