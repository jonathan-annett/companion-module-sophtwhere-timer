const instance_type = "companion-module-sophtwhere-timer";
const HTTP_PORT = 8088;
const itst_label = 'timer'
const idsUsed = {

};

function makeRandomId(name) {
    const len = "wLWooZRJQAxsy11IcwgPY".length;
    let result = '';
    while (result.length < len) result += Math.random().toString(36).substring(2);
    result = result.substring(0, len);
    idsUsed[name] = result;
    return result;
}

function makeControls(instanceId, page_no, sourceData) {
    let controls = {};

    let items = [
        2,  3,  4,  5,
        10, 11, 12, 13,
        18, 19, 20, 21
    ].slice(0, sourceData.length).map(function (btn_no, index) {
        return { id: `bank:${page_no}-${btn_no}`, data: sourceData[index] }
    });

    controls[`bank:${page_no}-1`] = {
        "type": "pageup"
    };
    items.forEach(function (item, ix) {
        switch (ix) {
            case 4:
                controls[`bank:${page_no}-9`] = {
                    "type": "pagenum"
                };
                break;
            case 8:
                controls[`bank:${page_no}-17`] = {
                    "type": "pagedown"
                };
                break;
        }
        controls[item.id] = buttonObj(instanceId, item.id, item.data);
    });
    if (items.length < 5) {
        controls[`bank:${page_no}-9`] = {
            "type": "pagenum"
        };
    }
    if (items.length < 9) {
        controls[`bank:${page_no}-17`] = {
            "type": "pagedown"
        };
    }

    return controls;

}

function makeInstance(port, label) {

    return {
        "instance_type": instance_type,
        "label": label,
        "isFirstInit": false,
        "config": {
            "port": String(port)
        },
        "lastUpgradeIndex": -1,
        "enabled": true
    };

}

function buttonObj(instanceId,  position,  { buttonText, displayText, milliseconds }) {
    return {
        "type": "button",
        "style": {
            "text": buttonText,
            "size": "14",
            "png": null,
            "alignment": "center:center",
            "pngalignment": "center:center",
            "color": 16777215,
            "bgcolor": 0,
            "show_topbar": "default"
        },
        "options": {
            "relativeDelay": false,
            "stepAutoProgress": true
        },
        "feedbacks": [],
        "steps": {
            "0": {
                "action_sets": {
                    "down": [
                        {
                            "id": makeRandomId(position + '-1'),
                            "action": "customMessage",
                            "instance": instanceId,
                            "options": {
                                "text": displayText
                            },
                            "delay": 0
                        },
                        {
                            "id": makeRandomId(position + '-2'),
                            "action": "startNew",
                            "instance": instanceId,
                            "options": {
                                "days": 0,
                                "hours": 0,
                                "mins": 10,
                                "secs": 0,
                                "msecs": milliseconds.toString()
                            },
                            "delay": 0
                        }
                    ],
                    "up": []
                },
                "options": {
                    "runWhileHeld": []
                }
            }
        }
    };
}

function makePageExport(sourceData, port, label, page_no, pageName) {
    const instanceId = makeRandomId('inst');

    const data = {
        "version": 3,
        "type": "page",
        "controls": makeControls(instanceId, page_no, sourceData),
        "page": {
            "name": pageName
        },
        "instances": {}
    };
    data.instances[instanceId] = makeInstance(port, label);
    data.oldPageNumber = page_no;
    return data;
}

function makePagesExport(sourceData, port, label, pageNamePrefix) {

    Object.keys(idsUsed).forEach(function (k) {
        delete idsUsed[k];
    });

    if (sourceData.length <= 12) {
        return makePageExport(sourceData, port, label, 1, pageNamePrefix || "PAGE");
    }


    const exportData = {
        "version": 3,
        "type": "full",
        "controls": {},
        "pages": {},
        "instances": {}
    };

    let page_no = 1;
    const workData = sourceData.slice();
    const instanceId = makeRandomId('inst');

    while (workData.length > 0) {
        const thisPage = workData.splice(0, 12);
        if (thisPage.length > 0) {
            const controls = makeControls(instanceId, page_no, thisPage);

            Object.keys(controls).forEach(function (key) {
                workData.controls[key] = controls[key];
            });

            exportData.pages[page_no.toString()] = {
                "name": pageNamePrefix ? `${pageNamePrefix} #${page_no}` : "PAGE"
            };
            page_no++;
        }
    }

    workData.instances[instanceId] = makeInstance(port, label);

    return  workData ;
}


function getLinesData(str, defaultMins, defaultStartTime) {

    const infoSuffix = '-------------------------------------------------------';
    const infoPrefix = [
        'Start                                 End     Item',
        'Time  Display Text                    Time    Duration',
        infoSuffix
    ];


    const lines = str.trim().split("\n").map(function (line) { return line.trim() });
    const noon = (12 * 60);
    const midnight = (24 * 60);
    let events = lines.map(parseLineMode1).filter(notNull);

    const parsed = lines.slice();

    if (events.length > 0) {

        let dayMins = 0;
        const fixed_events = events.map(function (ev, ix, ar) {
            if (ix === 0) return { dayMins, startTime: ev.startTime, eventText: ev.eventText, timeStr: ev.timeStr };
            let start = dayMins + ev.startTime;
            const prevStart = dayMins + ar[ix - 1].startTime;
            if ((prevStart > start) && (ev.startTime < noon)) {
                dayMins += midnight;
                start += midnight;
            }
            return { dayMins, startTime: start, eventText: ev.eventText, timeStr: ev.timeStr };
        });

        let data = fixed_events.map(function (ev, ix, ar) {
            const eventMins = (ix === events.length - 1) ? defaultMins : ar[ix + 1].startTime - ev.startTime;
            const eventSecs = eventMins * 60;
            const eventMsec = eventSecs * 1000;

            const endTime = new Date(

                Date.prototype.setHours.apply(

                    new Date(),
                    (ev.timeStr + ':00').split(':')
                ) + eventMsec

            );


            const endTimeStr = local24HourTime(endTime).split(':').splice(0,2).join(':');

            defaultMins = eventMins;
            return {
                buttonText: `${eventMins} mins\\n${ev.eventText.replace(/^Dr\s|^Mr\s|^Ms\s|^Mrs\s|^Prof\s/ig, '').replace(/\s/g, '').substring(0, 10).trim()
                    }\\n@${ev.timeStr
                    }:00`,
                displayText: ev.eventText,
                milliseconds: eventMsec,
                eventMins: eventMins,
                eventSecs: eventSecs,
                startTime: ev.timeStr,
                endTime: endTimeStr
            };
        }).filter(function (el) {
            return el !== null && el.displayText.length > 0;
        });
        document.body.className = 'rules1';
        return {
            data: data,
            json : makePagesExport(data,HTTP_PORT,itst_label),
            parsed, 
            info: infoPrefix.concat(
                data.map(function (item) { return `${item.startTime} ${item.displayText.padEnd(30)} | ${item.endTime} | ${item.eventMins} mins` }),
                [ infoSuffix ]
            )
        }
    }

    parsed.splice(0, parsed.length);

    if (!defaultStartTime) {
        defaultStartTime = new Date();
        console.log("time now is", defaultStartTime);
        defaultStartTime.setMinutes(0);
        defaultStartTime.setSeconds(0);
        defaultStartTime.setTime(defaultStartTime.getTime() + (60 * 60 * 1000));
        console.log("set default time of", defaultStartTime);
        parsed.push(local24HourTime(defaultStartTime).split(':').splice(0, 2).join(':'));
    }

    let wipeOk = true;

    const data = lines.map(parseLineMode2).filter(notNull);

    document.body.className = data.length===0 ? '' : 'rules2';
    return {
        data: data,
        json : makePagesExport(data,HTTP_PORT,itst_label),
        parsed: parsed.filter(function (line) { return line.length > 0 }),
        info:  infoPrefix.concat(  
            data.map(function (item) { return `${item.startTime} ${item.displayText.padEnd(30)} | ${item.endTime} | ${item.eventMins} mins` }),
            [infoSuffix]
        )
    };

    function parseLineMode1(line, ix, lines) {

        line = (line.trim().replace(/\t/g, ' ').replace(/\|.*$/,'')).trim();
        while (line.indexOf('  ') >= 0) {
            line = line.replace(/\ \ /g, ' ');
        }
        const split = line.split(' ');
        const timeStr = split.shift();
        const eventText = split.join(' ').trim();
        if (eventText === '' && ix < lines.length - 1) return null;
        const hours_mins = timeStr.split(':');
        if (hours_mins.length != 2) return null;
        let [hours, mins] = hours_mins.map(function (x) { return Number.parseInt(x) });

        if (isNaN(hours) || isNaN(mins)) return null;
        if (hours > 23 || hours < 0) return null;
        if (mins > 59 || mins < 0) return null;

        const sinceMidnight = mins + (hours * 60);

        return {
            startTime: sinceMidnight,
            eventText: eventText,
            line,
            timeStr,
            hours_mins
        };
    }

    function parseLineMode2(line) {

        let startTimeStr = local24HourTime(defaultStartTime);

        line = (line.trim().replace(/\t/g, ' ').replace(/\|.*$/,'')).trim();
        while (line.indexOf('  ') >= 0) {
            line = line.replace(/\ \ /g, ' ');
        }
        const split = line.split(' ');

        const hours_mins = split[0].split(':');
        let eventMins = defaultMins;

        if (hours_mins.length === 2) {

            let [hours, mins] = hours_mins.map(function (x) { return Number.parseInt(x) });

            if (isNaN(hours) || isNaN(mins)) return null;
            if (hours > 23 || hours < 0) return null;
            if (mins > 59 || mins < 0) return null;
            defaultStartTime = new Date();
            defaultStartTime.setHours(hours, mins, 0);
            if (wipeOk) {
                parsed.splice(0, parsed.length);
                wipeOk = false;
            }
        } else {
            eventMins = Number.parseInt(split[split.length - 1]);
        }



        if (isNaN(eventMins)) {
            eventMins = defaultMins;
        } else {
            split.pop();
        }

        const displayText = split.join(' ');

        parsed.push(line.trim());

        if (displayText === '') {
            defaultMins = eventMins;
            return null;
        }

        wipeOk = false;

        const eventSecs = eventMins * 60;
        const eventMsec = eventSecs * 1000;

        defaultStartTime.setTime(defaultStartTime.getTime() + eventMsec);

        const endTimeStr = local24HourTime(defaultStartTime).split(':').splice(0,2).join(':');

        return {
            buttonText: `${eventMins} mins\\n${displayText.replace(/^Dr\s|^Mr\s|^Ms\s|^Mrs\s|^Prof\s/ig, '').replace(/\s/g, '').substring(0, 10).trim()
                }\\n@${startTimeStr
                }`,
            displayText: displayText,
            milliseconds: eventMsec,

            eventMins: eventMins,
            eventSecs: eventSecs,
            startTime: startTimeStr.split(':').splice(0,2).join(':'),
            endTime: endTimeStr
        };
    }

    function notNull(el) {
        return el !== null;
    }

}


const textarea = document.querySelector('textarea');

textarea.oninput = function () {
    const payload = getLinesData(textarea.value, 30);

    document.querySelector('#out').innerHTML = payload.info.join('\n');
    
    document.querySelector('button').onclick = function(){
        const when = new Date();
        const [
            yyyy,mm,dd,HH,MM
        ] = [
            when.getFullYear(),
            when.getMonth(),
            when.getDate(),
            when.getHours(),
            when.getMinutes()
        ];

      
     

        saveAs(
            new Blob(
            [ JSON.stringify(payload.json,undefined,4) ],
            {type: "application/json;charset=utf-8"}),
            
            `timer-custom-config_${yyyy}${mm}${dd}-${HH}${MM}.companionconfig`
        );
    }
/*
    textarea.onblur  = function(ev) {
        textarea.value = payload.parsed.join('\n');
        textarea.onblur = null; 
    };*/

    
};

textarea.oninput();
//textarea.onblur();
 

function secToStr(sec) {
    let prefix = sec < 0 ? "-" : "";
    if (sec < 0) {
        sec = 0 - sec;
    }
    let min = Math.trunc(sec / 60) % 60;
    let hr = Math.trunc(sec / 3600);
    let sx = Math.trunc(sec % 60);


    let sx_ = (sx < 10 ? "0" : "") + sx.toString();
    if (hr < 1) {
        let min_ = min.toString();
        return prefix + min_ + ":" + sx_;
    }
    let min_ = (min < 10 ? "0" : "") + min.toString();
    let hr_ = hr.toString();
    return prefix + hr_ + ":" + min_ + ":" + sx_;
}


function local24HourTime(dt) {
    const parts = dt.toString().split(':');
    parts[0] = parts[0].split(' ').pop();
    parts[2] = parts[2].split(' ')[0];
    return parts.join(':');
}