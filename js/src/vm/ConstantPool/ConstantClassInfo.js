define(['util/Util', 'vm/Enum'],
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

    ConstantClassInfo.prototype.getName = function() {
      return this._name;
    };

    //Resolve all references to other constant pool objects.
    ConstantClassInfo.prototype.resolveReferences = function(constantPool) {
      this._name = constantPool.getUTF8Info(this.nameIndex);

      Util.checkIsValidClassOrInterfaceName(this._name);
    };

    ConstantClassInfo.prototype.toString = function() {
      return "class " + this.getName();
    };

    return ConstantClassInfo;
  }
);