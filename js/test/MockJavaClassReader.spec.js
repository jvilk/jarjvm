define(['../test/StructDataTypes', '../test/MockJavaClassReader', 'vm/Primitives'],
  function(StructDataTypes, MockJavaClassReader, Primitives) {
    "use strict";
    
    describe("MockJavaClassReader Tests",
      function () {
        var cr,
          //Variable'd so I can call it from tests.
          reset = function() {
            cr = new MockJavaClassReader();
          },
          //First argument is the function to call,
          //the rest are arguments.
          tryCallTest = function() {
            var args = Array.prototype.slice.apply(arguments);
            expect(function() {
              cr[args[0]].apply(cr, args.slice(1));
            }).toThrow();
          },
          //A simple test. Valid only for numeric types.
          numericTypeTest = function(type, val, getter) {
            var expectedOut = type === 'long' ? Primitives.getLongFromNumber(val) : val;
            reset();
            cr.addField(type, val);
            expect(cr.getField(type, StructDataTypes[type])).toEqual(expectedOut);
            expect(cr.getOffset()).toBe(StructDataTypes[type]);
            expect(cr.isEndOfFile()).toBe(true);
            reset();
            cr.addField(type, val);
            expect(cr[getter](StructDataTypes[type])).toEqual(expectedOut);
            expect(cr.getOffset()).toBe(StructDataTypes[type]);
            expect(cr.isEndOfFile()).toBe(true);
            if (!(type in { 'double': 1, 'float': 1, 'long': 1})) {
              reset();
              cr.addField(type, val);
              tryCallTest('getField', type, StructDataTypes[type]+1);
              reset();
              cr.addField(type, val);
              tryCallTest('getField', type, StructDataTypes[type]+4);
              reset();
              cr.addField(type, val);
              tryCallTest(getter, StructDataTypes[type]+1);
              reset();
              cr.addField(type, val);
              tryCallTest(getter, StructDataTypes[type]+4);
            }
          };

        beforeEach(function() {
          //Start with a fresh reader, straight from the oven.
          reset();
        });

        it("should initialize with nothing, and should complain loudly if you try to do anything with it",
          function () {
            expect(cr.getOffset()).toBe(0);
            expect(cr.isEndOfFile()).toBe(true);
            tryCallTest('getField', 'u2', 2);
            reset();
            tryCallTest('getUTF8Field', 3);
            reset();
            tryCallTest('getIntField', 4);
            reset();
            tryCallTest('getDoubleField');
            reset();
            tryCallTest('getFloatField');
            reset();
            tryCallTest('getUintField', 2);
            reset();
            tryCallTest('getLongField');
          }
        );

        it("should complain loudly if you try to get a 0-length item",
          function () {
            //On an empty cr
            tryCallTest('getField', undefined, 0);
            tryCallTest('getField', 'utf8', 0);

            //On a cr with 1 item in it.
            reset();
            cr.addField('u2', 2);
            tryCallTest('getField', undefined, 0);

            reset();
            cr.addField('utf8', 'lol');
            tryCallTest('getField', 'utf8', 0);
          }
        );

        it("should not put up with fake types",
          function() {
            tryCallTest('addField', undefined, 2);
            reset();

            cr.addField('u2', 2);
            tryCallTest('getField', undefined, 2);
          }
        );

        it("should properly handle signed integer fields",
          function() {
            var intTest = function(type, val) {
                var getter = type === 'long' ? 'getLongField' : 'getIntField';
                numericTypeTest(type, val, getter);
              },
              intTypes = ['i1', 'i2', 'i4', 'long'],
              badVals = [-1.1, 2.5, true, false, "hey", "", undefined, null, {}, []],
              intVals = [0, 1, -1, 1000],
              i, j;

              for (i = 0; i < intTypes.length; i++) {
                //Good vals!
                for (j = 0; j < intVals.length; j++) {
                  intTest(intTypes[i], intVals[j]);
                }

                //Bad vals!
                for(j = 0; j < badVals.length; j++) {
                  tryCallTest('addField', intTypes[i], badVals[j]);
                }
              }
          }
        );

        it("should properly handle unsigned integer fields",
          function() {
            var uintTest = function(type, val) {
                numericTypeTest(type, val, 'getUintField');
              },
              uintTypes = ['u1', 'u2', 'u4', 'u8'],
              uintVals = [0, 1, 1000],
              badVals = [-1, 1.1, -1.3, true, false, "lol", "", undefined, null, {}, []],
              i, j;

            for (i = 0; i < uintTypes.length; i++) {
              //Good values.
              for (j = 0; j < uintVals.length; j++) {
                uintTest(uintTypes[i], uintVals[j]);
              }

              //Bad values!
              for (j = 0; j < badVals.length; j++) {
                tryCallTest('addField', uintTypes[i], badVals[j]);
              }
            }
          }
        );

        it("should properly handle float fields",
          function() {
            var floatTest = function(val) {
                numericTypeTest('float', val, 'getFloatField');
              },
              floatVals = [0, -1, 1, 1.34, -5.43],
              badVals = [true, false, "lol", "", undefined, null, {}, []],
              i;

            for (i = 0; i < floatVals.length; i++) {
              floatTest(floatVals[i]);
            }

            for (i = 0; i < badVals.length; i++) {
              tryCallTest('addField', 'float', badVals[i]);
            }
          }
        );

        it("should properly handle double fields",
          function() {
            var doubleTest = function(val) {
                numericTypeTest('double', val, 'getDoubleField');
              },
              doubleVals = [0, -1, 1, 1.34, -5.43],
              badVals = [true, false, "lol", "", undefined, null, {}, []],
              i;

            for (i = 0; i < doubleVals.length; i++) {
              doubleTest(doubleVals[i]);
            }

            for (i = 0; i < badVals.length; i++) {
              tryCallTest('addField', 'double', badVals[i]);
            }
          }
        );

        it("should properly handle utf8 fields",
          function() {
            var utf8Test = function(val) {
                reset();
                cr.addField('utf8', val);
                expect(cr.getField('utf8', val.length)).toBe(val);
                expect(cr.getOffset()).toBe(val.length);

                reset();
                cr.addField('utf8', val);
                tryCallTest('getField', 'utf8', val.length+1);

                reset();
                cr.addField('utf8', val);
                tryCallTest('getField', 'utf8', val.length-1);

                reset();
                cr.addField('utf8', val);
                expect(cr.getUTF8Field(val.length)).toBe(val);
                expect(cr.getOffset()).toBe(val.length);

                reset();
                cr.addField('utf8', val);
                tryCallTest('getUTF8Field', val.length+1);

                reset();
                cr.addField('utf8', val);
                tryCallTest('getUTF8Field', val.length-1);
              },
              utf8Vals = [" ", "hey"],
              badVals = [undefined, null, true, false, 1, -1, 0, 1.1, -5.2, ""],
              i;

            for (i = 0; i < utf8Vals.length; i++) {
              utf8Test(utf8Vals[i]);
            }

            for (i = 0; i < badVals.length; i++) {
              tryCallTest('addField', 'utf8', badVals[i]);
            }
          }
        );

        it("should accept multiple fields, yo",
          function() {
            cr.addField('utf8', "hey");
            cr.addField('u2', 4);
            cr.addField('long', -5);
            cr.addField('double', 5.6);

            expect(cr.getUTF8Field(3)).toBe("hey");
            expect(cr.getOffset()).toBe(3);
            expect(cr.getUintField(2)).toBe(4);
            expect(cr.getOffset()).toBe(5);
            expect(cr.getLongField().equals(Primitives.getLongFromNumber(-5))).toBe(true);
            expect(cr.getOffset()).toBe(13);
            expect(cr.getDoubleField()).toBe(5.6);
            expect(cr.getOffset()).toBe(21);

            tryCallTest('getUTF8Field', 1);
            tryCallTest('getUintField', 2);
            tryCallTest('getIntField', 8);
            tryCallTest('getDoubleField');
          }
        );
      }
    );
  }
);