/**
 * Contains helper functions for creating ConstantPoolFactories for testing.
 */
define(['Util/util', '../test/MockJavaClassReader', 'vm/ConstantPool/ConstantPoolFactory', 'vm/Enum', 'vm/Primitives'],
  function(Util, MockJavaClassReader, ConstantPoolFactory, Enum, Primitives) {
    "use strict";

    // It's way easier to type 'cpfh' than 'ConstantPoolFactoryHelper'.
    var cpfh = {};
    var cr;

    /**
     * Resets the MockJavaClassReader.
     * I know having state in here is not ideal, but... I'm lazy.
     */
    cpfh.reset = function() {
      cr = new MockJavaClassReader();
    };

    /**
     * Returns the MockJavaClassReader
     */
    cpfh.getCr = function() {
      return cr;
    };

    /**
     * Specifies the size of the CP. Note that the
     * resulting CP size is going to be numItems+1,
     * since the JVM reserves the 0th spot in the
     * ConstantPool to represent 'undefined'.
     */
    cpfh.initCp = function(numItems) {
      cr.addField('u2', numItems+1);
    };

    /**
     * Creates a CONSTANT_Utf8_info struct with
     * the given value.
     */
    cpfh.makeUTF8 = function(val) {
      cr.addField('u1', 1, 'tag');
      cr.addField('u2', val.length, 'length');
      cr.addField('utf8', val, 'bytes');
    };

    cpfh.testUtf8 = function(cp, idx, value) {
      var cpItem = cp.get(idx);
      expect(cpItem.getTag()).toBe(Enum.constantPoolTag.UTF8);
      expect(cpItem.getValue()).toBe(value);
      expect(cp.getUTF8Info(idx)).toBe(value);
    };

    /**
     * Creates a CONSTANT_Integer_info struct with
     * the given value.
     */
    cpfh.makeInt = function(val) {
      cr.addField('u1', 3, 'tag');
      cr.addField('i4', val, 'bytes');
    };

    cpfh.testNumber = function(tag, cp, idx, theValue) {
      var cpItem = cp.get(idx);
      expect(cpItem.getTag()).toBe(tag);
      expect(cpItem.getValue().value).toBe(theValue);
    };

    cpfh.testInt = function(cp, idx, theValue) {
      cpfh.testNumber(Enum.constantPoolTag.INTEGER, cp, idx, theValue);
    };

    /**
     * Creates a CONSTANT_Float_info struct with
     * the given value.
     */
    cpfh.makeFloat = function(val) {
      cr.addField('u1', 4, 'tag');
      cr.addField('float', val, 'bytes');
    };

    cpfh.testFloat = function(cp, idx, theValue) {
      cpfh.testNumber(Enum.constantPoolTag.FLOAT, cp, idx, theValue);
    };

    /**
     * Creates a CONSTANT_Double_info struct with
     * the given value.
     */
    cpfh.makeDouble = function(val) {
      cr.addField('u1', 6, 'tag');
      cr.addField('double', val);
    };

    cpfh.testDouble = function(cp, idx, val) {
      var cpItem = cp.get(idx);
      expect(cpItem.getTag()).toBe(Enum.constantPoolTag.DOUBLE);
      expect(cpItem.getValue().value).toBe(val);
      cpfh.shouldThrow(cp, 'get', idx+1);
    };

    /**
     * Creates a CONSTANT_String_info struct that
     * references the CONSTANT_Utf8_info struct at
     * the given index in the constant pool.
     */
    cpfh.makeString = function(utf8Index) {
      cr.addField('u1', 8, 'tag');
      cr.addField('u2', utf8Index, 'string_index');
    };

    cpfh.testString = function(cp, idx, value) {
      var cpItem = cp.get(idx);
      expect(cpItem.getTag()).toBe(Enum.constantPoolTag.STRING);
      expect(cpItem.getString()).toBe(value);
    };

    /**
     * Creates a CONSTANT_Long_info struct with the
     * given value.
     */
    cpfh.makeLong = function(val) {
      cr.addField('u1', 5);
      cr.addField('long', val, 'value');
    };

    cpfh.testLong = function(cp, idx, val) {
      var cpItem = cp.get(idx);
      expect(cpItem.getTag()).toBe(Enum.constantPoolTag.LONG);
      expect(cpItem.getValue().equals(Primitives.getLongFromNumber(val))).toBe(true);
      cpfh.shouldThrow(cp, 'get', idx+1);
    };

    /**
     * Creates a CONSTANT_Class_info struct with the
     * given value.
     */
    cpfh.makeClass = function(nameIndex) {
      cr.addField('u1', 7);
      cr.addField('u2', nameIndex);
    };

    cpfh.testClass = function(cp, idx, className) {
      var cpItem = cp.get(idx);
      expect(cpItem.getTag()).toBe(Enum.constantPoolTag.CLASS);
      expect(cpItem.getName()).toBe(className);
      expect(cp.getClassInfo(idx)).toBe(className);
    };

    /**
     * Creates the 'ref' type with the given tag.
     */
    cpfh._makeRefType = function(tagNum, classIndex, natIndex) {
      cr.addField('u1', tagNum);
      cr.addField('u2', classIndex);
      cr.addField('u2', natIndex);
    };

    cpfh._testRefType = function(tagNum, cp, idx, natIdx, className) {
      var cpItem = cp.get(idx);
      expect(cpItem.getTag()).toBe(tagNum);
      expect(cpItem.nameAndType).toBe(cp.get(natIdx));
      expect(cpItem.className).toBe(className);
    };

    /**
     * Creates a CONSTANT_Fieldref_info struct with that
     * references a CONSTANT_Class_info struct at the
     * given index, and a CONSTANT_NameAndType_info struct
     * at the given index.
     */
    cpfh.makeFieldref = function(classIndex, natIndex) {
      cpfh._makeRefType(9, classIndex, natIndex);
    };

    cpfh.testFieldref = function(cp, idx, natIdx, className) {
      cpfh._testRefType(Enum.constantPoolTag.FIELDREF, cp, idx, natIdx, className);
    };

    /**
     * A version of 'makeFieldref' that generates all dependent
     * constant pool items.
     */
    cpfh.enhancedMakeFieldref = function(className, fieldName, fieldDesc, extraSlots) {
      extraSlots = extraSlots === undefined ? 0 : extraSlots;

      cpfh.reset();

      cpfh.initCp(6+extraSlots);
      cpfh.makeUTF8(className); //1
      cpfh.makeUTF8(fieldName); //2
      cpfh.makeUTF8(fieldDesc); //3
      cpfh.makeClass(1); //4
      cpfh.makeNat(2, 3); //5
      cpfh.makeFieldref(4, 5); //6
    };

    /**
     * Creates a CONSTANT_Methodref_info struct with that
     * references a CONSTANT_Class_info struct at the
     * given index, and a CONSTANT_NameAndType_info struct
     * at the given index.
     */
    cpfh.makeMethodref = function(classIndex, natIndex) {
      cpfh._makeRefType(10, classIndex, natIndex);
    };

    cpfh.testMethodref = function(cp, idx, natIdx, className) {
      cpfh._testRefType(Enum.constantPoolTag.METHODREF, cp, idx, natIdx, className);
    };

    /**
     * A version of 'makeMethodref' that generates all dependent
     * constant pool items automatically.
     */
    cpfh.enhancedMakeMethodref = function(className, methodName, methodDesc, extraSlots) {
      extraSlots = extraSlots === undefined ? 0 : extraSlots;

      cpfh.reset();

      cpfh.initCp(6+extraSlots);
      cpfh.makeUTF8(className); //1
      cpfh.makeUTF8(methodName); //2
      cpfh.makeUTF8(methodDesc); //3
      cpfh.makeClass(1); //4
      cpfh.makeNat(2, 3); //5
      cpfh.makeMethodref(4, 5); //6
    };

    /**
     * Creates a CONSTANT_InterfaceMethodref_info struct with that
     * references a CONSTANT_Class_info struct at the
     * given index, and a CONSTANT_NameAndType_info struct
     * at the given index.
     */
    cpfh.makeInterfaceMethodref = function(classIndex, natIndex) {
      cpfh._makeRefType(11, classIndex, natIndex);
    };

    cpfh.testInterfaceMethodref = function(cp, idx, natIdx, className) {
      cpfh._testRefType(Enum.constantPoolTag.INTERFACEMETHODREF, cp, idx, natIdx, className);
    };

    /**
     * A version of 'makeInterfaceMethodref' that generates all dependent
     * constant pool items automatically.
     */
    cpfh.enhancedMakeInterfaceMethodref = function(className, methodName, methodDesc, extraSlots) {
      extraSlots = extraSlots === undefined ? 0 : extraSlots;

      cpfh.reset();

      cpfh.initCp(6+extraSlots);
      cpfh.makeUTF8(className); //1
      cpfh.makeUTF8(methodName); //2
      cpfh.makeUTF8(methodDesc); //3
      cpfh.makeClass(1); //4
      cpfh.makeNat(2, 3); //5
      cpfh.makeInterfaceMethodref(4, 5); //6
    };

    /**
     * Creates a CONSTANT_NameAndType_info struct with
     * the name given in a CONSTANT_Utf8_info struct at
     * the given index, and a descriptor in a
     * CONSTANT_Utf8_info struct at the given index.
     */
    cpfh.makeNat = function(nameIndex, descriptorIndex) {
      cr.addField('u1', 12);
      cr.addField('u2', nameIndex);
      cr.addField('u2', descriptorIndex);
    };

    cpfh.testNat = function(cp, idx, name, desc) {
      var cpItem = cp.get(idx);
      expect(cpItem.getTag()).toBe(Enum.constantPoolTag.NAMEANDTYPE);
      expect(cpItem.getName()).toBe(name);
      expect(cpItem.getDescriptor()).toBe(desc);
    };

    /**
     * Creates a CONSTANT_MethodHandle_info struct with
     * the given reference kind to the constant pool item
     * at the given index.
     */
    cpfh.makeMethodHandle = function(referenceKind, referenceIndex) {
      cr.addField('u1', Enum.constantPoolTag.METHODHANDLE);
      cr.addField('u1', referenceKind);
      cr.addField('u2', referenceIndex);
    };

    cpfh.testMethodHandle = function(cp, idx, referenceKind, referenceIndex) {
      var cpItem = cp.get(idx);
      expect(cpItem.getTag()).toBe(Enum.constantPoolTag.METHODHANDLE);
      expect(cpItem.getReferenceKind()).toBe(referenceKind);
      expect(cpItem.getReference()).toBe(cp.get(referenceIndex));
    };

    /**
     * Creates a CONSTANT_MethodType_info struct with the
     * descriptor from a CONSTANT_Utf8_info struct found
     * at the specified index in the constant pool.
     */
    cpfh.makeMethodType = function(descriptorIdx) {
      cr.addField('u1', Enum.constantPoolTag.METHODTYPE);
      cr.addField('u2', descriptorIdx);
    };

    cpfh.testMethodType = function(cp, idx, desc) {
      var cpItem = cp.get(idx);
      expect(cpItem.getTag()).toBe(Enum.constantPoolTag.METHODTYPE);
      expect(cpItem.getDescriptor().toString()).toBe(desc);
    };

    /**
     * Creates a CONSTANT_InvokeDynamic_info struct with
     * the given index into the class's bootstrap_methods table
     * and the name and type info found at the given index into
     * the constant pool.
     */
    cpfh.makeInvokeDynamic = function(bootstrapIdx, natIdx) {
      cr.addField('u1', Enum.constantPoolTag.INVOKEDYNAMIC);
      cr.addField('u2', bootstrapIdx);
      cr.addField('u2', natIdx);
    };

    cpfh.testInvokeDynamic = function(cp, idx, bootstrapIdx, natIdx) {
      var cpItem = cp.get(idx);
      expect(cpItem.getTag()).toBe(Enum.constantPoolTag.INVOKEDYNAMIC);
      expect(cpItem._bootstrapMethodAttrIndex).toBe(bootstrapIdx);
      expect(cpItem.nameAndType).toBe(cp.get(natIdx));
    };

    /**
     * Constructs and returns the ConstantPool constructed using the
     * MockJavaClassReader.
     */
    cpfh.getCp = function() {
      return ConstantPoolFactory.parseConstantPool(cr);
    };

    /**
     * Takes in an object, a member function, and its arguments.
     * Tests that running the member function on the object with the specified arguments
     * throws an exception.
     */
    cpfh.shouldThrow = function(object, fcnName) {
      var args = Array.prototype.slice.apply(arguments);
      expect(function() { object[fcnName].apply(object, args.slice(2)); }).toThrow();
    };

    /**
     * SAMPLE CONSTANT POOL
     * Below, we construct a sample constant pool with the given sample data.
     * This sample pool contains at least 1 of every constant pool item.
     **/
    cpfh.sampleClassName = "UnitTests/BabyMaker";
    cpfh.sampleFieldName = "babies";
    cpfh.sampleFieldDescriptor = "I";
    cpfh.sampleMethodName = "makeBabies";
    cpfh.sampleMethodDescriptor = "()V";
    cpfh.sampleInterfaceName = "UnitTests/Maker";
    cpfh.sampleInterfaceMethodName = "make";
    cpfh.sampleInterfaceMethodDescriptor = "(B)C";
    cpfh.sampleString = "lol BabyMaker, that's funny";
    cpfh.sampleInt = 3;
    cpfh.sampleFloat = 4.3;
    cpfh.sampleLong = 23232323;
    cpfh.sampleDouble = 1.323232;
    cpfh.sampleUTF8Idx = 1;
    cpfh.sampleUTF8Text = cpfh.sampleClassName;
    cpfh.sampleIntIdx = 10;
    cpfh.sampleFloatIdx = 11;
    cpfh.sampleLongIdx = 12;
    cpfh.sampleDoubleIdx = 14;
    cpfh.sampleClassIdx = 16;
    cpfh.sampleInterfaceIdx = 17;
    cpfh.sampleStringIdx = 18;
    cpfh.sampleFieldrefNatIdx = 19;
    cpfh.sampleMethodrefNatIdx = 20;
    cpfh.sampleInterfaceMethodrefNatIdx = 21;
    cpfh.sampleFieldrefIdx = 22;
    cpfh.sampleMethodrefIdx = 23;
    cpfh.sampleInterfaceMethodrefIdx = 24;
    cpfh.sampleCpSize = 28;
    cpfh.sampleMethodHandleIdx = 25;
    cpfh.sampleMethodTypeIdx = 26;
    cpfh.sampleInvokeDynamicIdx = 27;

    /**
     * Adds data to the class reader to build
     * a comprehensive sample constant pool.
     * emptySlots is the number of extra slots that
     * we should allocate into the constant pool.
     */
    cpfh.sampleCp = function(emptySlots) {
      cpfh.initCp(27 + emptySlots);

      //We'll place all of the constants on top.
      cpfh.makeUTF8(cpfh.sampleClassName); //1
      cpfh.makeUTF8(cpfh.sampleFieldName); //2
      cpfh.makeUTF8(cpfh.sampleFieldDescriptor); //3
      cpfh.makeUTF8(cpfh.sampleMethodName); //4
      cpfh.makeUTF8(cpfh.sampleMethodDescriptor); //5
      cpfh.makeUTF8(cpfh.sampleInterfaceName); //6
      cpfh.makeUTF8(cpfh.sampleInterfaceMethodName); //7
      cpfh.makeUTF8(cpfh.sampleInterfaceMethodDescriptor); //8
      cpfh.makeUTF8(cpfh.sampleString); //9
      cpfh.makeInt(cpfh.sampleInt); //10
      cpfh.makeFloat(cpfh.sampleFloat); //11
      cpfh.makeLong(cpfh.sampleLong); //12+13
      cpfh.makeDouble(cpfh.sampleDouble); //14+15

      //These guys reference the cp items above.
      cpfh.makeClass(1); //16
      cpfh.makeClass(6); //17
      cpfh.makeString(9); //18
      cpfh.makeNat(2, 3); //19
      cpfh.makeNat(4, 5); //20
      cpfh.makeNat(7, 8); //21

      //These guys reference everything above. Yay.
      cpfh.makeFieldref(16, 19); //22
      cpfh.makeMethodref(16, 20); //23
      cpfh.makeInterfaceMethodref(17, 21); //24

      cpfh.makeMethodHandle(Enum.referenceKind.GETFIELD, 22); //25
      cpfh.makeMethodType(5); //26
      cpfh.makeInvokeDynamic(3, 20); //27
    };

    return cpfh;
  }
);