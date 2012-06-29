define(['Util', 'Enum'],
  function(Util, Enum) {
    /* Represents a constant_pool_info for FieldRef, MethodRef, or InterfaceMethodRef.
     * parameters:
     *  refType - A tag from ConstantPoolInfo, which has to be either FIELDREF, METHODREF, INTERFACEMETHODREF
     *  nameIndex - The index into the constant pool that represents the class
     */
    function ConstantRefInfo(refType, classIndex, nameAndTypeIndex) {
      this.tag = refType;
      this.classIndex = classIndex;
      this.nameAndTypeIndex = nameAndTypeIndex;
      //Lazily resolve; do not access directly.
      this._class = undefined;
      this._ref = undefined;
    }

    //Resolve all references to other constant pool objects.
    ConstantRefInfo.prototype.resolveReferences = function(constantPool) {
      //Make sure the class has resolved its references first.
      constantPool.get(this.classIndex).resolveReferences(constantPool);
      //TODO: Never reach into an object like this.
      this.className = constantPool.getClassInfo(this.classIndex);
      this.nameAndType = constantPool.get(this.nameAndTypeIndex);
      Util.assert(this.nameAndType.getTag() === Enum.constantPoolTag.NAMEANDTYPE);
    };

    /**
     * Get the field/method/interface method object.
     */
    ConstantRefInfo.prototype.getRef = function() {
      if (this._ref !== undefined)
        return this._ref;
      
      var _class = this.getClass();
      var name = this.nameAndType.name;
      var descriptor = this.nameAndType.descriptor;
      
      switch(this.tag) {
        case Enum.constantPoolTag.FIELDREF:
          this._ref = _class.getField(name, descriptor);
          break;
        case Enum.constantPoolTag.METHODREF:
        case Enum.constantPoolTag.INTERFACEMETHODREF:
          //TODO: Verify that interfaces work in the same way!
          //e.g. I don't have to peer through the interfaces in getMethod.
          this._ref = _class.getMethod(name, descriptor);
          break;
        default:
          break;
      }
      
      return this._ref;
    };
    
    /**
     * Get the class object representing the class that this reference is from.
     */
    ConstantRefInfo.prototype.getClass = function() {
      if (this._class !== undefined)
        return this._class;
        
      //JVM.debugPrint("CPRef ClassIndex: " + this.classIndex);
      this._class = JVM.getClass(this.className);
      
      return this._class;
    };
    
    ConstantRefInfo.prototype.getTag = function() {
      return this.tag;
    };

    ConstantRefInfo.prototype.toString = function() {
      var output = [];
      
      switch(this.tag)
      {
        case Enum.constantPoolTag.FIELDREF:
          output.push("fieldref ");
          break;
        case Enum.constantPoolTag.METHODREF:
          output.push("methodref ");
          break;
        case Enum.constantPoolTag.INTERFACEMETHODREF:
          output.push("interfacemethodref ");
          break;
        default:
          output.push("unknownref ");
          break;
      }
      
      output.push(this.className, " ", this.nameAndType.name, " ", this.nameAndType.descriptor);
      return output.join("");
    };

    return ConstantRefInfo;
  }
);