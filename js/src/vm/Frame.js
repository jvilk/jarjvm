define(['util/Util', 'vm/Enum'],
  function(Util, Enum) {
    "use strict";
    
    /*
     * Frame implementation:
     *      push = push item into stack
     *      pop = pop item from stack
     *      peek = returns the top of stack
     *      slength = return the length of stack
     */
    function Frame(methodInfo)
    {
      this.stack = [];
      this.locals = [];
      this.constantPool = methodInfo.classInfo.constantPool;
      this.methodInfo = methodInfo;
    }

    Frame.prototype.push = function(x){
      if (x !== null && x !== undefined)
      {
        Util.pushElement(x.toString());
        if (x.dataType === Enum.dataType.DOUBLE || x.dataType === Enum.dataType.LONG)
        {
          Util.pushElement(x.toString());
        }
      }
      else if (x === undefined)
        Util.assert(false);
      else
        Util.pushElement("[null]");
        
      
      this.stack.push(x);
      //JavaScript null = Java null. We don't want to check properties on a null value.
      if (x !== null && x !== undefined && (x.dataType === Enum.dataType.DOUBLE || x.dataType === Enum.dataType.LONG))
      {
        this.stack.push(x);
      }
    };

    Frame.prototype.pop = function() {
      Util.assert(!this.isEmpty());
      Util.popElement();
      return this.stack.pop();
    };

    Frame.prototype.peek = function() {
      return this.stack[this.stack.length-1];
    };

    Frame.prototype.length = function() {
      return this.stack.length;
    };

    Frame.prototype.isEmpty = function() {
      return this.length() === 0;
    };

    Frame.prototype.setLocal = function(index, value) {
      this.locals[index] = value;
      //JavaScript null = Java null. We don't want to check properties on a null value.
      if (value !== null && value !== undefined && (value.dataType === Enum.dataType.DOUBLE || value.dataType === Enum.dataType.LONG)) {
        this.locals[index+1] = value;
      }
    };

    Frame.prototype.getLocal = function(index) {
      return this.locals[index];
    };

    Frame.prototype.getMethod = function() {
      return this.methodInfo;
    };

    Frame.prototype.getLocalsLength = function() {
      return this.locals.length;
    };

    return Frame;
  }
);