define(['util/Util', 'vm/Enum'],
  function(Util, Enum) {
    var PrimitiveMaker = {};
    PrimitiveMaker.getInteger = function(value) { return new Integer(value); };
    PrimitiveMaker.getBool = function(value) { return new Bool(value); };
    PrimitiveMaker.getByte = function(value) { return new Byte(value); };
    PrimitiveMaker.getChar = function(value) { return new Char(value); };
    PrimitiveMaker.getFloat = function(value) { return new Float(value); };
    PrimitiveMaker.getDouble = function(value) { return new Double(value); };
    PrimitiveMaker.getShort = function(value) { return new Short(value); };
    PrimitiveMaker.getLong = function(low, high) { return new Long(low, high); };
    PrimitiveMaker.getLongFromNumber = function(value) { return Long.fromNumber(value); };

    function Primitive(typeName, value){
      this.dataType = typeName;
      this.value = value;
    }

    function Integer(value){
      require('util/Util').inherits(this, Primitive, Enum.dataType.INTEGER, value & 0xFFFFFFFF); //Whatever the value is make it a 32bit signed int
    }

    /**Arithmetic **/
    Integer.prototype.add = function(otherPrimitive){
      return new Integer(this.value + otherPrimitive.value);
    };
    Integer.prototype.subtract = function(otherPrimitive){
      return new Integer(this.value - otherPrimitive.value);
    };
    Integer.prototype.multiply = function(otherPrimitive){
      return new Integer(this.value * otherPrimitive.value);
    };
    Integer.prototype.divide = function(otherPrimitive){
      return new Integer(this.value / otherPrimitive.value);
    };
    Integer.prototype.negate = function(){
      return new Integer(-this.value);
    };
    Integer.prototype.modulo = function(otherPrimitive){
      var result = this.value % otherPrimitive.value;
      return new Integer(result);
    };
    
    /**Shifting**/
    //Shift this number left by the shift amount
    Integer.prototype.shiftLeft = function(shiftAmount){
      return new Integer(this.value << shiftAmount);
    };
    
    Integer.prototype.shiftRight = function(shiftAmount){
      return new Integer(this.value >> shiftAmount);
    };
    
    //Shift this number right by the shift amount unsigned
    Integer.prototype.shiftRightUnsigned = function(shiftAmount){
      return new Integer(this.value >>> shiftAmount);
    };
    
    /**Logical Operations **/
    
    Integer.prototype.and = function(otherPrimitive){
      return new Integer(this.value & otherPrimitive.value);
    };
    
    Integer.prototype.or = function(otherPrimitive){
      return new Integer(this.value | otherPrimitive.value);
    };
    
    Integer.prototype.xor = function(otherPrimitive){
      return new Integer(this.value ^ otherPrimitive.value);
    };

    /**Conversion Functions **/
    Integer.prototype.toInteger = function(){
      return new Integer(this.value); //Wink ;)
    };
    Integer.prototype.toDouble = function(){
      return new Double(this.value); //Wink ;)
    };
    Integer.prototype.toLong = function(){
      return new Long.fromNumber(this.value); //Use the long method - already creates new long
    };
    Integer.prototype.toByte = function(){
      return new Byte(this.value); //Return a new byte with this value
    };
    Integer.prototype.toBool = function(){
      return new Bool(this.value);
    };
    Integer.prototype.toChar = function(){
      return new Char(this.value); //Return a new char with this value
    };
    Integer.prototype.toShort = function(){
      return new Short(this.value);
    };
    Integer.prototype.toFloat = function(){
      return new Float(this.value); //Wink, but the Float has more precision
    };
    Integer.prototype.toString = function(){
      var integer = Math.floor(this.value);
      return "[" + this.dataType + " " + integer.toString() + "]";
    };
    Integer.prototype.clone = function(){
      return new Integer(this.value);
    };

    function Byte(value){
      require('util/Util').inherits(this, Primitive, Enum.dataType.BYTE, value & 0xFF);
    }

    Byte.prototype.add = function(otherPrimitive){
      return new Byte(this.value + otherPrimitive.value);
    };
    Byte.prototype.subtract = function(otherPrimitive){
      return new Byte(this.value - otherPrimitive.value);
    };
    Byte.prototype.multiply = function(otherPrimitive){
      return new Byte(this.value * otherPrimitive.value);
    };
    Byte.prototype.divide = function(otherPrimitive){
      return new Byte(this.value / otherPrimitive.value);
    };
    Byte.prototype.negate = function(){
      return new Byte(-this.value);
    };
    Byte.prototype.modulo = function(otherPrimitive){
      var result = this.value - (this.value/otherPrimitive.value) * otherPrimitive.value;
      return new Byte(result);
    };
    /**Shifting**/
    //Shift this number left by the shift amount
    Byte.prototype.shiftLeft = function(shiftAmount){
      return new Byte(this.value << shiftAmount);
    };
    
    Byte.prototype.shiftRight = function(shiftAmount){
      return new Byte(this.value >> shiftAmount);
    };
    
    //Shift this number right by the shift amount unsigned
    Byte.prototype.shiftRightUnsigned = function(shiftAmount){
      return new Byte(this.value >>> shiftAmount);
    };
    
    /**Logical Operations **/
    
    Byte.prototype.and = function(otherPrimitive){
      return new Byte(this.value & otherPrimitive.value);
    };
    
    Byte.prototype.or = function(otherPrimitive){
      return new Byte(this.value | otherPrimitive.value);
    };
    
    Byte.prototype.xor = function(otherPrimitive){
      return new Byte(this.value ^ otherPrimitive.value);
    };

    /**Conversion Functions **/
    Byte.prototype.toInteger = function(){
      return new Integer(this.value);
    };
    Byte.prototype.toDouble = function(){
      return new Double(this.value);
    };
    Byte.prototype.toLong = function(){
      return new Long.fromNumber(this.value); //Use the long method - already creates new long
    };
    Byte.prototype.toByte = function(){
      return new Byte(this.value);
    };
    Byte.prototype.toBool = function(){
      return new Bool(this.value);
    };
    Byte.prototype.toChar = function(){
      return new Char(this.value);
    };
    Byte.prototype.toShort = function(){
      return new Short(this.value);
    };
    Byte.prototype.toFloat = function(){
      return new Float(parseFloat(this.value));
    };
    Byte.prototype.toString = function(){
      var integer = Math.floor(this.value);
      return integer.toString();
    };
    Byte.prototype.toString = function(){
      var byte_ = this.value & 0xFF;
      return "[" + this.dataType + " " + byte_.toString() + "]";
    };
    Byte.prototype.clone = function(){
      return new Byte(this.value);
    };

    function Bool(value){
      require('util/Util').inherits(this, Primitive, Enum.dataType.BOOLEAN, value & 0x1);
    }

    Bool.prototype.add = function(otherPrimitive){
      return new Bool(this.value + otherPrimitive.value);
    };
    Bool.prototype.subtract = function(otherPrimitive){
      return new Bool(this.value - otherPrimitive.value);
    };
    Bool.prototype.multiply = function(otherPrimitive){
      return new Bool(this.value * otherPrimitive.value);
    };
    Bool.prototype.divide = function(otherPrimitive){
      return new Bool(this.value / otherPrimitive.value);
    };
    Bool.prototype.negate = function(){
      return new Bool(-this.value);
    };
    Bool.prototype.modulo = function(otherPrimitive){
      var result = this.value - (this.value/otherPrimitive.value) * otherPrimitive.value;
      return new Bool(result);
    };
    /**Shifting**/
    //Shift this number left by the shift amount
    Bool.prototype.shiftLeft = function(shiftAmount){
      return new Bool(this.value << shiftAmount);
    };
    
    Bool.prototype.shiftRight = function(shiftAmount){
      return new Bool(this.value >> shiftAmount);
    };
    
    //Shift this number right by the shift amount unsigned
    Bool.prototype.shiftRightUnsigned = function(shiftAmount){
      return new Bool(this.value >>> shiftAmount);
    };
    
    /**Logical Operations **/
    
    Bool.prototype.and = function(otherPrimitive){
      return new Bool(this.value & otherPrimitive.value);
    };
    
    Bool.prototype.or = function(otherPrimitive){
      return new Bool(this.value | otherPrimitive.value);
    };
    
    Bool.prototype.xor = function(otherPrimitive){
      return new Bool(this.value ^ otherPrimitive.value);
    };

    /**Conversion Functions **/
    Bool.prototype.toInteger = function(){
      return new Integer(this.value);
    };
    Bool.prototype.toDouble = function(){
      return new Double(this.value);
    };
    Bool.prototype.toLong = function(){
      return new Long.fromNumber(this.value); //Use the long method - already creates new long
    };
    Bool.prototype.toByte = function(){
      return new Byte(this.value);
    };
    Bool.prototype.toBool = function(){
      return new Bool(this.value);
    };
    Bool.prototype.toChar = function(){
      return new Char(this.value);
    };
    Bool.prototype.toShort = function(){
      return new Short(this.value);
    };
    Bool.prototype.toFloat = function(){
      return new Float(parseFloat(this.value));
    };
    Bool.prototype.toString = function(){
      var bool_ = this.value & 0x1;
      return "[" + this.dataType + " " + bool_.toString() + "]";
    };
    Bool.prototype.clone = function(){
      return new Bool(this.value);
    };

    function Char(value){
      require('util/Util').inherits(this, Primitive, Enum.dataType.CHAR, value & 0xFF);
    }

    Char.prototype.add = function(otherPrimitive){
      return new Char(this.value + otherPrimitive.value);
    };
    Char.prototype.subtract = function(otherPrimitive){
      return new Char(this.value - otherPrimitive.value);
    };
    Char.prototype.multiply = function(otherPrimitive){
      return new Char(this.value * otherPrimitive.value);
    };
    Char.prototype.divide = function(otherPrimitive){
      return new Char(this.value / otherPrimitive.value);
    };
    Char.prototype.negate = function(){
      return new Char(-this.value);
    };
    Char.prototype.modulo = function(otherPrimitive){
      var result = this.value - (this.value/otherPrimitive.value) * otherPrimitive.value;
      return new Char(result);
    };
    /**Shifting**/
    //Shift this number left by the shift amount
    Char.prototype.shiftLeft = function(shiftAmount){
      return new Char(this.value << shiftAmount);
    };
    
    Char.prototype.shiftRight = function(shiftAmount){
      return new Char(this.value >> shiftAmount);
    };
    
    //Shift this number right by the shift amount unsigned
    Char.prototype.shiftRightUnsigned = function(shiftAmount){
      return new Char(this.value >>> shiftAmount);
    };
    /**Logical Operations **/
    
    /**Logical Operations **/
    
    Char.prototype.and = function(otherPrimitive){
      return new Char(this.value & otherPrimitive.value);
    };
    
    Char.prototype.or = function(otherPrimitive){
      return new Char(this.value | otherPrimitive.value);
    };
    
    Char.prototype.xor = function(otherPrimitive){
      return new Char(this.value ^ otherPrimitive.value);
    };

    /**Conversion Functions **/
    Char.prototype.toInteger = function(){
      return new Integer(this.value);
    };
    Char.prototype.toDouble = function(){
      return new Double(this.value);
    };
    Char.prototype.toLong = function(){
      return new Long.fromNumber(this.value); //Use the long method - already creates new long
    };
    Char.prototype.toByte = function(){
      return new Byte(this.value);
    };
    Char.prototype.toBool = function(){
      return new Bool(this.value);
    };
    Char.prototype.toChar = function(){
      return new Char(this.value);
    };
    Char.prototype.toShort = function(){
      return new Short(this.value);
    };
    Char.prototype.toFloat = function(){
      return new Float(parseFloat(this.value));
    };
    Char.prototype.toString = function(){
      var char_ = this.value & 0xFF;
      return "[" + this.dataType + " " + char_.toString() + "]";
    };
    Char.prototype.clone = function(){
      return new Char(this.value);
    };

    function Double(value){
      require('util/Util').inherits(this, Primitive, Enum.dataType.DOUBLE, value);
    }

    Double.prototype.add = function(otherPrimitive){
      return new Double(this.value + otherPrimitive.value);
    };
    Double.prototype.subtract = function(otherPrimitive){
      return new Double(this.value - otherPrimitive.value);
    };
    Double.prototype.multiply = function(otherPrimitive){
      return new Double(this.value * otherPrimitive.value);
    };
    Double.prototype.divide = function(otherPrimitive){
      //TODO: Make sure this works according to the JVM spec
      return new Double(this.value / otherPrimitive.value);
    };
    Double.prototype.negate = function(){
      return new Double(-this.value);
    };
    Double.prototype.modulo = function(otherPrimitive){
      var result = this.value - (this.value/otherPrimitive.value) * otherPrimitive.value;
      return new Double(result);
    };
    
    /**Shifting**/
    //Shift this number left by the shift amount
    Double.prototype.shiftLeft = function(shiftAmount){
      return new Double(this.value << shiftAmount);
    };
    
    Double.prototype.shiftRight = function(shiftAmount){
      return new Double(this.value >> shiftAmount);
    };
    
    //Shift this number right by the shift amount unsigned
    Double.prototype.shiftRightUnsigned = function(shiftAmount){
      return new Double(this.value >>> shiftAmount);
    };
    
    /**Logical Operations **/
    
    Double.prototype.and = function(otherPrimitive){
      return new Double(this.value & otherPrimitive.value);
    };
    
    Double.prototype.or = function(otherPrimitive){
      return new Double(this.value | otherPrimitive.value);
    };
    
    Double.prototype.xor = function(otherPrimitive){
      return new Double(this.value ^ otherPrimitive.value);
    };

    /**Conversion Functions **/
    Double.prototype.toInteger = function(){
      return new Integer(this.value); //wink
    };
    Double.prototype.toDouble = function(){
      return new Double(this.value); //wink
    };
    Double.prototype.toLong = function(){
      return new Long.fromNumber(this.value); //Use the long method - already creates new long
    };
    Double.prototype.toByte = function(){
      return new Byte(this.value);
    };
    Double.prototype.toBool = function(){
      return new Bool(this.value );
    };
    Double.prototype.toChar = function(){
      return new Char(this.value); //Return a new char with this value
    };
    Double.prototype.toShort = function(){
      return new Char(this.value); //Return a new char with this value
    };
    Double.prototype.toFloat = function(){
      //TODO: Do a bounds check
      return new Float(parseFloat(this.value)); //Wink ;)
    };
    Double.prototype.toString = function(){
      return "[" + this.dataType + " " + this.value.toString() + "]";
    };
    Double.prototype.clone = function(){
      return new Double(this.value);
    };

    function Float(value){
      require('util/Util').inherits(this, Primitive, Enum.dataType.FLOAT, value);
    }

    Float.prototype.add = function(otherPrimitive){
      return new Float("float", this.value + otherPrimitive.value);
    };
    Float.prototype.subtract = function(otherPrimitive){
      return new Float("float", this.value - otherPrimitive.value);
    };
    Float.prototype.multiply = function(otherPrimitive){
      return new Float("float", this.value * otherPrimitive.value);
    };
    Float.prototype.subtract = function(otherPrimitive){
      return new Float("float", this.value / otherPrimitive.value);
    };
    Float.prototype.negate = function(){
      return new Float(-this.value);
    };
    Float.prototype.modulo = function(otherPrimitive){
      var result = this.value - (this.value/otherPrimitive.value) * otherPrimitive.value;
      return new Float(result);
    };
    /**Shifting**/
    //Shift this number left by the shift amount
    Float.prototype.shiftLeft = function(shiftAmount){
      return new Float(this.value << shiftAmount);
    };
    
    Float.prototype.shiftRight = function(shiftAmount){
      return new Float(this.value >> shiftAmount);
    };
    
    //Shift this number right by the shift amount unsigned
    Float.prototype.shiftRightUnsigned = function(shiftAmount){
      return new Float(this.value >>> shiftAmount);
    };
    
    /**Logical Operations **/
    
    Float.prototype.and = function(otherPrimitive){
      return new Float(this.value & otherPrimitive.value);
    };
    
    Float.prototype.or = function(otherPrimitive){
      return new Float(this.value | otherPrimitive.value);
    };
    
    Float.prototype.xor = function(otherPrimitive){
      return new Float(this.value ^ otherPrimitive.value);
    };

    /**Conversion Functions **/
    Float.prototype.toInteger = function(){
      return new Integer(this.value);
    };
    Float.prototype.toDouble = function(){
      return new Double(this.value);
    };
    Float.prototype.toLong = function(){
      return new Long.fromNumber(this.value); //Use the long method - already creates new long
    };
    Float.prototype.toByte = function(){
      return new Byte(this.value & 0xFF);
    };
    Float.prototype.toBool = function(){
      return new Bool(this.value & 0x1);
    };
    Float.prototype.toChar = function(){
      return new Char(this.value & 0xFF);
    };
    Float.prototype.toShort = function(){
      return new Short(this.value & 0xFFFF);
    };
    Float.prototype.toFloat = function(){
      return new Float(parseFloat(this.value));
    };
    Float.prototype.toString = function(){
      return "[" + this.dataType + " " + this.value.toString() + "]";
    };
    Float.prototype.clone = function(){
      return new Float(this.value);
    };

    // Copyright 2009 The Closure Library Authors. All Rights Reserved.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS-IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.

    /**
     * @fileoverview Defines a Long class for representing a 64-bit two's-complement
     * integer value, which faithfully simulates the behavior of a Java "long". This
     * implementation is derived from LongLib in GWT.
     *
     * Adapted by John Vilk for use in JAR JVM
     */


    /**
     * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
     * values as *signed* integers.  See the from* functions below for more
     * convenient ways of constructing Longs.
     *
     * The internal representation of a long is the two given signed, 32-bit values.
     * We use 32-bit pieces because these are the size of integers on which
     * Javascript performs bit-operations.  For operations like addition and
     * multiplication, we split each number into 16-bit pieces, which can easily be
     * multiplied within Javascript's floating-point representation without overflow
     * or change in sign.
     *
     * In the algorithms below, we frequently reduce the negative case to the
     * positive case by negating the input(s) and then post-processing the result.
     * Note that we must ALWAYS check specially whether those values are MIN_VALUE
     * (-2^63) because -MIN_VALUE === MIN_VALUE (since 2^63 cannot be represented as
     * a positive number, it overflows back into a negative).  Not handling this
     * case would often result in infinite recursion.
     *
     * @param {number} low  The low (signed) 32 bits of the long.
     * @param {number} high  The high (signed) 32 bits of the long.
     * @constructor
     */
    function Long(low, high) {
      /**
       * @type {number}
       * @private
       */
      this.low_ = low | 0;  // force into 32 signed bits.

      /**
       * @type {number}
       * @private
       */
      this.high_ = high | 0;  // force into 32 signed bits.
    }

    //Hack here because Data wasn't loading fast enough
    Long.prototype.dataType = "long";

    Long.prototype.toInteger = function() {
      return new Integer(Long.prototype.toInt());
    };
    Long.prototype.toDouble = function() {
      return new Double(Long.prototype.toNumber());
    };
    Long.prototype.toLong = function() {
      return new Long(this.low, this.high);
    };
    Long.prototype.toByte = function() {
      var int_ = Long.prototype.toInt();
      return new Byte(int_);
    };
    Long.prototype.toBool = function() {
      var int_ = Long.prototype.toInt();
      return new Bool(int_);
    };
    Long.prototype.toChar = function() {
      var int_ = Long.prototype.toInt();
      return new Char(int_);
    };
    Long.prototype.toShort = function() {
      var int_ = Long.prototype.toInt();
      return new Short(int_);
    };
    Long.prototype.toFloat = function() {
      return new Float(Long.prototype.toNumber());
    };
    Long.prototype.toString = function() {
      return "[" + Long.prototype.dataType + " " + Long.prototype.toString() + "]";
    };
    Long.prototype.clone = function() {
      return new Long(this.low, this.high);
    };


    // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
    // from* methods on which they depend.


    /**
     * A cache of the Long representations of small integer values.
     * @type {Object}
     * @private
     */
    Long.INT_CACHE_ = {};


    /**
     * Returns a Long representing the given (32-bit) integer value.
     * @param {number} value The 32-bit integer in question.
     * @return {Long} The corresponding Long value.
     */
    Long.fromInt = function(value) {
      if (-128 <= value && value < 128) {
        var cachedObj = Long.INT_CACHE_[value];
        if (cachedObj) {
          return cachedObj;
        }
      }

      var obj = new Long(value | 0, value < 0 ? -1 : 0);
      if (-128 <= value && value < 128) {
        Long.INT_CACHE_[value] = obj;
      }
      return obj;
    };


    /**
     * Returns a Long representing the given value, provided that it is a finite
     * number.  Otherwise, zero is returned.
     * @param {number} value The number in question.
     * @return {Long} The corresponding Long value.
     */
    Long.fromNumber = function(value) {
      if (isNaN(value) || !isFinite(value)) {
        return Long.ZERO;
      } else if (value <= -Long.TWO_PWR_63_DBL_) {
        return Long.MIN_VALUE;
      } else if (value + 1 >= Long.TWO_PWR_63_DBL_) {
        return Long.MAX_VALUE;
      } else if (value < 0) {
        return Long.fromNumber(-value).negate();
      } else {
        return new Long(
            (value % Long.TWO_PWR_32_DBL_) | 0,
            (value / Long.TWO_PWR_32_DBL_) | 0);
      }
    };


    /**
     * Returns a Long representing the 64-bit integer that comes by concatenating
     * the given high and low bits.  Each is assumed to use 32 bits.
     * @param {number} lowBits The low 32-bits.
     * @param {number} highBits The high 32-bits.
     * @return {Long} The corresponding Long value.
     */
    Long.fromBits = function(lowBits, highBits) {
      return new Long(lowBits, highBits);
    };


    /**
     * Returns a Long representation of the given string, written using the given
     * radix.
     * @param {string} str The textual representation of the Long.
     * @param {number=} opt_radix The radix in which the text is written.
     * @return {Long} The corresponding Long value.
     */
    Long.fromString = function(str, opt_radix) {
      if (str.length === 0) {
        throw Error('number format error: empty string');
      }

      var radix = opt_radix || 10;
      if (radix < 2 || 36 < radix) {
        throw Error('radix out of range: ' + radix);
      }

      if (str.charAt(0) === '-') {
        return Long.fromString(str.substring(1), radix).negate();
      } else if (str.indexOf('-') >= 0) {
        throw Error('number format error: interior "-" character: ' + str);
      }

      // Do several (8) digits each time through the loop, so as to
      // minimize the calls to the very expensive emulated div.
      var radixToPower = Long.fromNumber(Math.pow(radix, 8));

      var result = Long.ZERO;
      for (var i = 0; i < str.length; i += 8) {
        var size = Math.min(8, str.length - i);
        var value = parseInt(str.substring(i, i + size), radix);
        if (size < 8) {
          var power = Long.fromNumber(Math.pow(radix, size));
          result = result.multiply(power).add(Long.fromNumber(value));
        } else {
          result = result.multiply(radixToPower);
          result = result.add(Long.fromNumber(value));
        }
      }
      return result;
    };


    // NOTE: the compiler should inline these constant values below and then remove
    // these variables, so there should be no runtime penalty for these.


    /**
     * Number used repeated below in calculations.  This must appear before the
     * first call to any from* function below.
     * @type {number}
     * @private
     */
    Long.TWO_PWR_16_DBL_ = 1 << 16;

    /**
     * @type {number}
     * @private
     */
    Long.TWO_PWR_24_DBL_ = 1 << 24;

    /**
     * @type {number}
     * @private
     */
    Long.TWO_PWR_32_DBL_ =
        Long.TWO_PWR_16_DBL_ * Long.TWO_PWR_16_DBL_;

    /**
     * @type {number}
     * @private
     */
    Long.TWO_PWR_31_DBL_ =
        Long.TWO_PWR_32_DBL_ / 2;

    /**
     * @type {number}
     * @private
     */
    Long.TWO_PWR_48_DBL_ =
        Long.TWO_PWR_32_DBL_ * Long.TWO_PWR_16_DBL_;

    /**
     * @type {number}
     * @private
     */
    Long.TWO_PWR_64_DBL_ =
        Long.TWO_PWR_32_DBL_ * Long.TWO_PWR_32_DBL_;

    /**
     * @type {number}
     * @private
     */
    Long.TWO_PWR_63_DBL_ =
        Long.TWO_PWR_64_DBL_ / 2;


    /** @type {Long} */
    Long.ZERO = Long.fromInt(0);

    /** @type {Long} */
    Long.ONE = Long.fromInt(1);

    /** @type {Long} */
    Long.NEG_ONE = Long.fromInt(-1);

    /** @type {Long} */
    Long.MAX_VALUE =
        Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);

    /** @type {Long} */
    Long.MIN_VALUE = Long.fromBits(0, 0x80000000 | 0);


    /**
     * @type {Long}
     * @private
     */
    Long.TWO_PWR_24_ = Long.fromInt(1 << 24);


    /** @return {number} The value, assuming it is a 32-bit integer. */
    Long.prototype.toInt = function() {
      return this.low_;
    };


    /** @return {number} The closest floating-point representation to this value. */
    Long.prototype.toNumber = function() {
      return this.high_ * Long.TWO_PWR_32_DBL_ +
             this.getLowBitsUnsigned();
    };


    Long.prototype.toString = function(opt_radix) {
      var oldstring = Long.prototype.toStringOld(opt_radix);
      return "[long " + oldstring + "]";
    };

    /**
     * @param {number=} opt_radix The radix in which the text should be written.
     * @return {string} The textual representation of this value.
     */
    Long.prototype.toStringOld = function(opt_radix) {
      var radix = opt_radix || 10;
      if (radix < 2 || 36 < radix) {
        throw Error('radix out of range: ' + radix);
      }

      if (this.isZero()) {
        return '0';
      }

      if (this.isNegative()) {
        if (this.equals(Long.MIN_VALUE)) {
          // We need to change the Long value before it can be negated, so we remove
          // the bottom-most digit in this base and then recurse to do the rest.
          var radixLong = Long.fromNumber(radix);
          var div = this.div(radixLong);
          var rem = div.multiply(radixLong).subtract(this);
          return div.toString(radix) + rem.toInt().toString(radix);
        } else {
          return '-' + this.negate().toString(radix);
        }
      }

      // Do several (6) digits each time through the loop, so as to
      // minimize the calls to the very expensive emulated div.
      var radixToPower = Long.fromNumber(Math.pow(radix, 6));

      var rem = this;
      var result = '';
      while (true) {
        var remDiv = rem.div(radixToPower);
        var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
        var digits = intval.toString(radix);

        rem = remDiv;
        if (rem.isZero()) {
          return digits + result;
        } else {
          while (digits.length < 6) {
            digits = '0' + digits;
          }
          result = '' + digits + result;
        }
      }
    };


    /** @return {number} The high 32-bits as a signed value. */
    Long.prototype.getHighBits = function() {
      return this.high_;
    };


    /** @return {number} The low 32-bits as a signed value. */
    Long.prototype.getLowBits = function() {
      return this.low_;
    };


    /** @return {number} The low 32-bits as an unsigned value. */
    Long.prototype.getLowBitsUnsigned = function() {
      return (this.low_ >= 0) ?
          this.low_ : Long.TWO_PWR_32_DBL_ + this.low_;
    };


    /**
     * @return {number} Returns the number of bits needed to represent the absolute
     *     value of this Long.
     */
    Long.prototype.getNumBitsAbs = function() {
      if (this.isNegative()) {
        if (this.equals(Long.MIN_VALUE)) {
          return 64;
        } else {
          return this.negate().getNumBitsAbs();
        }
      } else {
        var val = this.high_ != 0 ? this.high_ : this.low_;
        for (var bit = 31; bit > 0; bit--) {
          if ((val & (1 << bit)) != 0) {
            break;
          }
        }
        return this.high_ != 0 ? bit + 33 : bit + 1;
      }
    };


    /** @return {boolean} Whether this value is zero. */
    Long.prototype.isZero = function() {
      return this.high_ === 0 && this.low_ === 0;
    };


    /** @return {boolean} Whether this value is negative. */
    Long.prototype.isNegative = function() {
      return this.high_ < 0;
    };


    /** @return {boolean} Whether this value is odd. */
    Long.prototype.isOdd = function() {
      return (this.low_ & 1) === 1;
    };


    /**
     * @param {Long} other Long to compare against.
     * @return {boolean} Whether this Long equals the other.
     */
    Long.prototype.equals = function(other) {
      return (this.high_ === other.high_) && (this.low_ === other.low_);
     s
    };


    /**
     * @param {Long} other Long to compare against.
     * @return {boolean} Whether this Long does not equal the other.
     */
    Long.prototype.notEquals = function(other) {
      return (this.high_ != other.high_) || (this.low_ != other.low_);
    };


    /**
     * @param {Long} other Long to compare against.
     * @return {boolean} Whether this Long is less than the other.
     */
    Long.prototype.lessThan = function(other) {
      return this.compare(other) < 0;
    };


    /**
     * @param {Long} other Long to compare against.
     * @return {boolean} Whether this Long is less than or equal to the other.
     */
    Long.prototype.lessThanOrEqual = function(other) {
      return this.compare(other) <= 0;
    };


    /**
     * @param {Long} other Long to compare against.
     * @return {boolean} Whether this Long is greater than the other.
     */
    Long.prototype.greaterThan = function(other) {
      return this.compare(other) > 0;
    };


    /**
     * @param {Long} other Long to compare against.
     * @return {boolean} Whether this Long is greater than or equal to the other.
     */
    Long.prototype.greaterThanOrEqual = function(other) {
      return this.compare(other) >= 0;
    };


    /**
     * Compares this Long with the given one.
     * @param {Long} other Long to compare against.
     * @return {number} 0 if they are the same, 1 if the this is greater, and -1
     *     if the given one is greater.
     */
    Long.prototype.compare = function(other) {
      if (this.equals(other)) {
        return 0;
      }

      var thisNeg = this.isNegative();
      var otherNeg = other.isNegative();
      if (thisNeg && !otherNeg) {
        return -1;
      }
      if (!thisNeg && otherNeg) {
        return 1;
      }

      // at this point, the signs are the same, so subtraction will not overflow
      if (this.subtract(other).isNegative()) {
        return -1;
      } else {
        return 1;
      }
    };


    /** @return {Long} The negation of this value. */
    Long.prototype.negate = function() {
      if (this.equals(Long.MIN_VALUE)) {
        return Long.MIN_VALUE;
      } else {
        return this.not().add(Long.ONE);
      }
    };


    /**
     * Returns the sum of this and the given Long.
     * @param {Long} other Long to add to this one.
     * @return {Long} The sum of this and the given Long.
     */
    Long.prototype.add = function(other) {
      // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

      var a48 = this.high_ >>> 16;
      var a32 = this.high_ & 0xFFFF;
      var a16 = this.low_ >>> 16;
      var a00 = this.low_ & 0xFFFF;

      var b48 = other.high_ >>> 16;
      var b32 = other.high_ & 0xFFFF;
      var b16 = other.low_ >>> 16;
      var b00 = other.low_ & 0xFFFF;

      var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
      c00 += a00 + b00;
      c16 += c00 >>> 16;
      c00 &= 0xFFFF;
      c16 += a16 + b16;
      c32 += c16 >>> 16;
      c16 &= 0xFFFF;
      c32 += a32 + b32;
      c48 += c32 >>> 16;
      c32 &= 0xFFFF;
      c48 += a48 + b48;
      c48 &= 0xFFFF;
      return Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
    };


    /**
     * Returns the difference of this and the given Long.
     * @param {Long} other Long to subtract from this.
     * @return {Long} The difference of this and the given Long.
     */
    Long.prototype.subtract = function(other) {
      return this.add(other.negate());
    };


    /**
     * Returns the product of this and the given long.
     * @param {Long} other Long to multiply with this.
     * @return {Long} The product of this and the other.
     */
    Long.prototype.multiply = function(other) {
      if (this.isZero()) {
        return Long.ZERO;
      } else if (other.isZero()) {
        return Long.ZERO;
      }

      if (this.equals(Long.MIN_VALUE)) {
        return other.isOdd() ? Long.MIN_VALUE : Long.ZERO;
      } else if (other.equals(Long.MIN_VALUE)) {
        return this.isOdd() ? Long.MIN_VALUE : Long.ZERO;
      }

      if (this.isNegative()) {
        if (other.isNegative()) {
          return this.negate().multiply(other.negate());
        } else {
          return this.negate().multiply(other).negate();
        }
      } else if (other.isNegative()) {
        return this.multiply(other.negate()).negate();
      }

      // If both longs are small, use float multiplication
      if (this.lessThan(Long.TWO_PWR_24_) &&
          other.lessThan(Long.TWO_PWR_24_)) {
        return Long.fromNumber(this.toNumber() * other.toNumber());
      }

      // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
      // We can skip products that would overflow.

      var a48 = this.high_ >>> 16;
      var a32 = this.high_ & 0xFFFF;
      var a16 = this.low_ >>> 16;
      var a00 = this.low_ & 0xFFFF;

      var b48 = other.high_ >>> 16;
      var b32 = other.high_ & 0xFFFF;
      var b16 = other.low_ >>> 16;
      var b00 = other.low_ & 0xFFFF;

      var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
      c00 += a00 * b00;
      c16 += c00 >>> 16;
      c00 &= 0xFFFF;
      c16 += a16 * b00;
      c32 += c16 >>> 16;
      c16 &= 0xFFFF;
      c16 += a00 * b16;
      c32 += c16 >>> 16;
      c16 &= 0xFFFF;
      c32 += a32 * b00;
      c48 += c32 >>> 16;
      c32 &= 0xFFFF;
      c32 += a16 * b16;
      c48 += c32 >>> 16;
      c32 &= 0xFFFF;
      c32 += a00 * b32;
      c48 += c32 >>> 16;
      c32 &= 0xFFFF;
      c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
      c48 &= 0xFFFF;
      return Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
    };


    /**
     * Returns this Long divided by the given one.
     * @param {Long} other Long by which to divide.
     * @return {Long} This Long divided by the given one.
     */
    Long.prototype.div = function(other) {
      if (other.isZero()) {
        throw Error('division by zero');
      } else if (this.isZero()) {
        return Long.ZERO;
      }

      if (this.equals(Long.MIN_VALUE)) {
        if (other.equals(Long.ONE) ||
            other.equals(Long.NEG_ONE)) {
          return Long.MIN_VALUE;  // recall that -MIN_VALUE === MIN_VALUE
        } else if (other.equals(Long.MIN_VALUE)) {
          return Long.ONE;
        } else {
          // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
          var halfThis = this.shiftRight(1);
          var approx = halfThis.div(other).shiftLeft(1);
          if (approx.equals(Long.ZERO)) {
            return other.isNegative() ? Long.ONE : Long.NEG_ONE;
          } else {
            var rem = this.subtract(other.multiply(approx));
            var result = approx.add(rem.div(other));
            return result;
          }
        }
      } else if (other.equals(Long.MIN_VALUE)) {
        return Long.ZERO;
      }

      if (this.isNegative()) {
        if (other.isNegative()) {
          return this.negate().div(other.negate());
        } else {
          return this.negate().div(other).negate();
        }
      } else if (other.isNegative()) {
        return this.div(other.negate()).negate();
      }

      // Repeat the following until the remainder is less than other:  find a
      // floating-point that approximates remainder / other *from below*, add this
      // into the result, and subtract it from the remainder.  It is critical that
      // the approximate value is less than or equal to the real value so that the
      // remainder never becomes negative.
      var res = Long.ZERO;
      var rem = this;
      while (rem.greaterThanOrEqual(other)) {
        // Approximate the result of division. This may be a little greater or
        // smaller than the actual value.
        var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

        // We will tweak the approximate result by changing it in the 48-th digit or
        // the smallest non-fractional digit, whichever is larger.
        var log2 = Math.ceil(Math.log(approx) / Math.LN2);
        var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

        // Decrease the approximation until it is smaller than the remainder.  Note
        // that if it is too large, the product overflows and is negative.
        var approxRes = Long.fromNumber(approx);
        var approxRem = approxRes.multiply(other);
        while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
          approx -= delta;
          approxRes = Long.fromNumber(approx);
          approxRem = approxRes.multiply(other);
        }

        // We know the answer can't be zero... and actually, zero would cause
        // infinite recursion since we would make no progress.
        if (approxRes.isZero()) {
          approxRes = Long.ONE;
        }

        res = res.add(approxRes);
        rem = rem.subtract(approxRem);
      }
      return res;
    };


    /**
     * Returns this Long modulo the given one.
     * @param {Long} other Long by which to mod.
     * @return {Long} This Long modulo the given one.
     */
    Long.prototype.modulo = function(other) {
      return this.subtract(this.div(other).multiply(other));
    };


    /** @return {Long} The bitwise-NOT of this value. */
    Long.prototype.not = function() {
      return Long.fromBits(~this.low_, ~this.high_);
    };


    /**
     * Returns the bitwise-AND of this Long and the given one.
     * @param {Long} other The Long with which to AND.
     * @return {Long} The bitwise-AND of this and the other.
     */
    Long.prototype.and = function(other) {
      return Long.fromBits(this.low_ & other.low_,
                                     this.high_ & other.high_);
    };


    /**
     * Returns the bitwise-OR of this Long and the given one.
     * @param {Long} other The Long with which to OR.
     * @return {Long} The bitwise-OR of this and the other.
     */
    Long.prototype.or = function(other) {
      return Long.fromBits(this.low_ | other.low_,
                                     this.high_ | other.high_);
    };


    /**
     * Returns the bitwise-XOR of this Long and the given one.
     * @param {Long} other The Long with which to XOR.
     * @return {Long} The bitwise-XOR of this and the other.
     */
    Long.prototype.xor = function(other) {
      return Long.fromBits(this.low_ ^ other.low_,
                                     this.high_ ^ other.high_);
    };


    /**
     * Returns this Long with bits shifted to the left by the given amount.
     * @param {number} numBits The number of bits by which to shift.
     * @return {Long} This shifted to the left by the given amount.
     */
    Long.prototype.shiftLeft = function(numBits) {
      numBits &= 63;
      if (numBits === 0) {
        return this;
      } else {
        var low = this.low_;
        if (numBits < 32) {
          var high = this.high_;
          return Long.fromBits(
              low << numBits,
              (high << numBits) | (low >>> (32 - numBits)));
        } else {
          return Long.fromBits(0, low << (numBits - 32));
        }
      }
    };


    /**
     * Returns this Long with bits shifted to the right by the given amount.
     * @param {number} numBits The number of bits by which to shift.
     * @return {Long} This shifted to the right by the given amount.
     */
    Long.prototype.shiftRight = function(numBits) {
      numBits &= 63;
      if (numBits === 0) {
        return this;
      } else {
        var high = this.high_;
        if (numBits < 32) {
          var low = this.low_;
          return Long.fromBits(
              (low >>> numBits) | (high << (32 - numBits)),
              high >> numBits);
        } else {
          return Long.fromBits(
              high >> (numBits - 32),
              high >= 0 ? 0 : -1);
        }
      }
    };


    /**
     * Returns this Long with bits shifted to the right by the given amount, with
     * the new top bits matching the current sign bit.
     * @param {number} numBits The number of bits by which to shift.
     * @return {Long} This shifted to the right by the given amount, with
     *     zeros placed into the new leading bits.
     */
    Long.prototype.shiftRightUnsigned = function(numBits) {
      numBits &= 63;
      if (numBits === 0) {
        return this;
      } else {
        var high = this.high_;
        if (numBits < 32) {
          var low = this.low_;
          return Long.fromBits(
              (low >>> numBits) | (high << (32 - numBits)),
              high >>> numBits);
        } else if (numBits === 32) {
          return Long.fromBits(high, 0);
        } else {
          return Long.fromBits(high >>> (numBits - 32), 0);
        }
      }
    };

    function Short(value){
      require('util/Util').inherits(this, Primitive, Enum.dataType.SHORT, value & 0xFFFF);
    }

    Short.prototype.add = function(otherPrimitive){
      return new Short(this.value + otherPrimitive.value);
    };
    Short.prototype.subtract = function(otherPrimitive){
      return new Short(this.value - otherPrimitive.value);
    };
    Short.prototype.multiply = function(otherPrimitive){
      return new Short(this.value * otherPrimitive.value);
    };
    Short.prototype.subtract = function(otherPrimitive){
      return new Short(this.value / otherPrimitive.value);
    };
    Short.prototype.negate = function(){
      return new Short(-this.value);
    };
    Short.prototype.modulo = function(otherPrimitive){
      var result = this.value - (this.value/otherPrimitive.value) * otherPrimitive.value;
      return new Short(result);
    };
    /**Shifting**/
    //Shift this number left by the shift amount
    Short.prototype.shiftLeft = function(shiftAmount){
      return new Short(this.value << shiftAmount);
    };
    
    Short.prototype.shiftRight = function(shiftAmount){
      return new Short(this.value >> shiftAmount);
    };
    
    //Shift this number right by the shift amount unsigned
    Short.prototype.shiftRightUnsigned = function(shiftAmount){
      return new Short(this.value >>> shiftAmount);
    };
    
    /**Logical Operations **/
    
    Short.prototype.and = function(otherPrimitive){
      return new Short(this.value & otherPrimitive.value);
    };
    
    Short.prototype.or = function(otherPrimitive){
      return new Short(this.value | otherPrimitive.value);
    };
    
    Short.prototype.xor = function(otherPrimitive){
      return new Short(this.value ^ otherPrimitive.value);
    };

    /**Conversion Functions **/
    Short.prototype.toInteger = function(){
      return new Integer(this.value);
    };
    Short.prototype.toDouble = function(){
      return new Double(this.value);
    };
    Short.prototype.toLong = function(){
      return new Long.fromNumber(this.value); //Use the long method - already creates new long
    };
    Short.prototype.toByte = function(){
      return new Byte(this.value);
    };
    Short.prototype.toBool = function(){
      return new Bool(this.value);
    };
    Short.prototype.toChar = function(){
      return new Char(this.value);
    };
    Short.prototype.toShort = function(){
      return new Short(this.value);
    };
    Short.prototype.toFloat = function(){
      return new Float(parseFloat(this.value));
    };
    Short.prototype.toString = function(){
      var short_ = this.value & 0xFFFF;
      return "[" + this.dataType + " " + short_.toString() + "]";
    };
    Short.prototype.clone = function(){
      return new Short(this.value);
    };

    return PrimitiveMaker;
  }
);