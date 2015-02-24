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
                sdpMax: '='
            },
            compile: function(element, attributes) {

                var uid;
                var txt = ' <div class="datepick" id="$$$" ng-click="$event.stopPropagation()" ng-cloak>' +
                            '<div class="datepick_header">' +
                                '<a href ng-click="setMonth($event, -1)"><span class="datepick_arrowleft"></span></a>' +
                                '<span class="titleMonth">{{ actualDate.format("MMMM") | uppercase }}</span>' +
                                '<a href ng-click="setMonth($event, 1)"><span class="datepick_arrowright"></span></a>' +
                                '<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>' +
                                '<a href ng-click="setYear($event, -1)"><span class="datepick_arrowleft"></span></a>' +
                                '<span class="titleYear">{{ actualDate.format("YYYY") }}</span>' +
                                '<a href ng-click="setYear($event, 1)"><span class="datepick_arrowright"></span></a>' +
                                '<span class=""><a href ng-click="">x</a></span>' +
                            '</div>' +
                            '<div class="datepick_body">' +
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
                            '<div class="datepick_footer" ng-show="showFooter">' +
                            '<div><a href ng-click="setDate($event, today)">Hoje</a></div>' +
                            '<div><a href ng-click="clearDate();" ng-show="model">Limpar</a></div>' +
                            '</div>' +
                        '</div>';

                return function($scope, element, attr, ngModel) {

                    ngModel.$parsers.push(function(value) {

                        var format = attr.sdpFormat || 'DD/MM/YYYY';

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

                    var format = attr.sdpFormat || 'DD/MM/YYYY';

                    $scope.showFooter = attr.footer == undefined ? true : (attr.footer != '');
                    $scope.today = { disabled: false, date: moment() };


                    $scope.actualDate = moment($scope.model || $scope.chosendate, format);
                    if ($scope.actualDate.isValid() == false) { $scope.actualDate = moment(); }

                    // Compile the html, link it to our scope and append the result to the page's body
                    var linkFn = $compile(txt);
                    var content = linkFn($scope);
                    var body = $document.find('body').eq(0);
                    body.append(content);

                    // Answers the original div or input click event
                    element.on('click', function(evt) {

                        // Calculate the dropdown box's position
                        var elePos = $(element).offset();
                        var top = elePos.top + $(element).outerHeight() + 2;
                        var left = elePos.left;
                        $scope.initialDate = moment($scope.model || $scope.chosendate, format);

                        if (top < 0) { top = 0; }
                        if (left < 0) { left = 0; }

                        // Apply the changes in the current month and render the calendar
                        $scope.$apply(function() {
                            $scope.monthObj = renderMonth($scope.actualDate, $scope.sdpMin, $scope.sdpMax, $scope.initialDate, format);

                            $('.datepick:not(' + uid + ')').hide();

                            $(uid).fadeIn(400).css({ 'top': top, 'left': left });
                            evt.preventDefault();
                        })

                        return false;
                    });

                    // Dismisses the date picker box when the user clicks somewhere else
                    $document.on('click', function($event) { goAway(400); });


                    $scope.clearDate = function() {

                        $scope.model = '';
                        goAway(400);
                    }

                    // Answers a year navigation click
                    $scope.setYear = function(e, val) {
                        e.stopPropagation();
                        $scope.actualDate.add(val, 'y');
                        $scope.monthObj = renderMonth($scope.actualDate, $scope.sdpMin, $scope.sdpMax, $scope.initialDate, format);
                    }

                    // Answers a month navigation click
                    $scope.setMonth = function(e, val) {
                        e.stopPropagation();
                        $scope.actualDate.add(val, 'M');
                        $scope.monthObj = renderMonth($scope.actualDate, $scope.sdpMin, $scope.sdpMax, $scope.initialDate, format);
                    }

                    // Answers a date cell click
                    $scope.setDate = function(e, cell) {

                        e.stopPropagation();

                        if (!cell.disabled) {

                            $scope.$evalAsync(function() {
                                if ($(element).attr('sdp-date')) {
                                    $scope.chosendate = cell.date.format(format);
                                } else {
                                    $scope.model = cell.date.format(format);
                                }

                                if ($scope.ondateselected) {

                                    $scope.ondateselected({ seldate: cell.date.format(format) });
                                }
                            });
                            goAway(400);
                        }
                    }
                }

                // Dismisses the date picker box
                function goAway(speed) {

                    $('.datepick').fadeOut(speed);
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
