/**
 * Contains unit tests for the ConstantPoolFactory class, which is
 * responsible for parsing out ConstantPool items.
 *
 * lol this is a long class. I should break this up into submodules at some point,
 * with a module devoted solely to helper functions...
 */
define(['vm/ConstantPool/ConstantPoolFactory', '../test/ConstantPoolFactoryHelper', '../test/MockJavaClassReader', 'vm/Enum', 'vm/Primitives'],
  function(ConstantPoolFactory, cpfh, MockJavaClassReader, Enum, Primitives) {
    "use strict";
    
    var cr,
      /**
       * Run before every test. Resets the class reader.
       */
      reset = function() {
        cpfh.reset();
        cr = cpfh.getCr();
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
            cpfh.initCp(0);
            var cp = cpfh.getCp();
            expect(cp.getLength()).toBe(1);
            expect(cp.get(0)).toBe(undefined);
            expect(cp.getUTF8Info(0)).toBe(undefined);
            expect(cp.getClassInfo(0)).toBe(undefined);
            cpfh.shouldThrow(cp, 'get', 1);
            cpfh.shouldThrow(cp, 'getUTF8Info', 1);
            cpfh.shouldThrow(cp, 'getClassInfo', 1);
            cpfh.shouldThrow(cp, 'get', 0.1);
            cpfh.shouldThrow(cp, 'getUTF8Info', 0.1);
            cpfh.shouldThrow(cp, 'getClassInfo', 0.1);
            cpfh.shouldThrow(cp, 'get', -1);
            cpfh.shouldThrow(cp, 'getUTF8Info', -1);
            cpfh.shouldThrow(cp, 'getClassInfo', -1);
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
                cpfh.initCp(1);
                cpfh.makeUTF8(value);
                cp = cpfh.getCp();
                expect(cp.getLength()).toBe(2);
                expect(cp.getUTF8Info(0)).toBe(undefined);

                cpfh.testUtf8(cp, 1, value);

                cpfh.shouldThrow(cp, 'getClassInfo', 1);
                cpfh.shouldThrow(cp, 'get', 2);
                cpfh.shouldThrow(cp, 'getUTF8Info', 2);
                cpfh.shouldThrow(cp, 'getClassInfo', 2);

                reset();
              }
            );
          }
        );

        it("should also be okay with 2 strings",
          function() {
            var cp, cpItem;

            cpfh.initCp(2);
            cpfh.makeUTF8(" ");
            cpfh.makeUTF8(" hey");

            cp = cpfh.getCp();
            expect(cp.getLength()).toBe(3);
            expect(cp.get(0)).toBe(undefined);

            cpfh.testUtf8(cp, 1, " ");
            cpfh.testUtf8(cp, 2, " hey");

            cpfh.shouldThrow(cp, 'get', 3);
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

            cpfh.initCp(2);
            cpfh.makeUTF8("name");
            cpfh.makeString(1);

            cp = cpfh.getCp();
            cpfh.testString(cp, 2, "name");
          }
        );

        it("should properly handle a single string field that references a UTF8 info item that occurs after it",
          function() {
            var cp;

            cpfh.initCp(2);
            cpfh.makeString(2);
            cpfh.makeUTF8("lol");

            cp = cpfh.getCp();
            cpfh.testString(cp, 1, "lol");
            expect(cp.getLength()).toBe(3);
          }
        );

        it("should complain loudly if the UTF8 reference happens to be anything else",
          function() {
            var badIndices = [cpfh.sampleIntIdx,
                            cpfh.sampleFloatIdx,
                            cpfh.sampleLongIdx,
                            cpfh.sampleDoubleIdx,
                            cpfh.sampleStringIdx,
                            cpfh.sampleFieldrefNatIdx,
                            cpfh.sampleMethodrefNatIdx,
                            cpfh.sampleInterfaceMethodrefNatIdx,
                            cpfh.sampleClassIdx,
                            cpfh.sampleFieldrefIdx,
                            cpfh.sampleMethodrefIdx,
                            cpfh.sampleInterfaceMethodrefIdx,
                            cpfh.sampleMethodHandleIdx,
                            cpfh.sampleMethodTypeIdx,
                            cpfh.sampleInvokeDynamicIdx];

            badIndices.forEach(function(idx) {
              cpfh.sampleCp(1);
              cpfh.makeString(idx);
              expect(cpfh.getCp).toThrow();

              reset();
            });
          }
        );

        it("should not allow for out-of-range constant pool references",
          function() {
            //Note that negative CP indices are impossible, since
            //it's dictated by an unsigned value.
            cpfh.initCp(1);
            cpfh.makeString(2);
            expect(cpfh.getCp).toThrow();
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
              cpfh.initCp(1);
              cpfh.makeInt(aValue);
              cpfh.testInt(cpfh.getCp(), 1, aValue);
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
              cpfh.initCp(1);

              cpfh.makeFloat(aValue);
              var cp = cpfh.getCp();
              cpfh.testFloat(cp, 1, aValue);
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
              cpfh.initCp(2);
              cpfh.makeLong(aValue);
              cp = cpfh.getCp();
              cpfh.testLong(cp, 1, aValue);
              expect(cp.getLength()).toBe(3);
              reset();
            });
          }
        );

        it("should complain if the cp is not specified with the correct size",
          function() {
            cpfh.initCp(1);
            cpfh.makeLong(3);
            expect(cpfh.getCp).toThrow();
          }
        );

        it("should properly handle two long infos",
          function() {
            var cp;

            cpfh.initCp(4);
            cpfh.makeLong(4);
            cpfh.makeLong(7);

            cp = cpfh.getCp();
            cpfh.testLong(cp, 1, 4);
            cpfh.testLong(cp, 3, 7);

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
              cpfh.initCp(2);
              cpfh.makeDouble(aValue);
              cp = cpfh.getCp();
              cpfh.testDouble(cp, 1, aValue);
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

            cpfh.initCp(2);
            cpfh.makeUTF8("class");
            cpfh.makeClass(1);

            cp = cpfh.getCp();
            cpfh.testClass(cp, 2, "class");

            reset();

            cpfh.initCp(2);
            cpfh.makeClass(2);
            cpfh.makeUTF8("class");

            cp = cpfh.getCp();
            cpfh.testClass(cp, 1, "class");
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
              cpfh.initCp(2);
              cpfh.makeUTF8(goodName);
              cpfh.makeClass(1);

              cp = cpfh.getCp();
              cpfh.testClass(cp, 2, goodName);
              reset();
            });

            badNames.forEach(function(badName) {
              cpfh.initCp(2);
              cpfh.makeUTF8(badName);
              cpfh.makeClass(1);

              expect(cpfh.getCp).toThrow();
              reset();
            });
          }
        );

        it("should complain loudly if the name is not a UTF8 info",
          function() {
            var badIndices = [cpfh.sampleIntIdx,
                            cpfh.sampleFloatIdx,
                            cpfh.sampleLongIdx,
                            cpfh.sampleDoubleIdx,
                            cpfh.sampleStringIdx,
                            cpfh.sampleFieldrefNatIdx,
                            cpfh.sampleMethodrefNatIdx,
                            cpfh.sampleInterfaceMethodrefNatIdx,
                            cpfh.sampleClassIdx,
                            cpfh.sampleFieldrefIdx,
                            cpfh.sampleMethodrefIdx,
                            cpfh.sampleInterfaceMethodrefIdx,
                            cpfh.sampleMethodHandleIdx,
                            cpfh.sampleMethodTypeIdx,
                            cpfh.sampleInvokeDynamicIdx,
                            50]; //Out of range

            badIndices.forEach(function(badIndex) {
              cpfh.sampleCp(1);
              cpfh.makeClass(badIndex);
              expect(cpfh.getCp).toThrow();
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
          cpfh.initCp(3);
          cpfh.makeUTF8(name);
          cpfh.makeUTF8(desc);
          cpfh.makeNat(1, 2);
        };

        it("should support name and type cp items",
          function() {
            var cp,
              name = "boo",
              type = "()V";

            setupNatTest(name, type);
            cp = cpfh.getCp();
            cpfh.testNat(cp, 3, name, type);
          }
        );

        it("should allow for name and type for <init>, but not <clinit>",
          function() {
            var cp, cpItem,
              name = "<init>",
              type = "()V";

            setupNatTest(name, type);
            cp = cpfh.getCp();
            cpfh.testNat(cp, 3, name, type);
            reset();

            cpfh.initCp(3);
            cpfh.makeUTF8("<clinit>");
            cpfh.makeUTF8("()V");
            cpfh.makeNat(1, 2);
            expect(cpfh.getCp).toThrow();
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
              expect(cpfh.getCp).toThrow();
            });
          }
        );

        it("should complain if name and/or type is not UTF8",
          function() {
            var badIndices = [cpfh.sampleIntIdx,
                            cpfh.sampleFloatIdx,
                            cpfh.sampleLongIdx,
                            cpfh.sampleDoubleIdx,
                            cpfh.sampleStringIdx,
                            cpfh.sampleFieldrefNatIdx,
                            cpfh.sampleMethodrefNatIdx,
                            cpfh.sampleInterfaceMethodrefNatIdx,
                            cpfh.sampleClassIdx,
                            cpfh.sampleFieldrefIdx,
                            cpfh.sampleMethodrefIdx,
                            cpfh.sampleInterfaceMethodrefIdx,
                            50]; //Out of range

            badIndices.forEach(function(badIndex1) {
              cpfh.sampleCp(2);
              cpfh.makeUTF8("()V");
              cpfh.makeNat(badIndex1, cpfh.sampleCpSize);
              expect(cpfh.getCp).toThrow();
              reset();

              cpfh.sampleCp(2);
              cpfh.makeUTF8("test");
              cpfh.makeNat(cpfh.sampleCpSize, badIndex1);
              expect(cpfh.getCp).toThrow();
              reset();

              //Yo, dawg...
              badIndices.forEach(function(badIndex2) {
                cpfh.sampleCp(1);
                cpfh.makeNat(badIndex1, badIndex2);
                expect(cpfh.getCp).toThrow();
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

            cpfh.enhancedMakeFieldref(className, fieldName, fieldDesc);

            cp = cpfh.getCp();
            cpfh.testFieldref(cp, 6, 5, className);
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

            cpfh.enhancedMakeFieldref(className, fieldName, fieldDesc);
            expect(cpfh.getCp).toThrow();
          }
        );

        it("should complain loudly if the class and/or name and type indices point to cp items with different types",
          function() {
            var cp, i, j,
              badClassIndices = [cpfh.sampleIntIdx,
                            cpfh.sampleFloatIdx,
                            cpfh.sampleLongIdx,
                            cpfh.sampleDoubleIdx,
                            cpfh.sampleStringIdx,
                            cpfh.sampleFieldrefNatIdx,
                            cpfh.sampleMethodrefNatIdx,
                            cpfh.sampleInterfaceMethodrefNatIdx,
                            cpfh.sampleUTF8Idx,
                            cpfh.sampleFieldrefIdx,
                            cpfh.sampleMethodrefIdx,
                            cpfh.sampleInterfaceMethodrefIdx,
                            cpfh.sampleMethodHandleIdx,
                            cpfh.sampleMethodTypeIdx,
                            cpfh.sampleInvokeDynamicIdx,
                            50], //Out of range
              badNatIndices = [cpfh.sampleIntIdx,
                            cpfh.sampleFloatIdx,
                            cpfh.sampleLongIdx,
                            cpfh.sampleDoubleIdx,
                            cpfh.sampleStringIdx,
                            cpfh.sampleUTF8Idx,
                            cpfh.sampleClassIdx,
                            cpfh.sampleFieldrefIdx,
                            cpfh.sampleMethodrefIdx,
                            cpfh.sampleInterfaceMethodrefIdx,
                            cpfh.sampleMethodHandleIdx,
                            cpfh.sampleMethodTypeIdx,
                            cpfh.sampleInvokeDynamicIdx,
                            50]; //Out of range

            badClassIndices.forEach(function(badClassIndex) {
              cpfh.sampleCp(1);
              cpfh.makeFieldref(badClassIndex, cpfh.sampleFieldrefNatIdx);
              expect(cpfh.getCp).toThrow();
              reset();

              badNatIndices.forEach(function(badNatIndex) {
                cpfh.sampleCp(1);
                cpfh.makeFieldref(cpfh.sampleClassIdx, badNatIndex);
                expect(cpfh.getCp).toThrow();
                reset();

                cpfh.sampleCp(1);
                cpfh.makeFieldref(badClassIndex, badNatIndex);
                expect(cpfh.getCp).toThrow();
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

            cpfh.enhancedMakeMethodref(className, methodName, methodDesc);

            cp = cpfh.getCp();
            cpfh.testMethodref(cp, 6, 5, className);
          }
        );

        it("should accept <init> methodrefs, but not <clinit> methodrefs",
          function() {
            var cp, cpItem;

            cpfh.enhancedMakeMethodref("TestClass", "<init>", "()V");
            cp = cpfh.getCp();
            cpfh.testMethodref(cp, 6, 5, "TestClass");

            cpfh.enhancedMakeMethodref("TestClass", "<clinit>", "()V");
            expect(cpfh.getCp).toThrow();
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

            cpfh.enhancedMakeMethodref(className, methodName, methodDesc);
            expect(cpfh.getCp).toThrow();
          }
        );

        it("should complain loudly if the class and/or name and type indices point to cp items with different types",
          function() {
            var badClassIndices = [cpfh.sampleIntIdx,
                            cpfh.sampleFloatIdx,
                            cpfh.sampleLongIdx,
                            cpfh.sampleDoubleIdx,
                            cpfh.sampleStringIdx,
                            cpfh.sampleFieldrefNatIdx,
                            cpfh.sampleMethodrefNatIdx,
                            cpfh.sampleInterfaceMethodrefNatIdx,
                            cpfh.sampleUTF8Idx,
                            cpfh.sampleFieldrefIdx,
                            cpfh.sampleMethodrefIdx,
                            cpfh.sampleInterfaceMethodrefIdx,
                            cpfh.sampleMethodHandleIdx,
                            cpfh.sampleMethodTypeIdx,
                            cpfh.sampleInvokeDynamicIdx,
                            50], //Out of range
              badNatIndices = [cpfh.sampleIntIdx,
                            cpfh.sampleFloatIdx,
                            cpfh.sampleLongIdx,
                            cpfh.sampleDoubleIdx,
                            cpfh.sampleStringIdx,
                            cpfh.sampleUTF8Idx,
                            cpfh.sampleClassIdx,
                            cpfh.sampleFieldrefIdx,
                            cpfh.sampleMethodrefIdx,
                            cpfh.sampleInterfaceMethodrefIdx,
                            cpfh.sampleMethodHandleIdx,
                            cpfh.sampleMethodTypeIdx,
                            cpfh.sampleInvokeDynamicIdx,
                            50]; //Out of range

            badClassIndices.forEach(function(badClassIndex) {
              cpfh.sampleCp(1);
              cpfh.makeMethodref(badClassIndex, cpfh.sampleFieldrefNatIdx);
              expect(cpfh.getCp).toThrow();
              reset();

              badNatIndices.forEach(function(badNatIndex) {
                cpfh.sampleCp(1);
                cpfh.makeMethodref(cpfh.sampleClassIdx, badNatIndex);
                expect(cpfh.getCp).toThrow();
                reset();

                cpfh.sampleCp(1);
                cpfh.makeMethodref(badClassIndex, badNatIndex);
                expect(cpfh.getCp).toThrow();
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

            cpfh.enhancedMakeInterfaceMethodref(className, methodName, methodDesc);

            cp = cpfh.getCp();
            cpfh.testInterfaceMethodref(cp, 6, 5, className);
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

            cpfh.enhancedMakeInterfaceMethodref(className, methodName, methodDesc);
            expect(cpfh.getCp).toThrow();
          }
        );

        it("should complain loudly if the class and/or name and type indices point to cp items with different types",
          function() {
            var badClassIndices = [cpfh.sampleIntIdx,
                            cpfh.sampleFloatIdx,
                            cpfh.sampleLongIdx,
                            cpfh.sampleDoubleIdx,
                            cpfh.sampleStringIdx,
                            cpfh.sampleFieldrefNatIdx,
                            cpfh.sampleMethodrefNatIdx,
                            cpfh.sampleInterfaceMethodrefNatIdx,
                            cpfh.sampleUTF8Idx,
                            cpfh.sampleFieldrefIdx,
                            cpfh.sampleMethodrefIdx,
                            cpfh.sampleInterfaceMethodrefIdx,
                            cpfh.sampleMethodHandleIdx,
                            cpfh.sampleMethodTypeIdx,
                            cpfh.sampleInvokeDynamicIdx,
                            50], //Out of range
              badNatIndices = [cpfh.sampleIntIdx,
                            cpfh.sampleFloatIdx,
                            cpfh.sampleLongIdx,
                            cpfh.sampleDoubleIdx,
                            cpfh.sampleStringIdx,
                            cpfh.sampleUTF8Idx,
                            cpfh.sampleClassIdx,
                            cpfh.sampleFieldrefIdx,
                            cpfh.sampleMethodrefIdx,
                            cpfh.sampleInterfaceMethodrefIdx,
                            cpfh.sampleMethodHandleIdx,
                            cpfh.sampleMethodTypeIdx,
                            cpfh.sampleInvokeDynamicIdx,
                            50]; //Out of range

            badClassIndices.forEach(function(badClassIndex) {
              cpfh.sampleCp(1);
              cpfh.makeInterfaceMethodref(badClassIndex, cpfh.sampleFieldrefNatIdx);
              expect(cpfh.getCp).toThrow();
              reset();

              badNatIndices.forEach(function(badNatIndex) {
                cpfh.sampleCp(1);
                cpfh.makeInterfaceMethodref(cpfh.sampleClassIdx, badNatIndex);
                expect(cpfh.getCp).toThrow();
                reset();

                cpfh.sampleCp(1);
                cpfh.makeInterfaceMethodref(badClassIndex, badNatIndex);
                expect(cpfh.getCp).toThrow();
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

            cpfh.sampleCp(0);

            //Let's make this huge constant pool!
            cp = cpfh.getCp();
            expect(cr.isEndOfFile()).toBe(true);

            //Verify the sanity of the pool.
            cpItem = cp.get(0);
            expect(cpItem).toBe(undefined);
            expect(cp.getLength()).toBe(cpfh.sampleCpSize);

            //UTF8
            cpfh.testUtf8(cp, 1, cpfh.sampleClassName);
            //The above is also the sample UTF8 object...
            cpfh.testUtf8(cp, cpfh.sampleUTF8Idx, cpfh.sampleUTF8Text);
            cpfh.testUtf8(cp, 2, cpfh.sampleFieldName);
            cpfh.testUtf8(cp, 3, cpfh.sampleFieldDescriptor);
            cpfh.testUtf8(cp, 4, cpfh.sampleMethodName);
            cpfh.testUtf8(cp, 5, cpfh.sampleMethodDescriptor);
            cpfh.testUtf8(cp, 6, cpfh.sampleInterfaceName);
            cpfh.testUtf8(cp, 7, cpfh.sampleInterfaceMethodName);
            cpfh.testUtf8(cp, 8, cpfh.sampleInterfaceMethodDescriptor);
            cpfh.testUtf8(cp, 9, cpfh.sampleString);

            //Int
            cpfh.testInt(cp, cpfh.sampleIntIdx, cpfh.sampleInt);

            //Float
            cpfh.testFloat(cp, cpfh.sampleFloatIdx, cpfh.sampleFloat);

            //Long
            cpfh.testLong(cp, cpfh.sampleLongIdx, cpfh.sampleLong);

            //Double
            cpfh.testDouble(cp, cpfh.sampleDoubleIdx, cpfh.sampleDouble);

            //Class
            cpfh.testClass(cp, cpfh.sampleClassIdx, cpfh.sampleClassName);

            //Class (interface, for testing purposes)
            cpfh.testClass(cp, cpfh.sampleInterfaceIdx, cpfh.sampleInterfaceName);

            //String
            cpfh.testString(cp, cpfh.sampleStringIdx, cpfh.sampleString);

            //Name_and_type -- Field
            cpfh.testNat(cp, cpfh.sampleFieldrefNatIdx, cpfh.sampleFieldName, cpfh.sampleFieldDescriptor);

            //Name_and_type -- method
            cpfh.testNat(cp, cpfh.sampleMethodrefNatIdx, cpfh.sampleMethodName, cpfh.sampleMethodDescriptor);

            //Name_and_type -- interfacemethod
            cpfh.testNat(cp, cpfh.sampleInterfaceMethodrefNatIdx, cpfh.sampleInterfaceMethodName, cpfh.sampleInterfaceMethodDescriptor);

            //Fieldref
            cpfh.testFieldref(cp, cpfh.sampleFieldrefIdx, cpfh.sampleFieldrefNatIdx, cpfh.sampleClassName);

            //Methodref
            cpfh.testMethodref(cp, cpfh.sampleMethodrefIdx, cpfh.sampleMethodrefNatIdx, cpfh.sampleClassName);

            //InterfaceMethodRef
            cpfh.testInterfaceMethodref(cp, cpfh.sampleInterfaceMethodrefIdx, cpfh.sampleInterfaceMethodrefNatIdx, cpfh.sampleInterfaceName);

            //MethodHandle
            cpfh.testMethodHandle(cp, cpfh.sampleMethodHandleIdx, Enum.referenceKind.GETFIELD, cpfh.sampleFieldrefIdx);

            //MethodType
            cpfh.testMethodType(cp, cpfh.sampleMethodTypeIdx, cpfh.sampleMethodDescriptor);

            //InvokeDynamic
            cpfh.testInvokeDynamic(cp, cpfh.sampleInvokeDynamicIdx, 3, 20);
          }
        );

        it("should allow for extra CP items at the end of the cp",
          function() {
            var cp, cpItem;
            cpfh.sampleCp(1);
            cpfh.makeNat(7, 8);

            cp = cpfh.getCp();
            cpfh.testNat(cp, cpfh.sampleCpSize, cpfh.sampleInterfaceMethodName, cpfh.sampleInterfaceMethodDescriptor);
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

            cpfh.enhancedMakeMethodref(className, methodName, methodDesc, 1);
            cpfh.makeMethodHandle(referenceKind, 6);

            cp = cpfh.getCp();
            cpfh.testMethodHandle(cp, 7, referenceKind, 6);
            reset();

            //Now try with a forward reference.
            cpfh.initCp(7);
            cpfh.makeMethodHandle(referenceKind, 7); //1
            cpfh.makeUTF8(className); //2
            cpfh.makeUTF8(methodName); //3
            cpfh.makeUTF8(methodDesc); //4
            cpfh.makeClass(2); //5
            cpfh.makeNat(3, 4); //6
            cpfh.makeMethodref(5, 6); //7

            cp = cpfh.getCp();
            cpfh.testMethodHandle(cp, 1, referenceKind, 7);
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
              cpfh.enhancedMakeFieldref(className, fieldName, fieldDesc, 1);
              cpfh.makeMethodHandle(referenceKind, 6);
              cp = cpfh.getCp();
              cpfh.testMethodHandle(cp, 7, referenceKind, 6);
              reset();

              //These should fail.
              cpfh.enhancedMakeMethodref(className, methodName, methodDesc, 1);
              cpfh.makeMethodHandle(referenceKind, 6);
              expect(cpfh.getCp).toThrow();
              reset();

              cpfh.enhancedMakeInterfaceMethodref(className, methodName, methodDesc, 1);
              cpfh.makeMethodHandle(referenceKind, 6);
              expect(cpfh.getCp).toThrow();
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
              cpfh.enhancedMakeFieldref(className, fieldName, fieldDesc, 1);
              cpfh.makeMethodHandle(referenceKind, 6);
              expect(cpfh.getCp).toThrow();
              reset();

              //This should pass.
              cpfh.enhancedMakeMethodref(className, methodName, methodDesc, 1);
              cpfh.makeMethodHandle(referenceKind, 6);
              cp = cpfh.getCp();
              cpfh.testMethodHandle(cp, 7, referenceKind, 6);
              reset();

              //This should fail.
              cpfh.enhancedMakeInterfaceMethodref(className, methodName, methodDesc, 1);
              cpfh.makeMethodHandle(referenceKind, 6);
              expect(cpfh.getCp).toThrow();
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
            cpfh.enhancedMakeFieldref(className, fieldName, fieldDesc, 1);
            cpfh.makeMethodHandle(referenceKind, 6);
            expect(cpfh.getCp).toThrow();
            reset();

            //This should fail.
            cpfh.enhancedMakeMethodref(className, methodName, methodDesc, 1);
            cpfh.makeMethodHandle(referenceKind, 6);
            expect(cpfh.getCp).toThrow();
            reset();

            //This should pass.
            cpfh.enhancedMakeInterfaceMethodref(className, methodName, methodDesc, 1);
            cpfh.makeMethodHandle(referenceKind, 6);
            cp = cpfh.getCp();
            cpfh.testMethodHandle(cp, 7, referenceKind, 6);
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
                cpfh.enhancedMakeMethodref(className, methodName, methodDesc, 1);
                cpfh.makeMethodHandle(referenceKind, 6);
                expect(cpfh.getCp).toThrow();
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
              cpfh.enhancedMakeInterfaceMethodref(className, methodName, methodDesc, 1);
              cpfh.makeMethodHandle(referenceKind, 6);
              expect(cpfh.getCp).toThrow();
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

            cpfh.enhancedMakeMethodref(className, goodMethodName, methodDesc, 1);
            cpfh.makeMethodHandle(referenceKind, 6);
            cp = cpfh.getCp();
            cpfh.testMethodHandle(cp, 7, referenceKind, 6);
            reset();

            //These should fail (<init> should be a MethodRef)
            cpfh.enhancedMakeInterfaceMethodref(className, goodMethodName, methodDesc, 1);
            cpfh.makeMethodHandle(referenceKind, 6);
            expect(cpfh.getCp).toThrow();
            reset();

            cpfh.enhancedMakeFieldref(className, goodMethodName, methodDesc, 1);
            cpfh.makeMethodHandle(referenceKind, 6);
            expect(cpfh.getCp).toThrow();
            reset();

            badMethodNames.forEach(function(methodName) {
              //These should fail.
              cpfh.enhancedMakeInterfaceMethodref(className, methodName, methodDesc, 1);
              cpfh.makeMethodHandle(referenceKind, 6);
              expect(cpfh.getCp).toThrow();
              reset();
            });
          }
        );

        it("should not allow invalid / unrecognized reference types",
          function() {
            var badIndices = [cpfh.sampleIntIdx,
                            cpfh.sampleFloatIdx,
                            cpfh.sampleLongIdx,
                            cpfh.sampleDoubleIdx,
                            cpfh.sampleStringIdx,
                            cpfh.sampleFieldrefNatIdx,
                            cpfh.sampleMethodrefNatIdx,
                            cpfh.sampleInterfaceMethodrefNatIdx,
                            cpfh.sampleClassIdx,
                            cpfh.sampleMethodHandleIdx,
                            cpfh.sampleMethodTypeIdx,
                            cpfh.sampleInvokeDynamicIdx,
                            50], //Out of range
              referenceKinds = [], refKind;

            //TODO(jvilk): Why can't I forEach on
            //Enum.referenceKind.keys?
            for (refKind in Enum.referenceKind) {
              referenceKinds.push(Enum.referenceKind[refKind]);
            }

            referenceKinds.forEach(function(referenceKind) {
              badIndices.forEach(function(idx) {
                cpfh.sampleCp(1);
                cpfh.makeMethodHandle(referenceKind, idx);
                expect(cpfh.getCp).toThrow();

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
            cpfh.initCp(2);
            cpfh.makeUTF8(descriptor);
            cpfh.makeMethodType(1);

            cp = cpfh.getCp();
            cpfh.testMethodType(cp, 2, descriptor);
            reset();

            //Forward reference.
            cpfh.initCp(2);
            cpfh.makeMethodType(2);
            cpfh.makeUTF8(descriptor);

            cp = cpfh.getCp();
            cpfh.testMethodType(cp, 1, descriptor);
          }
        );

        /**
         * We only want to verify that it is using our method descriptor
         * validator method, which is thoroughly tested elsewhere.
         */
        it("should only accept valid method descriptors",
          function() {
            var badDesc = "B";
            cpfh.initCp(2);
            cpfh.makeUTF8(badDesc);
            cpfh.makeMethodType(1);

            expect(cpfh.getCp).toThrow();
          }
        );

        it("should complain if the method descriptor index references a non-UTF8 constant pool item",
          function() {
            var badIndices = [cpfh.sampleFloatIdx,
                            cpfh.sampleLongIdx,
                            cpfh.sampleDoubleIdx,
                            cpfh.sampleStringIdx,
                            cpfh.sampleFieldrefNatIdx,
                            cpfh.sampleMethodrefNatIdx,
                            cpfh.sampleInterfaceMethodrefNatIdx,
                            cpfh.sampleClassIdx,
                            cpfh.sampleFieldrefIdx,
                            cpfh.sampleMethodrefIdx,
                            cpfh.sampleInterfaceMethodrefIdx,
                            cpfh.sampleMethodHandleIdx,
                            cpfh.sampleMethodTypeIdx,
                            cpfh.sampleInvokeDynamicIdx,
                            50]; //Out of range

            badIndices.forEach(function(idx) {
              cpfh.sampleCp(1);
              cpfh.makeMethodType(idx);
              expect(cpfh.getCp).toThrow();

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

            cpfh.initCp(4);
            cpfh.makeUTF8(name);
            cpfh.makeUTF8(desc);
            cpfh.makeNat(1, 2);
            cpfh.makeInvokeDynamic(bootstrapIdx, 3);
            
            cp = cpfh.getCp();
            cpfh.testInvokeDynamic(cp, 4, bootstrapIdx, 3);
            reset();

            //Forward reference
            cpfh.initCp(4);
            cpfh.makeUTF8(name);
            cpfh.makeUTF8(desc);
            cpfh.makeInvokeDynamic(bootstrapIdx, 4);
            cpfh.makeNat(1, 2);
            
            cp = cpfh.getCp();
            cpfh.testInvokeDynamic(cp, 3, bootstrapIdx, 4);
            reset();
          }
        );

        it("should verify that its NameAndType reference has a valid method descriptor",
          function() {
            var bootstrapIdx = 2,
                name = "someMethod",
                desc = "C";

            cpfh.initCp(4);
            cpfh.makeUTF8(name);
            cpfh.makeUTF8(desc);
            cpfh.makeNat(1, 2);
            cpfh.makeInvokeDynamic(bootstrapIdx, 3);

            expect(cpfh.getCp).toThrow();
          }
        );

        it("should verify that its NameAndType reference is, in fact, a NameAndType constant pool item",
          function() {
            var badIndices = [cpfh.sampleUTF8Idx,
                            cpfh.sampleIntIdx,
                            cpfh.sampleFloatIdx,
                            cpfh.sampleLongIdx,
                            cpfh.sampleDoubleIdx,
                            cpfh.sampleStringIdx,
                            cpfh.sampleClassIdx,
                            cpfh.sampleFieldrefIdx,
                            cpfh.sampleMethodrefIdx,
                            cpfh.sampleInterfaceMethodrefIdx,
                            cpfh.sampleMethodHandleIdx,
                            cpfh.sampleMethodTypeIdx,
                            cpfh.sampleInvokeDynamicIdx,
                            50]; //Out of range.

            badIndices.forEach(function(idx) {
              cpfh.sampleCp(1);
              cpfh.makeInvokeDynamic(2, idx);
              expect(cpfh.getCp).toThrow();
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
            cpfh.initCp(1);
            cr.addField("u1", 100, "tag"); //Invalid CP item.
            expect(cpfh.getCp).toThrow();
            reset();

            cpfh.initCp(2);
            cpfh.makeUTF8("lol");
            cr.addField("u1", 100, "tag"); //Invalid CP item.
            expect(cpfh.getCp).toThrow();
            reset();

            cpfh.initCp(2);
            cr.addField("u1", 100, "tag"); //Invalid CP item.
            cpfh.makeUTF8("lol");
            expect(cpfh.getCp).toThrow();
          }
        );
      }
    );
  }
);