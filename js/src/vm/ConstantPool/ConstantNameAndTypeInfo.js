define(['util/Util', 'vm/Enum'],
  function(Util, Enum) {
    function ConstantNameAndTypeInfo(nameIndex, descriptorIndex) {
      this.nameIndex = nameIndex;
      this.descriptorIndex = descriptorIndex;
    }

    //Resolve all references to other constant pool objects.
    ConstantNameAndTypeInfo.prototype.resolveReferences = function(constantPool) {
      this.name = constantPool.getUTF8Info(this.nameIndex);
      
      this.descriptor = constantPool.getUTF8Info(this.descriptorIndex);
    };
    
    ConstantNameAndTypeInfo.prototype.toString = function() {
      return "NameAndTypeInfo" + this.name + " " + this.descriptor;
    };

    ConstantNameAndTypeInfo.prototype.getTag = function() {
      return Enum.constantPoolTag.NAMEANDTYPE;
    };

    return ConstantNameAndTypeInfo;
  }
);