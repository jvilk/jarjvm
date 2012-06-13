function makeAttributes(javaClassReader, attributesCount) {
    var attributes = [];
    for (var i = 0; i < attributesCount; i++)
    {
        var attributeNameIndex = javaClassReader.getUintField(2);
        var attributeName = CONSTANTPOOL.getUTF8Info(attributeNameIndex);
        
        //Switching on Strings? In MY JavaScript? It's more likely than you think...
        switch(attributeName) {
            case "SourceFile":
                attributes[i] = new SourceFileAttribute(javaClassReader, attributeNameIndex);
                break;
            case "ConstantValue":
                attributes[i] = new ConstantValueAttribute(javaClassReader, attributeNameIndex);
                break;
            case "Code":
                attributes[i] = new CodeAttribute(javaClassReader, attributeNameIndex);
                break;
            case "Exceptions":
                attributes[i] = new ExceptionAttribute(javaClassReader, attributeNameIndex);
                break;
            case "InnerClasses":
                attributes[i] = new InnerClassAttribute(javaClassReader, attributeNameIndex);
                break;
            case "Synthetic":
                attributes[i] = new SyntheticAttribute(javaClassReader, attributeNameIndex);
                break;
            case "LineNumberTable":
                attributes[i] = new LineNumberTableAttribute(javaClassReader, attributeNameIndex);
                break;
            case "LocalVariableTable":
                attributes[i] = new LocalVariableTable(javaClassReader, attributeNameIndex);
                break;
            case "Deprecated":
                attributes[i] = new DeprecatedAttribute(javaClassReader, attributeNameIndex);
                break;
            default:
                //JVM.printError("WARNING: Unrecognized attribute " + attributeName + ".");
                attributes[i] = new GenericAttribute(javaClassReader, attributeNameIndex);
                break;
        }
    }
    return attributes;
}

/* The parent of all attributes */
function Attribute(javaClassReader, attributeNameIndex) {
    this.attributeNameIndex = attributeNameIndex;
    this.attributeName = CONSTANTPOOL.getUTF8Info(attributeNameIndex);
    this.attributeLength = javaClassReader.getUintField(4);
    
    //Prototype.
    this.toString = function() {};
}

function GenericAttribute(javaClassReader, attributeNameIndex) {
    inherits(this, "Attribute", javaClassReader, attributeNameIndex);
    this.info_ = javaClassReader.getUintField(this.attributeLength);
    
    this.toString = function() {
        return "\tGeneric: " + this.attributeName;
    };
}

function SourceFileAttribute(javaClassReader, attributeNameIndex) {
    inherits(this, "Attribute", javaClassReader, attributeNameIndex);
    assert(this.attributeLength == 2);
    this.sourceFileIndex = javaClassReader.getUintField(2);
    this.sourceFile = CONSTANTPOOL.getUTF8Info(this.sourceFileIndex);
    
    this.toString = function() {
        return "\tSourceFile: " + this.attributeName + " " + this.sourceFile;
    };
}

function ConstantValueAttribute(javaClassReader, attributeNameIndex) {
    inherits(this, "Attribute", javaClassReader, attributeNameIndex);
    assert(this.attributeLength == 2);
    this.constantValueIndex = javaClassReader.getUintField(2);
    this.constantValue = CONSTANTPOOL[this.constantValueIndex];
    this.toString = function() {
        return "\tConstantValue: " + this.attributeName + " " + this.constantValue;
    };
}

function CodeAttribute(javaClassReader, attributeNameIndex) {
    inherits(this, "Attribute", javaClassReader, attributeNameIndex);
    
    this.maxStack = javaClassReader.getUintField(2);
    this.maxLocals = javaClassReader.getUintField(2);
    
    //The actual bytecode for the method
    this.codeLength = javaClassReader.getUintField(4);
    
    var oldIndex = javaClassReader.index;
    
    /**
     * The following gigantic loop handles parsing the bytecode.
     * It resolves constant pool entries and performs various assertions
     * to ensure things are going on track.
     *
     * Believe me, I wish it wasn't this long. I was too lazy to make
     * individual 'class' files for each bytecode.
     */
    this.code = [];
    var i = 0; //Declared outside of loop for assert below.
    var j = 0; //Declared here because it is reused.
    for (i = 0; i < this.codeLength; ) {
        //Get the instruction.
        var instr = javaClassReader.getUintField(1);
        var insObj;
        
        /**
         * Shared temporary variables.
         * JavaScript only creates new scopes in functions, so any variables
         * that I want to reuse down below should be declared once up here, or
         * else I am declaring them multiple times in the same scope. The linter
         * hates me for that.
         */
         var int1, index, unit1, constant, padding, paddingVal, default_;

        //Is it a special bytecode with arguments?
        switch(instr) {
            /**
             * Instructions with index into local variable array
             */
            case ByteCode.codes.aload:
            case ByteCode.codes.astore:
            case ByteCode.codes.dload:
            case ByteCode.codes.dstore:
            case ByteCode.codes.fload:
            case ByteCode.codes.fstore:
            case ByteCode.codes.iload:
            case ByteCode.codes.istore:
            case ByteCode.codes.lload:
            case ByteCode.codes.lstore:
            case ByteCode.codes.ret:
                var uint1 = javaClassReader.getUintField(1);
                insObj = new Instruction(2, instr, uint1);
                break;
                
            //TODO: Test 1 byte signed integer. Does it work?
            case ByteCode.codes.bipush:
                int1 = javaClassReader.getIntField(1);
                insObj = new Instruction(2, instr, int1);
                break;
                
            //TODO: Test 2 byte signed integer. Does it work?
            case ByteCode.codes.goto_:
            case ByteCode.codes.if_acmpeq:
            case ByteCode.codes.if_acmpne:
            case ByteCode.codes.if_icmpeq:
            case ByteCode.codes.if_icmpge:
            case ByteCode.codes.if_icmpgt:
            case ByteCode.codes.if_icmple:
            case ByteCode.codes.if_icmplt:
            case ByteCode.codes.if_icmpne:
            case ByteCode.codes.ifeq:
            case ByteCode.codes.ifge:
            case ByteCode.codes.ifgt:
            case ByteCode.codes.ifle:
            case ByteCode.codes.iflt:
            case ByteCode.codes.ifne:
            case ByteCode.codes.ifnonnull:
            case ByteCode.codes.ifnull:
            case ByteCode.codes.jsr:
            case ByteCode.codes.sipush:
                int1 = javaClassReader.getIntField(2);
                insObj = new Instruction(3, instr, int1);
                break;
            case ByteCode.codes.goto_w:
            case ByteCode.codes.jsr_w:
                int1 = javaClassReader.getIntField(4);
                insObj = new Instruction(5, instr, int1);
                break;
                
            /**
             * Instructions with index into constant pool.
             */
            
            //class, array, or interface type
            case ByteCode.codes.anewarray:
            case ByteCode.codes.checkcast:
            case ByteCode.codes.instanceof_:
            case ByteCode.codes.new_:
                //TODO: Is this always a class info???
                index = javaClassReader.getUintField(2);
                var type = CONSTANTPOOL.getClassInfo(index);
                insObj = new Instruction(3, instr, type);
                break;
            
            //The runtime constant pool item at that index must be a symbolic reference to a field,
            //which gives the name and descriptor of the field as well as a symbolic reference to
            //the class in which the field is to be found.
            case ByteCode.codes.getfield:
            case ByteCode.codes.getstatic:
            case ByteCode.codes.putfield:
            case ByteCode.codes.putstatic:
                index = javaClassReader.getUintField(2);
                var field = CONSTANTPOOL[index];
                assert(field.tag == ConstantPoolInfo.tags.FIELDREF);
                insObj = new Instruction(3, instr, field);
                break;
            
            //The runtime constant pool item at that index must be a symbolic reference to an
            //interface method (§5.1), which gives the name and descriptor (§4.3.3) of the
            //interface method as well as a symbolic reference to the interface in which the
            //interface method is to be found.
            case ByteCode.codes.invokeinterface:
                index = javaClassReader.getUintField(2);
                var intMeth = CONSTANTPOOL[index];
                assert(intMeth.tag == ConstantPoolInfo.tags.INTERFACEMETHODREF);
                var count = javaClassReader.getUintField(1);
                //Waste a byte.
                var wasted = javaClassReader.getUintField(1);
                assert(wasted === 0);
                assert(count > 0);
                insObj = new Instruction(5, instr, intMeth, count);
                break;
            
            //The runtime constant pool item at that index must be a symbolic reference to a
            //method (§5.1), which gives the name and descriptor (§4.3.3) of the method as
            //well as a symbolic reference to the class in which the method is to be found.
            case ByteCode.codes.invokespecial:
            case ByteCode.codes.invokestatic:
            case ByteCode.codes.invokevirtual:
                index = javaClassReader.getUintField(2);
                var method = CONSTANTPOOL[index];
                assert(method.tag == ConstantPoolInfo.tags.METHODREF);
                insObj = new Instruction(3, instr, method);
                break;
            
            //The runtime constant pool entry at index either must be a runtime constant
            //of type int or float, or must be a symbolic reference to a string literal (§5.1)
            //OR A CLASS according to some versions of the spec. *sigh*
            case ByteCode.codes.ldc:
                uint1 = javaClassReader.getUintField(1);
                constant = CONSTANTPOOL[uint1];
                
                assert(constant.tag == ConstantPoolInfo.tags.INTEGER ||
                    constant.tag == ConstantPoolInfo.tags.FLOAT ||
                    constant.tag == ConstantPoolInfo.tags.STRING||
                    constant.tag == ConstantPoolInfo.tags.CLASS);
                insObj = new Instruction(2, instr, constant);
                break;
            
            case ByteCode.codes.ldc_w:
                index = javaClassReader.getUintField(2);
                constant = CONSTANTPOOL[index];
                    
                assert(constant.tag == ConstantPoolInfo.tags.INTEGER ||
                    constant.tag == ConstantPoolInfo.tags.FLOAT ||
                    constant.tag == ConstantPoolInfo.tags.STRING ||
                    constant.tag == ConstantPoolInfo.tags.CLASS);
                    
                insObj = new Instruction(3, instr, constant);
                break;
            
            //The runtime constant pool entry at the index must be a runtime constant of
            //type long or double.
            case ByteCode.codes.ldc2_w:
                index = javaClassReader.getUintField(2);
                constant = CONSTANTPOOL[index];
                assert(constant.tag == ConstantPoolInfo.tags.DOUBLE ||
                    constant.tag == ConstantPoolInfo.tags.LONG);
                insObj = new Instruction(3, instr, constant);
                break;
            
            //TODO: 1 byte signed int
            case ByteCode.codes.iinc:
                uint1 = javaClassReader.getUintField(1);
                int1 = javaClassReader.getIntField(1);
                insObj = new Instruction(3, instr, uint1, int1);
                break;
            
            /**
             * Misc.
             */
            //The atype is a code that indicates the type of array to create. It must take
            //one of the following values [see table in docs]
            case ByteCode.codes.newarray:
                uint1 = javaClassReader.getUintField(1);
                assert(uint1 >= 4 && uint1 <= 11);
                insObj = new Instruction(2, instr, uint1);
                break;
                
            /**
             * Crazy instructions.
             */
            case ByteCode.codes.lookupswitch:
                //i is the start of the current instruction.
                //0 is the first instruction, so the 4th byte
                //is 4.
                padding = (4 - ((i+1)%4))%4; //Will be 0-3
                paddingVal = javaClassReader.getUintField(padding);
                assert(paddingVal === 0);
                default_ = javaClassReader.getIntField(4);
                var npairs = javaClassReader.getIntField(4);
                assert(npairs >= 0);
                var matches = [];
                for (j = 0; j < npairs; j++)
                {
                    matches[j] = [];
                    matches[j].match = javaClassReader.getIntField(4);
                    if (j > 0) assert(matches[j].match >= matches[j-1].match);
                    matches[j].offset = javaClassReader.getIntField(4);
                }
                insObj = new Instruction(9+padding+npairs*8, instr,9+padding+npairs*8, default_, npairs, matches);
                //default straight from javasoc, npairs number of pairs, matches is the matches
                break;
            case ByteCode.codes.tableswitch:
                padding = (4 - ((i+1)%4))%4; //Will be 0-3
                paddingVal = javaClassReader.getUintField(padding);
                assert(paddingVal === 0);
                default_ = javaClassReader.getIntField(4);
                var low = javaClassReader.getIntField(4);
                var high = javaClassReader.getIntField(4);
                assert(low <= high);
                var offsetCount = high-low+1;
                var offsets = [];
                for (j = 0; j < offsetCount; j++)
                {
                    offsets[j] = javaClassReader.getIntField(4);
                }
                insObj = new Instruction(13+padding+4*offsetCount, instr, 13+padding+4*offsetCount, default_, low, high, offsets);
                break;
            case ByteCode.codes.wide:
                var opcode = javaClassReader.getUintField(1);
                index = javaClassReader.getUintField(2);
                
                //The first form of the wide instruction modifies one of the instructions
                //iload, fload, aload, lload, dload, istore, fstore, astore, lstore, dstore, or ret.
                if (opcode != ByteCode.codes.iinc)
                {
                    assert(opcode == ByteCode.codes.iload ||
                        opcode == ByteCode.codes.fload ||
                        opcode == ByteCode.codes.aload ||
                        opcode == ByteCode.codes.lload ||
                        opcode == ByteCode.codes.dload ||
                        opcode == ByteCode.codes.istore ||
                        opcode == ByteCode.codes.fstore ||
                        opcode == ByteCode.codes.astore ||
                        opcode == ByteCode.codes.lstore ||
                        opcode == ByteCode.codes.dstore ||
                        opcode == ByteCode.codes.ret);
                    insObj = new Instruction(4, instr, opcode, index);
                }
                //The second form applies only to the iinc instruction.
                else
                {
                    constant = javaClassReader.getIntField(2);
                    insObj = new Instruction(6, instr, opcode, index, constant);
                }
                break;
            
            //The runtime constant pool item at the index must be a symbolic reference to a
            //class, array, or interface type.
            //TODO: Check.
            case ByteCode.codes.multianewarray:
                index = javaClassReader.getUintField(2);
                var dim = javaClassReader.getUintField(1);
                assert(dim > 0);
                insObj = new Instruction(4, instr, index, count);
                break;
            default:
                assert(instr in ByteCode);
                insObj = new Instruction(1, instr);
                break;
        }
        
        //Store insObj at its pc location.
        this.code[i] = insObj;

        //Increment i.
        i += insObj.length;
    }
    //Let's make sure we read in ALL of the code.
    assert(i == this.codeLength);
    assert(javaClassReader.index - oldIndex == this.codeLength);
    
    //An Array of ExceptionTableEntries
    this.exceptionTableLength = javaClassReader.getUintField(2);
    
    this.exceptionTable = [];
    for (i = 0; i < this.exceptionTableLength; i++)
    {
        this.exceptionTable[i] = new ExceptionTableEntry(javaClassReader);
    }
    
    //NOTE: The Java spec permits us to entirely ignore these attributes.
    this.attributesCount = javaClassReader.getUintField(2);
    this.attributeInfo = makeAttributes(javaClassReader, this.attributesCount);
    
    /**
     * Executes the code, starting from the value of PC.
     */
    this.execute = function() {
        //Execution will be interrupted by an exception.
        //If it is not, then the method didn't end with a return instruction,
        //which is illegal anyway!
        var currentInst;
        
        //Since we're resuming the method, the context switch is over.
        JVM.getExecutingThread().setContextSwitch(false);
        
        while (!JVM.getExecutingThread().isContextSwitch()) {
            currentInst = this.code[JVM.getExecutingThread().getPC()];
            JVM.debugPrint("Bytecode Opcode: " + ByteCode.strings[currentInst.opcode]);
            JVM.getExecutingThread().incrementPC(currentInst.length);
            currentInst.execute();
        }
    };
    
    /**
     * Find a catch statement for the input exception using the current value of the
     * program counter.
     *
     * Manipulates the stack to the correct configuration to resume execution.
     */
    this.exception = function(exception) {
        for (var anException in this.exceptionTable)
        {
            var exceptionEntry = this.exceptionTable[anException];
            //Check if exception is in range
            //Range is [startPC, endPC)
            var pc = JVM.getExecutingThread().getPC();
            if (pc >= exceptionEntry.startPC && pc < exceptionEntry.endPC)
            {
                var className = exceptionEntry.catchType;
                //className is undefined if it's a finally block [which means it matches everything]
                //Otherwise, we need to check if the exception type is a subclass or an instance of the
                //class type that this block matches.
                if (className === undefined || exception.classInfo.isA(className))
                {
                    //We're done. Create the needed MethodRun object.
                    MethodRun.createResume(exceptionEntry.handlerPC);
                    return;
                }
            }
        }
        
        //Pop off our frame. There's nothing that can be done.
        JVM.getExecutingThread().popFrame();
        
        //Rethrow the exception.
        MethodRun.throwException(exception);
    };
    
    /**
     * Returns a string representation for printing. errorPC is an option
     * argument -- if specified, the output prints an arrow pointing to the
     * line of code that caused an error.
     */
    this.toString = function(errorPC) {
        if (errorPC === undefined) errorPC = -1;

        var i;
        var output = [];

        for (i = 0; i < this.codeLength; ) {
            output.push(this.code[i].toString(i === errorPC), "\n");
            i += this.code[i].length;
        }

        return output.join("");
    };
}

function ExceptionTableEntry(javaClassReader) {
    this.startPC = javaClassReader.getUintField(2);
    this.endPC = javaClassReader.getUintField(2);
    this.handlerPC = javaClassReader.getUintField(2);
    this.catchTypeIndex = javaClassReader.getUintField(2);
    this.catchType = CONSTANTPOOL.getClassInfo(this.catchTypeIndex);
}

function ExceptionAttribute(javaClassReader, attributeNameIndex) {
    inherits(this, "Attribute", javaClassReader, attributeNameIndex);
    this.numberOfExceptions = javaClassReader.getUintField(2);
    
    //An array of constant pool references to exceptions
    this.exceptionsIndexTable = [];
    for (var i = 0; i < this.numberOfExceptions; i++)
    {
        this.exceptionsIndexTable[i] = javaClassReader.getUintField(2);
    }
    
    //TODO: Flesh out attribute output.
    this.toString = function() {
        return "\tException: " + this.attributeName;
    };
}

function LineNumberTableAttribute(javaClassReader, attributeNameIndex) {
    inherits(this, "Attribute", javaClassReader, attributeNameIndex);
    this.lineNumberTableLength = javaClassReader.getUintField(2);
    
    //An Array of LineNumberTableEntries
    this.lineNumberTable = [];
    for (var i = 0; i < this.lineNumberTableLength; i++)
    {
        this.lineNumberTable[i] = new LineNumberTableEntry(javaClassReader);
    }
    
    //TODO: Flesh out attribute output.
    this.toString = function() {
        return "\tLineNumberTable: " + this.attributeName;
    };
}

function LineNumberTableEntry(javaClassReader) {
    this.startPC = javaClassReader.getUintField(2);
    this.lineNumber = javaClassReader.getUintField(2);
}

function LocalVariableTable(javaClassReader, attributeNameIndex) {
    inherits(this, "Attribute", javaClassReader, attributeNameIndex);
    this.localVariableTableLength = javaClassReader.getUintField(2);
    
    //An Array of LocalVariableTableEntries
    this.localVariableTable = [];
    for (var i = 0; i < this.localVariableTableLength; i++)
    {
        this.localVariableTable[i] = new LocalVariableTableEntry(javaClassReader);
    }
    
    //TODO: Flesh out attribute output.
    this.toString = function() {
        return "\tLocalVariableTable: " + this.attributeName;
    };
}

function LocalVariableTableEntry(javaClassReader) {
    this.startPC = javaClassReader.getUintField(2);
    this.length = javaClassReader.getUintField(2);
    this.nameIndex = javaClassReader.getUintField(2);
    this.name = CONSTANTPOOL.getUTF8Info(this.nameIndex);
    this.descriptorIndex = javaClassReader.getUintField(2);
    this.descriptor = CONSTANTPOOL.getUTF8Info(this.descriptorIndex);
    this.index = javaClassReader.getUintField(2);
}

function SyntheticAttribute(javaClassReader, attributeNameIndex) {
    inherits(this, "Attribute", javaClassReader, attributeNameIndex);
    assert(this.attributeLength === 0);
    
    //TODO: Flesh out attribute output.
    this.toString = function() {
        return "\tSynthetic: " + this.attributeName;
    };
}

function InnerClassAttribute(javaClassReader, attributeNameIndex) {
    inherits(this, "Attribute", javaClassReader, attributeNameIndex);
    this.numberOfClasses = javaClassReader.getUintField(2);
    
    this.classes = [];
    for (var i = 0; i < this.numberOfClasses; i++)
    {
        this.classes[i] = new ClassEntry(javaClassReader);
    }
    
    //TODO: Flesh out attribute output.
    this.toString = function() {
        return "\tInnerClass: " + this.attributeName;
    };
}

function ClassEntry(javaClassReader) {
    this.innerClassInfoIndex = javaClassReader.getUintField(2);
    this.innerClassInfo = CONSTANTPOOL.getClassInfo(this.innerClassInfoIndex);
    this.outerClassInfoIndex = javaClassReader.getUintField(2);
    this.outerClassInfo = CONSTANTPOOL.getClassInfo(this.outerClassInfoIndex);
    this.innerNameIndex = javaClassReader.getUintField(2);
    this.innerName = CONSTANTPOOL.getUTF8Info(this.innerNameIndex);
    this.innerClassAccessFlags = javaClassReader.getUintField(2);
}

function DeprecatedAttribute(javaClassReader, attributeNameIndex) {
    inherits(this, "Attribute", javaClassReader, attributeNameIndex);
    assert(this.attributeLength === 0);
    
    //TODO: Flesh out attribute output.
    this.toString = function() {
        return "\tDeprecated: " + this.attributeName;
    };
}