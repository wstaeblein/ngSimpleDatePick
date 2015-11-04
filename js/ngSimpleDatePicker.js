// =====================================================================
// Simple Datepicker Directive
// ---------------------------
//
// Directive for date picking on textboxes. Just drop a few attributes
// and you're done!!
//
// Depends on JQuery 1.11+
//
// By Walter Staeblein .:. 2014 - 2015
// =====================================================================
(function() {
    var sdp_app = angular.module('ngSimpleDatePick', []);

    sdp_app.directive('simpleDatePick', ['$compile', '$document', function($compile, $document) {

        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                model: '=ngModel',
                chosendate: '=sdpDate',
                ondateselected: '&sdpOnDateSelected',
                sdpMin: '=',
                sdpMax: '=',
                language: '@sdpLanguage'
            },
            compile: function(element, attributes) {
                var defFormat = 'YYYY-MM-DD';
                var translations = {
                    pt: { clear: 'Apagar', today: 'Hoje', back: 'Voltar', time: 'Tempo', months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'], weekdays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'] },
                    en: { clear: 'Clear', today: 'Today', back: 'Back', time: 'Time', months: ['January', 'February', 'Mars', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
                    es: { clear: 'Borrar', today: 'Hoy', back: 'Volver', time: 'Tiempo', months: ['Eneiro', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'], weekdays: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'] }
                };
                var txt = ' <div class="datepick" ng-click="$event.stopPropagation()" ng-blur="disappear()" ng-cloak>' +
                    '<div class="datepick_header">' +
                    '<span class="titleDay" ng-click="showModule(1)" >{{ actualDate.format("DD") }}</span>' +
                    '<a href ng-click="setMonth($event, -1)"><span class="datepick_arrowleft"></span></a>' +
                    '<span class="titleMonth" ng-click="showModule(0)">{{ translation.months[actualDate.month()] | uppercase }}</span>' +
                    '<a href ng-click="setMonth($event, 1)"><span class="datepick_arrowright"></span></a>' +
                    '<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>' +
                    '<a href ng-click="setYear($event, -1)"><span class="datepick_arrowleft"></span></a>' +
                    '<span class="titleYear" ng-click="showModule(0)">{{ actualDate.format("YYYY") }}</span>' +
                    '<a href ng-click="setYear($event, 1)"><span class="datepick_arrowright"></span></a>' +
                    '<span class="titleTime" ng-show="pickTime" ng-click="showModule(2)">{{ time }}</span>' +
                    '</div>' +
                    '<div class="datepick_content_container">' +
                    '<div class="datepick_body">' +
                    '<div class="sdp_anoscontainer">' +
                    '<div style="float: left; margin-top: 14px; margin-left: 8px"><a href ng-click="makeYears(-1)"><span class="datepick_arrowleftlist"></span></a></div>' +
                    '<div style="float: right; margin-top: 14px; margin-right: 8px"><a href ng-click="makeYears(1)"><span class="datepick_arrowrightlist"></span></a></div>' +
                    '<div class="yearlistcontainer">' +
                    '<div class="sdp_years" ng-class="{ sdp_sel: y == actualDate.year() }" ng-click="setYear($event, y)" ng-repeat="y in yearsBelow track by $index">{{ y }}</div>' +
                    '<br />' +
                    '<div class="sdp_years" ng-class="{ sdp_sel: y == actualDate.year() }" ng-click="setYear($event, y)" ng-repeat="y in yearsAbove track by $index">{{ y }}</div>' +
                    '</div>' +
                    '<div style="margin: 15px 0">' +
                    '<div class="sdp_months" ng-class="{ sdp_sel: $index == actualDate.month() }" ng-click="setMonthStraight($event, $index)" ng-repeat="m in translation.months track by $index">{{ m | uppercase }}</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="datepick_body ison">' +
                    '<table class="datepick_datecontainer" cellspacing="0" cellpadding="8">' +
                    '<thead>' +
                    '<tr>' +
                    '<td ng-repeat="dname in translation.weekdays">{{ dname }}</td>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                    '<tr ng-repeat="wk in monthObj.dates">' +
                    '<td ng-repeat="cell in wk" ng-click="setDate($event, cell)" ' +
                    'ng-class="{ datepick_outdatecell: cell.outofmonth, datepick_disabled: cell.disabled, ' +
                    'datepick_today: cell.today, datepick_initial: cell.initial }">{{ cell.day }}</td>' +
                    '</tr>' +
                    '</tbody>' +
                    '</table>' +
                    '</div>' +
                    '<div class="datepick_body">' +
                    '<div class="timecontainer">' +
                    '<div style="margin: 10px;">' +
                    '<div class="timecell" ng-click="setTime(0, h)" ng-repeat="h in hours track by $index" ng-class="{ sdp_sel: h == hour }">{{ h }}</div>' +
                    '</div>' +
                    '<div style="margin: 10px;">' +
                    '<div style="margin: 20px;">' +
                    '<div class="timecell" ng-click="setTime(1, 0)" ng-class="{ sdp_sel: 0 == minuteD }">0</div>' +
                    '<div class="timecell" ng-click="setTime(1, 1)" ng-class="{ sdp_sel: 1 == minuteD }">10</div>' +
                    '<div class="timecell" ng-click="setTime(1, 2)" ng-class="{ sdp_sel: 2 == minuteD }">20</div>' +
                    '<div class="timecell" ng-click="setTime(1, 3)" ng-class="{ sdp_sel: 3 == minuteD }">30</div>' +
                    '<div class="timecell" ng-click="setTime(1, 4)" ng-class="{ sdp_sel: 4 == minuteD }">40</div>' +
                    '<div class="timecell" ng-click="setTime(1, 5)" ng-class="{ sdp_sel: 5 == minuteD }">50</div>' +
                    '</div>' +
                    '<div style="margin: 10px 0 5px 0;">' +
                    '<div class="timecell" ng-click="setTime(2, 0)" ng-class="{ sdp_sel: 0 == minuteU }">0</div>' +
                    '<div class="timecell" ng-click="setTime(2, 1)" ng-class="{ sdp_sel: 1 == minuteU }">1</div>' +
                    '<div class="timecell" ng-click="setTime(2, 2)" ng-class="{ sdp_sel: 2 == minuteU }">2</div>' +
                    '<div class="timecell" ng-click="setTime(2, 3)" ng-class="{ sdp_sel: 3 == minuteU }">3</div>' +
                    '<div class="timecell" ng-click="setTime(2, 4)" ng-class="{ sdp_sel: 4 == minuteU }">4</div>' +
                    '<br />' +
                    '<div class="timecell" ng-click="setTime(2, 5)" ng-class="{ sdp_sel: 5 == minuteU }">5</div>' +
                    '<div class="timecell" ng-click="setTime(2, 6)" ng-class="{ sdp_sel: 6 == minuteU }">6</div>' +
                    '<div class="timecell" ng-click="setTime(2, 7)" ng-class="{ sdp_sel: 7 == minuteU }">7</div>' +
                    '<div class="timecell" ng-click="setTime(2, 8)" ng-class="{ sdp_sel: 8 == minuteU }">8</div>' +
                    '<div class="timecell" ng-click="setTime(2, 9)" ng-class="{ sdp_sel: 9 == minuteU }">9</div>' +
                    '</div>' +
                    '</div>' +
                    '<br />' +
                    '<div class="timeshowtime">{{ time}}</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="datepick_footer">' +
                    '<div class="btntoday" ng-show="checkToday()"><a href ng-click="setDate($event, today)">{{ ::translation.today }}</a></div>' +
                    '<div class="btnclear"><a href ng-click="clearDate();" ng-class="{ invis: !model }">{{ ::translation.clear }}</a></div>' +
                    '<div class="btntime" ng-show="mode"><a href ng-click="mode = 0">{{ ::translation.back }}</a></div>'
                '</div>' +
                '</div>';



                return function($scope, element, attrs, ngModel) {

                    var inputFormat = attrs.sdpInputFormat || 'DMY';
                    var outputFormat = attrs.sdpOutputFormat || defFormat;

                    element.attr('readonly', true);
                    $scope.translation = translations[$scope.language || 'pt'];                     // Directive messages
                    $scope.pickTime = (attrs.sdpPickTime == "true" || attrs.sdpPickTime == "1");    // If the picker has to pick times as well
                    $scope.mode = 0;                                                                // 0 = date / Day, 1 = time, 2 = Month / Year
                    $scope.today = { disabled: false, date: new shortDate() };
                    $scope.hours = makeHours(attrs.timeformat || '24');                             // Hours picking

                    if ($scope.pickTime) {
                        outputFormat += attrs.timeformat == '12' ? ' hh:mmA' : ' HH:mm';
                    }

                    var actdt;
                    if ($scope.model) {
                        actdt = new shortDate($scope.model, inputFormat);
                        if (actdt.isValid() == false) {
                            actdt = new shortDate();
                            $scope.model = '';
                        } else {
                            $scope.model = actdt.format(outputFormat);
                        }
                    } else {
                        actdt = new shortDate();
                    }
                    actdt.setTime(0, 0, 0);
                    $scope.actualDate = actdt;
                   
                    $scope.time = $scope.actualDate.format(attrs.timeformat == '12' ? ' hh:mmA' : ' HH:mm');

                    $scope.checkMinMax = function() {
                        if ($scope.sdpMin) { 
                            $scope.min = new shortDate($scope.sdpMin, inputFormat); 
                            if (!$scope.min.isValid()) { $scope.min = new shortDate('min'); }
                        } else {
                            $scope.min = new shortDate('min'); 
                        }
                        $scope.min.setTime(0, 0, 0);

                        if ($scope.sdpMax) { 
                            $scope.max = new shortDate($scope.sdpMax, inputFormat); 
                            if (!$scope.max.isValid()) { $scope.max = new shortDate('max'); }
                        } else {
                            $scope.max = new shortDate('max'); 
                        }
                        $scope.max.setTime(0, 0, 0);
                    }
                    $scope.checkMinMax();

                    $scope.checkToday = function() {
                        var t = new shortDate()
                        t.setTime(0, 0, 0);

                        if ($scope.min.toDate() > t) { return false; }
                        if ($scope.max.toDate() < t) { return false; }
                        return true;
                    }

                    $scope.showModule = function(mod) {
                        // 0 = Years & Months, 1 = Dates, 2 = Time
                        var onObj = element.next().find('.datepick_body.ison');
                        if (mod != onObj.index()) {
                            var offObj = element.next().find('.datepick_body').eq(mod);
                            onObj.hide(300, function() {
                                onObj.removeClass('ison');
                            });
                            offObj.show(360, function() {
                                offObj.addClass('ison');
                            }); 
                        }                   
                    }

                    $scope.setTime = function(t, num) {
                        switch(t) {
                            case 0:
                                if (num.indexOf('p') > -1) {
                                    num = parseInt(num.replace('p', '')) + 12;
                                }
                                $scope.hour = num;
                                break;
                            case 1: $scope.minuteD = num; break;
                            case 2: $scope.minuteU = num; break;
                        }
                        //var t = $scope.time();

                        $scope.actualDate.setTime($scope.hour, ($scope.minuteD * 10 + $scope.minuteU), 0);
                        $scope.time = $scope.actualDate.format(attrs.timeformat == '12' ? ' hh:mmA' : ' HH:mm');
                    }

                    $scope.disappear = function() {
                        goAway();
                        $scope.mode = 0;
                        showModule(1);
                    }

                    // Compile the html, link it to our scope and append the result to the page's body
                    var linkFn = $compile(txt);
                    var content = linkFn($scope);
                    var body = $document.find('body').eq(0);
                    element.after(content);
                    var offsets = attrs.offsets ? attrs.offsets.split(',') : [0,0];

                    // ---------------------------------------------
                    // Answers the original div or input click event
                    // ---------------------------------------------
                    element.on('click', function(evt) {
                        $scope.checkMinMax();
                        $scope.hour = 0;
                        $scope.minuteU = 0;
                        $scope.minuteD = 0;
                        //$scope.empty = ($scope.model == '' || $scope.model == null || $scope.model == undefined ? true : false);

                        $scope.initialDate = new shortDate($scope.actualDate);       // Data na caixa ou a data de hoje
                        $scope.initialDate.day(1);

                        $scope.bulkYear = $scope.initialDate.year() || new Date().getFullYear();
                        $scope.makeYears(0);

                        // Get the time part of the date
                        if ($scope.pickTime) {
                            var dt = $scope.model;
                            if (dt) {
                                var aa = dt.split(' ');
                                if (aa.length == 2) {
                                    var aaa = aa[1].split(':');
                                    $scope.hour = parseInt(aaa[0]);
                                    $scope.minuteD = Math.floor(parseInt(aaa[1]) / 10);
                                    $scope.minuteU = parseInt(aaa[1]) % 10;
                                }
                            }
                        }

                        // Apply the changes in the current month and render the calendar
                        $scope.$apply(function() {
                            $scope.monthObj = renderMonth($scope.min, $scope.max, $scope.initialDate, $scope.model);

                            positionBox(element, offsets);
                            evt.preventDefault();
                        });
                        return false;
                    });

                    window.onresize = function(event) {
                        positionBox(element, offsets);
                    };

                    // Dismisses the date picker box when the user clicks somewhere else
                    $document.on('click', function($event) { goAway(400); $scope.mode = 0; });

                    $scope.clearDate = function() {
                        $scope.model = '';
                        $scope.actualDate = new shortDate();
                        goAway(400);
                    }

                    // Answers a year navigation click
                    $scope.setYear = function(e, val) {
                        e.stopPropagation();
                        if (val > 10) {
                            $scope.actualDate.year(val);
                        } else {
                            $scope.actualDate.addYears(val);
                        }
                        $scope.initialDate = $scope.actualDate.clone();
                        $scope.initialDate.day(1);
                        $scope.monthObj = renderMonth($scope.min, $scope.max, $scope.initialDate, $scope.model);
                    }

                    // Answers a month navigation click
                    $scope.setMonth = function(e, val) {
                        e.stopPropagation();
                        if (val > 10) {
                            $scope.actualDate.month(val);
                        } else {
                            $scope.actualDate.addMonths(val);
                        }
                        $scope.initialDate = new shortDate($scope.actualDate);
                        $scope.initialDate.day(1);
                        $scope.monthObj = renderMonth($scope.min, $scope.max, $scope.initialDate, $scope.model);
                    }

                    $scope.setMonthStraight = function(e, val) {
                        $scope.actualDate.month(val);
                        $scope.initialDate = new shortDate($scope.actualDate);
                        $scope.initialDate.day(1);
                        $scope.monthObj = renderMonth($scope.min, $scope.max, $scope.initialDate, $scope.model);
                    }

                    // Answers a date cell click
                    $scope.setDate = function(e, cell) {
                        e.stopPropagation();

                        if (!cell.disabled) {

                            $scope.$evalAsync(function() {
                                $scope.actualDate = $scope.composeChosenDate(cell);
                                $scope.model = $scope.actualDate.format(outputFormat);

                                if ($scope.ondateselected) {
                                    $scope.ondateselected({ seldate: $scope.model });
                                }
                            });
                            $scope.mode = 0;
                            goAway(400);
                        }
                    }

                    // Seta a data e a hora escolhidas
                    $scope.composeChosenDate = function(cell) {
                        var dt = cell.date;
                        if ($scope.pickTime) {
                            dt.setTime($scope.hour, ($scope.minuteD * 10 + $scope.minuteU), 0);
                        }
                        return dt;
                    }

                    $scope.makeYears = function(updown) {
                        $scope.bulkYear = $scope.bulkYear + (updown * 6);
                        var resp1 = [];
                        for (var i = 6; i > 0; i--) {
                            resp1.push($scope.bulkYear - i);
                        }
                        $scope.yearsBelow = resp1;
                        var resp2 = [];
                        for (var i = 0; i < 6; i++) {
                            resp2.push($scope.bulkYear + i);
                        }
                        $scope.yearsAbove = resp2;
                    }
                }

                function positionBox(ele, ofs) { //console.log(ofs);
                    var elePos = ele.offset();
                    var top = elePos.top + ele.outerHeight() + (ofs[1] ? parseInt(ofs[1], 10) : 0) + 1;
                    var left = elePos.left + (ofs[0] ? parseInt(ofs[0], 10) : 0);

                    if (top < 0) { top = 0; }
                    if (left < 0) { left = 0; }
                    $('.datepick').hide();
                    ele.next().fadeIn(400).css({ 'top': top, 'left': left });
                }

                // Dismisses the date picker box
                function goAway(speed) {
                    $('.datepick').fadeOut(speed);
                }

                function makeHours(fmt) {
                    var resp = [];
                    for (var i = 0; i < 24; i++) {
                        if (fmt == '12') {
                            resp.push((i < 12 ? i + '': ( i - 12) + 'Pm'));
                        } else {
                            resp.push(i.toString());
                        }
                    }
                    return resp;
                }

                // Renders a month of a year passed in dt.
                // min and max determines which cells can be selected
                // inidate is the date at the box when it was clicked
                // actdate is the actual choice made (will be current date if empty)
                // Empty signals that the date box is empty
                function renderMonth(min, max, inidate, model) { 
                    var m = inidate.month(), y = inidate.year();
                    var counter = new shortDate(inidate.addDays(-inidate.weekday())).setTime(0, 0, 0);      // Posiciona no primeiro dia da semana
                    var modelDate = new shortDate(model ? model : 'min').setTime(0, 0, 0);

                    var dateObj = {};
                    var lines = [];
                    var wdn = [];
                    var idate = '';

                    for (var l = 0; l < 6; l++) {
                        var line = [];
                        for (var c = 0; c < 7; c++) {
                            var dis = (counter.toDate() < min.toDate() || counter.toDate() > max.toDate());
                            var obj = { date: counter.clone(),
                                day: counter.day(),
                                outofmonth: (counter.month() != m),
                                disabled: dis,
                                today: counter.isToday(),
                                initial: (modelDate.compare(counter) == 0)
                            };
    console.log(modelDate.compare(counter) + ' -- ' + modelDate.toDate())
                            line.push(obj);
                            counter.addDays(1);
                        }
                        lines.push(line);
                    }
                    dateObj.dates = lines;
                    dateObj.month = m;
                    dateObj.year = y;

                    return dateObj;
                }
            }
        }
    } ]);
} ());


function shortDate(stringDate, dateFormat) {

    var self = this;
    var utc = false;
    var thisDate = parseDate(stringDate, dateFormat);
    this.toDate = function() { return thisDate; }

    this.year = function(y) { if (!isNaN(y)) { thisDate.setYear(y); } else { return thisDate.getFullYear(); }};
    this.month = function(m) { if (!isNaN(m)) { thisDate.setMonth(m); } else { return thisDate.getMonth(); }};
    this.day = function(d) { if (!isNaN(d)) { thisDate.setDate(d); } else { return thisDate.getDate(); }};
    this.weekday = function() { return thisDate.getDay(); };
    this.hours = function() { return thisDate.getHours(); };
    this.minutes = function() { return thisDate.getMinutes(); };
    this.seconds = function() { return thisDate.getSeconds(); };
    this.milliseconds = function() { return thisDate.getMilliseconds(); };
    this.timeSinceEpoch = function(unix) { return Math.floor(thisDate.getTime() / (unix ? 1000 : 1)); }
    this.tzOffsetMinutes = function() { return thisDate.getTimezoneOffset(); };
    this.isUTC = function() { return utc; };

    this.isValid = function() { return isValidDate(thisDate); }
    this.clone = function() { return new shortDate(thisDate); }

    this.isToday = function() {
        var t = new Date();
        return (t.getFullYear() == thisDate.getFullYear() && t.getMonth() == thisDate.getMonth() && t.getDate() == thisDate.getDate());
    }

    this.removeTime = function() {  
        thisDate = new Date(thisDate.getFullYear(), thisDate.getMonth(), thisDate.getDate(), 0, 0, 0, 0);
        return self;
    }

    this.addDays = function(number) {
        thisDate = new Date(thisDate.getFullYear(), thisDate.getMonth(), thisDate.getDate() + number, 
            thisDate.getHours(), thisDate.getMinutes(), thisDate.getSeconds());
        return self;
    }
    this.addMonths = function(number) {
        thisDate = new Date(thisDate.getFullYear(), thisDate.getMonth() + number, thisDate.getDate(), 
            thisDate.getHours(), thisDate.getMinutes(), thisDate.getSeconds());
        return self;
    }
    this.addYears = function(number) {
        thisDate = new Date(thisDate.getFullYear() + number, thisDate.getMonth(), thisDate.getDate(), 
            thisDate.getHours(), thisDate.getMinutes(), thisDate.getSeconds());
        return self;
    }


    this.setTime = function(h, m, s) {
        thisDate = new Date(thisDate.getFullYear(), thisDate.getMonth(), thisDate.getDate(), h, m, s);
        return self;
    }

    // return 0 for equals, 1 for otherdate smaller and -1 for otherdate larger
    this.compare = function(otherDate, justDate) {
        var other = otherDate instanceof shortDate ? otherDate.toDate() : otherDate;
        if (justDate) {
            var mydt = new Date(thisDate.getFullYear(), thisDate.getMonth(), thisDate.getDate(), 0, 0, 0);
            var otdt = new Date(other.getFullYear(), other.getMonth(), other.getDate(), 0, 0, 0);
        } else {
            mydt = thisDate;
            otdt = new Date(other);
        }
        if (mydt.getTime() === otdt.getTime()) { return 0; } else { return (mydt > otdt) ? 1 : -1; }
    }

    this.format = function(format) {
        return formatDate(thisDate, format);
    }

    /*shortDate.prototype.isDate = function(date2Test) {
        var dt = date2Test instanceof shortDate ? date2Test.toDate() : date2Test;
        return Object.prototype.toString.call(dt) === '[object Date]';
    }*/

    // format = [ISO, MMD, DDM] 
    function parseDate(strDate, format) {

        if (strDate instanceof shortDate) { return new Date(strDate.toDate()); }                                                  // Is a shortDate object
        if (!strDate) { utc = (new Date().getTimezoneOffset() == 0); return new Date(); }  // Empty so return present date

        // Se já for uma data
         if (Object.prototype.toString.call(strDate) === '[object Date]') {
            if (isValidDate(strDate)) {
                utc = (strDate.getTimezoneOffset() == 0);
                return new Date(strDate);
            } else {
                return 'Error: Invalid Date';
            }
        }

        if (strDate.toLowerCase() == 'min') { return new Date(-864000000000000); }                                     // Min date
        if (strDate.toLowerCase() == 'max') { return new Date(864000000000000); }                                      // Max date

        // Try using the built in date parser
        var dd = new Date(strDate);
        if (isValidDate(dd)) { return new Date(dd.getTime() + dd.getTimezoneOffset() * 60000); }

        // If all else fails, go for the manual parsing
        var sep = '';
        var seps = '-/.'
        var ampm = '';
        var arr = strDate.replace('T', ' ').split(' ');
        var year = 0, month = 0, day = 0, hour = 0, min = 0, sec = 0, msec = 0;
        var dt = arr[0], tm = '';
        if (arr.length > 1) { tm = arr[1]; };

        // Determine the date separator
        for (var i = 0; i < seps.length; i++) {
            if (dt.indexOf(seps[i]) > -1) {
                sep = seps[i];
                break;
            }
        }
        if (sep == '') { return 'Error: Date format not recognized'; }                                                  // Date format not recognized

        // Determine the timezone
        if (lastChars(dt, 1) == 'Z') {
            utc = true;
            dt = dt.slice(0, -1);
        } else {
            if (lastChars(dt, 5) == '+0000') {
                utc = true;
                dt = dt.slice(0, -5);
            }
        }

        // Determine date format
        var dtArr = dt.split(sep);
        var dtFormat = format;
        if (dtArr.length != 3) { return 'Error: Date is incomplete'; }                                                  // Not a complete date
        if (isNaN(dtArr[0]) || isNaN(dtArr[1]) || isNaN(dtArr[1])) { return 'Error: Date parts are not numeric'; }      // Not 100% numeric date
        if (dtArr[0].length == 4) { dtFormat = 'ISO'; }

        switch(dtFormat.substring(0, 3)) {
            case 'MDY': year = parseInt(dtArr[2], 10); month = parseInt(dtArr[0], 10) - 1; day = parseInt(dtArr[1], 10); break;
            case 'DMY': year = parseInt(dtArr[2], 10); month = parseInt(dtArr[1], 10) - 1; day = parseInt(dtArr[0], 10); break;
            default: year = parseInt(dtArr[0], 10); month = parseInt(dtArr[1], 10) - 1; day = parseInt(dtArr[2], 10); break;
        }

        // Determine time format
        tm = tm.trim();
        if (tm.length > 0) {
            var tmp = tm.toLowerCase();
            if (tmp.indexOf('pm') > -1) { ampm = 'pm'; tm = tm.replace('pm', '').replace('PM', ''); }
            tm = tm.replace('am', '').replace('AM', '');

            // Start with milliseconds if they are present
            var tmArr = tm.split('.');
            if (tmArr.length > 2)  { return 'Error: Time format not recognized'; }                                         // Time format not recognized
            if (tmArr.length == 2 && !isNaN(tmArr[1])) { msec = parseInt(tmArr[1], 10); }

            // Then move to the other time elements
            tmArr = tmArr[0].split(':');
            if (tmArr.length != 2 && tmArr.length != 3) { return 'Error: Time format not recognized'; }                    // Time format not recognized

            if (isNaN(tmArr[0]) || isNaN(tmArr[1])) { return 'Error: Time parts are not numeric'; }                        // Not 100% numeric time
            hour = parseInt(tmArr[0], 10) + (ampm == 'pm' ? 12 : 0);
            min = parseInt(tmArr[1], 10);
            if (tmArr.length == 3) {
                if (isNaN(tmArr[2]))  { return 'Error: Time parts are not numeric'; }                                      // Not 100% numeric time
                sec = parseInt(tmArr[2], 10);
            }
        }
        return utc ? new Date(Date.UTC(year, month, day, hour, min, sec, msec)) : new Date(year, month, day, hour, min, sec, msec);
    }

    // Formata as datas de acordo com o formato passado
    function formatDate(dt, format) {

        var mmm = dt.getMonth() + 1;
        var hhh = dt.getHours();
        var ampm = hhh > 12 ? 'pm' : 'am';
        var is12h = (format.indexOf('A') > -1);
        hhh = is12h ? (hhh > 12 ? hhh - 12 : hhh) : hhh;
        var y = ('0000' + dt.getFullYear()).slice(-4), mm = ('00' + mmm).slice(-2), d = ('00' + dt.getDate()).slice(-2);
        var h = ('00' + hhh).slice(-2), m = ('00' + dt.getMinutes()).slice(-2), s = ('00' + dt.getSeconds()).slice(-2);
        var ms = ('000' + dt.getMilliseconds()).slice(-3);

        return format.replace('YYYY', y).replace('MM', mm).replace('DD', d).replace('HH', h).replace('mm', m).replace('sss', ms).replace('ss', s).replace('A', ampm);
    }

    function lastChars(str, number) { return str.substr(str.length - number); }

    function isValidDate(d) {
        if ( Object.prototype.toString.call(d) !== "[object Date]" ) { return false; }
        return !isNaN(d.getTime());
    }
    
    return this;                // Allow chaining on the constructor
}
