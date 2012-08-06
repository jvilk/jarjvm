/**
 * Tests Attribute parsing in the AttributeFactory module.
 * TODO(jvilk): Need to port over the constant pool factory helpers
 * so I can use them in here. :(
 * Alternatively: Construct items manually.
 */
describe(['../test/Struct', 'vm/Attributes/AttributeFactory', '../test/MockJavaClassReader'],
  function(Struct, AttributeFactory, MockJavaClassReader) {
    "use strict";
    
    var cr,
        /**
         * Run before every test. Resets the class reader.
         */
        reset = function() {
          cr = new MockJavaClassReader();
        },
        /**
         * Writes the number of attributes that will be in the attributes[] array.
         */
        initAttributes = function(numFields) {
          cr.addField('u2', numFields);
        },
        /**
         * Writes the header of an attribute.
         */
        _makeAttributeHeader = function(nameIndex, length) {
          cr.addField('u2', nameIndex);
          cr.addField('u4', length);
        },
        makeConstantValue = function(nameIndex, length, valueIndex) {

        };

    describe("Attribute: ConstantValue (§4.7.2)",
      function() {
       
      }
    );

    describe("Attribute: Code (§4.7.3)",
      function() {

      }
    );

    describe("Attribute: StackMapTable (§4.7.4)",
      function() {

      }
    );

    describe("Attribute: Exceptions (§4.7.5)",
      function() {

      }
    );

    describe("Attribute: InnerClasses (§4.7.6)",
      function() {

      }
    );

    describe("Attribute: EnclosingMethod (§4.7.7)",
      function() {

      }
    );

    describe("Attribute: Synthetic (§4.7.8)",
      function() {

      }
    );

    describe("Attribute: Signature (§4.7.9)",
      function() {

      }
    );

    describe("Attribute: SourceFile (§4.7.10)",
      function() {

      }
    );

    describe("Attribute: SourceDebugExtension (§4.7.11)",
      function() {

      }
    );

    describe("Attribute: LineNumberTable (§4.7.12)",
      function() {

      }
    );

    describe("Attribute: LocalVariableTable (§4.7.13)",
      function() {

      }
    );

    describe("Attribute: LocalVariableTypeTable (§4.7.14)",
      function() {

      }
    );

    describe("Attribute: Deprecated (§4.7.15)",
      function() {

      }
    );

    describe("Attribute: RuntimeVisibleAnnotations (§4.7.16)",
      function() {

      }
    );

    describe("Attribute: RuntimeInvisibleAnnotations (§4.7.17)",
      function() {

      }
    );

    describe("Attribute: RuntimeVisibleParameterAnnotations (§4.7.18)",
      function() {

      }
    );

    describe("Attribute: RuntimeInvisibleParameterAnnotations (§4.7.19)",
      function() {

      }
    );

    describe("Attribute: AnnotationDefault (§4.7.20)",
      function() {

      }
    );

    describe("Attribute: BootstrapMethods (§4.7.21)",
      function() {

      }
    );
  }
);