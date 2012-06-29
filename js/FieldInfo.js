define(['Primitives', 'Util', 'FieldDescriptor', 'Enum'],
  function(Primitives, Util, FieldDescriptor, Enum) {
    /**
     * FieldInfo object
     */

    function FieldInfo(classInfo, accessFlags, name, descriptor, attributesCount, fieldDescriptor, attributes) {
      this.classInfo = classInfo;
      this.accessFlags = accessFlags;
      this.name = name;
      this.descriptor = descriptor;
      this.attributesCount = attributesCount;
      this.fieldDescriptor = fieldDescriptor;
      this.attributes = attributes;

      //Stores either the current value of a static field, or the default value of
      //a static final / regular field.
      this.value = undefined;
      
      //A field is constant if it is static, final, AND has a ConstantValue attribute.
      this.isConstant = false;
      this.constantValueAttribute = undefined;

      //Populated during deprecation check.
      this.deprecated = undefined;
      this.deprecationWarned = false;

      //Check if the attribute is constant.
      for (var i=0; i < attributes.length; i++)
      {
        if (attributes[i].attributeName == "ConstantValue")
        {
          constantValueAttribute = this.attributes[i].constantValue;
          isConstant = this.hasFlag(FieldInfo.AccessFlags.STATIC & FieldInfo.AccessFlags.FINAL);
          break;
        }
      }

      this._initializeDefaultValue();
    }

    /**
     * Returns the value stored in this field. Only use this for static fields!
     */
    FieldInfo.prototype.getValue = function() {
      Util.assert(this.value !== undefined);
      Util.assert(this.hasFlag(FieldInfo.AccessFlags.STATIC));
      
      //Run the class initializer if this is a nonconstant field.
      //Constant fields are final, static, and are initialized with a compile-time constant
      //expression.
      if (!this.isConstant)
      {
        this.classInfo.initialize();
      }
      
      //Warn if using a deprecated field.
      if (!this.deprecationWarned && this.isDeprecated())
      {
        this.deprecationWarned = true;
      }
      
      return this.value;
    };

    /**
     * Alter the value of a static variable.
     */
    FieldInfo.prototype.setValue = function(value) {
      Util.assert(this.hasFlag(FieldInfo.AccessFlags.STATIC));
      Util.assert(!this.isConstant);
      this.value = value;
    };

    /**
     * Use this to get the default value of an instance variable
     * during object instantiation.
     * DO NOT USE THIS ON STATIC FIELDS.
     */
    FieldInfo.prototype.getDefaultValue = function() {
      Util.assert(!this.hasFlag(FieldInfo.AccessFlags.STATIC));
      Util.assert(this.value !== undefined);
      return this.value;
    };

    /**
     * Only called internally. Initializes the default value of the
     * attribute.
     */
    FieldInfo.prototype._initializeDefaultValue = function() {
      if (this.fieldDescriptor.type === FieldDescriptor.type.BASE)
      {
        switch(this.fieldDescriptor.baseValue)
        {
          case FieldDescriptor.baseType.BYTE:
            this.value = Primitives.getByte(0);
            break;
          case FieldDescriptor.baseType.CHAR:
            this.value = Primitives.getChar(0);
            break;
          case FieldDescriptor.baseType.DOUBLE:
            this.value = Primitives.getDouble(0);
            break;
          case FieldDescriptor.baseType.FLOAT:
            this.value = Primitives.getFloat(0);
            break;
          case FieldDescriptor.baseType.INTEGER:
            this.value = Primitives.getInteger(0);
            break;
          case FieldDescriptor.baseType.LONG:
            this.value = Primitives.getLongFromNumber(0);
            break;
          case FieldDescriptor.baseType.SHORT:
            this.value = Primitives.getShort(0);
            break;
          case FieldDescriptor.baseType.BOOLEAN:
            this.value = Primitives.getBool(0);
            break;
          default:
            Util.assert(false);
            break;
        }
      }
      else {
        this.value = null;
      }

      if (this.constantValueAttribute !== undefined)
      {
        var constVal = this.constantValueAttribute;
        if (constVal.getTag() == Enum.constantPoolTag.STRING)
        {
          this.value = Util.getJavaString(constVal.string);
        }
        else
        {
          this.value = constVal.value;
        }
      }
    };

    /**
     * Checks if the field has a specific access flag.
     */
    FieldInfo.prototype.hasFlag = function(mask) {
      return (this.accessFlags & mask) == mask;
    };

    /**
     * Prints the field to the console.
     */
    FieldInfo.prototype.toString = function() {
      var output = [];
      output.push("\t");
      
      //Access information
      for (var x in FieldInfo.AccessFlags)
      {
        if (this.hasFlag(FieldInfo.AccessFlags[x]))
          output.push(FieldInfo.AccessFlagStrings[x], " ");
      }
      
      //Name + descriptor
      output.push(this.name, " ", this.descriptor, " ");
      
      
      //output.push("Attributes:\n");
      //Attributes??
      //for (var i = 0; i < this.attributesCount; i++)
      //{
      //  output.push(this.attributes[i].toString(), "\n");
      //}

      return output.join("");
    };

    /**
     * Returns true if the field is deprecated.
     */
    FieldInfo.prototype.isDeprecated = function() {
      if (this.deprecated !== undefined)
        return this.deprecated;
        
      for (var attribute in this.attributes)
      {
        if (this.attributes[attribute].attributeName == "Deprecated")
        {
          this.deprecated = true;
          return true;
        }
      }
      this.deprecated = false;
      return false;
    };

    FieldInfo.AccessFlagStrings = {
      PUBLIC : "public",
      PRIVATE : "private",
      PROTECTED : "protected",
      STATIC : "static",
      FINAL : "final",
      VOLATILE : "volatile",
      TRANSIENT : "transient"
    };

    FieldInfo.AccessFlags = {
      PUBLIC : 0x0001,
      PRIVATE : 0x0002,
      PROTECTED : 0x0004,
      STATIC : 0x0008,
      FINAL : 0x0010,
      VOLATILE : 0x0040,
      TRANSIENT : 0x0080
    };

    return FieldInfo;
  }
);