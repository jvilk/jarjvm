define(
  function() {
    function LocalVariableTableEntry(startPC, name, descriptor) {
      this.startPC = startPC;
      this.name = name;
      this.descriptor = descriptor;
    }

    return LocalVariableTableEntry;
  }
);