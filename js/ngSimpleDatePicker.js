// =====================================================================
// Simple Datepicker Directive
// ---------------------------
//
// Directive for date picking on textboxes. Just drop a few attributes
// and you're done!!
//
// Depends on JQuery 1.11+ and Moment.js 2.8.3+
//
// By Walter Staeblein .:. 2014 - 2015
// =====================================================================
(function() {
    var sdp_app = angular.module('ngSimpleDatePick', []);
    var sdp_id = 0;
    var isofmt = 'YYYY-MM-DD';

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
                var uid;
                var defFormat = 'DD/MM/YYYY';
                var translations = {
                    pt: { clear: 'Apagar', today: 'Hoje', back: 'Voltar' },
                    en: { clear: 'Clear', today: 'Today', back: 'Back' },
                    es: { clear: 'Borrar', today: 'Hoy', back: 'Volver' }
                };
                var txt = ' <div class="datepick" id="$$$" ng-click="$event.stopPropagation()" ng-cloak>' +
                                '<div class="datepick_header">' +
                                    '<span class="titleDay" ng-click="mode = 0" ng-show="pickTime">{{ actualDate.format("DD") }}</span>' +
                                    '<a href ng-click="setMonth($event, -1)"><span class="datepick_arrowleft"></span></a>' +
                                    '<span class="titleMonth" ng-click="mode = (mode == 2 ? 0 : 2)">{{ actualDate.format("MMMM") | uppercase }}</span>' +
                                    '<a href ng-click="setMonth($event, 1)"><span class="datepick_arrowright"></span></a>' +
                                    '<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>' +
                                    '<a href ng-click="setYear($event, -1)"><span class="datepick_arrowleft"></span></a>' +
                                    '<span class="titleYear" ng-click="mode = (mode == 2 ? 0 : 2)">{{ actualDate.format("YYYY") }}</span>' +
                                    '<a href ng-click="setYear($event, 1)"><span class="datepick_arrowright"></span></a>' +
                                    '<span class="titleTime" ng-show="pickTime" ng-click="mode = (mode == 1 ? 0 : 1)">{{ time() }}</span>' +
                                '</div>' +
                                '<div class="datepick_body" ng-show="mode == 2">' +
                                    '<div class="sdp_anoscontainer">' +
                                        '<div style="float: left; margin-top: 14px; margin-left: 8px"><a href ng-click="makeYears(-1)"><span class="datepick_arrowleftlist"></span></a></div>' +
                                        '<div style="float: right; margin-top: 14px; margin-right: 8px"><a href ng-click="makeYears(1)"><span class="datepick_arrowrightlist"></span></a></div>' +
                                        '<div class="yearlistcontainer">' +
                                            '<div class="sdp_years" ng-class="{ sdp_sel: y == actualDate.year() }" ng-click="setYear($event, y)" ng-repeat="y in yearsBelow track by $index">{{ y }}</div>' +
                                            '<br />' +
                                            '<div class="sdp_years" ng-class="{ sdp_sel: y == actualDate.year() }" ng-click="setYear($event, y)" ng-repeat="y in yearsAbove track by $index">{{ y }}</div>' +
                                        '</div>' +
                                        '<br />' +
                                        '<div>' +
                                            '<div class="sdp_months" ng-class="{ sdp_sel: $index == actualDate.month() }" ng-click="setMonthStraight($event, $index)" ng-repeat="m in months track by $index">{{ m | uppercase }}</div>' +
                                        '</div><br />' +
                                    '</div>' +
                                '</div>' +
                                '<div class="datepick_body" ng-show="mode == 0">' +                                    
                                    '<table class="datepick_datecontainer" cellspacing="0" cellpadding="6">' +
                                        '<thead>' +
                                            '<tr>' +
                                                '<td ng-repeat="dname in monthObj.weekdays">{{ dname }}</td>' +
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
                                '<div class="datepick_body" ng-show="mode == 1">' +
                                '<div class="timecontainer">' +
                                    '<div style="margin-bottom: 10px;">' +
                                        '<div class="timecell" ng-click="setTime(0, h)" ng-repeat="h in hours track by $index" ng-class="{ sdp_sel: h == hour }">{{ h }}</div>' +
                                    '</div>' +
                                    '<div style="margin-bottom: 5px;">' +
                                        '<div class="timecell" ng-click="setTime(1, 0)" ng-class="{ sdp_sel: 0 == minuteD }">0</div>' + 
                                        '<div class="timecell" ng-click="setTime(1, 1)" ng-class="{ sdp_sel: 1 == minuteD }">10</div>' + 
                                        '<div class="timecell" ng-click="setTime(1, 2)" ng-class="{ sdp_sel: 2 == minuteD }">20</div>' + 
                                        '<div class="timecell" ng-click="setTime(1, 3)" ng-class="{ sdp_sel: 3 == minuteD }">30</div>' + 
                                        '<div class="timecell" ng-click="setTime(1, 4)" ng-class="{ sdp_sel: 4 == minuteD }">40</div>' + 
                                        '<div class="timecell" ng-click="setTime(1, 5)" ng-class="{ sdp_sel: 5 == minuteD }">50</div>' + 
                                        '<br />' +
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
                                    '<br />' +
                                    '<div class="timeshowtime">{{ time() }}</div>' +                               
                                '</div>' +
                            '</div>' +
                            '<div class="datepick_footer" ng-show="showFooter">' +
                                '<div class="btntoday" ng-show="checkToday()"><a href ng-click="setDate($event, today)">{{ ::translation.today }}</a></div>' +
                                '<div class="btnclear"><a href ng-click="clearDate();" ng-class="{ invis: !model }">{{ ::translation.clear }}</a></div>' +
                                '<div class="btntime" ng-show="mode"><a href ng-click="mode = 0">{{ ::translation.back }}</a></div>' 
                            '</div>' +
                        '</div>';

                return function($scope, element, attr, ngModel) {

                    ngModel.$parsers.push(function(value) {

                        var format = attr.sdpFormat || defFormat;

                        if (moment(value).isValid() == true) {
                            return moment(value).format(format);
                        } else {
                            return value;
                        }

                    });

                    sdp_id++;
                    uid = "sdp_id" + sdp_id;
                    txt = txt.replace('$$$', uid);
                    uid = '#' + uid;
                    var format = attr.sdpFormat || defFormat;

                    $scope.translation = translations[$scope.language || 'pt'];

                    $scope.pickTime = (attr.sdpPickTime == "true" || attr.sdpPickTime == "1");  // If the picker has to pick times as well
                    $scope.months = moment.months();                                            // Month names
                    $scope.mode = 0;                                                            // 0 = date / Day, 1 = time, 2 = Month / Year

                    $scope.showFooter = attr.footer == undefined ? true : (attr.footer != '');  
                    $scope.today = { disabled: false, date: moment() };

                    $scope.hours = makeHours(attr.timeformat || '24');


                    $scope.time = function() {
                        return ('00' + $scope.hour).slice(-2) + ':' + ('00' + ($scope.minuteD * 10 + $scope.minuteU)).slice(-2);
                    }

                    $scope.checkToday = function() {
                        var t = moment().startOf('day');
                        var min = moment($scope.sdpMin, format);
                        var max = moment($scope.sdpMax, format);

                        if (min.isValid() && min.toDate() > t) { return false; }
                        if (max.isValid() && max.toDate() < t) { return false; }
                        return true;
                    }

                    $scope.showDateTime = function(mod) {
                        $scope.mode = mod;
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
                        var t = $scope.time();

                    
                    }

                    // Compile the html, link it to our scope and append the result to the page's body
                    var linkFn = $compile(txt);
                    var content = linkFn($scope);
                    var body = $document.find('body').eq(0);
                    body.append(content);

                    // Answers the original div or input click event
                    element.on('click', function(evt) {

                        $scope.hour = 0;
                        $scope.minuteU = 0;
                        $scope.minuteD = 0;
                        
                        $scope.actualDate = moment($scope.model || $scope.chosendate, format);
                        if ($scope.actualDate.isValid() == false) { $scope.actualDate = moment(); }
                        
                        $scope.initialDate = moment($scope.model || $scope.chosendate, format);
                        $scope.bulkYear = $scope.initialDate.year() || new Date().getFullYear();
                        $scope.makeYears(0);

                        // Get the time part of the date
                        if ($scope.pickTime) {
                            var dt = $scope.model || $scope.chosendate;
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
                            $scope.monthObj = renderMonth($scope.actualDate, $scope.sdpMin, $scope.sdpMax, $scope.initialDate, format);

                            positionBox(element);
                            evt.preventDefault();
                        });
                        return false;
                    });

                    window.onresize = function(event) {
                        positionBox(element);
                    };

                    // Dismisses the date picker box when the user clicks somewhere else
                    $document.on('click', function($event) { goAway(400); });

                    $scope.clearDate = function() {
                        $scope.model = '';
                        goAway(400);
                    }

                    // Answers a year navigation click
                    $scope.setYear = function(e, val) {
                        e.stopPropagation();
                        if (val > 10) {
                            $scope.actualDate.year(val);
                        } else {                        
                            $scope.actualDate.add(val, 'y');
                        }
                        $scope.monthObj = renderMonth($scope.actualDate, $scope.sdpMin, $scope.sdpMax, $scope.initialDate, format);
                    }

                    // Answers a month navigation click
                    $scope.setMonth = function(e, val) {
                        e.stopPropagation();
                        if (val > 10) {
                            $scope.actualDate.month(val);
                        } else {
                            $scope.actualDate.add(val, 'M');
                        }
                        $scope.monthObj = renderMonth($scope.actualDate, $scope.sdpMin, $scope.sdpMax, $scope.initialDate, format);
                    }

                    $scope.setMonthStraight = function(e, val) {
                        $scope.actualDate.month(val);
                        $scope.monthObj = renderMonth($scope.actualDate, $scope.sdpMin, $scope.sdpMax, $scope.initialDate, format);
                    }

                    // Answers a date cell click
                    $scope.setDate = function(e, cell) {

                        e.stopPropagation();

                        if (!cell.disabled) {

                            $scope.$evalAsync(function() {
                                var tm = $scope.pickTime ? ' ' + $scope.time() : ''
                                if ($(element).attr('sdp-date')) {
                                    $scope.chosendate = cell.date.format(format) + tm;
                                } else {
                                    $scope.model = cell.date.format(format) + tm;
                                }

                                if ($scope.ondateselected) {
                                    $scope.ondateselected({ seldate: cell.date.format(format) + tm });
                                }
                            });
                            $scope.mode = 0;
                            goAway(400);
                        }
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

                function positionBox(ele) {
                    var elePos = $(ele).offset();
                    var top = elePos.top + $(ele).outerHeight() + 2;
                    var left = elePos.left;

                    if (top < 0) { top = 0; }
                    if (left < 0) { left = 0; }    
                    $('.datepick:not(' + uid + ')').hide();
                    $(uid).fadeIn(400).css({ 'top': top, 'left': left });                                    
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
                // Format is the format in which to show dates
                function renderMonth(dt, min, max, inidate, format) {

                    var ini = moment(dt), m = ini.month(), y = ini.year();
                    var fim = ini.date(0);
                    var counter = ini.add(-ini.weekday(), 'd');

                    var dateObj = {};
                    var lines = [];
                    var wdn = [];
                    var tmp = counter.clone();
                    var idate = '';
                    if (inidate != undefined) { idate = inidate.format(isofmt); }

                    for (var i = 0; i < 7; i++) {
                        wdn.push(tmp.format('ddd').toUpperCase());
                        tmp.add(1, 'd');
                    }

                    if (min || max) {
                        var mindate = moment(min + ' 10:00:00', format + ' HH:mm:SS');
                        if (!mindate.isValid()) { mindate = moment(new Date(1970, 1, 1, 10)); }

                        var maxdate = moment(max + ' 10:00:00', format + ' HH:mm:SS');
                        if (!maxdate.isValid()) { maxdate = moment(new Date(2160, 12, 31, 10)); }
                    }
                    for (var l = 0; l < 6; l++) {

                        var line = [];

                        for (var c = 0; c < 7; c++) {
                            var dis = false;

                            if (min || max) {
                                var adate = counter.format(isofmt);
                                dis = !(adate >= mindate.format(isofmt) && adate <= maxdate.format(isofmt));
                                console.log(adate + ' ==> ' + mindate.format(isofmt));
                            }
                            var ctrfmt = counter.format(isofmt);
                            var obj = { date: counter.clone(),
                                day: counter.date(),
                                outofmonth: (counter.month() != m),
                                disabled: dis,
                                today: (moment().format(isofmt) == ctrfmt),
                                initial: (idate == ctrfmt)
                            };

                            line.push(obj);
                            counter.add(1, 'd');
                        }
                        lines.push(line);
                    }
                    dateObj.dates = lines;
                    dateObj.weekdays = wdn;
                    dateObj.month = m;
                    dateObj.year = y;

                    return dateObj;
                }
            }
        }
    } ]);
} ());