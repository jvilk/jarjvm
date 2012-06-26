define(['Util', 'Enum'],
  function(Util, Enum) {
    //Used for INTEGER OR FLOATING REFERENCES
    function ConstantNumberInfo(refType, value) {
      this.tag = refType;
      this.value = value;
    }

    ConstantNumberInfo.prototype.toString = function() {
      var output = "";
      
      switch(this.tag)
      {
        case Enum.constantPoolTag.INTEGER:
          output += "int ";
          break;
        case Enum.constantPoolTag.FLOAT:
          output += "float ";
          break;
        default:
          output += "unknownnumber ";
          break;
      }
      
      return output + this.value;
    };

    ConstantNumberInfo.prototype.getTag = function() {
      return this.tag;
    };

    /**
     * Required by all constant pool items
     */
    ConstantNumberInfo.prototype.resolveReferences = function() {};

    return ConstantNumberInfo;
  }
);