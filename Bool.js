define(['Primitive', 'Float', 'Short', 'Char', 'Byte', 'Double', 'Integer', 'Long', 'Instruction', 'Util'],
	function(Primitive, Float, Short, Char, Byte, Double, Integer, Long, Instruction, Util) {
	function Bool(value){
		Util.inherits(this, Primitive, Data.type.BOOLEAN, value & 0x1);
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

	return Bool;
});