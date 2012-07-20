/**
 * Defines the CONSTANT_MethodHandle_info struct defined in the JVM7 Spec §4.4.8.
 */
define(['util/Util', 'vm/Enum'],
  function(Util, Enum) {
    function ConstantMethodHandleInfo(referenceKind, referenceIndex) {
      this._referenceKind = referenceKind;
      this._referenceIndex = referenceIndex;
      /**
       * From JVM7 Spec §4.4.8:
       * "The value of the reference_kind item must be in the range 1 to 9."
       */
      Util.assert(referenceKind <= 9);

      /**
       * Due to type requirements below, referenceIndex cannot point to
       * the reserved 0th index of the constant pool.
       */
      Util.assert(referenceIndex !== 0);
    }

    ConstantMethodHandleInfo.prototype.getReferenceKind = function() {
      return this._referenceKind;
    };

    ConstantMethodHandleInfo.prototype.getReference = function() {
      return this._reference;
    };

    ConstantMethodHandleInfo.prototype.resolveReferences = function(constantPool) {
      var referenceKind = this.getReferenceKind(),
          referenceTag, methodName, reference;
      reference = constantPool.get(this._referenceIndex);
      referenceTag = reference.getTag();

      this._reference = reference;

      /**
       * From JVM7 Spec §4.4.8:
       * "If the value of the reference_kind item is 1 (REF_getField), 2
       *  (REF_getStatic), 3 (REF_putField), or 4 (REF_putStatic), then the
       *  constant_pool entry at that index must be a CONSTANT_Fieldref_info
       *  (§4.4.2) structure representing a field for which a method handle is to be
       *  created."
       */
      if (referenceKind <= Enum.referenceKind.PUTSTATIC) {
        Util.assert(referenceTag === Enum.constantPoolTag.FIELDREF);
      }
      /**
       * From JVM7 Spec §4.4.8:
       * "If the value of the reference_kind item is 5
       *  (REF_invokeVirtual), 6 (REF_invokeStatic), 7 (REF_invokeSpecial), or 8
       *  (REF_newInvokeSpecial), then the constant_pool entry at that index must be
       *  a CONSTANT_Methodref_info (§4.4.2) structure representing a class's method
       *  or constructor (§2.9) for which a method handle is to be created."
       */
      else if (referenceKind <= Enum.referenceKind.NEWINVOKESPECIAL) {
        Util.assert(referenceTag === Enum.constantPoolTag.METHODREF);
      }
      /**
       * From JVM7 Spec §4.4.8:
       *  "If the value of the reference_kind item is 9 (REF_invokeInterface),
       *  then the constant_pool entry at that index must be a
       *  CONSTANT_InterfaceMethodref_info (§4.4.2) structure representing an
       *  interface's method for which a method handle is to be created."
       */
      else {
        Util.assert(referenceTag === Enum.constantPoolTag.INTERFACEMETHODREF);
      }

      /**
       * From JVM7 Spec §4.4.8:
       *  "If the value of the reference_kind item is 5 (REF_invokeVirtual), 6
       *  (REF_invokeStatic), 7 (REF_invokeSpecial), or 9 (REF_invokeInterface),
       *  the name of the method represented by a CONSTANT_Methodref_info structure
       *  must not be <init> or <clinit>.
       *  If the value is 8 (REF_newInvokeSpecial), the name of the method represented
       *  by a CONSTANT_Methodref_info structure must be <init>."
       */
      methodName = reference.getName();
      switch(referenceKind) {
        case Enum.referenceKind.INVOKEVIRTUAL:
        case Enum.referenceKind.INVOKESTATIC:
        case Enum.referenceKind.INVOKESPECIAL:
        case Enum.referenceKind.INVOKEINTERFACE:
          Util.assert(methodName !== "<init>" && methodName !== "<clinit>");
          break;
        case Enum.referenceKind.NEWINVOKESPECIAL:
          Util.assert(methodName === "<init>");
          break;
        default:
          break;
      }
    };

    ConstantMethodHandleInfo.prototype.getTag = function() {
      return Enum.constantPoolTag.METHODHANDLE;
    };

    return ConstantMethodHandleInfo;
  }
);