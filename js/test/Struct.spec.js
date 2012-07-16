define(['../test/Struct.js', '../test/StructDataTypes', '../test/MockJavaClassReader', 'vm/Primitives'],
  function(Struct, StructDataTypes, MockJavaClassReader, Primitives) {
    var _id = 0;
    var uniqueID = function() {
      return "struct" + _id++;
    };

    var rejectStruct = function(name, desc) {
      expect(function() {
        return new Struct(name, desc);
      }).toThrow();
    };

    var acceptStruct = function(name, desc) {
      expect(function() {
        return new Struct(name, desc);
      }).not.toThrow();
    };

    var rejectValueForType = function(type, value) {
      expect(function() {
        return getStructAndInstantiation(type, value);
      }).toThrow();
    };

    var getStructAndInstantiation = function(type, value) {
      var a = new Struct(uniqueID(), type + " name");
      return [a, a.create(value)];
    };

    var validateComplexStruct = function(types, values) {
      var i, desc = '', struct_type, struct, retval;
      expect(types.length).toBe(values.length);

      for (i = 0; i < types.length; i++) {
        desc += types[i] + " member" + i + ";";
      }

      struct_type = new Struct(uniqueID(), desc);
      struct = struct_type.create.apply(struct_type, values);
      expect(struct.type).toBe(struct_type);

      for (i = 0; i < values.length; i++) {
        if (typeof values[i] === 'boolean') {
          expect(struct.values[i]).toBe(values[i] ? 1 : 0);
        }
        else {
          expect(struct.values[i]).toBe(values[i]);
        }
      }

      return [struct_type, struct];
    };

    var validateSimpleStruct = function(type, value) {
      return validateComplexStruct([type], [value]);
    };

    var acceptValuesForTypes = function(types, values) {
      var i, j;
      for (i = 0; i < types.length; i++) {
        for (j = 0; j < values.length; j++) {
          validateSimpleStruct(types[i], values[j]);
        }
      }
    };

    var rejectValuesForTypes = function(types, values) {
      var i, j;
      for (i = 0; i < types.length; i++) {
        for (j = 0; j < values.length; j++) {
          rejectValueForType(types[i], values[j]);
        }
      }
    };

    describe("Struct.js Tests",
      function() {
        afterEach(function() {
          Struct.prototype._clearStructs();
        });

        it ("should complain about unnamed structs",
          function() {
            rejectStruct('', 'u2 some_member');
          }
        );

        it ("should complain about structs with no members",
          function() {
            rejectStruct(uniqueID(), '');
          }
        );

        it("should allow for primitive fields",
          function() {
            var a, prim, name;

            for (prim in StructDataTypes) {
              if (!StructDataTypes.hasOwnProperty(prim)) continue;
              a = new Struct(uniqueID(), prim + " singlebyteint");
              expect(a.getMemberType(0)).toBe(prim);
              expect(a.getMemberName(0)).toBe("singlebyteint");
            }
          }
        );

        it("should allow for multiple primitive fields",
          function() {
            var desc = 'u2 field1;u2 field2;';
            var a = new Struct(uniqueID(), desc);
            expect(a.getMemberType(0)).toBe("u2");
            expect(a.getMemberName(0)).toBe('field1');
            expect(a.getMemberType(1)).toBe("u2");
            expect(a.getMemberName(1)).toBe('field2');
          }
        );

        it("should not allow access to nonexistent indices",
          function() {
            var desc = 'u2 field1;u2 field2;';
            var a = new Struct(uniqueID(), desc);

            var typeTest = function() { a.getMemberType(2); };
            var nameTest = function() { a.getMemberName(2); };

            expect(typeTest).toThrow();
            expect(nameTest).toThrow();
          }
        );

        it("should not allow for non-string names",
          function () {
            var desc = 'u1 field1';
            rejectStruct(3, desc);
          }
        );

        it("should not allow a non-string description",
          function () {
            rejectStruct(uniqueID(), 4);
          }
        );

        it("should allow a trailing semicolon on names",
          function () {
            var desc = 'u1 field1;';
            var a = new Struct(uniqueID(), desc);
            expect(a.getMemberName(0)).toBe('field1');
            expect(a.getMemberType(0)).toBe("u1");
          }
        );

        it("should not allow for multiple fields with the same name",
          function() {
            var desc = 'u2 name1;u1 name1';
            rejectStruct(uniqueID(), desc);
          }
        );

        it("should not allow for multiple fields with the same name, even if same type",
          function() {
            var desc = 'u1 name1;u1 name1';
            rejectStruct(uniqueID(), desc);
          }
        );

        it("should allow fields to have same name as struct",
          function() {
            var desc = 'u1 name1';
            acceptStruct('name1', desc);
          }
        );

        it("should allow a nested structure",
          function() {
            var desc1 = 'utf8 member1';
            var struct1 = new Struct('struct1', desc1);
            var desc2 = 'struct1 member1';
            var struct2 = new Struct('struct2', desc2);

            expect(struct2.getMemberType(0)).toBe(struct1);
            expect(struct2.getMemberName(0)).toBe('member1');
            expect(struct2.getMemberType(0).getMemberName(0)).toBe('member1');
          }
        );

        it("should allow multiple nested structures",
          function() {
            var desc1 = 'utf8 member1';
            var struct1 = new Struct('struct1', desc1);
            var desc2 = 'struct1 member1; struct1 anotherMember';
            var struct2 = new Struct('struct2', desc2);

            expect(struct2.getMemberType(0)).toBe(struct1);
            expect(struct2.getMemberType(1)).toBe(struct1);
            expect(struct2.getMemberName(0)).toBe('member1');
            expect(struct2.getMemberName(1)).toBe('anotherMember');
            expect(struct2.getMemberType(0).getMemberName(0)).toBe('member1');
          }
        );

        it("should allow an arbitrary number of nested structures",
          function() {
            var desc1 = 'utf8 member1';
            var struct1 = new Struct('struct1', desc1);
            var desc2 = 'struct1 member1; struct1 anotherMember';
            var struct2 = new Struct('struct2', desc2);
            var desc3 = 'struct1 member1; struct2 member2; struct1 member4;';
            var struct3 = new Struct('struct3', desc3);

            expect(struct3.getMemberType(0)).toBe(struct1);
            expect(struct3.getMemberType(1)).toBe(struct2);
            expect(struct3.getMemberType(2)).toBe(struct1);
            expect(struct3.getMemberName(0)).toBe('member1');
            expect(struct3.getMemberName(1)).toBe('member2');
            expect(struct3.getMemberName(2)).toBe('member4');
          }
        );

        it("should not allow redefinition of an existing structure",
          function () {
            var struct1 = new Struct('struct1', 'u2 amember');
            rejectStruct('struct1', 'i2 someMember');
          }
        );

        it("should not allow nested structure of same type.",
          function() {
            rejectStruct('struct1', 'struct1 member');
          }
        );

        it("should allow for whitespace.",
          function () {
            var desc1 = "  \tutf8\n string  \n;  \n";
            var struct1 = new Struct('struct1', desc1);
            expect(struct1.getMemberName(0)).toBe('string');
            expect(struct1.getMemberType(0)).toBe("utf8");
          }
        );

        it("should not accept undefined values",
          function() {
            var type;
            for (type in StructDataTypes) {
              rejectValueForType(type, undefined);
            }
          }
        );

        it("should not accept strings, negative integers, or floating point numbers for unsigned types",
          function() {
            rejectValuesForTypes(['u1', 'u2', 'u4', 'u8'], ['', 'test', -1, 1.3]);
          }
        );

        it ("should not accept booleans for any type that is not u1",
          function() {
            var type;
            for (type in StructDataTypes) {
              if (type === 'u1') {
                continue;
              }

              rejectValueForType(type, false);
              rejectValueForType(type, true);
            }
          }
        );

        it("should accept positive integers for unsigned numbers",
          function() {
            acceptValuesForTypes(['u1', 'u2', 'u4', 'u8'], [0, 1]);
          }
        );

        it("should reject floating point, strings, and booleans for signed values",
          function() {
            rejectValuesForTypes(['i1', 'i2', 'i4', 'long'], [1.1, '', 'hey', false, true]);
          }
        );

        it("should accept both positive and negative signed numbers",
          function() {
            acceptValuesForTypes(['i1', 'i2', 'i4', 'long'], [0, -1, 1, 100, -100]);
          }
        );

        it("should accept booleans for 1 byte unsigned integers",
          function() {
            acceptValuesForTypes(['u1'], [true, false]);
          }
        );

        it("should accept strings for utf8 types",
          function() {
            acceptValuesForTypes(['utf8'], ['', 'blah']);
          }
        );

        it("should accept floating point numbers for floats / doubles",
          function() {
            acceptValuesForTypes(['float', 'double'], [1.0, 1, -1, -1.3, 0]);
          }
        );

        it("should properly create structs with multiple types",
          function() {
            validateComplexStruct(['u1', 'u1'], [true, false]);
            validateComplexStruct(['u2', 'float', 'i2'], [3, 5.2, -3]);
            validateComplexStruct(['utf8', 'u4'], ["hello world", 4858]);
          }
        );

        it("should properly create structs with nested structures",
          function() {
            var retval = validateComplexStruct(['u1', 'u1'], [true, false]);
            validateComplexStruct([retval[0].getName(), 'utf8', retval[0].getName()], [retval[1], 'hey', retval[1]]);
          }
        );

        /** MockJavaClassReader Tests **/

        it("should properly add simple structs to a MockJavaClassReader",
          function() {
            var retval = validateSimpleStruct('u2', 23),
                classReader = new MockJavaClassReader();
            retval[1].addToClassReader(classReader);
            expect(classReader.getUintField(2)).toBe(23);
            //Offset
            //Etc.
          }
        );

        //Add simple structs to MockClassReader.
        //Add struct w/ multiple fields to MockClassReader.
        // --> Remember utf8 special case.
        //Add struct w/ nested members to MockClassReader.
      }
    );
  }
);