define(['Primitive', 'Float', 'Short', 'Char', 'Bool', 'Byte', 'Double', 'Long', 'Util'],
	function(Primitive, Float, Short, Char, Bool, Byte, Double, Long, Util) {
	function Integer(value){
		Util.inherits(this, Primitive, Data.type.INTEGER, value & 0xFFFFFFFF); //Whatever the value is make it a 32bit signed int
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

	return Integer;
});