 define(
  function() {
    "use strict";
    
    function LineNumberTableEntry(startPC, lineNumber) {
      this.startPC = startPC;
      this.lineNumber = lineNumber;
    }

    return LineNumberTableEntry;
  }
);