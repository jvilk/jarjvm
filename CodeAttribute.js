define(['Util', 'ByteCode'],
  function(Util, ByteCode) {
    function CodeAttribute(attributeName, maxStack, maxLocals, code, exceptionTable, attributeInfo) {
      this.attributeName = attributeName;
      this.maxStack = maxStack;
      this.maxLocals = maxLocals;
      this.code = code;
      this.exceptionTable = exceptionTable;
      this.attributeInfo = attributeInfo;
    }

    /**
     * Executes the code, starting from the value of PC.
     */
    CodeAttribute.prototype.execute = function() {
      //Execution will be interrupted by an exception.
      //If it is not, then the method didn't end with a return instruction,
      //which is illegal anyway!
      var currentInst;
      
      //Since we're resuming the method, the context switch is over.
      JVM.getExecutingThread().setContextSwitch(false);
      
      while (!JVM.getExecutingThread().isContextSwitch()) {
        currentInst = this.code[JVM.getExecutingThread().getPC()];
        JVM.debugPrint("Bytecode Opcode: " + ByteCode.strings[currentInst.opcode]);
        JVM.getExecutingThread().incrementPC(currentInst.length);
        currentInst.execute();
      }
    };
    
    /**
     * Find a catch statement for the input exception using the current value of the
     * program counter.
     *
     * Manipulates the stack to the correct configuration to resume execution.
     */
    CodeAttribute.prototype.exception = function(exception) {
      for (var anException in this.exceptionTable)
      {
        var exceptionEntry = this.exceptionTable[anException];
        //Check if exception is in range
        //Range is [startPC, endPC)
        var pc = JVM.getExecutingThread().getPC();
        if (pc >= exceptionEntry.startPC && pc < exceptionEntry.endPC)
        {
          var className = exceptionEntry.catchType;
          //className is undefined if it's a finally block [which means it matches everything]
          //Otherwise, we need to check if the exception type is a subclass or an instance of the
          //class type that this block matches.
          if (className === undefined || exception.classInfo.isA(className))
          {
            //We're done. Create the needed MethodRun object.
            MethodRun.createResume(exceptionEntry.handlerPC);
            return;
          }
        }
      }
      
      //Pop off our frame. There's nothing that can be done.
      JVM.getExecutingThread().popFrame();
      
      //Rethrow the exception.
      MethodRun.throwException(exception);
    };
    
    /**
     * Returns a string representation for printing. errorPC is an option
     * argument -- if specified, the output prints an arrow pointing to the
     * line of code that caused an error.
     */
    CodeAttribute.prototype.toString = function(errorPC) {
      if (errorPC === undefined) errorPC = -1;

      var i;
      var output = [];

      for (i = 0; i < this.codeLength; ) {
        output.push(this.code[i].toString(i === errorPC), "\n");
        i += this.code[i].length;
      }

      return output.join("");
    };

    return CodeAttribute;
  }
);