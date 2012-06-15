define(['Primitive', 'Short', 'Char', 'Bool', 'Byte', 'Double', 'Integer', 'Long', 'Util'],
	function(Primitive, Short, Char, Bool, Byte, Double, Integer, Long, Util) {
	function Float(value){
		Util.inherits(this, Primitive, Data.type.FLOAT, value);
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

	return Float;
});