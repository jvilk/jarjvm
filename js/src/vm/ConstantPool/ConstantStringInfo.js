define(['util/Util', 'vm/Enum'],
  function(Util, Enum) {
    "use strict";
    
    //Used for Strings
    function ConstantStringInfo(stringIndex) {
      this.stringIndex = stringIndex;
    }

    //Resolve all references to other constant pool objects.
    ConstantStringInfo.prototype.resolveReferences = function(constantPool) {
      this._string = constantPool.getUTF8Info(this.stringIndex);
    };
    
    ConstantStringInfo.prototype.getTag = function() {
      return Enum.constantPoolTag.STRING;
    };

    ConstantStringInfo.prototype.getString = function() {
      return this._string;
    };

    ConstantStringInfo.prototype.toString = function() {
      return "string " + this.getString();
    };

    return ConstantStringInfo;
  }
);