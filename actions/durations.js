const durationOptions = [
    {
        id: 'days',
        type: 'number',
        label: 'Days',
        default: 0,
        min: 0,
        max: 365,
    },
    {
        id: 'hours',
        type: 'number',
        label: 'Hours',
        default: 0,
        min: 0,
        max: 23,
    },
    {
        id: 'mins',
        type: 'number',
        label: 'Minutes',
        default: 10,
        min: 0,
        max: 59,
    },
    {
        id: 'secs',
        type: 'number',
        label: 'Seconds',
        default: 0,
        min: 0,
        max: 59,
    }, 
    {
        id: 'msecs',
        type: 'textinput',
        label: 'Milliseconds (override other options)',
        default: ''
    }
];

function getMsec (event) {
    let tally = Number.parseInt((event.options.msecs||'').trim());
    if (isNaN(tally)) {
        tally = (event.options.days||0);
        tally = (tally * 24) + (event.options.hours||0);
        tally = (tally * 60) + (event.options.mins||0);
        tally = (tally * 60) + (event.options.secs||0);
        return  tally * 1000;
    }
    return tally;
}
 
module.exports =   {
        durationOptions,
        getMsec
};

