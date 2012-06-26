define(['Util'],
  function(Util) {
    function ExceptionTableEntry(startPC, endPC, handlerPC, catchType) {
      this.startPC = startPC;
      this.endPC = endPC;
      this.handlerPC = handlerPC;
      this.catchType = catchType;
    }

    return ExceptionTableEntry;
  }
);