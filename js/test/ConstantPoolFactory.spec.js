/**
 * Contains unit tests for the ConstantPoolFactory class, which is
 * responsible for parsing out ConstantPool items.
 *
 * lol this is a long class. I should break this up into submodules at some point,
 * with a module devoted solely to helper functions...
 */
define(['vm/ConstantPool/ConstantPoolFactory', '../test/MockJavaClassReader', 'vm/Enum', 'vm/Primitives'],
  function(ConstantPoolFactory, MockJavaClassReader, Enum, Primitives) {
    var cr,
    /** HELPER FUNCTIONS **/
      /**
       * Run before every test. Resets the class reader.
       */
      reset = function() {
        cr = new MockJavaClassReader();
      },
      /**
       * Specifies the size of the CP. Note that the
       * resulting CP size is going to be numItems+1,
       * since the JVM reserves the 0th spot in the
       * ConstantPool to represent 'undefined'.
       */
      initCp = function(numItems) {
        cr.addField('u2', numItems+1);
      },
      /**
       * Creates a CONSTANT_Utf8_info struct with
       * the given value.
       */
      makeUTF8 = function(val) {
        cr.addField('u1', 1, 'tag');
        cr.addField('u2', val.length, 'length');
        cr.addField('utf8', val, 'bytes');
      },
      testUtf8 = function(cp, idx, value) {
        var cpItem = cp.get(idx);
        expect(cpItem.getTag()).toBe(Enum.constantPoolTag.UTF8);
        expect(cpItem.getValue()).toBe(value);
        expect(cp.getUTF8Info(idx)).toBe(value);
      },
      /**
       * Creates a CONSTANT_Integer_info struct with
       * the given value.
       */
      makeInt = function(val) {
        cr.addField('u1', 3, 'tag');
        cr.addField('i4', val, 'bytes');
      },
      testNumber = function(tag, cp, idx, theValue) {
        var cpItem = cp.get(idx);
        expect(cpItem.getTag()).toBe(tag);
        expect(cpItem.getValue().value).toBe(theValue);
      },
      testInt = function(cp, idx, theValue) {
        testNumber(Enum.constantPoolTag.INTEGER, cp, idx, theValue);
      },
      /**
       * Creates a CONSTANT_Float_info struct with
       * the given value.
       */
      makeFloat = function(val) {
        cr.addField('u1', 4, 'tag');
        cr.addField('float', val, 'bytes');
      },
      testFloat = function(cp, idx, theValue) {
        testNumber(Enum.constantPoolTag.FLOAT, cp, idx, theValue);
      },
      /**
       * Creates a CONSTANT_Double_info struct with
       * the given value.
       */
      makeDouble = function(val) {
        cr.addField('u1', 6, 'tag');
        cr.addField('double', val);
      },
      testDouble = function(cp, idx, val) {
        var cpItem = cp.get(idx);
        expect(cpItem.getTag()).toBe(Enum.constantPoolTag.DOUBLE);
        expect(cpItem.getValue().value).toBe(val);
        shouldThrow(cp, 'get', idx+1);
      },
      /**
       * Creates a CONSTANT_String_info struct that
       * references the CONSTANT_Utf8_info struct at
       * the given index in the constant pool.
       */
      makeString = function(utf8Index) {
        cr.addField('u1', 8, 'tag');
        cr.addField('u2', utf8Index, 'string_index');
      },
      testString = function(cp, idx, value) {
        var cpItem = cp.get(idx);
        expect(cpItem.getTag()).toBe(Enum.constantPoolTag.STRING);
        expect(cpItem.getString()).toBe(value);
      },
      /**
       * Creates a CONSTANT_Long_info struct with the
       * given value.
       */
      makeLong = function(val) {
        cr.addField('u1', 5);
        cr.addField('long', val, 'value');
      },
      testLong = function(cp, idx, val) {
        var cpItem = cp.get(idx);
        expect(cpItem.getTag()).toBe(Enum.constantPoolTag.LONG);
        expect(cpItem.getValue().equals(Primitives.getLongFromNumber(val))).toBe(true);
        shouldThrow(cp, 'get', idx+1);
      },
      /**
       * Creates a CONSTANT_Class_info struct with the
       * given value.
       */
      makeClass = function(nameIndex) {
        cr.addField('u1', 7);
        cr.addField('u2', nameIndex);
      },
      testClass = function(cp, idx, className) {
        var cpItem = cp.get(idx);
        expect(cpItem.getTag()).toBe(Enum.constantPoolTag.CLASS);
        expect(cpItem.getName()).toBe(className);
        expect(cp.getClassInfo(idx)).toBe(className);
      },
      /**
       * Creates the 'ref' type with the given tag.
       */
      _makeRefType = function(tagNum, classIndex, natIndex) {
        cr.addField('u1', tagNum);
        cr.addField('u2', classIndex);
        cr.addField('u2', natIndex);
      },
      _testRefType = function(tagNum, cp, idx, natIdx, className) {
        var cpItem = cp.get(idx);
        expect(cpItem.getTag()).toBe(tagNum);
        expect(cpItem.nameAndType).toBe(cp.get(natIdx));
        expect(cpItem.className).toBe(className);
      },
      /**
       * Creates a CONSTANT_Fieldref_info struct with that
       * references a CONSTANT_Class_info struct at the
       * given index, and a CONSTANT_NameAndType_info struct
       * at the given index.
       */
      makeFieldref = function(classIndex, natIndex) {
        _makeRefType(9, classIndex, natIndex);
      },
      testFieldref = function(cp, idx, natIdx, className) {
        _testRefType(Enum.constantPoolTag.FIELDREF, cp, idx, natIdx, className);
      },
      /**
       * A version of 'makeFieldref' that generates all dependent
       * constant pool items.
       */
      enhancedMakeFieldref = function(className, fieldName, fieldDesc, extraSlots) {
        extraSlots = extraSlots === undefined ? 0 : extraSlots;

        reset();

        initCp(6+extraSlots);
        makeUTF8(className); //1
        makeUTF8(fieldName); //2
        makeUTF8(fieldDesc); //3
        makeClass(1); //4
        makeNat(2, 3); //5
        makeFieldref(4, 5); //6
      },
      /**
       * Creates a CONSTANT_Methodref_info struct with that
       * references a CONSTANT_Class_info struct at the
       * given index, and a CONSTANT_NameAndType_info struct
       * at the given index.
       */
      makeMethodref = function(classIndex, natIndex) {
        _makeRefType(10, classIndex, natIndex);
      },
      testMethodref = function(cp, idx, natIdx, className) {
        _testRefType(Enum.constantPoolTag.METHODREF, cp, idx, natIdx, className);
      },
      /**
       * A version of 'makeMethodref' that generates all dependent
       * constant pool items automatically.
       */
      enhancedMakeMethodref = function(className, methodName, methodDesc, extraSlots) {
        extraSlots = extraSlots === undefined ? 0 : extraSlots;

        reset();

        initCp(6+extraSlots);
        makeUTF8(className); //1
        makeUTF8(methodName); //2
        makeUTF8(methodDesc); //3
        makeClass(1); //4
        makeNat(2, 3); //5
        makeMethodref(4, 5); //6
      },
      /**
       * Creates a CONSTANT_InterfaceMethodref_info struct with that
       * references a CONSTANT_Class_info struct at the
       * given index, and a CONSTANT_NameAndType_info struct
       * at the given index.
       */
      makeInterfaceMethodref = function(classIndex, natIndex) {
        _makeRefType(11, classIndex, natIndex);
      },
      testInterfaceMethodref = function(cp, idx, natIdx, className) {
        _testRefType(Enum.constantPoolTag.INTERFACEMETHODREF, cp, idx, natIdx, className);
      },
      /**
       * A version of 'makeInterfaceMethodref' that generates all dependent
       * constant pool items automatically.
       */
      enhancedMakeInterfaceMethodref = function(className, methodName, methodDesc, extraSlots) {
        extraSlots = extraSlots === undefined ? 0 : extraSlots;

        reset();

        initCp(6+extraSlots);
        makeUTF8(className); //1
        makeUTF8(methodName); //2
        makeUTF8(methodDesc); //3
        makeClass(1); //4
        makeNat(2, 3); //5
        makeInterfaceMethodref(4, 5); //6
      },
      /**
       * Creates a CONSTANT_NameAndType_info struct with
       * the name given in a CONSTANT_Utf8_info struct at
       * the given index, and a descriptor in a
       * CONSTANT_Utf8_info struct at the given index.
       */
      makeNat = function(nameIndex, descriptorIndex) {
        cr.addField('u1', 12);
        cr.addField('u2', nameIndex);
        cr.addField('u2', descriptorIndex);
      },
      testNat = function(cp, idx, name, desc) {
        var cpItem = cp.get(idx);
        expect(cpItem.getTag()).toBe(Enum.constantPoolTag.NAMEANDTYPE);
        expect(cpItem.getName()).toBe(name);
        expect(cpItem.getDescriptor()).toBe(desc);
      },
      /**
       * Creates a CONSTANT_MethodHandle_info struct with
       * the given reference kind to the constant pool item
       * at the given index.
       */
      makeMethodHandle = function(referenceKind, referenceIndex) {
        cr.addField('u1', Enum.constantPoolTag.METHODHANDLE);
        cr.addField('u1', referenceKind);
        cr.addField('u2', referenceIndex);
      },
      testMethodHandle = function(cp, idx, referenceKind, referenceIndex) {
        var cpItem = cp.get(idx);
        expect(cpItem.getTag()).toBe(Enum.constantPoolTag.METHODHANDLE);
        expect(cpItem.getReferenceKind()).toBe(referenceKind);
        expect(cpItem.getReference()).toBe(cp.get(referenceIndex));
      },
      /**
       * Creates a CONSTANT_MethodType_info struct with the
       * descriptor from a CONSTANT_Utf8_info struct found
       * at the specified index in the constant pool.
       */
      makeMethodType = function(descriptorIdx) {
        cr.addField('u1', Enum.constantPoolTag.METHODTYPE);
        cr.addField('u2', descriptorIdx);
      },
      testMethodType = function(cp, idx, desc) {
        var cpItem = cp.get(idx);
        expect(cpItem.getTag()).toBe(Enum.constantPoolTag.METHODTYPE);
        expect(cpItem.getDescriptor().toString()).toBe(desc);
      },
      /**
       * Creates a CONSTANT_InvokeDynamic_info struct with
       * the given index into the class's bootstrap_methods table
       * and the name and type info found at the given index into
       * the constant pool.
       */
      makeInvokeDynamic = function(bootstrapIdx, natIdx) {
        cr.addField('u1', Enum.constantPoolTag.INVOKEDYNAMIC);
        cr.addField('u2', bootstrapIdx);
        cr.addField('u2', natIdx);
      },
      testInvokeDynamic = function(cp, idx, bootstrapIdx, natIdx) {
        var cpItem = cp.get(idx);
        expect(cpItem.getTag()).toBe(Enum.constantPoolTag.INVOKEDYNAMIC);
        expect(cpItem._bootstrapMethodAttrIndex).toBe(bootstrapIdx);
        expect(cpItem.nameAndType).toBe(cp.get(natIdx));
      },
      /**
       * Constructs and returns the ConstantPool constructed using the
       * MockJavaClassReader.
       */
      getCp = function() {
        return ConstantPoolFactory.parseConstantPool(cr);
      },
      /**
       * Takes in an object, a member function, and its arguments.
       * Tests that running the member function on the object with the specified arguments
       * throws an exception.
       */
      shouldThrow = function(object, fcnName) {
        var args = Array.prototype.slice.apply(arguments);
        expect(function() { object[fcnName].apply(object, args.slice(2)); }).toThrow();
      },
      /**
       * SAMPLE CONSTANT POOL
       * Below, we construct a sample constant pool with the given sample data.
       * This sample pool contains at least 1 of every constant pool item.
       **/
      sampleClassName = "UnitTests/BabyMaker",
      sampleFieldName = "babies",
      sampleFieldDescriptor = "I",
      sampleMethodName = "makeBabies",
      sampleMethodDescriptor = "()V",
      sampleInterfaceName = "UnitTests/Maker",
      sampleInterfaceMethodName = "make",
      sampleInterfaceMethodDescriptor = "(B)C",
      sampleString = "lol BabyMaker, that's funny",
      sampleInt = 3,
      sampleFloat = 4.3,
      sampleLong = 23232323,
      sampleDouble = 1.323232,
      sampleUTF8Idx = 1,
      sampleUTF8Text = sampleClassName,
      sampleIntIdx = 10,
      sampleFloatIdx = 11,
      sampleLongIdx = 12,
      sampleDoubleIdx = 14,
      sampleClassIdx = 16,
      sampleInterfaceIdx = 17,
      sampleStringIdx = 18,
      sampleFieldrefNatIdx = 19,
      sampleMethodrefNatIdx = 20,
      sampleInterfaceMethodrefNatIdx = 21,
      sampleFieldrefIdx = 22,
      sampleMethodrefIdx = 23,
      sampleInterfaceMethodrefIdx = 24,
      sampleCpSize = 28,
      sampleMethodHandleIdx = 25,
      sampleMethodTypeIdx = 26,
      sampleInvokeDynamicIdx = 27,
      /**
       * Adds data to the class reader to build
       * a comprehensive sample constant pool.
       * emptySlots is the number of extra slots that
       * we should allocate into the constant pool.
       */
      sampleCp = function(emptySlots) {
        initCp(27 + emptySlots);

        //We'll place all of the constants on top.
        makeUTF8(sampleClassName); //1
        makeUTF8(sampleFieldName); //2
        makeUTF8(sampleFieldDescriptor); //3
        makeUTF8(sampleMethodName); //4
        makeUTF8(sampleMethodDescriptor); //5
        makeUTF8(sampleInterfaceName); //6
        makeUTF8(sampleInterfaceMethodName); //7
        makeUTF8(sampleInterfaceMethodDescriptor); //8
        makeUTF8(sampleString); //9
        makeInt(sampleInt); //10
        makeFloat(sampleFloat); //11
        makeLong(sampleLong); //12+13
        makeDouble(sampleDouble); //14+15

        //These guys reference the cp items above.
        makeClass(1); //16
        makeClass(6); //17
        makeString(9); //18
        makeNat(2, 3); //19
        makeNat(4, 5); //20
        makeNat(7, 8); //21

        //These guys reference everything above. Yay.
        makeFieldref(16, 19); //22
        makeMethodref(16, 20); //23
        makeInterfaceMethodref(17, 21); //24

        makeMethodHandle(Enum.referenceKind.GETFIELD, 22); //25
        makeMethodType(5); //26
        makeInvokeDynamic(3, 20); //27
      };

    /**
     * Ensure that we can use forEach on Arrays.
     */
    if ( !Array.prototype.forEach ) {
      Array.prototype.forEach = function(fn, scope) {
        for(var i = 0, len = this.length; i < len; ++i) {
          fn.call(scope || this, this[i], i, this);
        }
      };
    }

    /** BEGIN THE TESTS :) **/

    describe("ConstantPool: Empty ConstantPool Tests",
      function() {
        beforeEach(reset);

        it("should be OK with an empty CP",
          function() {
            initCp(0);
            var cp = getCp();
            expect(cp.getLength()).toBe(1);
            expect(cp.get(0)).toBe(undefined);
            expect(cp.getUTF8Info(0)).toBe(undefined);
            expect(cp.getClassInfo(0)).toBe(undefined);
            shouldThrow(cp, 'get', 1);
            shouldThrow(cp, 'getUTF8Info', 1);
            shouldThrow(cp, 'getClassInfo', 1);
            shouldThrow(cp, 'get', 0.1);
            shouldThrow(cp, 'getUTF8Info', 0.1);
            shouldThrow(cp, 'getClassInfo', 0.1);
            shouldThrow(cp, 'get', -1);
            shouldThrow(cp, 'getUTF8Info', -1);
            shouldThrow(cp, 'getClassInfo', -1);
          }
        );
      }
    );

    describe("ConstantPool: CONSTANT_Utf8_info (§4.4.7)",
      function() {
        beforeEach(reset);

        it("should accept 1 UTF8_info struct",
          function() {
            var strings = [" ", "t", "test"];

            strings.forEach(
              function(value) {
                var cp;
                initCp(1);
                makeUTF8(value);
                cp = getCp();
                expect(cp.getLength()).toBe(2);
                expect(cp.getUTF8Info(0)).toBe(undefined);

                testUtf8(cp, 1, value);

                shouldThrow(cp, 'getClassInfo', 1);
                shouldThrow(cp, 'get', 2);
                shouldThrow(cp, 'getUTF8Info', 2);
                shouldThrow(cp, 'getClassInfo', 2);

                reset();
              }
            );
          }
        );

        it("should also be okay with 2 strings",
          function() {
            var cp, cpItem;

            initCp(2);
            makeUTF8(" ");
            makeUTF8(" hey");

            cp = getCp();
            expect(cp.getLength()).toBe(3);
            expect(cp.get(0)).toBe(undefined);

            testUtf8(cp, 1, " ");
            testUtf8(cp, 2, " hey");

            shouldThrow(cp, 'get', 3);
          }
        );
      }
    );

    describe("ConstantPool: CONSTANT_String_info (§4.4.3)",
      function() {
        beforeEach(reset);

        it("should properly handle a single string field",
          function() {
            var cp;

            initCp(2);
            makeUTF8("name");
            makeString(1);

            cp = getCp();
            testString(cp, 2, "name");
          }
        );

        it("should properly handle a single string field that references a UTF8 info item that occurs after it",
          function() {
            var cp;

            initCp(2);
            makeString(2);
            makeUTF8("lol");

            cp = getCp();
            testString(cp, 1, "lol");
            expect(cp.getLength()).toBe(3);
          }
        );

        it("should complain loudly if the UTF8 reference happens to be anything else",
          function() {
            var badIndices = [sampleIntIdx,
                            sampleFloatIdx,
                            sampleLongIdx,
                            sampleDoubleIdx,
                            sampleStringIdx,
                            sampleFieldrefNatIdx,
                            sampleMethodrefNatIdx,
                            sampleInterfaceMethodrefNatIdx,
                            sampleClassIdx,
                            sampleFieldrefIdx,
                            sampleMethodrefIdx,
                            sampleInterfaceMethodrefIdx,
                            sampleMethodHandleIdx,
                            sampleMethodTypeIdx,
                            sampleInvokeDynamicIdx];

            badIndices.forEach(function(idx) {
              sampleCp(1);
              makeString(idx);
              expect(getCp).toThrow();

              reset();
            });
          }
        );

        it("should not allow for out-of-range constant pool references",
          function() {
            //Note that negative CP indices are impossible, since
            //it's dictated by an unsigned value.
            initCp(1);
            makeString(2);
            expect(getCp).toThrow();
          }
        );
      }
    );

    describe("ConstantPool: CONSTANT_Integer_info (§4.4.4)",
      function() {
        beforeEach(reset);

        it("should properly handle integer info",
          function() {
            var values = [0, 1, -1];

            values.forEach(function(aValue) {
              initCp(1);
              makeInt(aValue);
              testInt(getCp(), 1, aValue);
              reset();
            });
          }
        );
      }
    );

    describe("ConstantPool: CONSTANT_Float_info (§4.4.4)",
      function() {
        beforeEach(reset);

        it("should properly handle float info",
          function() {
            var values = [0, 1.1, -1.1];

            values.forEach(function(aValue) {
              initCp(1);

              makeFloat(aValue);
              cp = getCp();
              testFloat(cp, 1, aValue);
              reset();
            });
          }
        );
      }
    );

    describe("ConstantPool: CONSTANT_Long_info (§4.4.5)",
      function() {
        beforeEach(reset);

        it("should properly handle long info",
          function() {
            var values = [0, 3934848484, -494949494];

            values.forEach(function(aValue) {
              var cp;
              initCp(2);
              makeLong(aValue);
              cp = getCp();
              testLong(cp, 1, aValue);
              expect(cp.getLength()).toBe(3);
              reset();
            });
          }
        );

        it("should complain if the cp is not specified with the correct size",
          function() {
            initCp(1);
            makeLong(3);
            expect(getCp).toThrow();
          }
        );

        it("should properly handle two long infos",
          function() {
            var cp;

            initCp(4);
            makeLong(4);
            makeLong(7);

            cp = getCp();
            testLong(cp, 1, 4);
            testLong(cp, 3, 7);

            expect(cp.getLength()).toBe(5);
          }
        );
      }
    );

    describe("ConstantPool: CONSTANT_Double_info (§4.4.5)",
      function() {
        beforeEach(reset);

        it("should properly handle double info",
          function() {
            var values = [0, 1.1, -1.1, 2.343432324];

            values.forEach(function(aValue) {
              var cp;
              initCp(2);
              makeDouble(aValue);
              cp = getCp();
              testDouble(cp, 1, aValue);
              expect(cp.getLength()).toBe(3);
              reset();
            });
          }
        );
      }
    );

    describe("ConstantPool: CONSTANT_Class_info (§4.4.1)",
      function() {
        beforeEach(reset);

        it("should properly accept class info items",
          function() {
            var cp;

            initCp(2);
            makeUTF8("class");
            makeClass(1);

            cp = getCp();
            testClass(cp, 2, "class");

            reset();

            initCp(2);
            makeClass(2);
            makeUTF8("class");

            cp = getCp();
            testClass(cp, 1, "class");
          }
        );

        it("should verify that the class name is a valid binary class or interface name (§4.2.1)",
          function() {
            var
              //The ONLY restriction in the spec is that the identifiers themselves do not
              //contain any of the following characters:
              // '.' ';' '[' '/'
              goodNames = ['ha/lp', 'h/a/l/p', 'h]/a]/l]/p]', 'hello good sir/give me your/ java classes '],
              badNames = ['/halp', 'halp/', 'h//a//l//p', '.halp', 'halp.', 'ha.lp', ';halp', 'halp;', 'ha;lp', '[halp', 'halp[', 'ha[lp', '/halp/['];

            goodNames.forEach(function(goodName) {
              var cp;
              initCp(2);
              makeUTF8(goodName);
              makeClass(1);

              cp = getCp();
              testClass(cp, 2, goodName);
              reset();
            });

            badNames.forEach(function(badName) {
              initCp(2);
              makeUTF8(badName);
              makeClass(1);

              expect(getCp).toThrow();
              reset();
            });
          }
        );

        it("should complain loudly if the name is not a UTF8 info",
          function() {
            var badIndices = [sampleIntIdx,
                            sampleFloatIdx,
                            sampleLongIdx,
                            sampleDoubleIdx,
                            sampleStringIdx,
                            sampleFieldrefNatIdx,
                            sampleMethodrefNatIdx,
                            sampleInterfaceMethodrefNatIdx,
                            sampleClassIdx,
                            sampleFieldrefIdx,
                            sampleMethodrefIdx,
                            sampleInterfaceMethodrefIdx,
                            sampleMethodHandleIdx,
                            sampleMethodTypeIdx,
                            sampleInvokeDynamicIdx,
                            50]; //Out of range

            badIndices.forEach(function(badIndex) {
              sampleCp(1);
              makeClass(badIndex);
              expect(getCp).toThrow();
              reset();
            });
          }
        );
      }
    );

    describe("ConstantPool: CONSTANT_NameAndType_info (§4.4.6)",
      function() {
        beforeEach(reset);

        var setupNatTest = function(name, desc) {
          reset();
          initCp(3);
          makeUTF8(name);
          makeUTF8(desc);
          makeNat(1, 2);
        };

        it("should support name and type cp items",
          function() {
            var cp,
              name = "boo",
              type = "()V";

            setupNatTest(name, type);
            cp = getCp();
            testNat(cp, 3, name, type);
          }
        );

        it("should allow for name and type for <init>, but not <clinit>",
          function() {
            var cp, cpItem,
              name = "<init>",
              type = "()V";

            setupNatTest(name, type);
            cp = getCp();
            testNat(cp, 3, name, type);
            reset();

            initCp(3);
            makeUTF8("<clinit>");
            makeUTF8("()V");
            makeNat(1, 2);
            expect(getCp).toThrow();
          }
        );

        it("should validate the name as an unqualified name",
          function() {
            //NOTE: We cannot test <>, since those are technically acceptable
            //in the case of field names.
            var badNames = [";he;lp", "he.lp", "he/lp"],
              type = "()V";

            badNames.forEach(function(badName) {
              setupNatTest(badName, type);
              expect(getCp).toThrow();
            });
          }
        );

        it("should complain if name and/or type is not UTF8",
          function() {
            var badIndices = [sampleIntIdx,
                            sampleFloatIdx,
                            sampleLongIdx,
                            sampleDoubleIdx,
                            sampleStringIdx,
                            sampleFieldrefNatIdx,
                            sampleMethodrefNatIdx,
                            sampleInterfaceMethodrefNatIdx,
                            sampleClassIdx,
                            sampleFieldrefIdx,
                            sampleMethodrefIdx,
                            sampleInterfaceMethodrefIdx,
                            50]; //Out of range

            badIndices.forEach(function(badIndex1) {
              sampleCp(2);
              makeUTF8("()V");
              makeNat(badIndex1, sampleCpSize);
              expect(getCp).toThrow();
              reset();

              sampleCp(2);
              makeUTF8("test");
              makeNat(sampleCpSize, badIndex1);
              expect(getCp).toThrow();
              reset();

              //Yo, dawg...
              badIndices.forEach(function(badIndex2) {
                sampleCp(1);
                makeNat(badIndex1, badIndex2);
                expect(getCp).toThrow();
                reset();
              });
            });
          }
        );
      }
    );

    describe("ConstantPool: CONSTANT_Fieldref_info (§4.4.2)",
      function() {
        beforeEach(reset);

        it("should accept a fieldref",
          function() {
            var cp,
              className = "byorg",
              fieldName = "blargh",
              fieldDesc = "B";

            enhancedMakeFieldref(className, fieldName, fieldDesc);

            cp = getCp();
            testFieldref(cp, 6, 5, className);
          }
        );

        it("should not accept fieldrefs with invalid field descriptors",
          function() {
            var cp, cpItem,
              className = "byorg",
              fieldName = "blargh",
              fieldDesc = 'A',
              i;

            //We don't do comprehensive field descriptor testing here.
            //That is tested elsewhere.
            //We just want to verify that that existing verification code is
            //being used.

            enhancedMakeFieldref(className, fieldName, fieldDesc);
            expect(getCp).toThrow();
          }
        );

        it("should complain loudly if the class and/or name and type indices point to cp items with different types",
          function() {
            var cp, i, j,
              badClassIndices = [sampleIntIdx,
                            sampleFloatIdx,
                            sampleLongIdx,
                            sampleDoubleIdx,
                            sampleStringIdx,
                            sampleFieldrefNatIdx,
                            sampleMethodrefNatIdx,
                            sampleInterfaceMethodrefNatIdx,
                            sampleUTF8Idx,
                            sampleFieldrefIdx,
                            sampleMethodrefIdx,
                            sampleInterfaceMethodrefIdx,
                            sampleMethodHandleIdx,
                            sampleMethodTypeIdx,
                            sampleInvokeDynamicIdx,
                            50], //Out of range
              badNatIndices = [sampleIntIdx,
                            sampleFloatIdx,
                            sampleLongIdx,
                            sampleDoubleIdx,
                            sampleStringIdx,
                            sampleUTF8Idx,
                            sampleClassIdx,
                            sampleFieldrefIdx,
                            sampleMethodrefIdx,
                            sampleInterfaceMethodrefIdx,
                            sampleMethodHandleIdx,
                            sampleMethodTypeIdx,
                            sampleInvokeDynamicIdx,
                            50]; //Out of range

            badClassIndices.forEach(function(badClassIndex) {
              sampleCp(1);
              makeFieldref(badClassIndex, sampleFieldrefNatIdx);
              expect(getCp).toThrow();
              reset();

              badNatIndices.forEach(function(badNatIndex) {
                sampleCp(1);
                makeFieldref(sampleClassIdx, badNatIndex);
                expect(getCp).toThrow();
                reset();

                sampleCp(1);
                makeFieldref(badClassIndex, badNatIndex);
                expect(getCp).toThrow();
                reset();
              });
            });
          }
        );
      }
    );

    describe("ConstantPool: CONSTANT_Methodref_info (§4.4.2)",
      function() {
        beforeEach(reset);

        it("should accept a methodref",
          function() {
            var cp,
              className = "byorg",
              methodName = "blargh",
              methodDesc = "()V";

            enhancedMakeMethodref(className, methodName, methodDesc);

            cp = getCp();
            testMethodref(cp, 6, 5, className);
          }
        );

        it("should accept <init> methodrefs, but not <clinit> methodrefs",
          function() {
            var cp, cpItem;

            enhancedMakeMethodref("TestClass", "<init>", "()V");
            cp = getCp();
            testMethodref(cp, 6, 5, "TestClass");

            enhancedMakeMethodref("TestClass", "<clinit>", "()V");
            expect(getCp).toThrow();
          }
        );

        it("should not accept methodrefs with invalid method descriptors",
          function() {
            var cp,
              className = "byorg",
              methodName = "blargh",
              methodDesc = 'B';

            //We don't do comprehensive method descriptor testing here.
            //That is tested elsewhere.
            //We just want to verify that that existing verification code is
            //being used.

            enhancedMakeMethodref(className, methodName, methodDesc);
            expect(getCp).toThrow();
          }
        );

        it("should complain loudly if the class and/or name and type indices point to cp items with different types",
          function() {
            var badClassIndices = [sampleIntIdx,
                            sampleFloatIdx,
                            sampleLongIdx,
                            sampleDoubleIdx,
                            sampleStringIdx,
                            sampleFieldrefNatIdx,
                            sampleMethodrefNatIdx,
                            sampleInterfaceMethodrefNatIdx,
                            sampleUTF8Idx,
                            sampleFieldrefIdx,
                            sampleMethodrefIdx,
                            sampleInterfaceMethodrefIdx,
                            sampleMethodHandleIdx,
                            sampleMethodTypeIdx,
                            sampleInvokeDynamicIdx,
                            50], //Out of range
              badNatIndices = [sampleIntIdx,
                            sampleFloatIdx,
                            sampleLongIdx,
                            sampleDoubleIdx,
                            sampleStringIdx,
                            sampleUTF8Idx,
                            sampleClassIdx,
                            sampleFieldrefIdx,
                            sampleMethodrefIdx,
                            sampleInterfaceMethodrefIdx,
                            sampleMethodHandleIdx,
                            sampleMethodTypeIdx,
                            sampleInvokeDynamicIdx,
                            50]; //Out of range

            badClassIndices.forEach(function(badClassIndex) {
              sampleCp(1);
              makeMethodref(badClassIndex, sampleFieldrefNatIdx);
              expect(getCp).toThrow();
              reset();

              badNatIndices.forEach(function(badNatIndex) {
                sampleCp(1);
                makeMethodref(sampleClassIdx, badNatIndex);
                expect(getCp).toThrow();
                reset();

                sampleCp(1);
                makeMethodref(badClassIndex, badNatIndex);
                expect(getCp).toThrow();
                reset();
              });
            });
          }
        );

      }
    );

    describe("ConstantPool: CONSTANT_InterfaceMethodref_info (§4.4.2)",
      function() {
        beforeEach(reset);

        it("should accept an interfacemethodref",
          function() {
            var cp, cpItem,
              className = "byorg",
              methodName = "blargh",
              methodDesc = "()V";

            enhancedMakeInterfaceMethodref(className, methodName, methodDesc);

            cp = getCp();
            testInterfaceMethodref(cp, 6, 5, className);
          }
        );

        it("should not accept interfacemethodrefs with invalid method descriptors",
          function() {
            var cp,
              className = "byorg",
              methodName = "blargh",
              methodDesc = 'B';

            //We don't do comprehensive method descriptor testing here.
            //That is tested elsewhere.
            //We just want to verify that that existing verification code is
            //being used.

            enhancedMakeInterfaceMethodref(className, methodName, methodDesc);
            expect(getCp).toThrow();
          }
        );

        it("should complain loudly if the class and/or name and type indices point to cp items with different types",
          function() {
            var badClassIndices = [sampleIntIdx,
                            sampleFloatIdx,
                            sampleLongIdx,
                            sampleDoubleIdx,
                            sampleStringIdx,
                            sampleFieldrefNatIdx,
                            sampleMethodrefNatIdx,
                            sampleInterfaceMethodrefNatIdx,
                            sampleUTF8Idx,
                            sampleFieldrefIdx,
                            sampleMethodrefIdx,
                            sampleInterfaceMethodrefIdx,
                            sampleMethodHandleIdx,
                            sampleMethodTypeIdx,
                            sampleInvokeDynamicIdx,
                            50], //Out of range
              badNatIndices = [sampleIntIdx,
                            sampleFloatIdx,
                            sampleLongIdx,
                            sampleDoubleIdx,
                            sampleStringIdx,
                            sampleUTF8Idx,
                            sampleClassIdx,
                            sampleFieldrefIdx,
                            sampleMethodrefIdx,
                            sampleInterfaceMethodrefIdx,
                            sampleMethodHandleIdx,
                            sampleMethodTypeIdx,
                            sampleInvokeDynamicIdx,
                            50]; //Out of range

            badClassIndices.forEach(function(badClassIndex) {
              sampleCp(1);
              makeInterfaceMethodref(badClassIndex, sampleFieldrefNatIdx);
              expect(getCp).toThrow();
              reset();

              badNatIndices.forEach(function(badNatIndex) {
                sampleCp(1);
                makeInterfaceMethodref(sampleClassIdx, badNatIndex);
                expect(getCp).toThrow();
                reset();

                sampleCp(1);
                makeInterfaceMethodref(badClassIndex, badNatIndex);
                expect(getCp).toThrow();
                reset();
              });
            });
          }
        );
      }
    );

    /**
     * Tests the sample constant pool with (at least) one of every
     * CP item. This sample pool is used in many other tests,
     * so we want to ensure that it is constructed properly!
     */
    describe("ConstantPool Super Deluxe Sample CP",
      function() {
        beforeEach(reset);

        it("should properly be parsed into the constantpool",
          function() {
            var cp, cpItem;

            sampleCp(0);

            //Let's make this huge constant pool!
            cp = getCp();
            expect(cr.isEndOfFile()).toBe(true);

            //Verify the sanity of the pool.
            cpItem = cp.get(0);
            expect(cpItem).toBe(undefined);
            expect(cp.getLength()).toBe(sampleCpSize);

            //UTF8
            testUtf8(cp, 1, sampleClassName);
            //The above is also the sample UTF8 object...
            testUtf8(cp, sampleUTF8Idx, sampleUTF8Text);
            testUtf8(cp, 2, sampleFieldName);
            testUtf8(cp, 3, sampleFieldDescriptor);
            testUtf8(cp, 4, sampleMethodName);
            testUtf8(cp, 5, sampleMethodDescriptor);
            testUtf8(cp, 6, sampleInterfaceName);
            testUtf8(cp, 7, sampleInterfaceMethodName);
            testUtf8(cp, 8, sampleInterfaceMethodDescriptor);
            testUtf8(cp, 9, sampleString);

            //Int
            testInt(cp, sampleIntIdx, sampleInt);

            //Float
            testFloat(cp, sampleFloatIdx, sampleFloat);

            //Long
            testLong(cp, sampleLongIdx, sampleLong);

            //Double
            testDouble(cp, sampleDoubleIdx, sampleDouble);

            //Class
            testClass(cp, sampleClassIdx, sampleClassName);

            //Class (interface, for testing purposes)
            testClass(cp, sampleInterfaceIdx, sampleInterfaceName);

            //String
            testString(cp, sampleStringIdx, sampleString);

            //Name_and_type -- Field
            testNat(cp, sampleFieldrefNatIdx, sampleFieldName, sampleFieldDescriptor);

            //Name_and_type -- method
            testNat(cp, sampleMethodrefNatIdx, sampleMethodName, sampleMethodDescriptor);

            //Name_and_type -- interfacemethod
            testNat(cp, sampleInterfaceMethodrefNatIdx, sampleInterfaceMethodName, sampleInterfaceMethodDescriptor);

            //Fieldref
            testFieldref(cp, sampleFieldrefIdx, sampleFieldrefNatIdx, sampleClassName);

            //Methodref
            testMethodref(cp, sampleMethodrefIdx, sampleMethodrefNatIdx, sampleClassName);

            //InterfaceMethodRef
            testInterfaceMethodref(cp, sampleInterfaceMethodrefIdx, sampleInterfaceMethodrefNatIdx, sampleInterfaceName);

            //MethodHandle
            testMethodHandle(cp, sampleMethodHandleIdx, Enum.referenceKind.GETFIELD, sampleFieldrefIdx);

            //MethodType
            testMethodType(cp, sampleMethodTypeIdx, sampleMethodDescriptor);

            //InvokeDynamic
            testInvokeDynamic(cp, sampleInvokeDynamicIdx, 3, 20);
          }
        );

        it("should allow for extra CP items at the end of the cp",
          function() {
            var cp, cpItem;
            sampleCp(1);
            makeNat(7, 8);

            cp = getCp();
            testNat(cp, sampleCpSize, sampleInterfaceMethodName, sampleInterfaceMethodDescriptor);
          }
        );
      }
    );

    describe("ConstantPool: CONSTANT_MethodHandle_info (§4.4.8)",
      function() {
        beforeEach(reset);

        it("should accept a MethodHandle constant pool item",
          function() {
            var className = "Blargh",
                methodName = "Yarg",
                methodDesc = "()V",
                referenceKind = Enum.referenceKind.INVOKEVIRTUAL,
                cp;

            enhancedMakeMethodref(className, methodName, methodDesc, 1);
            makeMethodHandle(referenceKind, 6);

            cp = getCp();
            testMethodHandle(cp, 7, referenceKind, 6);
            reset();

            //Now try with a forward reference.
            initCp(7);
            makeMethodHandle(referenceKind, 7); //1
            makeUTF8(className); //2
            makeUTF8(methodName); //3
            makeUTF8(methodDesc); //4
            makeClass(2); //5
            makeNat(3, 4); //6
            makeMethodref(5, 6); //7

            cp = getCp();
            testMethodHandle(cp, 1, referenceKind, 7);
          }
        );

        it("should ensure the reference item for [get|put]Field and [get|put]Static is a fieldref",
          function() {
            var className = "Blargh",
                fieldName = "yargh",
                fieldDesc = "B",
                methodName = "hey",
                methodDesc = "()V",
                referenceKinds = [Enum.referenceKind.GETFIELD,
                                  Enum.referenceKind.PUTFIELD,
                                  Enum.referenceKind.GETSTATIC,
                                  Enum.referenceKind.PUTSTATIC];

            referenceKinds.forEach(function(referenceKind) {
              var cp;

              //This should pass.
              enhancedMakeFieldref(className, fieldName, fieldDesc, 1);
              makeMethodHandle(referenceKind, 6);
              cp = getCp();
              testMethodHandle(cp, 7, referenceKind, 6);
              reset();

              //These should fail.
              enhancedMakeMethodref(className, methodName, methodDesc, 1);
              makeMethodHandle(referenceKind, 6);
              expect(getCp).toThrow();
              reset();

              enhancedMakeInterfaceMethodref(className, methodName, methodDesc, 1);
              makeMethodHandle(referenceKind, 6);
              expect(getCp).toThrow();
              reset();
            });
          }
        );

        it("should ensure that the reference item for invoke[Virtual|Static|Special] is a MethodRef",
          function() {
            var className = "Blargh",
                fieldName = "yargh",
                fieldDesc = "B",
                methodName = "hey",
                methodDesc = "()V",
                referenceKinds = [Enum.referenceKind.INVOKEVIRTUAL,
                                  Enum.referenceKind.INVOKESTATIC,
                                  Enum.referenceKind.INVOKESPECIAL];

            referenceKinds.forEach(function(referenceKind) {
              var cp;

              //This should fail.
              enhancedMakeFieldref(className, fieldName, fieldDesc, 1);
              makeMethodHandle(referenceKind, 6);
              expect(getCp).toThrow();
              reset();

              //This should pass.
              enhancedMakeMethodref(className, methodName, methodDesc, 1);
              makeMethodHandle(referenceKind, 6);
              cp = getCp();
              testMethodHandle(cp, 7, referenceKind, 6);
              reset();

              //This should fail.
              enhancedMakeInterfaceMethodref(className, methodName, methodDesc, 1);
              makeMethodHandle(referenceKind, 6);
              expect(getCp).toThrow();
              reset();
            });
          }
        );

        it("should ensure that the reference item for invokeInterface is an InterfaceMethodInfo",
          function() {
            var className = "Blargh",
                fieldName = "yargh",
                fieldDesc = "B",
                methodName = "hey",
                methodDesc = "()V",
                referenceKind = Enum.referenceKind.INVOKEINTERFACE,
                cp;

            //This should fail.
            enhancedMakeFieldref(className, fieldName, fieldDesc, 1);
            makeMethodHandle(referenceKind, 6);
            expect(getCp).toThrow();
            reset();

            //This should fail.
            enhancedMakeMethodref(className, methodName, methodDesc, 1);
            makeMethodHandle(referenceKind, 6);
            expect(getCp).toThrow();
            reset();

            //This should pass.
            enhancedMakeInterfaceMethodref(className, methodName, methodDesc, 1);
            makeMethodHandle(referenceKind, 6);
            cp = getCp();
            testMethodHandle(cp, 7, referenceKind, 6);
            reset();
          }
        );

        it("should ensure that the reference item for invoke[Virtual|Static|Special] is not <init> or <clinit>",
          function() {
            var className = "Blargh",
                methodNames = ["<init>", "<clinit>"],
                methodDesc = "()V",
                referenceKinds = [Enum.referenceKind.INVOKEVIRTUAL,
                                  Enum.referenceKind.INVOKESTATIC,
                                  Enum.referenceKind.INVOKESPECIAL];

            referenceKinds.forEach(function(referenceKind) {
              methodNames.forEach(function(methodName) {
                //These should fail.
                enhancedMakeMethodref(className, methodName, methodDesc, 1);
                makeMethodHandle(referenceKind, 6);
                expect(getCp).toThrow();
                reset();
              });
            });
          }
        );

        it("should ensure that the reference item for invokeInterface is not <init> or <clinit>",
          function() {
            var className = "Blargh",
                methodNames = ["<init>", "<clinit>"],
                methodDesc = "()V",
                referenceKind = Enum.referenceKind.INVOKEINTERFACE;

            methodNames.forEach(function(methodName) {
              //These should fail.
              enhancedMakeInterfaceMethodref(className, methodName, methodDesc, 1);
              makeMethodHandle(referenceKind, 6);
              expect(getCp).toThrow();
              reset();
            });
          }
        );

        it("should ensure that the reference item for newInvokeSpecial is a MethodRef for <init>",
          function() {
            var className = "Blargh",
                goodMethodName = "<init>",
                badMethodNames = ["<clinit>", "someMethod"],
                methodDesc = "()V",
                referenceKind = Enum.referenceKind.NEWINVOKESPECIAL,
                cp;

            enhancedMakeMethodref(className, goodMethodName, methodDesc, 1);
            makeMethodHandle(referenceKind, 6);
            cp = getCp();
            testMethodHandle(cp, 7, referenceKind, 6);
            reset();

            //These should fail (<init> should be a MethodRef)
            enhancedMakeInterfaceMethodref(className, goodMethodName, methodDesc, 1);
            makeMethodHandle(referenceKind, 6);
            expect(getCp).toThrow();
            reset();

            enhancedMakeFieldref(className, goodMethodName, methodDesc, 1);
            makeMethodHandle(referenceKind, 6);
            expect(getCp).toThrow();
            reset();

            badMethodNames.forEach(function(methodName) {
              //These should fail.
              enhancedMakeInterfaceMethodref(className, methodName, methodDesc, 1);
              makeMethodHandle(referenceKind, 6);
              expect(getCp).toThrow();
              reset();
            });
          }
        );

        it("should not allow invalid / unrecognized reference types",
          function() {
            var badIndices = [sampleIntIdx,
                            sampleFloatIdx,
                            sampleLongIdx,
                            sampleDoubleIdx,
                            sampleStringIdx,
                            sampleFieldrefNatIdx,
                            sampleMethodrefNatIdx,
                            sampleInterfaceMethodrefNatIdx,
                            sampleClassIdx,
                            sampleMethodHandleIdx,
                            sampleMethodTypeIdx,
                            sampleInvokeDynamicIdx,
                            50], //Out of range
              referenceKinds = [], refKind;

            //TODO(jvilk): Why can't I forEach on
            //Enum.referenceKind.keys?
            for (refKind in Enum.referenceKind) {
              referenceKinds.push(Enum.referenceKind[refKind]);
            }

            referenceKinds.forEach(function(referenceKind) {
              badIndices.forEach(function(idx) {
                sampleCp(1);
                makeMethodHandle(referenceKind, idx);
                expect(getCp).toThrow();

                reset();
              });
            });
          }
        );
      }
    );

    describe("ConstantPool: CONSTANT_MethodType_info (§4.4.9)",
      function() {
        beforeEach(reset);
        
        it("should accept a MethodType constant pool item",
          function() {
            var descriptor = "()V", cp;
            initCp(2);
            makeUTF8(descriptor);
            makeMethodType(1);

            cp = getCp();
            testMethodType(cp, 2, descriptor);
            reset();

            //Forward reference.
            initCp(2);
            makeMethodType(2);
            makeUTF8(descriptor);

            cp = getCp();
            testMethodType(cp, 1, descriptor);
          }
        );

        /**
         * We only want to verify that it is using our method descriptor
         * validator method, which is thoroughly tested elsewhere.
         */
        it("should only accept valid method descriptors",
          function() {
            var badDesc = "B";
            initCp(2);
            makeUTF8(badDesc);
            makeMethodType(1);

            expect(getCp).toThrow();
          }
        );

        it("should complain if the method descriptor index references a non-UTF8 constant pool item",
          function() {
            var badIndices = [sampleFloatIdx,
                            sampleLongIdx,
                            sampleDoubleIdx,
                            sampleStringIdx,
                            sampleFieldrefNatIdx,
                            sampleMethodrefNatIdx,
                            sampleInterfaceMethodrefNatIdx,
                            sampleClassIdx,
                            sampleFieldrefIdx,
                            sampleMethodrefIdx,
                            sampleInterfaceMethodrefIdx,
                            sampleMethodHandleIdx,
                            sampleMethodTypeIdx,
                            sampleInvokeDynamicIdx,
                            50]; //Out of range

            badIndices.forEach(function(idx) {
              sampleCp(1);
              makeMethodType(idx);
              expect(getCp).toThrow();

              reset();
            });
          }
        );
      }
    );

    describe("ConstantPool: CONSTANT_InvokeDynamic_info (§4.4.10)",
      function() {
        beforeEach(reset);

         it("should accept an InvokeDynamic struct",
          function() {
            var bootstrapIdx = 2,
                name = "someMethod",
                desc = "()V",
                cp;

            initCp(4);
            makeUTF8(name);
            makeUTF8(desc);
            makeNat(1, 2);
            makeInvokeDynamic(bootstrapIdx, 3);
            
            cp = getCp();
            testInvokeDynamic(cp, 4, bootstrapIdx, 3);
            reset();

            //Forward reference
            initCp(4);
            makeUTF8(name);
            makeUTF8(desc);
            makeInvokeDynamic(bootstrapIdx, 4);
            makeNat(1, 2);
            
            cp = getCp();
            testInvokeDynamic(cp, 3, bootstrapIdx, 4);
            reset();
          }
        );

        it("should verify that its NameAndType reference has a valid method descriptor",
          function() {
            var bootstrapIdx = 2,
                name = "someMethod",
                desc = "C";

            initCp(4);
            makeUTF8(name);
            makeUTF8(desc);
            makeNat(1, 2);
            makeInvokeDynamic(bootstrapIdx, 3);

            expect(getCp).toThrow();
          }
        );

        it("should verify that its NameAndType reference is, in fact, a NameAndType constant pool item",
          function() {
            var badIndices = [sampleUTF8Idx,
                            sampleIntIdx,
                            sampleFloatIdx,
                            sampleLongIdx,
                            sampleDoubleIdx,
                            sampleStringIdx,
                            sampleClassIdx,
                            sampleFieldrefIdx,
                            sampleMethodrefIdx,
                            sampleInterfaceMethodrefIdx,
                            sampleMethodHandleIdx,
                            sampleMethodTypeIdx,
                            sampleInvokeDynamicIdx,
                            50]; //Out of range.

            badIndices.forEach(function(idx) {
              sampleCp(1);
              makeInvokeDynamic(2, idx);
              expect(getCp).toThrow();
              reset();
            });
          }
        );
      }
    );

    describe("ConstantPool: Invalid Types",
      function() {
        beforeEach(reset);

        it("should complain if it receives an unrecognized constant pool item",
          function() {
            initCp(1);
            cr.addField("u1", 100, "tag"); //Invalid CP item.
            expect(getCp).toThrow();
            reset();

            initCp(2);
            makeUTF8("lol");
            cr.addField("u1", 100, "tag"); //Invalid CP item.
            expect(getCp).toThrow();
            reset();

            initCp(2);
            cr.addField("u1", 100, "tag"); //Invalid CP item.
            makeUTF8("lol");
            expect(getCp).toThrow();
          }
        );
      }
    );
  }
);