define(['util/Util', 'lib/Deflate', 'vm/Primitives'],
  function(Util, Utf8Translator, Primitives) {
    "use strict";
    
    /**
     * Used to read a Java Class.
     */
    function JavaClassReader(data) {
      this.data = data;
      this.index = 0;
    }

    /**
     * Retrieve the current offset relative to the start of the class file.
     */
    JavaClassReader.prototype.getOffset = function() {
      return this.index;
    };

    /**
     * Get the next length bytes of the class file as an unsigned integer array.
     */
    JavaClassReader.prototype.getRawBytes = function(length) {
      //var bytes = this.data.subarray(this.index, this.index + length);
      var bytes = [];
      
      for (var i = this.index; i < this.index + length; i++)
      {
        bytes[i-this.index] = this.data.charCodeAt(i);
      }
      
      this.index += length;
      return bytes;
    };

    /**
     * Get an unsigned integer field. Converts multi-byte fields into a single
     * unsigned integer.
     */
    JavaClassReader.prototype.getUintField = function(fieldLength) {
      var bytes = this.getRawBytes(fieldLength);

      var value = 0;
      for(var i = 0; i < bytes.length; i++) {
        //Shift over the previous value by a byte.
        value = value << 8;

        //Add the next byte.
        value = value | bytes[i];
      }
      //Convert back to unsigned. Yes, this is really dumb and hacky, but that's the only way.
      value = value >>> 0;
      return value;
    };

    /**
     * Returns a float.
     */
    JavaClassReader.prototype.getFloatField = function() {
      var rawBits = this.getUintField(4);
      var s = ((rawBits >> 31) === 0) ? 1 : -1;

      //Make it unsigned.
      var e = ((rawBits >> 23) & 0xff);
      e = e >>> 0;

      //Make it unsigned.
      var m = (e === 0) ? (rawBits & 0x7fffff) << 1 : (rawBits & 0x7fffff) | 0x800000;
      m = m >>> 0;

      var value = s * m * Math.pow(2, e - 150);
      return value;
    };

    /**
     * Returns a double.
     */
    JavaClassReader.prototype.getDoubleField = function() {
      var bits_1 = this.getUintField(2);
      
      //Sign.
      var s = ((bits_1>>15) === 0) ? 1 : -1;
      
      //Exponent. Make it unsigned.
      var e = ((bits_1>>4) & 0x7ff);
      e = e >>> 0;
      
      //3 bits of m here.
      var m = bits_1 & 0xf;
      
      if (e !== 0)
        m = (bits_1 & 0xf) | 0x10;
        
      //We CANNOT use any more bit operations on the mantissa,
      //since bit ops operate on 32 bits ONLY.
      
      //"Shift" it over by 4 bytes.
      m *= Math.pow(2,32);
      //"Or" it with the next 4 bytes.
      m += this.getUintField(4);
      //"Shift" it 2 more bytes.
      m *= Math.pow(2,16);
      //"Or" it with the final 2 bytes.
      m += this.getUintField(2);
      
      //Left shift 1 if e is 0.
      if (e === 0)
        m *= 2;

      var value = s * m * Math.pow(2, e - 1075);
      return value;
    };

    /**
     * Get a SIGNED INTEGER field.
     */
    JavaClassReader.prototype.getIntField = function(fieldLength) {
      Util.assert(fieldLength <= 4);
      var bytes = this.getRawBytes(fieldLength);

      var value = 0;
      var i;
      for(i = 0; i < bytes.length; i++) {
        //Shift over the previous value by a byte.
        value = value << 8;

        //Add the next byte.
        value = value | bytes[i];
      }
      
      //Need to sign extend if it is <4 bytes.
      if (fieldLength < 4)
      {
        //Form a mask to find the leftmost bit.
        var leftmostMask = 0x80;
        //Multiply by 0x10 for each byte.
        for (i = 1; i < fieldLength; i++)
        {
          leftmostMask *= 0x100;
        }
        //Check if the leftmost bit is 1 or 0. Use to select the
        //pad value.
        var padValue = (value & leftmostMask) !== 0 ? 0xFF : 0;
        
        //If it's 0, there's nothing to do. Terminate.
        if (padValue === 0) return value;
        
        //Otherwise, pad on.
        var padMask = 0;
        
        //Form the mask to left pad with.
        for (i = 0; i < 4 - fieldLength; i++)
        {
          padMask <<= 8;
          padMask |= padValue;
        }
        
        //Left shift it the number of bits of the field.
        padMask <<= fieldLength * 8;
        
        //Finally, OR with the mask!
        value |= padMask;
      }

      return value;
    };

    /**
     * Turns raw bytes in the Java Class file into a UTF8 string.
     */
    JavaClassReader.prototype.getUTF8Field = function(fieldLength) {
      var bytes = this.getRawBytes(fieldLength);
      var utf8tler = new Utf8Translator(new Util.utf8Wrapper(bytes));
      var string = "";
      var currentChar = utf8tler.readChar();
      while(currentChar !== null) {
        string += currentChar;
        currentChar = utf8tler.readChar();
      }
      return string;
    };

    /**
     * Turns raw bytes in the Java Class file into a Long.
     */
    JavaClassReader.prototype.getLongField = function() {
      var high = jcr.getUintField(4);
      var low = jcr.getUintField(4);
      return Primitives.getLong(low, high);
    };

    return JavaClassReader;
  }
);