/*
 *          DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
 *                  Version 2, December 2004 
 *
 *          DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION 
 *
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 */

var events = (function () {
    'use strict';

    var addEvent = ('addEventListener' in document)?
            'addEventListener': 'attachEvent',
        removeEvent = ('removeEventListener' in document)?
            'removeEventListener': 'detachEvent',
        
        elements = [],
        targets  = [];

    if (!('indexOf' in Array.prototype)) {
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
                events: {},
                typeCount: 0
            };

            elements.push(element);
            targets.push(target);
        }
        if (!target.events[type]) {
            target.events[type] = [];
            target.typeCount++;
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
            var len = target.events[type].length;

            if (listener === 'all') {
                for (i = 0; i < len; i++) {
                    element[removeEvent](type, target.events[type][i], useCapture || false);
                }
                target.events[type] = null;
                target.typeCount--;
            } else {
                for (i = 0; i < len; i++) {
                    if (target.events[type][i] === listener) {

                        element[removeEvent](type, target.events[type][i], useCapture || false);
                        target.events[type].splice(i, 1);

                        break;
                    }
                }
            }
            if (target.events[type] && target.events[type].length === 0) {
                target.events[type] = null;
                target.typeCount--;
            }
        }

        if (!target.typeCount) {
            targets.splice(targets.indexOf(target), 1);
            elements.splice(elements.indexOf(element), 1);
        }
    }

    return {
        add: add,
        remove: remove
    };
}());
