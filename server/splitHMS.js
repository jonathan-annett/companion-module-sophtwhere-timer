function splitHMS(hms) {
	const parts = hms.split(':');
	if (parts.length === 2) {
		parts.unshift('0');
	}
	let [hh, mm, ss] = parts;


	const hours = ( Number(hh) +
	                (Number(mm) / 60) + 
				    (Number(ss) / 3600)  ).toFixed(2) ;

	const  minutes = ( (Number(hh) * 60 ) +
				       Number(mm)  +
					   (Number(ss) / 60)  ).toFixed(2);

	const  seconds =  ( (Number(hh) * 3600 ) +
	                    (Number(mm) * 60) +
				   	    Number(ss) ).toFixed(0)  ;


	let h = Number(hh).toString();
	let m = Number(mm).toString();
	let s = Number(ss).toString();
	hh = h.padStart(2,'0');//  ('0' + h).substr(-2);
	mm = m.padStart(2,'0');//('0' + m).substr(-2);
	ss = s.padStart(2,'0');//('0' + s).substr(-2);

	return {
		hh, 
		mm, 
		ss,
		h : h === '0' ? '' : h, 
		m : m === '0' ? '' : m, 
		s : s === '0' ? '' : s, 
		mm_ss: mm + ':' + ss,
		hh_mm_ss: h + ':' + mm + ':'+ss,
		m_ss:     m + ':' + ss,
		h_mm_ss:  h + ':' + mm + ':'+ss,
		
		hours,
		minutes,
		seconds
	};

}
exports.splitHMS = splitHMS;
