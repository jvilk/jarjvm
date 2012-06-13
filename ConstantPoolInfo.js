/**
 * Object for the entire constant pool for a class.
 */
function ConstantPool(javaClassReader) {
    var i;

    //This global is used by the parsing process as a convenient location
    //for getting constant pool data.
    CONSTANTPOOL = this;
    
    /**
     * PARSING
     */
    
    //u2 constant_pool_count;
    this.count = javaClassReader.getUintField(2);
    //cp_info constant_pool[constant_pool_count-1];
    //NOTE: Index 0 of the constant pool is reserved for use by the JVM, and is not
    //in the class file.
    for(i = 1; i < this.count; i++) {
        var tag = javaClassReader.getUintField(1);
        var bytes, name_index;

        switch(tag) {
            case ConstantPoolInfo.tags.CLASS:
                name_index = javaClassReader.getUintField(2);
                this[i] = new ConstantClassInfo(name_index);
                break;
            case ConstantPoolInfo.tags.FIELDREF:
            case ConstantPoolInfo.tags.METHODREF:
            case ConstantPoolInfo.tags.INTERFACEMETHODREF:
                var class_index = javaClassReader.getUintField(2);
                var name_and_type_index = javaClassReader.getUintField(2);
                this[i] = new ConstantRefInfo(tag, class_index, name_and_type_index);
                break;
            case ConstantPoolInfo.tags.STRING:
                var string_index = javaClassReader.getUintField(2);
                this[i] = new ConstantStringInfo(string_index);
                break;
            case ConstantPoolInfo.tags.INTEGER:
                bytes = new Integer(javaClassReader.getIntField(4));
                this[i] = new ConstantNumberInfo(tag, bytes);
                break;
            case ConstantPoolInfo.tags.FLOAT:
                bytes = new Float(javaClassReader.getFloatField(4));
                this[i] = new ConstantNumberInfo(tag, bytes);
                break;
            case ConstantPoolInfo.tags.LONG:
                var high = javaClassReader.getUintField(4);
                var low = javaClassReader.getUintField(4);
                var long_value = new Long(low, high);
                this[i] = new ConstantBigNumberInfo(tag, long_value);
                //8 byte constants take up two slots.
                i++;
                break;
            case ConstantPoolInfo.tags.DOUBLE:
                var double_field = new Double(javaClassReader.getDoubleField(8));
                this[i] = new ConstantBigNumberInfo(tag, double_field);
                //8 byte constants take up two slots.
                i++;
                break;
            case ConstantPoolInfo.tags.NAMEANDTYPE:
                name_index = javaClassReader.getUintField(2);
                var descriptor_index = javaClassReader.getUintField(2);
                this[i] = new ConstantNameAndTypeInfo(name_index, descriptor_index);
                break;
            case ConstantPoolInfo.tags.UTF8:
                var length = javaClassReader.getUintField(2);
                var string = javaClassReader.getUTF8Field(length);
                this[i] = new ConstantUTF8Info(length, string);
                break;
            default:
                JVM.printError("ERROR: Unable to determine the 'tag' element of a cp_info struct: " + tag + ".");
                break;
        }
    }
    
    //Constant pool items sometimes refer to other constant pool items, and
    //we cannot resolve these references until the constant pool is completely
    //assembled. So, we do it after the fact.
    for (i = 1; i < this.count; i++)
    {
        if (i in this) //This may be false for the second items for double/long constants.
        {
            this[i].resolveReferences(this);
        }
    }
}
    
/**
 * Get the string from a UTF8 info object at the given index.
 * Asserts that it is, in fact, a UTF8 info object.
 */
ConstantPool.prototype.getUTF8Info = function(index) {
    if (index === 0) return undefined;
    assert(this[index].tag == ConstantPoolInfo.tags.UTF8);
    return this[index].string;
};

/**
 * Resolve a class info object at the given index to its UTF8 name.
 * Asserts that it is, in fact, a class info object.
 */
ConstantPool.prototype.getClassInfo = function(index) {
    if (index === 0) return undefined;
    if (!(index in this)) assert(false);
    assert(this[index].tag == ConstantPoolInfo.tags.CLASS);
    return this[index].name;
};

/**
 * Print the constant pool contents to the terminal.
 */
ConstantPool.prototype.toString = function() {
    var output = [];
    output.push("Constant Pool Contents:\n");
    for (var i = 1; i < this.count; i++)
    {
        output.push("\t" + i + " ");
        output.push(this[i].toString(), "\n");
    }

    return output.join("");
};

/*The parent object for all the Constant Pool objects
 *Paramaters
 *  tagType - What type is this information for
 */
function ConstantPoolInfo(tagType) {
    this.tag = tagType;
    //Part of the "interface" of this type. Resolves references to the constant pool to objects.
    this.resolveReferences = function(constantPool) { };
    this.toString = function() { };
}

ConstantPoolInfo.tags = {
    CLASS : 7,
    FIELDREF : 9,
    METHODREF : 10,
    INTERFACEMETHODREF : 11,
    STRING : 8,
    INTEGER : 3,
    FLOAT : 4,
    LONG : 5,
    DOUBLE : 6,
    NAMEANDTYPE : 12,
    UTF8 : 1
};

/* Represents a constant_pool_class_info.
 * parameters:
 *  nameIndex - The index into the constant pool that represents the class
 */
function ConstantClassInfo(nameIndex) {
    inherits(this,"ConstantPoolInfo", ConstantPoolInfo.tags.CLASS);
    this.nameIndex = nameIndex;
    //Index into the constant pool for the class 'u2'
    
    //Resolve all references to other constant pool objects.
    this.resolveReferences = function(constantPool) {
        this.name = CONSTANTPOOL.getUTF8Info(this.nameIndex);
    };
    
    this.toString = function() {
        return "class " + this.name;
    };
}

/* Represents a constant_pool_info for FieldRef, MethodRef, or InterfaceMethodRef.
 * parameters:
 *  refType - A tag from ConstantPoolInfo, which has to be either FIELDREF, METHODREF, INTERFACEMETHODREF
 *  nameIndex - The index into the constant pool that represents the class
 */
function ConstantRefInfo(refType, classIndex, nameAndTypeIndex) {
    inherits(this,"ConstantPoolInfo", refType);
    this.classIndex = classIndex;
    this.nameAndTypeIndex = nameAndTypeIndex;
    //Lazily resolve; do not access directly.
    this._class = undefined;
    this._ref = undefined;
    
    //Resolve all references to other constant pool objects.
    this.resolveReferences = function(constantPool) {
        //Make sure the class has resolved its references first.
        CONSTANTPOOL[this.classIndex].resolveReferences();
        this.className = CONSTANTPOOL.getClassInfo(this.classIndex);
        this.nameAndType = CONSTANTPOOL[this.nameAndTypeIndex];
        assert(this.nameAndType.tag == ConstantPoolInfo.tags.NAMEANDTYPE);
    };
    
    /**
     * Get the field/method/interface method object.
     */
    this.getRef = function() {
        if (this._ref !== undefined)
            return this._ref;
        
        var _class = this.getClass();
        var name = this.nameAndType.name;
        var descriptor = this.nameAndType.descriptor;
        
        switch(this.tag) {
            case ConstantPoolInfo.tags.FIELDREF:
                this._ref = _class.getField(name, descriptor);
                break;
            case ConstantPoolInfo.tags.METHODREF:
            case ConstantPoolInfo.tags.INTERFACEMETHODREF:
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
    this.getClass = function() {
        if (this._class !== undefined)
            return this._class;
            
        //JVM.debugPrint("CPRef ClassIndex: " + this.classIndex);
        this._class = JVM.getClass(this.className);
        
        return this._class;
    };
    
    this.toString = function() {
        var output = [];
        
        switch(this.tag)
        {
            case ConstantPoolInfo.tags.FIELDREF:
                output.push("fieldref ");
                break;
            case ConstantPoolInfo.tags.METHODREF:
                output.push("methodref ");
                break;
            case ConstantPoolInfo.tags.INTERFACEMETHODREF:
                output.push("interfacemethodref ");
                break;
            default:
                output.push("unknownref ");
                break;
        }
        
        output.push(this.className, " ", this.nameAndType.name, " ", this.nameAndType.descriptor);
        return output.join("");
    };
}

//Used for Strings
function ConstantStringInfo(stringIndex) {
    inherits(this,"ConstantPoolInfo", ConstantPoolInfo.tags.STRING);
    this.stringIndex = stringIndex;
    
    //Resolve all references to other constant pool objects.
    this.resolveReferences = function(constantPool) {
        this.string = CONSTANTPOOL.getUTF8Info(this.stringIndex);
    };
    
    this.toString = function() {
        return "string " + this.string;
    };
}

//Used for INTEGER OR FLOATING REFERENCES
function ConstantNumberInfo(refType, value) {
    inherits(this,"ConstantPoolInfo", refType);
    this.value = value;
    
    this.toString = function() {
        var output = "";
        
        switch(this.tag)
        {
            case ConstantPoolInfo.tags.INTEGER:
                output += "int ";
                break;
            case ConstantPoolInfo.tags.FLOAT:
                output += "float ";
                break;
            default:
                output += "unknownnumber ";
                break;
        }
        
        return output + this.value;
    };
}

//Used for LONGS and DOUBLES
function ConstantBigNumberInfo(refType, value) {
    inherits(this,"ConstantPoolInfo", refType);
    this.value = value;
    
    this.toString = function() {
        var output = "";
        switch(this.tag)
        {
            case ConstantPoolInfo.tags.LONG:
                output += "long ";
                break;
            case ConstantPoolInfo.tags.DOUBLE:
                output += "double ";
                break;
            default:
                output += "unknownbignumber ";
                break;
        }
        
        return output + this.value;
    };
}

function ConstantNameAndTypeInfo(nameIndex, descriptorIndex) {
    inherits(this,"ConstantPoolInfo", ConstantPoolInfo.tags.NAMEANDTYPE);
    this.nameIndex = nameIndex;
    this.descriptorIndex = descriptorIndex;
    
    //Resolve all references to other constant pool objects.
    this.resolveReferences = function(constantPool) {
        this.name = CONSTANTPOOL.getUTF8Info(this.nameIndex);
        
        this.descriptor = CONSTANTPOOL.getUTF8Info(this.descriptorIndex);
    };
    
    this.toString = function() {
        return "NameAndTypeInfo" + this.name + " " + this.descriptor;
    };
}

function ConstantUTF8Info(length, string) {
    inherits(this,"ConstantPoolInfo", ConstantPoolInfo.tags.UTF8);
    this.length = length;
    this.string = string;
    
    this.toString = function() {
        return "UTF8 " + this.string;
    };
}