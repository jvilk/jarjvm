define(['Primitive', 'Float', 'Short', 'Bool', 'Byte', 'Double', 'Integer', 'Long', 'Util'],
	function(Primitive, Float, Short, Bool, Byte, Double, Integer, Long, Util) {
	function Char(value){
		Util.inherits(this, Primitive, Data.type.CHAR, value & 0xFF);
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

	return Char;
});