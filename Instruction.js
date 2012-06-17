define(['ByteCode', 'require'],
  function(ByteCode, require) {
    /**
     * Contains all of the data on a single instruction, including its length, arguments,
     * and the function required to call it.
     */
    function Instruction(length, opcode) {
      this.opcode = opcode; //Kept for debugging purposes
      this.args = Array.prototype.slice.call(arguments);
      this.length = this.args.shift();
      this.fcn = require("ByteCode").instrs[this.args.shift()];
    }

    /**
     * Converts the instruction to a string representation for output. If
     * causedError is true, it draws an arrow next to the printout (helpful for
     * debugging).
     */
    Instruction.prototype.toString = function(causedError) {
      var printString = "\t" + require("ByteCode").strings[this.opcode];

      var numArgs = this.args.length;
      var i;

      for (i = 0; i < numArgs; i++) {
        printString += " " + this.args[i];
      }

      if (causedError === true) {
        printString += "<-- Caused Error";
      }

      return printString;
    };

    Instruction.prototype.execute = function() {
      this.fcn.apply(null, this.args);
    };

    return Instruction;
  }
);