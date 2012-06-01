/**
 * Contains the code for every bytecode instruction.
 */
var ByteCode = [];
var ArrayType = {};
ByteCode.codes = {
	aaload : 0x32, //Done
	aastore : 0x53, //Done
	aconst_null : 0x01, //Done using javascript null for 'null'
	aload : 0x19, //Done
	aload_0 : 0x2a, //Done
	aload_1 : 0x2b, //Done
	aload_2 : 0x2c, //Done
	aload_3 : 0x2d, //Done
	anewarray : 0xbd, //Done
	areturn : 0xb0, //Done
	arraylength : 0xbe, //Done
	astore : 0x3a, //Done
	astore_0 : 0x4b, //Done
	astore_1 : 0x4c, //Done
	astore_2 : 0x4d, //Done
	astore_3 : 0x4e, //Done
	athrow : 0xbf, //Done
	baload : 0x33, //Done
	bastore : 0x54, //DOne
	bipush : 0x10, //Done
	caload : 0x34, //Done
	castore : 0x55, //Done
	checkcast : 0xc0, //Done
	d2f : 0x90, //Done
	d2i : 0x8e, //Done
	d2l : 0x8f, //Done
	dadd : 0x63, //Done
	daload : 0x31, //Done
	dastore : 0x52, //Done
	dcmpg : 0x98, //Done
	dcmpl : 0x97, //Done
	dconst_0 : 0x0e, //Done
	dconst_1 : 0x0f, //Done
	ddiv : 0x6f, //Done
	dload : 0x18, //Done
	dload_0 : 0x26, //Done
	dload_1 : 0x27, //Done
	dload_2 : 0x28, //Done
	dload_3 : 0x29, //Done
	dmul : 0x6b, //Done
	dneg : 0x77, //Done
	drem : 0x73, //Done
	dreturn : 0xaf, //Done
	dstore : 0x39, //Done
	dstore_0 : 0x47, //Done
	dstore_1 : 0x48, //Done
	dstore_2 : 0x49, //Done
	dstore_3 : 0x4a, //Done
	dsub : 0x67, //Done
	dup : 0x59, //Done
	dup2 : 0x5c, //Done
	dup2_x1 : 0x5d, //Done
	dup2_x2 : 0x5e, //Done
	dup_x1 : 0x5a, //Done
	dup_x2 : 0x5b, //Done
	f2d : 0x8d, //Done
	f2i : 0x8b, //Done
	f2l : 0x8c, //Done
	fadd : 0x62, //Done
	faload : 0x30, //Done
	fastore : 0x51, //Done
	fcmpg : 0x96, //Done
	fcmpl : 0x95, //Done
	fconst_0 : 0x0b, //Done
	fconst_1 : 0x0c, //Done
	fconst_2 : 0x0d, //Done
	fdiv : 0x6e, //Done
	fload : 0x17, //Done
	fload_0 : 0x22, //Done
	fload_1 : 0x23, //Done
	fload_2 : 0x24, //Done
	fload_3 : 0x25, //Done
	fmul : 0x6a, //Done
	fneg : 0x76, //Done
	frem : 0x72, //Done
	freturn : 0xae, //Done
	fstore : 0x38, //Done
	fstore_0 : 0x43, //Done
	fstore_1 : 0x44, //Done
	fstore_2 : 0x45, //Done
	fstore_3 : 0x46, //Done
	fsub : 0x66, //Done
	getfield : 0xb4, //Done
	getstatic : 0xb2, //Done
	goto_ : 0xa7, //Done
	goto_w : 0xc8, //Done
	i2b : 0x91, //Done
	i2c : 0x92, //Done
	i2d : 0x87, //Done
	i2f : 0x86, //Done
	i2l : 0x85, //Done
	i2s : 0x93, //Done
	iadd : 0x60, //Done
	iaload : 0x2e, //Done
	iand : 0x7e, //Done
	iastore : 0x4f, //Done
	iconst_0 : 0x03, //Done
	iconst_1 : 0x04, //Done
	iconst_2 : 0x05, //Done
	iconst_3 : 0x06, //Done
	iconst_4 : 0x07, //Done
	iconst_5 : 0x08, //Done
	iconst_m1 : 0x02, //Done
	idiv : 0x6c, //Done
	if_acmpeq : 0xa5, //Done
	if_acmpne : 0xa6, //Done
	if_icmpeq : 0x9f, //Done
	if_icmpge : 0xa2, //Done
	if_icmpgt : 0xa3, //Done
	if_icmple : 0xa4, //Done
	if_icmplt : 0xa1, //Done
	if_icmpne : 0xa0, //Done
	ifeq : 0x99, //Done
	ifge : 0x9c, //Done
	ifgt : 0x9d, //Done
	ifle : 0x9e, //Done
	iflt : 0x9b, //Done
	ifne : 0x9a, //Done
	ifnonnull : 0xc7, //Done
	ifnull : 0xc6, //Done
	iinc : 0x84, //Done
	iload : 0x15, //Done
	iload_0 : 0x1a, //Done
	iload_1 : 0x1b, //Done
	iload_2 : 0x1c, //Done
	iload_3 : 0x1d, //Done
	impdep1 : 0xfe, //Done Not in Spec
	impdep2 : 0xff, //Done Not in Spec
	imul : 0x68, //Done
	ineg : 0x74, //Done
	instanceof_ : 0xc1, //DOne
	invokeinterface : 0xb9, //Done
	invokespecial : 0xb7, //Done
	invokestatic : 0xb8, //Done
	invokevirtual : 0xb6, //Done
	ior : 0x80, //Done
	irem : 0x70, //Done
	ireturn : 0xac, //Done
	ishl : 0x78, //Done
	ishr : 0x7a, //Done
	istore : 0x36, //Done
	istore_0 : 0x3b, //Done
	istore_1 : 0x3c, //Done
	istore_2 : 0x3d, //Done
	istore_3 : 0x3e, //Done
	isub : 0x64, //Done
	iushr : 0x7c, //Done
	ixor : 0x82, //Done
	jsr : 0xa8, //Done
	jsr_w : 0xc9, //Done
	l2d : 0x8a, //Done
	l2f : 0x89, //Done
	l2i : 0x88, //Done
	ladd : 0x61, //Done
	laload : 0x2f, //Done
	land : 0x7f, //Done
	lastore : 0x50, //Done
	lcmp : 0x94, //Done
	lconst_0 : 0x09, //Done
	lconst_1 : 0x0a, //Done
	ldc : 0x12, //Done
	ldc2_w : 0x14, //Done
	ldc_w : 0x13, //Done
	ldiv : 0x6d, //Done
	lload : 0x16, //Done
	lload_0 : 0x1e, //Done
	lload_1 : 0x1f, //Done
	lload_2 : 0x20, //Done
	lload_3 : 0x21, //Done
	lmul : 0x69, //Done
	lneg : 0x75, //Done
	lookupswitch : 0xab,
	lor : 0x81, //Done
	lrem : 0x71, //Done
	lreturn : 0xad, //Done
	lshl : 0x79, //Done
	lshr : 0x7b, //Done
	lstore : 0x37, //Done
	lstore_0 : 0x3f, //Done
	lstore_1 : 0x40, //Done
	lstore_2 : 0x41, //Done
	lstore_3 : 0x42, //Done
	lsub : 0x65, //Done
	lushr : 0x7d, //Done
	lxor : 0x83, //Done
	monitorenter : 0xc2, //NOTE: does nothing - Done
	monitorexit : 0xc3, //NOTE: does nothing - Done
	multianewarray : 0xc5, //TODO: Do This
	new_ : 0xbb, //Done
	newarray : 0xbc, //Done
	nop : 0x00, //Done
	pop : 0x57, //Done
	pop2 : 0x58, //Done
	putfield : 0xb5, //Done
	putstatic : 0xb3, //Done
	ret : 0xa9, //Done
	return_ : 0xb1, //Done
	saload : 0x35, //Done
	sastore : 0x56, //Done
	sipush : 0x11, //Done
	swap : 0x5f, //Done
	tableswitch : 0xaa, //Done
	wide : 0xc4 //Done
};

//Useful for debugging (e.g. Instruction.toString()).
ByteCode.strings = {
	0x32 : 'aaload', //Done
	0x53 : 'aastore', //Done
	0x01 : 'aconst_null',
	0x19 : 'aload',
	0x2a : 'aload_0',
	0x2b : 'aload_1',
	0x2c : 'aload_2',
	0x2d : 'aload_3',
	0xbd : 'anewarray',
	0xb0 : 'areturn',
	0xbe : 'arraylength',
	0x3a : 'astore',
	0x4b : 'astore_0',
	0x4c : 'astore_1',
	0x4d : 'astore_2',
	0x4e : 'astore_3',
	0xbf : 'athrow',
	0x33 : 'baload',
	0x54 : 'bastore',
	0x10 : 'bipush',
	0x34 : 'caload',
	0x55 : 'castore',
	0xc0 : 'checkcast',
	0x90 : 'd2f',
	0x8e : 'd2i',
	0x8f : 'd2l',
	0x63 : 'dadd',
	0x31 : 'daload',
	0x52 : 'dastore',
	0x98 : 'dcmpg',
	0x97 : 'dcmpl',
	0x0e : 'dconst_0',
	0x0f : 'dconst_1',
	0x6f : 'ddiv',
	0x18 : 'dload',
	0x26 : 'dload_0',
	0x27 : 'dload_1',
	0x28 : 'dload_2',
	0x29 : 'dload_3',
	0x6b : 'dmul',
	0x77 : 'dneg',
	0x73 : 'drem',
	0xaf : 'dreturn',
	0x39 : 'dstore',
	0x47 : 'dstore_0',
	0x48 : 'dstore_1',
	0x49 : 'dstore_2',
	0x4a : 'dstore_3',
	0x67 : 'dsub',
	0x59 : 'dup',
	0x5c : 'dup2',
	0x5d : 'dup2_x1',
	0x5e : 'dup2_x2',
	0x5a : 'dup_x1',
	0x5b : 'dup_x2',
	0x8d : 'f2d',
	0x8b : 'f2i',
	0x8c : 'f2l',
	0x62 : 'fadd',
	0x30 : 'faload',
	0x51 : 'fastore',
	0x96 : 'fcmpg',
	0x95 : 'fcmpl',
	0x0b : 'fconst_0',
	0x0c : 'fconst_1',
	0x0d : 'fconst_2',
	0x6e : 'fdiv',
	0x17 : 'fload',
	0x22 : 'fload_0',
	0x23 : 'fload_1',
	0x24 : 'fload_2',
	0x25 : 'fload_3',
	0x6a : 'fmul',
	0x76 : 'fneg',
	0x72 : 'frem',
	0xae : 'freturn',
	0x38 : 'fstore',
	0x43 : 'fstore_0',
	0x44 : 'fstore_1',
	0x45 : 'fstore_2',
	0x46 : 'fstore_3',
	0x66 : 'fsub',
	0xb4 : 'getfield',
	0xb2 : 'getstatic',
	0xa7 : 'goto_',
	0xc8 : 'goto_w',
	0x91 : 'i2b',
	0x92 : 'i2c',
	0x87 : 'i2d',
	0x86 : 'i2f',
	0x85 : 'i2l',
	0x93 : 'i2s',
	0x60 : 'iadd',
	0x2e : 'iaload',
	0x7e : 'iand',
	0x4f : 'iastore',
	0x03 : 'iconst_0',
	0x04 : 'iconst_1',
	0x05 : 'iconst_2',
	0x06 : 'iconst_3',
	0x07 : 'iconst_4',
	0x08 : 'iconst_5',
	0x02 : 'iconst_m1',
	0x6c : 'idiv',
	0xa5 : 'if_acmpeq',
	0xa6 : 'if_acmpne',
	0x9f : 'if_icmpeq',
	0xa2 : 'if_icmpge',
	0xa3 : 'if_icmpgt',
	0xa4 : 'if_icmple',
	0xa1 : 'if_icmplt',
	0xa0 : 'if_icmpne',
	0x99 : 'ifeq',
	0x9c : 'ifge',
	0x9d : 'ifgt',
	0x9e : 'ifle',
	0x9b : 'iflt',
	0x9a : 'ifne',
	0xc7 : 'ifnonnull',
	0xc6 : 'ifnull',
	0x84 : 'iinc',
	0x15 : 'iload',
	0x1a : 'iload_0',
	0x1b : 'iload_1',
	0x1c : 'iload_2',
	0x1d : 'iload_3',
	0xfe : 'impdep1',
	0xff : 'impdep2',
	0x68 : 'imul',
	0x74 : 'ineg',
	0xc1 : 'instanceof_',
	0xb9 : 'invokeinterface',
	0xb7 : 'invokespecial',
	0xb8 : 'invokestatic',
	0xb6 : 'invokevirtual',
	0x80 : 'ior',
	0x70 : 'irem',
	0xac : 'ireturn',
	0x78 : 'ishl',
	0x7a : 'ishr',
	0x36 : 'istore',
	0x3b : 'istore_0',
	0x3c : 'istore_1',
	0x3d : 'istore_2',
	0x3e : 'istore_3',
	0x64 : 'isub',
	0x7c : 'iushr',
	0x82 : 'ixor',
	0xa8 : 'jsr',
	0xc9 : 'jsr_w',
	0x8a : 'l2d',
	0x89 : 'l2f',
	0x88 : 'l2i',
	0x61 : 'ladd',
	0x2f : 'laload',
	0x7f : 'land',
	0x50 : 'lastore',
	0x94 : 'lcmp',
	0x09 : 'lconst_0',
	0x0a : 'lconst_1',
	0x12 : 'ldc',
	0x14 : 'ldc2_w',
	0x13 : 'ldc_w',
	0x6d : 'ldiv',
	0x16 : 'lload',
	0x1e : 'lload_0',
	0x1f : 'lload_1',
	0x20 : 'lload_2',
	0x21 : 'lload_3',
	0x69 : 'lmul',
	0x75 : 'lneg',
	0xab : 'lookupswitch',
	0x81 : 'lor',
	0x71 : 'lrem',
	0xad : 'lreturn',
	0x79 : 'lshl',
	0x7b : 'lshr',
	0x37 : 'lstore',
	0x3f : 'lstore_0',
	0x40 : 'lstore_1',
	0x41 : 'lstore_2',
	0x42 : 'lstore_3',
	0x65 : 'lsub',
	0x7d : 'lushr',
	0x83 : 'lxor',
	0xc2 : 'monitorenter',
	0xc3 : 'monitorexit',
	0xc5 : 'multianewarray',
	0xbb : 'new_',
	0xbc : 'newarray',
	0x00 : 'nop',
	0x57 : 'pop',
	0x58 : 'pop2',
	0xb5 : 'putfield',
	0xb3 : 'putstatic',
	0xa9 : 'ret',
	0xb1 : 'return_',
	0x35 : 'saload',
	0x56 : 'sastore',
	0x11 : 'sipush',
	0x5f : 'swap',
	0xaa : 'tableswitch',
	0xc4 : 'wide'
};

/**Many functions do the same thing, like inserting a value into an array. Since javascript is stupid we can use the same function **/

/**
 * Throws an exception with no arguments of the given type.
 * Assumed to be in java/lang package.
 */
ByteCode.throwException = function(exceptionType) {
	var exception = MethodRun.constructObject("java/lang/" + exceptionType, "()V");
	MethodRun.throwException(exception);
	//ByteCode.add NullPointerException
};
/**Get anything from an array reference **/
ByteCode.loadFromArray = function() {
	var arrayIndex = ByteCode.pop().value;
	//Assumed Integer Primative
	var array = ByteCode.pop();
	if(array === null) {
		ByteCode.throwException("NullPointerException");
		return;
	}
	if(arrayIndex < 0 && array >= array.length) {
		ByteCode.throwException("ArrayIndexOutOfBoundsException");
		return;
	}
	ByteCode.push(array.get(arrayIndex));
};
/**Store anything into an array reference**/
ByteCode.storeToArray = function() {
	var value = ByteCode.pop();
	var arrayIndex = ByteCode.pop().value;
	//Get the int from the Primitive class
	var array = ByteCode.pop();
	if( array === null) {
		ByteCode.throwException("NullPointerException");
		return;
	}
	if(arrayIndex < 0 && arrayIndex >= array.length) {
		ByteCode.throwException("ArrayIndexOutOfBoundsException");
		return;
	}
	array.set(arrayIndex, value);
	//arrayRef[arrayIndex] = value;
};
/**Load from one index of local paramters **/
ByteCode.loadFromLocal = function(index) {//Index is actually a number not a Primitive
	ByteCode.push(ByteCode.getLocal(index));
};
/**Store into one index of local parameters **/
ByteCode.storeToLocal = function(index) {//Index is actually a number not a Primitive
	var objectReference = ByteCode.pop();
	ByteCode.setLocal(index, objectReference);
};

ByteCode.add = function() {
	var number2 = ByteCode.pop();
	//Primitive Reference
	var number1 = ByteCode.pop();
	//Primitive Reference

	var result = number1.add(number2);
	ByteCode.push(result);
};

ByteCode.subtract = function() {
	var number2 = ByteCode.pop();
	var number1 = ByteCode.pop();

	var result = number1.subtract(number2);
	ByteCode.push(result);
};

ByteCode.divide = function() {
	var number2 = ByteCode.pop();
	var number1 = ByteCode.pop();

	var result = number1.divide(number2);
	ByteCode.push(result);
};

ByteCode.multiply = function() {
	var number2 = ByteCode.pop();
	var number1 = ByteCode.pop();

	var result = number1.multiply(number2);
	ByteCode.push(result);
};

ByteCode.negate = function() {
	var number = ByteCode.pop();

	ByteCode.push(numbernegate());
};
/**ByteCode.pushes the variable onto the current frame**/
ByteCode.push = function(variable) {
	var frame = currentFrame();
	frame.push(variable);
};

ByteCode.pop = function() {
	var frame = currentFrame();
	return frame.pop();
};

ByteCode.getLocal = function(i) {
	var frame = currentFrame();
	var local = frame.getLocal(i);
	return local;
};

ByteCode.setLocal = function(i, x) {
	var frame = currentFrame();
	frame.setLocal(i, x);
};

ByteCode.compare = function(initialValue) {
	var number2 = ByteCode.pop();
	var number1 = ByteCode.pop();

	var result = initialValue;

	if(isNaN(number1.value) || isNaN(number2.value)) {
		//Do nothing.
	} else {
		if(number1 > number2) {
			result = 1;
		} else if(number1 == number2) {
			result = 0;
		} else {
			result = -1;
		}
	}
	
	ByteCode.push(new Integer(result));
};

ByteCode.cmpg = function() {
	ByteCode.compare(1);
};

ByteCode.cmpl = function() {
	ByteCode.compare(-1);
};

ByteCode.shiftLeft = function(hexShiftBy) {
	var number2 = ByteCode.pop();
	var number1 = ByteCode.pop();

	var shift = number2.value & hexShiftBy;
	//Get the lower 5 bits of number 2
	ByteCode.push(number1.shiftLeft(shift));
};

ByteCode.shiftRight = function(hexShiftBy) {
	var number2 = ByteCode.pop();
	var number1 = ByteCode.pop();

	var shift = number2.value & hexShiftBy;
	ByteCode.push(number1.shiftRight(shift));
};

ByteCode.logicalshiftRight = function(hexShiftBy) {
	var number2 = ByteCode.pop();
	var number1 = ByteCode.pop();

	var shift = number2.value & hexShiftBy;
	ByteCode.push(number1.shiftRightUnsigned(shift));
};

ByteCode.and = function() {
	var number2 = ByteCode.pop();
	var number1 = ByteCode.pop();

	ByteCode.push(number1.and(number2));
};

ByteCode.or = function() {
	var number2 = ByteCode.pop();
	var number1 = ByteCode.pop();

	ByteCode.push(number1.or(number2));
};

ByteCode.xor = function() {
	var number2 = ByteCode.pop();
	var number1 = ByteCode.pop();

	ByteCode.push(number1.xor(number2));
};

ByteCode.rem = function() {
	var number2 = ByteCode.pop();
	var number1 = ByteCode.pop();

	ByteCode.push(number1.modulo(number2));
};

ByteCode.branch = function(codeSize, offset) {
	PC -= codeSize;
	PC += offset;
};
/**Takes the return value and hands it to createReturn**/
ByteCode.return_ = function() {
	var returnValue = ByteCode.pop();
	MethodRun.createReturn(returnValue);
};

ByteCode.returnFromVoid = function() {
	MethodRun.createReturn();
};
/**Byte Code Implementations **/
ByteCode[ByteCode.codes.nop] = function() {
	//Do nothing.
};
ByteCode[ByteCode.codes.aaload] = function() {
	ByteCode.loadFromArray();
};
ByteCode[ByteCode.codes.aastore] = function() {
	ByteCode.storeToArray();
};
ByteCode[ByteCode.codes.aconst_null] = function() {
	ByteCode.push(null);
};
ByteCode[ByteCode.codes.aload] = function(index) {
	ByteCode.loadFromLocal(index);
};
ByteCode[ByteCode.codes.aload_0] = function() {
	ByteCode.loadFromLocal(0);
};
ByteCode[ByteCode.codes.aload_1] = function() {
	ByteCode.loadFromLocal(1);
};
ByteCode[ByteCode.codes.aload_2] = function() {
	ByteCode.loadFromLocal(2);
};
ByteCode[ByteCode.codes.aload_3] = function() {
	ByteCode.loadFromLocal(3);
};
ByteCode[ByteCode.codes.anewarray] = function(className) {
	var arrayLength = ByteCode.pop().value;
	//Get the integer value
	if(arrayLength < 0) {
		ByteCode.throwException("NegativeArraySizeException");
		return;
	}
	var class_ = Class.getClass(className);
	ByteCode.push(new JavaArray(Data.type.OBJECT, class_, 1, arrayLength));
};
ByteCode[ByteCode.codes.areturn] = function() {
	ByteCode.return_();
};
ByteCode[ByteCode.codes.arraylength] = function() {
	var array = ByteCode.pop();
	//
	if(array === null) {
		ByteCode.throwException("NullPointerException");
		return;
	}
	ByteCode.push(new Integer(array.length));
	//JavaArray.array.length
};
ByteCode[ByteCode.codes.astore] = function(index) {
	ByteCode.storeToLocal(index);
};
ByteCode[ByteCode.codes.astore_0] = function() {
	ByteCode.storeToLocal(0);
};
ByteCode[ByteCode.codes.astore_1] = function() {
	ByteCode.storeToLocal(1);
};
ByteCode[ByteCode.codes.astore_2] = function() {
	ByteCode.storeToLocal(2);
};
ByteCode[ByteCode.codes.astore_3] = function() {
	ByteCode.storeToLocal(3);
};
ByteCode[ByteCode.codes.athrow] = function() {
	var exception = ByteCode.pop();

	if(exception === null) {
		ByteCode.throwException("NullPointerException");
		return;
	}
	MethodRun.throwException(exception);
};
ByteCode[ByteCode.codes.baload] = function() {
	ByteCode.loadFromArray();
};
ByteCode[ByteCode.codes.bastore] = function() {
	ByteCode.storeToArray();
};
ByteCode[ByteCode.codes.bipush] = function(byteValue) {
	ByteCode.push(new Byte(byteValue));
};
ByteCode[ByteCode.codes.caload] = function() {
	ByteCode.loadFromArray();
};
ByteCode[ByteCode.codes.castore] = function() {
	ByteCode.storeToArray();
};
ByteCode[ByteCode.codes.checkcast] = function(symbolicReferenceName) {//Name of the class
	var object = ByteCode.pop();
	if(!object.isA(symbolicReferenceName)) {
		ByteCode.throwException("ClassCastException");
	}
};
/*Convert double to float */
ByteCode[ByteCode.codes.d2f] = function() {
	var double_ = ByteCode.pop();
	ByteCode.push(double_.toFloat());
};
ByteCode[ByteCode.codes.d2i] = function() {
	var double_ = ByteCode.pop();
	ByteCode.push(double_.toInteger());
};
ByteCode[ByteCode.codes.d2l] = function() {
	var double_ = ByteCode.pop();
	ByteCode.push(double_.toLong());
};
ByteCode[ByteCode.codes.dadd] = function() {
	ByteCode.add();
};
ByteCode[ByteCode.codes.daload] = function() {
	ByteCode.loadFromArray();
};
ByteCode[ByteCode.codes.dastore] = function() {
	ByteCode.storeToArray();
};
ByteCode[ByteCode.codes.dcmpg] = function() {
	ByteCode.cmpg();
};
ByteCode[ByteCode.codes.dcmpl] = function() {
	ByteCode.cmpl();
};
ByteCode[ByteCode.codes.dconst_0] = function() {
	ByteCode.push(new Double(0.0));
};
ByteCode[ByteCode.codes.dconst_1] = function() {
	ByteCode.push(new Double(1.0));
};
ByteCode[ByteCode.codes.ddiv] = function() {
	ByteCode.divide();
};
ByteCode[ByteCode.codes.dload] = function(index) {
	ByteCode.loadFromLocal(index);
};
ByteCode[ByteCode.codes.dload_0] = function() {
	ByteCode.loadFromLocal(0);
};
ByteCode[ByteCode.codes.dload_1] = function() {
	ByteCode.loadFromLocal(1);
};
ByteCode[ByteCode.codes.dload_2] = function() {
	ByteCode.loadFromLocal(2);
};
ByteCode[ByteCode.codes.dload_3] = function() {
	ByteCode.loadFromLocal(3);
};
ByteCode[ByteCode.codes.dmul] = function() {
	ByteCode.multiply();
};
ByteCode[ByteCode.codes.dneg] = function() {
	ByteCode.negate();
};
ByteCode[ByteCode.codes.drem] = function() {
	ByteCode.rem();
};
ByteCode[ByteCode.codes.dreturn] = function() {
	ByteCode.return_();
};
ByteCode[ByteCode.codes.dstore] = function(index) {
	ByteCode.storeToLocal(index);
};
ByteCode[ByteCode.codes.dstore_0] = function() {
	ByteCode.storeToLocal(0);
};
ByteCode[ByteCode.codes.dstore_1] = function() {
	ByteCode.storeToLocal(1);
};
ByteCode[ByteCode.codes.dstore_2] = function() {
	ByteCode.storeToLocal(2);
};
ByteCode[ByteCode.codes.dstore_3] = function() {
	ByteCode.storeToLocal(3);
};
ByteCode[ByteCode.codes.dsub] = function() {
	ByteCode.subtract();
};
ByteCode[ByteCode.codes.dup] = function() {
	var reference = ByteCode.pop();
	ByteCode.push(reference);
	ByteCode.push(reference);
};
ByteCode[ByteCode.codes.dup_x1] = function() {
	var firstValue = ByteCode.pop();
	var secondValue = ByteCode.pop();
	ByteCode.push(firstValue);
	ByteCode.push(secondValue);
	ByteCode.push(firstValue);
};
ByteCode[ByteCode.codes.dup_x2] = function() {
	var firstValue = ByteCode.pop();
	var secondValue = ByteCode.pop();

	//Check for which form needs to be done
	if(secondValue.type == Data.type.LONG || secondValue.type == Data.type.DOUBLE) {
		ByteCode.push(firstValue);
		ByteCode.push(secondValue);
		ByteCode.push(firstValue);
	} else {
		var thirdValue = ByteCode.pop();
		ByteCode.push(firstValue);
		ByteCode.push(thirdValue);
		ByteCode.push(secondValue);
		ByteCode.push(firstValue);
	}
};
ByteCode[ByteCode.codes.dup2] = function() {
	var firstValue = ByteCode.pop();

	if(firstValue.type == StackElement.types.long_ || firstValue.type == StackElement.types.double_) {
		ByteCode.push(firstValue);
		ByteCode.push(firstValue);
	} else {
		var secondValue = ByteCode.pop();
		ByteCode.push(secondValue);
		ByteCode.push(firstValue);
		ByteCode.push(secondValue);
		ByteCode.push(firstValue);
	}
};
ByteCode[ByteCode.codes.dup2_x1] = function() {
	var firstValue = ByteCode.pop();
	var secondValue;

	if(firstValue.type == StackElement.types.long_ || firstValue.type == StackElement.types.double_) {
		secondValue = ByteCode.pop();
		ByteCode.push(firstValue);
		ByteCode.push(secondValue);
		ByteCode.push(firstValue);
	} else {
		secondValue = ByteCode.pop();
		var thirdValue = ByteCode.pop();
		ByteCode.push(secondValue);
		ByteCode.push(firstValue);
		ByteCode.push(thirdValue);
		ByteCode.push(secondValue);
		ByteCode.push(firstValue);
	}
};
ByteCode[ByteCode.codes.dup2_x2] = function() {
	var firstValue = ByteCode.pop();
	var secondValue = ByteCode.pop();
	var thirdValue;
	if(firstValue.type == StackElement.types.long_ || firstValue.type == StackElement.types.double_) {
		if(secondValue.type == StackElement.types.long_ || secondValue.type == StackElement.types.double_) {
			//Form 4
			ByteCode.push(firstValue);
			ByteCode.push(secondValue);
			ByteCode.push(firstValue);
		} else {
			//Form 2
			thirdValue = ByteCode.pop();
			ByteCode.push(firstValue);
			ByteCode.push(thirdValue);
			ByteCode.push(secondValue);
			ByteCode.push(firstValue);
		}
	} else {
		thirdValue = ByteCode.pop();
		if(thirdValue.type == StackElement.types.long_ || thirdValue.type == StackElement.types.double_) {
			//Form 3
			ByteCode.push(secondValue);
			ByteCode.push(firstValue);
			ByteCode.push(thirdValue);
			ByteCode.push(secondValue);
			ByteCode.push(firstValue);
		} else {
			var fourthValue = ByteCode.pop();
			//Form 1
			ByteCode.push(secondValue);
			ByteCode.push(firstValue);
			ByteCode.push(fourthValue);
			ByteCode.push(thirdValue);
			ByteCode.push(secondValue);
			ByteCode.push(firstValue);
		}
	}
};
ByteCode[ByteCode.codes.f2d] = function() {
	var float_ = ByteCode.pop();
	ByteCode.push(float_.toDouble());
};
ByteCode[ByteCode.codes.f2i] = function() {
	var float_ = ByteCode.pop();
	ByteCode.push(float_.toInteger());
};
ByteCode[ByteCode.codes.f2l] = function() {
	var float_ = ByteCode.pop();
	ByteCode.push(float_.toLong());
};
ByteCode[ByteCode.codes.fadd] = function() {
	ByteCode.add();
};
ByteCode[ByteCode.codes.faload] = function() {
	ByteCode.loadFromArray();
};
ByteCode[ByteCode.codes.fastore] = function() {
	ByteCode.storeToArray();
};
ByteCode[ByteCode.codes.fcmpg] = function() {
	ByteCode.cmpg();
};
ByteCode[ByteCode.codes.fcmpl] = function() {
	ByteCode.cmpl();
};
ByteCode[ByteCode.codes.fconst_0] = function() {
	ByteCode.push(new Float(0.0));
};
ByteCode[ByteCode.codes.fconst_1] = function() {
	ByteCode.push(new Float(1.0));
	return;
};
ByteCode[ByteCode.codes.fconst_2] = function() {
	ByteCode.push(new Float(2.0));
};
ByteCode[ByteCode.codes.fdiv] = function() {
	ByteCode.divide();
};
ByteCode[ByteCode.codes.fload] = function(index) {
	ByteCode.loadFromLocal(index);
};
ByteCode[ByteCode.codes.fload_0] = function() {
	ByteCode.loadFromLocal(0);
};
ByteCode[ByteCode.codes.fload_1] = function() {
	ByteCode.loadFromLocal(1);
};
ByteCode[ByteCode.codes.fload_2] = function() {
	ByteCode.loadFromLocal(2);
};
ByteCode[ByteCode.codes.fload_3] = function() {
	ByteCode.loadFromLocal(3);
};
ByteCode[ByteCode.codes.fmul] = function() {
	ByteCode.multiply();
};
ByteCode[ByteCode.codes.fneg] = function() {
	ByteCode.negate();
};
ByteCode[ByteCode.codes.frem] = function() {
	ByteCode.rem();
};
ByteCode[ByteCode.codes.freturn] = function() {
	ByteCode.return_();
};
ByteCode[ByteCode.codes.fstore] = function(index) {
	ByteCode.storeToLocal(index);
};
ByteCode[ByteCode.codes.fstore_0] = function() {
	ByteCode.storeToLocal(0);
};
ByteCode[ByteCode.codes.fstore_1] = function() {
	ByteCode.storeToLocal(1);
};
ByteCode[ByteCode.codes.fstore_2] = function() {
	ByteCode.storeToLocal(2);
};
ByteCode[ByteCode.codes.fstore_3] = function() {
	ByteCode.storeToLocal(3);
};
ByteCode[ByteCode.codes.fsub] = function() {
	ByteCode.subtract();
};
ByteCode[ByteCode.codes.getfield] = function(fieldRef) {
	//alert("getField");
	var object = ByteCode.pop();
	var field = fieldRef.getRef();
	assert(field !== undefined);
	//debugPrintToConsole(object.getFieldByFieldInfo(field));
	//var value = object.getFieldByFieldInfo(field);
	//alert(value);
	ByteCode.push(object.getFieldByFieldInfo(field));
};
ByteCode[ByteCode.codes.getstatic] = function(field) {
	var ref = field.getRef();
	ByteCode.push(ref.getValue());
};
ByteCode[ByteCode.codes.goto_] = function(offset) {
	ByteCode.branch(3, offset);
};
ByteCode[ByteCode.codes.goto_w] = function(offset) {
	ByteCode.branch(5, offset);
};
ByteCode[ByteCode.codes.i2b] = function() {
	var int_ = ByteCode.pop();
	ByteCode.push(int_.toByte());
};
ByteCode[ByteCode.codes.i2c] = function() {
	var int_ = ByteCode.pop();
	ByteCode.push(int_.toChar());
};
ByteCode[ByteCode.codes.i2d] = function() {
	var int_ = ByteCode.pop();
	ByteCode.push(int_.toDouble());
};
ByteCode[ByteCode.codes.i2f] = function() {
	var int_ = ByteCode.pop();
	ByteCode.push(int_.toFloat());
};
ByteCode[ByteCode.codes.i2l] = function() {
	var int_ = ByteCode.pop();
	ByteCode.push(int_.toLong());
};
ByteCode[ByteCode.codes.i2s] = function() {
	var int_ = ByteCode.pop();
	ByteCode.push(int_.toShort());
};
ByteCode[ByteCode.codes.iadd] = function() {
	ByteCode.add();
};
ByteCode[ByteCode.codes.iaload] = function() {
	ByteCode.loadFromArray();
};
ByteCode[ByteCode.codes.iand] = function() {
	ByteCode.and();
};
ByteCode[ByteCode.codes.iastore] = function() {
	ByteCode.storeToArray();
};
ByteCode[ByteCode.codes.iconst_0] = function() {
	ByteCode.push(new Integer(0));
};
ByteCode[ByteCode.codes.iconst_1] = function() {
	ByteCode.push(new Integer(1));
};
ByteCode[ByteCode.codes.iconst_2] = function() {
	ByteCode.push(new Integer(2));
};
ByteCode[ByteCode.codes.iconst_3] = function() {
	ByteCode.push(new Integer(3));
};
ByteCode[ByteCode.codes.iconst_4] = function() {
	ByteCode.push(new Integer(4));
};
ByteCode[ByteCode.codes.iconst_5] = function() {
	ByteCode.push(new Integer(5));
};
ByteCode[ByteCode.codes.iconst_m1] = function() {
	ByteCode.push(new Integer(-1));
};
ByteCode[ByteCode.codes.idiv] = function() {
	ByteCode.divide();
};
ByteCode[ByteCode.codes.if_acmpeq] = function(offset) {
	var value2 = ByteCode.pop();
	var value1 = ByteCode.pop();

	if(value1.value == value2.value) {
		ByteCode.branch(3, offset);
		return;
	}
};
ByteCode[ByteCode.codes.if_acmpne] = function(offset) {
	var value2 = ByteCode.pop();
	var value1 = ByteCode.pop();

	if(value1.value != value2.value) {
		ByteCode.branch(3, offset);
		return;
	}
};
ByteCode[ByteCode.codes.if_icmpeq] = function(offset) {
	var value2 = ByteCode.pop();
	var value1 = ByteCode.pop();

	if(value1.value == value2.value) {
		ByteCode.branch(3, offset);
		return;
	}
};
ByteCode[ByteCode.codes.if_icmpne] = function(offset) {
	var value2 = ByteCode.pop();
	var value1 = ByteCode.pop();

	if(value1.value != value2.value) {
		ByteCode.branch(3, offset);
		return;
	}
};
ByteCode[ByteCode.codes.if_icmplt] = function(offset) {
	var value2 = ByteCode.pop();
	var value1 = ByteCode.pop();

	if(value1.value < value2.value) {
		ByteCode.branch(3, offset);
		return;
	}
};
ByteCode[ByteCode.codes.if_icmple] = function(offset) {
	var value2 = ByteCode.pop();
	var value1 = ByteCode.pop();

	if(value1.value <= value2.value) {
		ByteCode.branch(3, offset);
		return;
	}
};
ByteCode[ByteCode.codes.if_icmpgt] = function(offset) {
	var value2 = ByteCode.pop();
	var value1 = ByteCode.pop();

	if(value1.value > value2.value) {
		ByteCode.branch(3, offset);
		return;
	}
};
ByteCode[ByteCode.codes.if_icmpeq] = function(offset) {
	var value2 = ByteCode.pop();
	var value1 = ByteCode.pop();

	if(value1.value >= value2.value) {
		ByteCode.branch(3, offset);
		return;
	}
};
ByteCode[ByteCode.codes.ifeq] = function(offset) {
	var number = ByteCode.pop();

	if(number.value === 0) {
		ByteCode.branch(3, offset);
		return;
	}
};
ByteCode[ByteCode.codes.ifne] = function(offset) {
	var number = ByteCode.pop();

	if(number.value !== 0) {
		ByteCode.branch(3, offset);
		return;
	}
};
ByteCode[ByteCode.codes.iflt] = function(offset) {
	var number = ByteCode.pop();

	if(number.value < 0) {
		ByteCode.branch(3, offset);
	}
};
ByteCode[ByteCode.codes.ifle] = function(offset) {
	var number = ByteCode.pop();

	if(number.value <= 0) {
		ByteCode.branch(3, offset);
		return;
	}
};
ByteCode[ByteCode.codes.ifgt] = function(offset) {
	var number = ByteCode.pop();

	if(number.value > 0) {
		ByteCode.branch(3, offset);
		return;
	}
};
ByteCode[ByteCode.codes.ifge] = function(offset) {
	var number = ByteCode.pop();

	if(number.value >= 0) {
		ByteCode.branch(3, offset);
		return;
	}
};
ByteCode[ByteCode.codes.ifnonnull] = function(offset) {
	var number = ByteCode.pop();
	if(number !== null) {
		ByteCode.branch(3, offset);
		return;
	}
};
ByteCode[ByteCode.codes.ifnull] = function(offset) {
	var number = ByteCode.pop();

	if(number === null) {
		ByteCode.branch(3, offset);
		return;
	}
};
ByteCode[ByteCode.codes.iinc] = function(index, constant) {
	var currentValue = ByteCode.getLocal(index);
	ByteCode.setLocal(index, new Integer(currentValue.value + constant));
};
ByteCode[ByteCode.codes.iload] = function(index) {
	ByteCode.loadFromLocal(index);
};
ByteCode[ByteCode.codes.iload_0] = function() {
	ByteCode.loadFromLocal(0);
};
ByteCode[ByteCode.codes.iload_1] = function() {
	ByteCode.loadFromLocal(1);
};
ByteCode[ByteCode.codes.iload_2] = function() {
	ByteCode.loadFromLocal(2);
};
ByteCode[ByteCode.codes.iload_3] = function() {
	ByteCode.loadFromLocal(3);
};
ByteCode[ByteCode.codes.imul] = function() {
	ByteCode.multiply();
};
ByteCode[ByteCode.codes.ineg] = function() {
	ByteCode.negate();
};
ByteCode[ByteCode.codes.instanceof_] = function(className) {
	var objectRef = ByteCode.pop();

	if(objectRef === null) {
		ByteCode.push(new Integer(0));
		return;
	}

	if(objectRef.isA(className))
		ByteCode.push(new Integer(1));
	else
		ByteCode.push(new Integer(0));
};
ByteCode[ByteCode.codes.invokeinterface] = function(methodRef, count) {//Count used for historical reasons
	debugPrintToConsole(methodRef.toString());
	var nameAndDescriptor = methodRef.nameAndType;
	//Parse the descriptor to get a MethodDescriptor
	var method = parseMethodDescriptor(nameAndDescriptor.descriptor);
	var numOfArgs = method.args.length;
	
	debugPrintToConsole(method.toString());
	//save the arguments for stack popping
	//Pop the needed arguments off the stack
	var args = [];
	for(var i = 0; i < numOfArgs; i++) {
		args.push(ByteCode.pop());
		debugPrintToConsole("ARG at " + i + ": " + args[i]);
	}

	//Pop the object reference off the stack
	var objectRef = ByteCode.pop();
	//debugPrintToConsole(objectRef);
	if(objectRef === null) {
		alert("YUP, NPE");
		ByteCode.throwException("NullPointerException");
		return;
	}

	args.push(objectRef);
	
	//Get the methodInfo object from the reference and push it on the arguments
	var methodInfo = methodRef.getRef();

	//Check to make sure it found a methodinfo
	if(methodInfo === undefined) {
		alert(methodRef.toString());
		ByteCode.throwException("AbstractMethodError");
		return;
	}

	args.push(methodInfo);

	//Call createResume because I have to and call the method
	MethodRun.createResume();
	MethodRun.createCall.apply(null, args.reverse());
};
/**
 * Invokespecial can be used to invoke:
 * * Instance initialization method <init>
 * * Private method of "this"
 * * A method in a superclass of "this"
 */
ByteCode[ByteCode.codes.invokespecial] = function(methodRef) {
	//;)
	ByteCode[ByteCode.codes.invokeinterface](methodRef, 0);
};
ByteCode[ByteCode.codes.invokestatic] = function(methodRef) {
	var nameAndDescriptor = methodRef.nameAndType;
	//Parse the descriptor to get a MethodDescriptor
	var method = parseMethodDescriptor(nameAndDescriptor.descriptor);
	var numOfArgs = method.args.length;
	//save the arguments for stack popping

	//Pop the needed arguments off the stack
	var args = [];
	for(var i = 0; i < numOfArgs; i++) {
		args.push(ByteCode.pop());
	}

	//Get the methodInfo object from the reference and push it on the arguments
	var methodInfo = methodRef.getRef();

	//Check to make sure it found a methodinfo
	if(methodInfo === undefined) {
		alert(methodRef.toString());
		ByteCode.throwException("AbstractMethodError");
		return;
	}

	args.push(methodInfo);

	//Call createResume because I have to and call the method
	MethodRun.createResume();
	MethodRun.createCall.apply(null, args.reverse());
};
ByteCode[ByteCode.codes.invokevirtual] = function(methodRef) {
	//;)
	ByteCode[ByteCode.codes.invokeinterface](methodRef, 0);
};
ByteCode[ByteCode.codes.ior] = function() {
	ByteCode.or();
};
ByteCode[ByteCode.codes.irem] = function() {
	ByteCode.rem();
};
ByteCode[ByteCode.codes.ireturn] = function() {
	ByteCode.return_();
};
ByteCode[ByteCode.codes.ishl] = function() {
	ByteCode.shiftLeft(0x1F);
};
ByteCode[ByteCode.codes.ishr] = function() {
	ByteCode.shiftRight(0x1F);
};
ByteCode[ByteCode.codes.istore] = function(index) {
	ByteCode.storeToLocal(index);
};
ByteCode[ByteCode.codes.istore_0] = function() {
	ByteCode.storeToLocal(0);
};
ByteCode[ByteCode.codes.istore_1] = function() {
	ByteCode.storeToLocal(1);
};
ByteCode[ByteCode.codes.istore_2] = function() {
	ByteCode.storeToLocal(2);
};
ByteCode[ByteCode.codes.istore_3] = function() {
	ByteCode.storeToLocal(3);
};
ByteCode[ByteCode.codes.isub] = function() {
	ByteCode.subtract();
};
ByteCode[ByteCode.codes.iushr] = function() {
	ByteCode.shiftRight(0x1F);
};
ByteCode[ByteCode.codes.ixor] = function() {
	xor();
};
ByteCode[ByteCode.codes.jsr] = function(offset) {
	//push return address on stack
	MethodRun.createResume();

	//Execute from = Current - sizeofJSR(3) + offset
	PC = PC - 3 + offset;
	return;

};
ByteCode[ByteCode.codes.jsr_w] = function(offset) {
	//push return address on stack
	MethodRun.createResume();

	//Execute from = Current - sizeofJSR(5) + offset
	PC = PC - 5 + offset;
};
ByteCode[ByteCode.codes.l2d] = function() {
	var long_ = ByteCode.pop();
	ByteCode.push(long_.toDouble());
};
ByteCode[ByteCode.codes.l2f] = function() {
	var long_ = ByteCode.pop();
	ByteCode.push(long_.toFloat());
};
ByteCode[ByteCode.codes.l2i] = function() {
	var long_ = ByteCode.pop();
	ByteCode.push(long_.toInteger());
};
ByteCode[ByteCode.codes.ladd] = function() {
	ByteCode.add();
};
ByteCode[ByteCode.codes.laload] = function() {
	ByteCode.loadFromArray();
};
ByteCode[ByteCode.codes.land] = function() {
	ByteCode.and();
};
ByteCode[ByteCode.codes.lastore] = function() {
	ByteCode.storeToArray();
};
ByteCode[ByteCode.codes.lcmp] = function() {
	ByteCode.cmpg();
};
ByteCode[ByteCode.codes.lconst_0] = function() {
	ByteCode.push(new Long.fromInt(0));
};
ByteCode[ByteCode.codes.lconst_1] = function() {
	ByteCode.push(new Long.fromInt(1));
};
ByteCode[ByteCode.codes.ldc] = function(constant) {
	if(constant.tag == ConstantPoolInfo.tags.INTEGER) {
		ByteCode.push(constant.value);
	}
	if(constant.tag == ConstantPoolInfo.tags.FLOAT) {
		ByteCode.push(constant.value);
	}
	if(constant.tag == ConstantPoolInfo.tags.STRING) {
		//ConstantPoolInfo
		// /alert(constant.string);
		ByteCode.push(getJavaString(constant.string));
	}
	if(constant.tag == ConstantPoolInfo.tags.CLASS) {
		ByteCode.push(getJavaString(constant.name));
	}
};
ByteCode[ByteCode.codes.ldc_w] = function(constant) {
	if(constant.tag == ConstantPoolInfo.tags.INTEGER) {
		ByteCode.push(constant.value);
		return;
	}
	if(constant.tag == ConstantPoolInfo.tags.FLOAT) {
		ByteCode.push(constant.value);
		return;
	}
	if(constant.tag == ConstantPoolInfo.tags.STRING) {
		//ConstantPoolInfo
		ByteCode.push(getJavaString(constant.string));
		return;
	}
	if(constant.tag == ConstantPoolInfo.tags.CLASS) {
		ByteCode.push(getJavaString(constant.name));
		return;
	}
};
ByteCode[ByteCode.codes.ldc2_w] = function(constant) {
	if(constant.tag == ConstantPoolInfo.tags.LONG) {
		ByteCode.push(constant.value);
		return;
	}
	if(constant.tag == ConstantPoolInfo.tags.DOUBLE) {
		ByteCode.push(constant.value);
		return;
	}
};
ByteCode[ByteCode.codes.ldiv] = function() {
	ByteCode.divide();
};
ByteCode[ByteCode.codes.lload] = function(index) {
	ByteCode.loadFromLocal(index);
};
ByteCode[ByteCode.codes.lload_0] = function() {
	ByteCode.loadFromLocal(0);
};
ByteCode[ByteCode.codes.lload_1] = function() {
	ByteCode.loadFromLocal(1);
};
ByteCode[ByteCode.codes.lload_2] = function() {
	ByteCode.loadFromLocal(2);
};
ByteCode[ByteCode.codes.lload_3] = function() {
	ByteCode.loadFromLocal(3);
};
ByteCode[ByteCode.codes.lmul] = function() {
	ByteCode.multiply();
};
ByteCode[ByteCode.codes.lneg] = function() {
	ByteCode.negate();
};
ByteCode[ByteCode.codes.lookupswitch] = function(length, default_, npairs, matches) {
	var key = ByteCode.pop().value;

	//Set the offset to default, if a match is found it will be replaced.
	var offset = default_;
	for(var i = 0; i < npairs; i++) {
		if(matches[i].match < key) {
			break;
		}
		if(matches[i].match == key) {
			offset = matches[i].offset;
			break;
		}
	}

	//Offset now has the value for the next bytecode
	PC = PC - length + offset;

	return;
}
ByteCode[ByteCode.codes.lor] = function() {
	ByteCode.or();
};
ByteCode[ByteCode.codes.lrem] = function() {
	ByteCode.rem();
};
ByteCode[ByteCode.codes.lreturn] = function() {
	ByteCode.return_();
};
ByteCode[ByteCode.codes.lshl] = function() {
	ByteCode.shiftLeft(0x3F);
};
ByteCode[ByteCode.codes.lshr] = function() {
	ByteCode.shiftRight(0x3F);
};
ByteCode[ByteCode.codes.lstore] = function(index) {
	ByteCode.storeToLocal(index);
};
ByteCode[ByteCode.codes.lstore_0] = function() {
	ByteCode.storeToLocal(0);
};
ByteCode[ByteCode.codes.lstore_1] = function() {
	ByteCode.storeToLocal(1);
};
ByteCode[ByteCode.codes.lstore_2] = function() {
	ByteCode.storeToLocal(2);
};
ByteCode[ByteCode.codes.lstore_3] = function() {
	ByteCode.storeToLocal(3);
};
ByteCode[ByteCode.codes.lsub] = function() {
	ByteCode.subtract();
};
ByteCode[ByteCode.codes.lushr] = function() {
	ByteCode.shiftRight(0x3F);
};
ByteCode[ByteCode.codes.lxor] = function() {
	ByteCode.xor();
};
ByteCode[ByteCode.codes.monitorenter] = function() {
};
ByteCode[ByteCode.codes.monitorexit] = function() {
};
ByteCode[ByteCode.codes.multianewarray] = function(index, numberOfDimensions) {
	var baseArray = new JavaArray();

	//TODO: FInish this
};
ByteCode[ByteCode.codes.new_] = function(className) {
	var classInfo = Class.getClass(className);
	var object = classInfo.getInstantiation();
	ByteCode.push(classInfo.getInstantiation());
};
ByteCode[ByteCode.codes.newarray] = function(atype) {
	//atype might be needed not sure
	var count = ByteCode.pop().value;

	if(count < 0) {
		ByteCode.throwException("NegativeArraySizeException");
		return;
	}

	ByteCode.push(new JavaArray(Data.type.PRIMITIVE, ArrayType.type[atype], 1, count));
};

ArrayType.type = {
	4 : Data.type.BOOLEAN,
	5 : Data.type.CHAR,
	6 : Data.type.FLOAT,
	7 : Data.type.DOUBLE,
	8 : Data.type.BYTE,
	9 : Data.type.SHORT,
	10 : Data.type.INT,
	11 : Data.type.LONG
};

ByteCode[ByteCode.codes.pop] = function() {
	ByteCode.pop();
};
/**Used for longer variables but our implementation doesn't care **/
ByteCode[ByteCode.codes.pop2] = function() {
	ByteCode.pop();
	ByteCode.pop();
};
ByteCode[ByteCode.codes.putfield] = function(fieldRef) { //This doesn't work
	var value = ByteCode.pop();
	var objectRef = ByteCode.pop();
	objectRef.setFieldByFieldInfo(fieldRef.getRef(), value);
};
ByteCode[ByteCode.codes.putstatic] = function(fieldRef) {
	var field = fieldRef.getRef();
	var newValue = ByteCode.pop();
	field.setValue(newValue);
};
ByteCode[ByteCode.codes.ret] = function(index) {
	var newPC = ByteCode.getLocal(index);

	//'Jump' :)
	PC = newPC.value;

	//Do jump
};
ByteCode[ByteCode.codes.return_] = function() {
	ByteCode.returnFromVoid();
};
ByteCode[ByteCode.codes.saload] = function() {
	ByteCode.loadFromArray(StackElement.types.short_);
};
ByteCode[ByteCode.codes.sastore] = function() {
	ByteCode.storeToArray();
};
ByteCode[ByteCode.codes.sipush] = function(byteValue) {
	ByteCode.push(new Short(byteValue));
};
ByteCode[ByteCode.codes.swap] = function() {
	var value1 = ByteCode.pop();
	var value2 = ByteCode.pop();
	ByteCode.push(value1);
	ByteCode.push(value2);
};
ByteCode[ByteCode.codes.tableswitch] = function(length, default_, low, high, offsets) {
	var index = ByteCode.pop().value;
	//Value of an integer

	//Set the offset to default, if the index is within the bounds get the offset
	var offset = default_;
	if(index >= low || index <= high) {
		offset = offsets[index - low];
	}

	//Offset now has the value for the next bytecode
	PC = PC - length + offset;

};
ByteCode[ByteCode.codes.wide] = function(opcode, index, constant) {
	//If form 2
	if(opcode == ByteCode.codes.iinc) {
		ByteCode[opcode](index, constant);
		return;
	} else {
		ByteCode[opcode](index);
		return;
	}
};
