/*
 *          DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
 *                  Version 2, December 2004 
 *
 *          DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION 
 *
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 */

events = (function () {
    'use strict';

    var addEvent = ('addEventListener' in document)?
            'addEventListener': 'attachEvent',
        removeEvent = ('removeEventListener' in document)?
            'removeEventListener': 'detachEvent',
        
        elements = [],
        targets = [];

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(elt /*, from*/)   {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)?
            Math.ceil(from):
            Math.floor(from);

        if (from < 0) {
            from += len;
        }

        for (; from < len; from++) {
            if (from in this && this[from] === elt) {
                return from;
            }
        }

        return -1;
        };
    }

    function add (element, type, listener, useCapture) {
        if (!(element instanceof window.Element) && element !== window.document) {
            return;
        }

        var target = targets[elements.indexOf(element)];

        if (!target) {
            target = {
                events: {}
            };
            target.events[type] = [];
            elements.push(element);
            targets.push(target);
        }
        if (!target.events[type]) {
            target.events[type] = [];
        }

        if (target.events[type].indexOf(listener) === -1) {
            target.events[type].push(listener);

            return element[addEvent](type, listener, useCapture || false);
        }
    }

    function remove (element, type, listener, useCapture) {
        var i,
        target = targets[elements.indexOf(element)];

        if (!target || !target.events) {
            return;
        }

        if (type === 'all') {
            for (type in target.events) {
                if (target.events.hasOwnProperty(type)) {
                    remove(element, type, 'all');
                }
            }
            return;
        }

        if (target.events[type]) {

            if (listener === 'all') {
                for (i = 0; i < target.events[type].length; i++) {
                    element[removeEvent](type, target.events[type][i], useCapture || false);
                }
                target.events[type] = [];
            } else {
                for (i = 0; i < target.events[type].length; i++) {
                    if (target.events[type][i] === listener) {
                        element[removeEvent](type, target.events[type][i], useCapture || false);

                        target.events[type].splice(i, 1);
                        break;
                    }
                }
            }
        }
    }

    return {
        add: add,
        remove: remove
    };
}());
