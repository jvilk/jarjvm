/**
 * FieldInfo object
 */

function FieldInfo(javaClassReader, classInfo) {
    /**
     * INITIALIZATION
     */
    this.classInfo = classInfo;
    this.accessFlags = javaClassReader.getUintField(2);
    this.nameIndex = javaClassReader.getUintField(2);
    this.name = CONSTANTPOOL.getUTF8Info(this.nameIndex);
    this.descriptorIndex = javaClassReader.getUintField(2);
    this.descriptor = CONSTANTPOOL.getUTF8Info(this.descriptorIndex);
    this.attributesCount = javaClassReader.getUintField(2);
    this.fieldDescriptor = parseFieldDescriptor(this.descriptor);
    this.attributes = makeAttributes(javaClassReader, this.attributesCount);
    
    //Stores either the current value of a static field, or the default value of
    //a static final / regular field.
    this.value = undefined;
    
    //A field is constant if it is static, final, AND has a ConstantValue attribute.
    this.isConstant = false;
    this.constantValueAttribute = undefined;
    
    //Check if the attribute is constant.
    for (var i=0; i < this.attributes.length; i++)
    {
        if (this.attributes[i].attributeName == "ConstantValue")
        {
            this.constantValueAttribute = this.attributes[i].constantValue;
            this.isConstant = this.hasFlag(FieldInfo.AccessFlags.STATIC & FieldInfo.AccessFlags.FINAL);
            break;
        }
    }
    
    //Populated during deprecation check.
    this.deprecated = undefined;
    this.deprecationWarned = false;
}

/**
 * Returns the value stored in this field. Only use this for static fields!
 */
FieldInfo.prototype.getValue = function() {
    assert(this.value !== undefined);
    assert(this.hasFlag(FieldInfo.AccessFlags.STATIC));
    
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
    assert(this.hasFlag(FieldInfo.AccessFlags.STATIC));
    assert(!this.isConstant);
    this.value = value;
};

/**
 * Use this to get the default value of an instance variable
 * during object instantiation.
 * DO NOT USE THIS ON STATIC FIELDS.
 */
FieldInfo.prototype.getDefaultValue = function() {
    assert(!this.hasFlag(FieldInfo.AccessFlags.STATIC));
    assert(this.value !== undefined);
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
                this.value = new Byte(0);
                break;
            case FieldDescriptor.baseType.CHAR:
                this.value = new Char(0);
                break;
            case FieldDescriptor.baseType.DOUBLE:
                this.value = new Double(0);
                break;
            case FieldDescriptor.baseType.FLOAT:
                this.value = new Float(0);
                break;
            case FieldDescriptor.baseType.INTEGER:
                this.value = new Integer(0);
                break;
            case FieldDescriptor.baseType.LONG:
                this.value = Long.fromNumber(0);
                break;
            case FieldDescriptor.baseType.SHORT:
                this.value = new Short(0);
                break;
            case FieldDescriptor.baseType.BOOLEAN:
                this.value = new Bool(0);
                break;
            default:
                assert(false);
                break;
        }
    }
    else {
        this.value = null;
    }

    if (this.constantValueAttribute !== undefined)
    {
        var constVal = this.constantValueAttribute;
        if (constVal.tag == ConstantPoolInfo.tags.STRING)
        {
            //JVM.debugPrint("Initializing string field...");
            this.value = getJavaString(constVal.string);
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
}