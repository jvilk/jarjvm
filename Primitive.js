function Primitive(typeName, value){
	this.dataType = typeName;
	this.value = value;
}

function Integer(value){
	inherits(this, "Primitive", Data.type.INTEGER, value & 0xFFFFFFFF); //Whatever the value is make it a 32bit signed int
	/**Arithmetic **/
	this.add = function(otherPrimitive){
		return new Integer(this.value + otherPrimitive.value);
	};
	this.subtract = function(otherPrimitive){
		return new Integer(this.value - otherPrimitive.value);
	};
	this.multiply = function(otherPrimitive){
		return new Integer(this.value * otherPrimitive.value);
	};
	this.divide = function(otherPrimitive){
		return new Integer(this.value / otherPrimitive.value);
	};
	this.negate = function(){
		return new Integer(-this.value);
	};
	this.modulo = function(otherPrimitive){
		var result = this.value % otherPrimitive.value;
		return new Integer(result);
	};
	
	/**Shifting**/
	//Shift this number left by the shift amount
	this.shiftLeft = function(shiftAmount){
		return new Integer(this.value << shiftAmount);
	};
	
	this.shiftRight = function(shiftAmount){
		return new Integer(this.value >> shiftAmount);
	};
	
	//Shift this number right by the shift amount unsigned
	this.shiftRightUnsigned = function(shiftAmount){
		return new Integer(this.value >>> shiftAmount);
	};
	
	/**Logical Operations **/
	
	this.and = function(otherPrimitive){
		return new Integer(this.value & otherPrimitive.value);
	};
	
	this.or = function(otherPrimitive){
		return new Integer(this.value | otherPrimitive.value);
	};
	
	this.xor = function(otherPrimitive){
		return new Integer(this.value ^ otherPrimitive.value);
	};

	/**Conversion Functions **/
	this.toInteger = function(){
		return new Integer(this.value); //Wink ;)
	};
	this.toDouble = function(){
		return new Double(this.value); //Wink ;)
	};
	this.toLong = function(){
		return new Long.fromNumber(this.value); //Use the long method - already creates new long
	};
	this.toByte = function(){
		return new Byte(this.value); //Return a new byte with this value
	};
	this.toBool = function(){
		return new Bool(this.value);
	};
	this.toChar = function(){
		return new Char(this.value); //Return a new char with this value
	};
	this.toShort = function(){
		return new Short(this.value);
	};
	this.toFloat = function(){
		return new Float(this.value); //Wink, but the Float has more precision
	};
	this.toString = function(){
		var integer = Math.floor(this.value);
		return "[" + this.dataType + " " + integer.toString() + "]";
	};
	this.clone = function(){
		return new Integer(this.value);
	}
	
}

function Double(value){
	inherits(this, "Primitive", Data.type.DOUBLE, value);
	this.add = function(otherPrimitive){
		return new Double(this.value + otherPrimitive.value);
	};
	this.subtract = function(otherPrimitive){
		return new Double(this.value - otherPrimitive.value);
	};
	this.multiply = function(otherPrimitive){
		return new Double(this.value * otherPrimitive.value);
	};
	this.divide = function(otherPrimitive){
		//TODO: Make sure this works according to the JVM spec
		return new Double(this.value / otherPrimitive.value);
	};
	this.negate = function(){
		return new Double(-this.value);
	};
	this.modulo = function(otherPrimitive){
		var result = this.value - (this.value/otherPrimitive.value) * otherPrimitive.value;
		return new Double(result);
	};
	
		/**Shifting**/
	//Shift this number left by the shift amount
	this.shiftLeft = function(shiftAmount){
		return new Double(this.value << shiftAmount);
	};
	
	this.shiftRight = function(shiftAmount){
		return new Double(this.value >> shiftAmount);
	};
	
	//Shift this number right by the shift amount unsigned
	this.shiftRightUnsigned = function(shiftAmount){
		return new Double(this.value >>> shiftAmount);
	};
	
	/**Logical Operations **/
	
	this.and = function(otherPrimitive){
		return new Double(this.value & otherPrimitive.value);
	};
	
	this.or = function(otherPrimitive){
		return new Double(this.value | otherPrimitive.value);
	};
	
	this.xor = function(otherPrimitive){
		return new Double(this.value ^ otherPrimitive.value);
	};

	/**Conversion Functions **/
	this.toInteger = function(){
		return new Integer(this.value); //wink
	};
	this.toDouble = function(){
		return new Double(this.value); //wink
	};
	this.toLong = function(){
		return new Long.fromNumber(this.value); //Use the long method - already creates new long
	};
	this.toByte = function(){
		return new Byte(this.value);
	};
	this.toBool = function(){
		return new Bool(this.value );
	};
	this.toChar = function(){
		return new Char(this.value); //Return a new char with this value
	};
	this.toShort = function(){
		return new Char(this.value); //Return a new char with this value
	};
	this.toFloat = function(){
		//TODO: Do a bounds check
		return new Float(parseFloat(this.value)); //Wink ;) 
	};
	this.toString = function(){
		return "[" + this.dataType + " " + this.value.toString() + "]";
	};
	this.clone = function(){
		return new Double(this.value);
	}
}

function Byte(value){
	inherits(this, "Primitive", Data.type.BYTE, value & 0xFF);
	this.add = function(otherPrimitive){
		return new Byte(this.value + otherPrimitive.value);
	};
	this.subtract = function(otherPrimitive){
		return new Byte(this.value - otherPrimitive.value);
	};
	this.multiply = function(otherPrimitive){
		return new Byte(this.value * otherPrimitive.value);
	};
	this.divide = function(otherPrimitive){
		return new Byte(this.value / otherPrimitive.value);
	};
	this.negate = function(){
		return new Byte(-this.value);
	};
	this.modulo = function(otherPrimitive){
		var result = this.value - (this.value/otherPrimitive.value) * otherPrimitive.value;
		return new Byte(result);
	};
	/**Shifting**/
	//Shift this number left by the shift amount
	this.shiftLeft = function(shiftAmount){
		return new Byte(this.value << shiftAmount);
	};
	
	this.shiftRight = function(shiftAmount){
		return new Byte(this.value >> shiftAmount);
	};
	
	//Shift this number right by the shift amount unsigned
	this.shiftRightUnsigned = function(shiftAmount){
		return new Byte(this.value >>> shiftAmount);
	};
	
	/**Logical Operations **/
	
	this.and = function(otherPrimitive){
		return new Byte(this.value & otherPrimitive.value);
	};
	
	this.or = function(otherPrimitive){
		return new Byte(this.value | otherPrimitive.value);
	};
	
	this.xor = function(otherPrimitive){
		return new Byte(this.value ^ otherPrimitive.value);
	};

	/**Conversion Functions **/
	this.toInteger = function(){
		return new Integer(this.value);
	};
	this.toDouble = function(){
		return new Double(this.value);
	};
	this.toLong = function(){
		return new Long.fromNumber(this.value); //Use the long method - already creates new long
	};
	this.toByte = function(){
		return new Byte(this.value);
	};
	this.toBool = function(){
		return new Bool(this.value);
	};
	this.toChar = function(){
		return new Char(this.value);
	};
	this.toShort = function(){
		return new Short(this.value);
	};
	this.toFloat = function(){
		return new Float(parseFloat(this.value));
	};
	this.toString = function(){
		var integer = Math.floor(this.value);
		return integer.toString();
	};
	this.toString = function(){
		var byte_ = this.value & 0xFF;
		return "[" + this.dataType + " " + byte_.toString() + "]";
	};
	this.clone = function(){
		return new Byte(this.value);
	}
	
}

function Bool(value){
	inherits(this, "Primitive", Data.type.BOOLEAN, value & 0x1);
	this.add = function(otherPrimitive){
		return new Bool(this.value + otherPrimitive.value);
	};
	this.subtract = function(otherPrimitive){
		return new Bool(this.value - otherPrimitive.value);
	};
	this.multiply = function(otherPrimitive){
		return new Bool(this.value * otherPrimitive.value);
	};
	this.divide = function(otherPrimitive){
		return new Bool(this.value / otherPrimitive.value);
	};
	this.negate = function(){
		return new Bool(-this.value);
	};
	this.modulo = function(otherPrimitive){
		var result = this.value - (this.value/otherPrimitive.value) * otherPrimitive.value;
		return new Bool(result);
	};	
	/**Shifting**/
	//Shift this number left by the shift amount
	this.shiftLeft = function(shiftAmount){
		return new Bool(this.value << shiftAmount);
	};
	
	this.shiftRight = function(shiftAmount){
		return new Bool(this.value >> shiftAmount);
	};
	
	//Shift this number right by the shift amount unsigned
	this.shiftRightUnsigned = function(shiftAmount){
		return new Bool(this.value >>> shiftAmount);
	};
	
	/**Logical Operations **/
	
	this.and = function(otherPrimitive){
		return new Bool(this.value & otherPrimitive.value);
	};
	
	this.or = function(otherPrimitive){
		return new Bool(this.value | otherPrimitive.value);
	};
	
	this.xor = function(otherPrimitive){
		return new Bool(this.value ^ otherPrimitive.value);
	};

	/**Conversion Functions **/
	this.toInteger = function(){
		return new Integer(this.value);
	};
	this.toDouble = function(){
		return new Double(this.value);
	};
	this.toLong = function(){
		return new Long.fromNumber(this.value); //Use the long method - already creates new long
	};
	this.toByte = function(){
		return new Byte(this.value);
	};
	this.toBool = function(){
		return new Bool(this.value);
	};
	this.toChar = function(){
		return new Char(this.value);
	};
	this.toShort = function(){
		return new Short(this.value);
	};
	this.toFloat = function(){
		return new Float(parseFloat(this.value));
	};
	this.toString = function(){
		var bool_ = this.value & 0x1;
		return "[" + this.dataType + " " + bool_.toString() + "]";
	};
	this.clone = function(){
		return new Bool(this.value);
	}
}

function Char(value){
	inherits(this, "Primitive", Data.type.CHAR, value & 0xFF);
	this.add = function(otherPrimitive){
		return new Char(this.value + otherPrimitive.value);
	};
	this.subtract = function(otherPrimitive){
		return new Char(this.value - otherPrimitive.value);
	};
	this.multiply = function(otherPrimitive){
		return new Char(this.value * otherPrimitive.value);
	};
	this.divide = function(otherPrimitive){
		return new Char(this.value / otherPrimitive.value);
	};
	this.negate = function(){
		return new Char(-this.value);
	};
	this.modulo = function(otherPrimitive){
		var result = this.value - (this.value/otherPrimitive.value) * otherPrimitive.value;
		return new Char(result);
	};	
	/**Shifting**/
	//Shift this number left by the shift amount
	this.shiftLeft = function(shiftAmount){
		return new Char(this.value << shiftAmount);
	};
	
	this.shiftRight = function(shiftAmount){
		return new Char(this.value >> shiftAmount);
	};
	
	//Shift this number right by the shift amount unsigned
	this.shiftRightUnsigned = function(shiftAmount){
		return new Char(this.value >>> shiftAmount);
	};
	/**Logical Operations **/
	
	/**Logical Operations **/
	
	this.and = function(otherPrimitive){
		return new Char(this.value & otherPrimitive.value);
	};
	
	this.or = function(otherPrimitive){
		return new Char(this.value | otherPrimitive.value);
	};
	
	this.xor = function(otherPrimitive){
		return new Char(this.value ^ otherPrimitive.value);
	};

	/**Conversion Functions **/
	this.toInteger = function(){
		return new Integer(this.value);
	};
	this.toDouble = function(){
		return new Double(this.value);
	};
	this.toLong = function(){
		return new Long.fromNumber(this.value); //Use the long method - already creates new long
	};
	this.toByte = function(){
		return new Byte(this.value);
	};
	this.toBool = function(){
		return new Bool(this.value);
	};
	this.toChar = function(){
		return new Char(this.value);
	};
	this.toShort = function(){
		return new Short(this.value);
	};
	this.toFloat = function(){
		return new Float(parseFloat(this.value));
	};
	this.toString = function(){
		var char_ = this.value & 0xFF;
		return "[" + this.dataType + " " + char_.toString() + "]";
	};
	this.clone = function(){
		return new Char(this.value);
	}
}

function Short(value){
	inherits(this, "Primitive", Data.type.SHORT, value & 0xFFFF);
	this.add = function(otherPrimitive){
		return new Short(this.value + otherPrimitive.value);
	};
	this.subtract = function(otherPrimitive){
		return new Short(this.value - otherPrimitive.value);
	};
	this.multiply = function(otherPrimitive){
		return new Short(this.value * otherPrimitive.value);
	};
	this.subtract = function(otherPrimitive){
		return new Short(this.value / otherPrimitive.value);
	};
	this.negate = function(){
		return new Short(-this.value);
	};
	this.modulo = function(otherPrimitive){
		var result = this.value - (this.value/otherPrimitive.value) * otherPrimitive.value;
		return new Short(result);
	};	
	/**Shifting**/
	//Shift this number left by the shift amount
	this.shiftLeft = function(shiftAmount){
		return new Short(this.value << shiftAmount);
	};
	
	this.shiftRight = function(shiftAmount){
		return new Short(this.value >> shiftAmount);
	};
	
	//Shift this number right by the shift amount unsigned
	this.shiftRightUnsigned = function(shiftAmount){
		return new Short(this.value >>> shiftAmount);
	};
	
	/**Logical Operations **/
	
	this.and = function(otherPrimitive){
		return new Short(this.value & otherPrimitive.value);
	};
	
	this.or = function(otherPrimitive){
		return new Short(this.value | otherPrimitive.value);
	};
	
	this.xor = function(otherPrimitive){
		return new Short(this.value ^ otherPrimitive.value);
	};

	/**Conversion Functions **/
	this.toInteger = function(){
		return new Integer(this.value);
	};
	this.toDouble = function(){
		return new Double(this.value);
	};
	this.toLong = function(){
		return new Long.fromNumber(this.value); //Use the long method - already creates new long
	};
	this.toByte = function(){
		return new Byte(this.value);
	};
	this.toBool = function(){
		return new Bool(this.value);
	};
	this.toChar = function(){
		return new Char(this.value);
	};
	this.toShort = function(){
		return new Short(this.value);
	};
	this.toFloat = function(){
		return new Float(parseFloat(this.value));
	};
	this.toString = function(){
		var short_ = this.value & 0xFFFF;
		return "[" + this.dataType + " " + short_.toString() + "]";
	};
	this.clone = function(){
		return new Short(this.value);
	}
}

function Float(value){
	inherits(this, "Primitive", Data.type.FLOAT, value);
	this.add = function(otherPrimitive){
		return new Float("float", this.value + otherPrimitive.value);
	};
	this.subtract = function(otherPrimitive){
		return new Float("float", this.value - otherPrimitive.value);
	};
	this.multiply = function(otherPrimitive){
		return new Float("float", this.value * otherPrimitive.value);
	};
	this.subtract = function(otherPrimitive){
		return new Float("float", this.value / otherPrimitive.value);
	};
	this.negate = function(){
		return new Float(-this.value);
	};
	this.modulo = function(otherPrimitive){
		var result = this.value - (this.value/otherPrimitive.value) * otherPrimitive.value;
		return new Float(result);
	};	
	/**Shifting**/
	//Shift this number left by the shift amount
	this.shiftLeft = function(shiftAmount){
		return new Float(this.value << shiftAmount);
	};
	
	this.shiftRight = function(shiftAmount){
		return new Float(this.value >> shiftAmount);
	};
	
	//Shift this number right by the shift amount unsigned
	this.shiftRightUnsigned = function(shiftAmount){
		return new Float(this.value >>> shiftAmount);
	};
	
	/**Logical Operations **/
	
	this.and = function(otherPrimitive){
		return new Float(this.value & otherPrimitive.value);
	};
	
	this.or = function(otherPrimitive){
		return new Float(this.value | otherPrimitive.value);
	};
	
	this.xor = function(otherPrimitive){
		return new Float(this.value ^ otherPrimitive.value);
	};

	/**Conversion Functions **/
	this.toInteger = function(){
		return new Integer(this.value);
	};
	this.toDouble = function(){
		return new Double(this.value);
	};
	this.toLong = function(){
		return new Long.fromNumber(this.value); //Use the long method - already creates new long
	};
	this.toByte = function(){
		return new Byte(this.value & 0xFF);
	};
	this.toBool = function(){
		return new Bool(this.value & 0x1);
	};
	this.toChar = function(){
		return new Char(this.value & 0xFF);
	};
	this.toShort = function(){
		return new Short(this.value & 0xFFFF);
	};
	this.toFloat = function(){
		return new Float(parseFloat(this.value));
	};
	this.toString = function(){
		return "[" + this.dataType + " " + this.value.toString() + "]";
	};
	this.clone = function(){
		return new Float(this.value);
	}
}
