define(['Util'],
  function(Util) {
    //Used for LONGS and DOUBLES
    function ConstantBigNumberInfo(refType, value) {
      this.tag = refType;
      this.value = value;
    }

    ConstantBigNumberInfo.prototype.toString = function() {
      var output = "";
      switch(this.tag)
      {
        case Enum.constantPoolTag.LONG:
          output += "long ";
          break;
        case Enum.constantPoolTag.DOUBLE:
          output += "double ";
          break;
        default:
          output += "unknownbignumber ";
          break;
      }
      
      return output + this.value;
    };

    ConstantBigNumberInfo.prototype.getTag = function() {
      return this.tag;
    };

    /**
     * Required by all constant pool items
     */
    ConstantBigNumberInfo.prototype.resolveReferences = function() {};

    return ConstantBigNumberInfo;
  }
);