/**
 * Represents the CONSTANT_MethodType_info struct from
 * §4.4.9 of the JVM7 Spec.
 */
define(['util/Util', 'vm/Enum', 'vm/MethodDescriptor'],
  function(Util, Enum, MethodDescriptor) {
    function ConstantMethodTypeInfo(descriptorIndex) {
      this._descriptorIndex = descriptorIndex;
    }

    ConstantMethodTypeInfo.prototype.resolveReferences = function(constantPool) {
      this._descriptor = new MethodDescriptor(constantPool.getUTF8Info(this._descriptorIndex));
    };

    ConstantMethodTypeInfo.prototype.getDescriptor = function() {
      return this._descriptor;
    };

    ConstantMethodTypeInfo.prototype.getTag = function() {
      return Enum.constantPoolTag.METHODTYPE;
    };

    return ConstantMethodTypeInfo;
  }
);