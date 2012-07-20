define(['util/Util', 'vm/Enum', 'vm/MethodDescriptor'],
  function(Util, Enum, MethodDescriptor) {
    function ConstantInvokeDynamicInfo(bootstrapMethodAttrIndex, natIndex) {
      this._bootstrapMethodAttrIndex = bootstrapMethodAttrIndex;
      this._natIndex = natIndex;
    }

    ConstantInvokeDynamicInfo.prototype.resolveReferences = function(constantPool) {
      this.nameAndType = constantPool.get(this._natIndex);
      this._descriptor = new MethodDescriptor(this.nameAndType.getDescriptor());
    };

    ConstantInvokeDynamicInfo.prototype.getTag = function() {
      return Enum.constantPoolTag.INVOKEDYNAMIC;
    };

    return ConstantInvokeDynamicInfo;
  }
);