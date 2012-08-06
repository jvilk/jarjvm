define(['util/Util'],
  function(Util) {
    "use strict";
    
    function ExceptionTableEntry(startPC, endPC, handlerPC, catchType) {
      this.startPC = startPC;
      this.endPC = endPC;
      this.handlerPC = handlerPC;
      this.catchType = catchType;
    }

    return ExceptionTableEntry;
  }
);