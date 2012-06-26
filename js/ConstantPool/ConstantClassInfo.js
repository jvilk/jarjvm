define(['Util', 'Enum'],
  function(Util, Enum) {
    /* Represents a constant_pool_class_info.
     * parameters:
     *  nameIndex - The index into the constant pool that represents the class
     */
    function ConstantClassInfo(nameIndex) {
      this.nameIndex = nameIndex;
    }

    ConstantClassInfo.prototype.getTag = function() {
      return Enum.constantPoolTag.CLASS;
    };

    //Resolve all references to other constant pool objects.
    ConstantClassInfo.prototype.resolveReferences = function(constantPool) {
      this.name = constantPool.getUTF8Info(this.nameIndex);
    };

    ConstantClassInfo.prototype.toString = function() {
      return "class " + this.name;
    };

    return ConstantClassInfo;
  }
);