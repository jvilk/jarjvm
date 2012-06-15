define(['Primitive', 'Float', 'Short', 'Char', 'Bool', 'Double', 'Integer', 'Long', 'Util'],
	function(Primitive, Float, Short, Char, Bool, Double, Integer, Long, Util) {
	function Byte(value){
		Util.inherits(this, Primitive, Data.type.BYTE, value & 0xFF);
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

	return Byte;
});