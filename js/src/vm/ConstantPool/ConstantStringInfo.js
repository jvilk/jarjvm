define(['util/Util', 'vm/Enum'],
  function(Util, Enum) {
    //Used for Strings
    function ConstantStringInfo(stringIndex) {
      this.stringIndex = stringIndex;
    }

    //Resolve all references to other constant pool objects.
    ConstantStringInfo.prototype.resolveReferences = function(constantPool) {
      this.string = constantPool.getUTF8Info(this.stringIndex);
    };
    
    ConstantStringInfo.prototype.toString = function() {
      return "string " + this.string;
    };

    ConstantStringInfo.prototype.getTag = function() {
      return Enum.constantPoolTag.STRING;
    };

    return ConstantStringInfo;
  }
);