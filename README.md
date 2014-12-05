ngSimpleDatePick
================

A small angular date picker using JQuery and momentJS.
Supports min and max dates, so that only dates in between those can be picked.
Works on inputs with ngModel as well as on a &lt;div&gt;, &lt;span&gt; or any other tag.



Dependencies
------------
<ul>
<li>AngularJS (used v1.3.3)</li>
<li>JQuery (used v1.11.1)</li>
<li>Moment.js (used v2.8.3)</li>
</ul>


Installation
------------

Make sure you have Angular, JQuery and MomentJS in your project, then just add:

```html
<script src="js/ngSimpleDatePicker.js" type="text/javascript"></script>
```


Documentation
-------------

To use it, add attribute <b>simple-date-pick</b> to any tag. If your tag is an input ngModel can be used to store the picked date. Otherwise use attribute <b>sdp-date</b>. These attribute's values should be a property of your controller's scope, so that all changes are automatically processed on both ends (the directive and the controller).

```html
<input type="text" ng-model="anydate" simple-date-pick />

<div simple-date-pick sdp-date="mydate" sdp-min="smallestdate" sdp-max="largestdate">{{ mydate }}</div>
```

<h4>Other Attributes:</h4>

<b>sdp-min & sdp-max</b>
These should also be a property of your controller, so that these dates can change and be perceived by the ngSimpleDatePick directive. You can use them both or separately meaning dates after or before a given date.

<b>format</b>
This is a normal string attribute to set the date's format. Default is 'DD/MM/YYYY'.

<b>on-date-selected</b>
Takes a function that will be called after a date is selected. The selected date will be passed to this function as a parameter.

```html
<input type="text" ng-model="anydate" simple-date-pick sdp-on-date-selected="selDate" />
```
Then on your controller:

```javascript
$scope.selDate = function(selectedDate) {

	// Do whatever with the date
}
```


Licence
-------

Released under the MIT license:

The MIT License (MIT)

Copyright (c) 2014 Walter Staeblein

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
