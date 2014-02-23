events.js
=========

Simple JavaScript events wrapper magiaclly suporting IE5+

```javascript
function print (event) {
    document.body.innerHTML = [
        event.type,
        event.pageX + ', ' + event.pageY, '<br>',
        event.target.nodeName,
        event.currentTarget.nodeName
    ].join(' ');
}

events.add(document, 'mousedown', function (event) {
    events.add(document, 'mousemove', print);
});

events.add(document, 'mouseup', function (event) {
    events.remove(document, 'mousemove', print);
});
```
The same code above works on Internet Explorer 5-8 just about as you'd expect.
 - `event.target === event.srcElement`
 - `event.currentTarget === myElement`
 - `event.page{X,Y} === event.client{X,Y} + document.documentElement.scroll{Left,Top}`
 - stopPropagation makes `event.cancelBubble = true`
 - stopImmediatePropagation does the same and makes `event.immediatePropagationStopped = true` and further listeners are not called
 - preventDefault makes `event.returnValue = false`
