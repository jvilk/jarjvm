define(['util/Util', 'vm/Enum'],
  function(Util, Enum) {
    function ConstantNameAndTypeInfo(nameIndex, descriptorIndex) {
      this.nameIndex = nameIndex;
      this.descriptorIndex = descriptorIndex;
    }

    //Resolve all references to other constant pool objects.
    ConstantNameAndTypeInfo.prototype.resolveReferences = function(constantPool) {
      this._name = constantPool.getUTF8Info(this.nameIndex);
      
      //Name must be either <init>, OR a field / method.
      //

      this._descriptor = constantPool.getUTF8Info(this.descriptorIndex);
    };
    
    ConstantNameAndTypeInfo.prototype.getName = function() {
      return this._name;
    };

    ConstantNameAndTypeInfo.prototype.getDescriptor = function() {
      return this._descriptor;
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