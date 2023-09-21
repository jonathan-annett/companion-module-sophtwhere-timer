const durationOptions = [
    {
        id: 'days',
        type: 'number',
        label: 'Days',
        default: 0,
        min: 0,
        max: 365,
        isVisible: isDurDropVisible,
        isVisibleData : 'test'
    },
    {
        id: 'hours',
        type: 'number',
        label: 'Hours',
        default: 0,
        min: 0,
        max: 23,
        isVisible: isDurDropVisible,
        isVisibleData : 'test'
    },
    {
        id: 'mins',
        type: 'number',
        label: 'Minutes',
        default: 10,
        min: 0,
        max: 59,
        isVisible: isDurDropVisible,
        isVisibleData : 'test'
    },
    {
        id: 'secs',
        type: 'number',
        label: 'Seconds',
        default: 0,
        min: 0,
        max: 59,
        isVisible: isDurDropVisible,
        isVisibleData : 'test'
    }, 
    {
        id: 'msecs',
        type: 'textinput',
        label: 'Milliseconds (override other options)',
        default: ''
    }
];
function  isDurDropVisible (options, data) {
    return (options.msecs||'').trim()==='';
}

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

