/*
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *                     Version 2, December 2004
 * 
 *  Copyright (C) 2012, 2013 Taye Adeyemi
 * 
 *  Everyone is permitted to copy and distribute verbatim or modified
 *  copies of this license document, and changing it is allowed as long
 *  as the name is changed.
 * 
 *             DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *    TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
 * 
 *   0. You just DO WHAT THE FUCK YOU WANT TO.
 */

var events = (function () {
    'use strict';

    var useAttachEvent = 'attachEvent' in window && !('addEventListener' in window),
        addEvent = !useAttachEvent?  'addEventListener': 'attachEvent',
        removeEvent = !useAttachEvent?  'removeEventListener': 'detachEvent',
        on = useAttachEvent? 'on': '',
        
        elements = [],
        targets  = [],

        attachedListeners = {
            supplied: [],
            wrapped:  [],
            useCount: []
        };

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
    if (!('stopPropagation' in Event.prototype)) {
        Event.prototype.stopPropagation = function () {
            this.cancelBubble = true;
        };
        Event.prototype.stopImmediatePropagation = function () {
            this.cancelBubble = true;
            this.immediatePropagationStopped = true;
        }
    }
    if (!('preventDefault' in Event.prototype)) {
        Event.prototype.preventDefault = function () {
            this.returnValue = false;
        };
    }
    if (!('hasOwnProperty' in Event.prototype)) {
        Event.prototype.hasOwnProperty = Object.prototype.hasOwnProperty;
    }

    function add (element, type, listener, useCapture) {
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
            var ret;

            if (useAttachEvent) {
                var index = attachedListeners.supplied.indexOf(listener),

                    wrapped = attachedListeners.wrapped[index] || function (event) {
                        if (!event.immediatePropagationStopped) {
                            event.target = event.srcElement;
                            event.currentTarget = element;

                            if (/mouse|click/.test(event.type)) {
                                event.pageX = event.clientX + document.documentElement.scrollLeft;
                                event.pageY = event.clientY + document.documentElement.scrollTop;
                            }

                            listener(event);
                        }
                    };

                ret = element[addEvent](on + type, wrapped, Boolean(useCapture));

                if (index === -1) {
                    attachedListeners.supplied.push(listener);
                    attachedListeners.wrapped.push(wrapped);
                    attachedListeners.useCount.push(1);
                }
                else {
                    attachedListeners.useCount[index]++;
                }
            }
            else {
                ret = element[addEvent](type, listener, useCapture || false);
            }
            target.events[type].push(listener);

            return ret;
        }
    }

    function remove (element, type, listener, useCapture) {
        var i,
            target = targets[elements.indexOf(element)],
            index = attachedListeners.supplied.indexOf(listener),
            wrapped = attachedListeners.wrapped[index] || listener;

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
                    remove(element, type, target.events[type][i], useCapture);
                }
            } else {
                for (i = 0; i < len; i++) {
                    if (target.events[type][i] === listener) {
                        element[removeEvent](on + type, wrapped, useCapture || false);
                        target.events[type].splice(i, 1);

                        if (index !== -1) {
                            attachedListeners.useCount[index]--;
                            if (attachedListeners.useCount[index] === 0) {
                                attachedListeners.supplied.splice(index, 1);
                                attachedListeners.wrapped.splice(index, 1);
                                attachedListeners.useCount.splice(index, 1);
                            }
                        }

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
        remove: remove,
        useAttachEvent: useAttachEvent
    };
}());
