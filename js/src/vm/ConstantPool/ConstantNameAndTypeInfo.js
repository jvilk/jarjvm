/**
 * Represents a CONSTANT_NameAndType_info (§4.4.6)
 */
define(['util/Util', 'vm/Enum'],
  function(Util, Enum) {
    function ConstantNameAndTypeInfo(nameIndex, descriptorIndex) {
      this.nameIndex = nameIndex;
      this.descriptorIndex = descriptorIndex;
    }

    //Resolve all references to other constant pool objects.
    ConstantNameAndTypeInfo.prototype.resolveReferences = function(constantPool) {
      this._name = constantPool.getUTF8Info(this.nameIndex);
      this._descriptor = constantPool.getUTF8Info(this.descriptorIndex);

      /**
       * From JVM7 Spec §4.4.6:
       * "The value of the  name_index item must be a valid index into the
       *  constant_pool table. The  constant_pool entry at that index must be a
       *  CONSTANT_Utf8_info (§4.4.7) structure representing either the special method
       *  name <init> (§2.9) or a valid unqualified name (§4.2.2) denoting a field or
       *  method"
       * I take this to mean that <clinit> is not appropriate.
       */
      Util.checkIsValidUnqualifiedName(this._name);
      Util.assert(this._name !== "<clinit>");
    };

    ConstantNameAndTypeInfo.prototype.getName = function() {
      return this._name;
    };

    // TODO(jvilk): Change to getDescriptorString, since this is
    //              not an object. Or maybe make it an object;
    //              we can detect if it's Method or Field.
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