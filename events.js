/*
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *                     Version 2, December 2004
 * 
 *  Copyright (C) 2012, 2013, 2014 Taye Adeyemi <dev@taye.me>
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

        elements          = [],
        targets           = [],
        attachedListeners = [];

    function add (element, type, listener, useCapture) {
        var elementIndex = indexOf(elements, element),
            target = targets[elementIndex];

        if (!target) {
            target = {
                events: {},
                typeCount: 0
            };

            elementIndex = elements.push(element) - 1;
            targets.push(target);

            attachedListeners.push((useAttachEvent ? {
                    supplied: [],
                    wrapped : [],
                    useCount: []
                } : null));
        }

        if (!target.events[type]) {
            target.events[type] = [];
            target.typeCount++;
        }

        if (indexOf(target.events[type], listener) === -1) {
            var ret;

            if (useAttachEvent) {
                var listeners = attachedListeners[elementIndex],
                    listenerIndex = indexOf(listeners.supplied, listener);

                var wrapped = listeners.wrapped[listenerIndex] || function (event) {
                    if (!event.immediatePropagationStopped) {
                        event.target = event.srcElement;
                        event.currentTarget = element;

                        event.preventDefault = event.preventDefault || preventDef;
                        event.stopPropagation = event.stopPropagation || stopProp;
                        event.stopImmediatePropagation = event.stopImmediatePropagation || stopImmProp;

                        if (/mouse|click/.test(event.type)) {
                            event.pageX = event.clientX + document.documentElement.scrollLeft;
                            event.pageY = event.clientY + document.documentElement.scrollTop;
                        }

                        listener(event);
                    }
                };

                ret = element[addEvent](on + type, wrapped, Boolean(useCapture));

                if (listenerIndex === -1) {
                    listeners.supplied.push(listener);
                    listeners.wrapped.push(wrapped);
                    listeners.useCount.push(1);
                }
                else {
                    listeners.useCount[listenerIndex]++;
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
            elementIndex = indexOf(elements, element),
            target = targets[elementIndex],
            listeners,
            listenerIndex,
            wrapped = listener;

        if (!target || !target.events) {
            return;
        }

        if (useAttachEvent) {
            listeners = attachedListeners[elementIndex];
            listenerIndex = indexOf(listeners.supplied, listener);
            wrapped = listeners.wrapped[listenerIndex];
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
                    remove(element, type, target.events[type][i], Boolean(useCapture));
                }
            } else {
                for (i = 0; i < len; i++) {
                    if (target.events[type][i] === listener) {
                        element[removeEvent](on + type, wrapped, useCapture || false);
                        target.events[type].splice(i, 1);

                        if (useAttachEvent && listeners) {
                            listeners.useCount[listenerIndex]--;
                            if (listeners.useCount[listenerIndex] === 0) {
                                listeners.supplied.splice(listenerIndex, 1);
                                listeners.wrapped.splice(listenerIndex, 1);
                                listeners.useCount.splice(listenerIndex, 1);
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
            targets.splice(elementIndex);
            elements.splice(elementIndex);
            attachedListeners.splice(elementIndex);
        }
    }

    function indexOf (array, target) {
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i] === target) {
                return i;
            }
        }

        return -1;
    }

    function preventDef () {
        this.returnValue = false;
    }

    function stopProp () {
        this.cancelBubble = true;
    }

    function stopImmProp () {
        this.cancelBubble = true;
        this.immediatePropagationStopped = true;
    }


    return {
        add: add,
        remove: remove,
        useAttachEvent: useAttachEvent
    };
}());
