function splitHMS(hms) {
	const parts = hms.split(':');
	if (parts.length === 2) {
		parts.unshift('0');
	}
	let [hh, mm, ss] = parts;

	let h = Number(hh).toString();
	let m = Number(mm).toString();
	let s = Number(ss).toString();
	hh = ('0' + h).substr(-2);
	mm = ('0' + m).substr(-2);
	ss = ('0' + s).substr(-2);

	return {
		hh, 
		mm, 
		ss,
		h : h === '0' ? '' : h, 
		m : m === '0' ? '' : m, 
		s : s === '0' ? '' : s, 
		mm_ss: mm + ':' + ss,
		hh_mm_ss: h + ':' + mm + ':'+ss,
		m_ss: m + ':' + ss,
		h_mm_ss: h + ':' + mm + ':'+ss,
	};

}
exports.splitHMS = splitHMS;
