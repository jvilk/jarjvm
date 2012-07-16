/**
 * Convenience module for all of the Enums that we use around the JVM.
 * TODO(jvilk): There are a number of other Enums scattered about the code that I should
 * put into this module.
 */
define(
  function() {
    var Enum = {};

    /**
     * Maps colors to CSS classes for console text.
     */
    Enum.textColorClass = {
      WHITE : 'whiteConsoleText',
      RED : 'redConsoleText',
      YELLOW : 'yellowConsoleText'
    };

    /**
     * Input modes for our console.
     */
    Enum.consoleInputMode = {
      NONE : 0,
      BY_LINE : 1,
      BY_CHAR : 2
    };

    /**
     * Character codes for special characters.
     */
    Enum.controlCharacter = {
      LEFT : 37, //
      RIGHT : 39, //
      HOME : 36, //
      END : 35, //
      UP : 38, //
      DOWN : 40, //
      BACKSPACE : 8, //
      ENTER : 13, //
      TAB : 9 //
    };

    /**
     * Represents the ConstantPool tags from Table 4.3 in the JVM7 spec.
     */
    Enum.constantPoolTag = {
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

    /**
     * See Table 5.1: Bytecode Behaviors for Method Handles
     */
    Enum.bytecodeBehaviors = {
      getField : 1,
      getStatic : 2,
      putField : 3,
      putStatic : 4,
      invokeVirtual : 5,
      invokeStatic : 6,
      invokeSpecial : 7,
      newInvokeSpecial : 8,
      invokeInterface : 9
    };

    /**
     * Used around the code to represent all possible data types in the JVM.
     * PRIMITIVE is used inside the Java Array class specifically.
     * TODO(jvilk): This should probably be refactored out later for something more space efficient.
     */
    Enum.dataType = {
      INTEGER: "int",
      DOUBLE: "double",
      FLOAT: "float",
      CHAR: "char",
      SHORT: "short",
      BYTE: "byte",
      BOOLEAN: "boolean",
      LONG: "long",
      VOID: "void",
      OBJECT: "object",
      ARRAY: "array",
      PRIMITIVE: "primitive"
    };

    return Enum;
  }
);