define(['Primitive', 'Float', 'Char', 'Bool', 'Byte', 'Double', 'Integer', 'Long', 'Util'],
	function(Primitive, Float, Char, Bool, Byte, Double, Integer, Long, Util) {
	function Short(value){
		inherits(this, Primitive, Data.type.SHORT, value & 0xFFFF);
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

	return Short;
});