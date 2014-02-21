events.js
=========

Simple JavaScript events wrapper magiaclly suporting IE5+

```javascript
events.add(myElement, 'click', function (e) { 
    console.log(event.target);
    console.log(event.currentTarget);
    console.log(event.pageX, event.pageY);
    event.stopPropagation();
    event.preventDefault();
});
```
The same code above works on Internet Explorer 5+ just about as you'd expect.
 - event.target === event.srcElement
 - event.currentTarget === myElement
 - event.page{X,Y} === event.client{X,Y} - document.documentElement.scroll{Left,Top}
 - stopPropagation makes `event.cancelBubble = true`
 - stopImmediatePropagation does the same and makes `event.immediatePropagationStopped = true` and further listeners are not called
 - preventDefault makes `event.returnValue = false`
