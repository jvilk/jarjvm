/**
 * Stores all of the native functions.
 */
var NativeFunctions = [];

/**
 * Registers a native function for the given class name, method name, and method descriptor.
 */
function registerNativeFunction(className, methodName, methodDescriptor, fcn)
{
	if (!(className in NativeFunctions))
		NativeFunctions[className] = {};
		
	if (!(methodName in NativeFunctions[className]))
		NativeFunctions[className][methodName] = {};
		
	NativeFunctions[className][methodName][methodDescriptor] = fcn;
}

/**
 * Get the native function for the given class/method/descriptor combo.
 */
function getNativeFunction(className, methodName, methodDescriptor)
{
	if (!(className in NativeFunctions) ||
		!(methodName in NativeFunctions[className]) ||
		!(methodDescriptor in NativeFunctions[className][methodName]))
		//throw "ERROR: No native function found for " + className + "." + methodName + " " + methodDescriptor;
		return function() {
			throw "ERROR: Native method " + className + "." + methodName + " " + methodDescriptor + " is not defined.";
		};
		
	return NativeFunctions[className][methodName][methodDescriptor];
}

/**
 * Returns the arguments from the stack in an array, so that the first argument for the method in the
 * first location of the array.
 */
function getArguments(methodDescriptor){
	var frame = JVM.getExecutingThread().getCurrentFrame();
	var numOfArgs = getNumOfArguments(methodDescriptor);
	var methodArguments = [];
	var effectiveI = 0;
	//alert("Num of Args: " + numOfArgs
	//alert("Things: " + frame.locals);
	for(var i = 0;i<numOfArgs; i++) {
		var variable = frame.locals[effectiveI];
		//alert(variable);
		//JVM.debugPrint("Local at " + effectiveI + ": " + variable.value);
		methodArguments.push(variable);
		//methodArguments.push(frame.pop());
		if (methodArguments[i] !== undefined && (methodArguments[i].dataType == Data.type.LONG || methodArguments[i].dataType == Data.type.DOUBLE))
		{
			effectiveI++;
		}
		effectiveI++;
	}
	return methodArguments; //Array the represents the stack
}

function getNumOfArguments(methodDescriptor){
	var parsedDescriptor = getTheMethodDescriptor(methodDescriptor); //Returns a MethodDescriptor Object
	var numOfArguments = parsedDescriptor.args.length;
	return numOfArguments;
}

function getReturnType(methodDescriptor){
	var parsedDescriptor = getTheMethodDescriptor(methodDescriptor);
	var returnType = parsedDescriptor.returnType;
	return returnType;
}

function getTheMethodDescriptor(methodDescriptor){
	return parseMethodDescriptor(methodDescriptor); //Returns a MethodDescriptor Object
}

//Prints nothing to the console
registerNativeFunction("java/io/PrintStream", "printStuff", "()V", function(){
	JVM.println("");
	MethodRun.createReturn();
	}
);

//Used to print a boolean for system.out.println
registerNativeFunction("java/io/PrintStream", "printStuff", "(Z)V", function(){
	var arrayOfArguments = getArguments("(B)V");
	var booleanToPrint = arrayOfArguments[0];
	if (booleanToPrint.value == 1){
		JVM.println("True");
	}else{
		JVM.println("False");
	}
	MethodRun.createReturn();
	}
);

//Used to print a character for System.out.println
registerNativeFunction("java/io/PrintStream", "printStuff", "(C)V", function(){
	var arrayOfArguments = getArguments("(C)V");
	var charToPrint = arrayOfArguments[0];
	JVM.println(String.fromCharCode(charToPrint.value));
	MethodRun.createReturn();
	}
);

//Used to print an interger for System.out.println
registerNativeFunction("java/io/PrintStream", "printStuff", "(I)V", function(){
	var arrayOfArguments = getArguments("(I)V");
	var intToPrint = arrayOfArguments[0];
	JVM.println(intToPrint.value.toString());
	MethodRun.createReturn();
	}
);

//Print long
registerNativeFunction("java/io/PrintStream", "printStuff", "(J)V", function(){
	var arrayOfArguments = getArguments("(J)V");
	var longToPrint = arrayOfArguments[0];
	JVM.println(longToPrint.toStringOld());
	MethodRun.createReturn();
	}
);
//Print double
registerNativeFunction("java/io/PrintStream", "printStuff", "(D)V", function(){
	var arrayOfArguments = getArguments("(D)V");
	var doubleToPrint = arrayOfArguments[0];
	JVM.println(doubleToPrint.value.toString());
	MethodRun.createReturn();
	}
);

//Print float
registerNativeFunction("java/io/PrintStream", "printStuff", "(F)V", function(){
	var arrayOfArguments = getArguments("(F)V");
	var floatToPrint = arrayOfArguments[0];
	JVM.println(floatToPrint.value.toString());
	MethodRun.createReturn();
	}
);


function printCharArrayToConsole(arrayToPrint){
	JVM.println("[");
	//Not sure if length or
	for (var i = 0; i < arrayToPrint.length; i++){
		if(arrayToPrint[i] === undefined){
			JVM.print(' ');
		}else{
			JVM.print(String.fromCharCode(arrayToPrint[i].value));
		}
		
		if(i != arrayToPrint.length - 1){
			JVM.print(',');
		}
	}
	JVM.print(']');
}

//Print char[]
registerNativeFunction("java/io/PrintStream", "printStuff", "([C)V", function(){
	var arrayOfArguments = getArguments("([C)V");
	var arrayToPrint = arrayOfArguments[0].array;
	printCharArrayToConsole(arrayToPrint);
	MethodRun.createReturn();
});

//Print string - Take the stirng object then get its field "value" which is a char[]. Then call our char array print
registerNativeFunction("java/io/PrintStream", "printStuff", "(Ljava/lang/String;)V", function(){
	//alert("Printing String");
	var arrayOfArguments = getArguments("(Ljava/lang/String;)V");
	var string = arrayOfArguments[0];
	var arrayToPrint = string.getField("java/lang/String", "value", "[C");
	//alert(arrayToPrint + ": " + arrayToPrint.array);
	arrayToPrint = arrayToPrint.array;
	
	JVM.println("");
	//Not sure if length or
	for (var i = 0; i < arrayToPrint.length; i++){
		if(arrayToPrint[i] !== undefined){
			JVM.print(String.fromCharCode(arrayToPrint[i].value));
		}
	}
	MethodRun.createReturn();
});
	
	
//Print object - Need to call the toString Method then print the resulting string
registerNativeFunction("java/io/PrintStream", "printStuff", "(Ljava/lang/Object)V", function(){
	
});



//registerNativeFunction(ClassName, methodName, method descriptor - ignore outer (), native function definition)
//Yeah, you can pass functions as arguments in JavaScript! :)

// ---SYSTEM.CLASS---

//registerNatives doesn't do anything! I think it registers the native functions in a class, but we don't have to do that.
registerNativeFunction("java/lang/System", "registerNatives", "()V", function(){
		MethodRun.createReturn();
	}
);

/*registerNativeFunction("java/lang/System", "setIn0", "(Ljava/io/InputStream;)V", function(){
	var arrayOfArguments = getArguments("(Ljava/io/InputStream;)V");
	var returnType = getReturnType("(Ljava/io/InputStream;)V");
	//Probably Don't Need
	}
);
registerNativeFunction("java/lang/System", "setOut0", "(Ljava/io/PrintStream;)V", function(){
	var arrayOfArguments = getArguments("(Ljava/io/PrintStream;)V");
	var returnType = getReturnType("(Ljava/io/PrintStream;)V");
	//Probably Don't Need
	}
);
registerNativeFunction("java/lang/System", "setErr0", "(Ljava/io/PrintStream;)V", function(){
	var arrayOfArguments = getArguments("(Ljava/io/PrintStream;)V");
	var returnType = getReturnType("(Ljava/io/PrintStream;)V");
	//Probably Don't Need
	}
);*/
registerNativeFunction("java/lang/System", "currentTimeMillis", "()J", function(){
		var arrayOfArguments = getArguments("()J"); //This will be empty since currentTimeMillis doesn't take any arguments
		var returnType = getReturnType("()J");
		var long_= Long.fromNumber(56456456456);
		//alert(long_.getLowBits());
		MethodRun.createReturn(long_);
		//returnFromNativeFunction(currentTime, returnType);
	}
);
/*registerNativeFunction("java/lang/System", "nanoTime", "()J", function(){
		var arrayOfArguments = getArguments("()J");
		var returnType = getReturnType("()J");
		var time = currentTime = Date.now()*1000000;
		// No better accuracy than Miliseconds in JS
		returnFromNativeFunction(currentTime, returnType);
	}
);*/

registerNativeFunction("java/lang/System", "arraycopy", "(Ljava/lang/Object;ILjava/lang/Object;II)V", function(){
		var arrayOfArguments = getArguments("(Ljava/lang/Object;ILjava/lang/Object;II)V");
		var srcArray = arrayOfArguments[0];
		var srcPos = arrayOfArguments[1].value;
		var destArray = arrayOfArguments[2];
		var destPos = arrayOfArguments[3].value;
		var length = arrayOfArguments[4].value;
		//
		//If dest is null, then a NullPointerException is thrown.
		//If src is null, then a NullPointerException is thrown and the destination array is not modified.
		if (srcArray === null || destArray === null)
			ByteCode.throwException("NullPointerException");
		
		//Check the lengths.
		if (destArray.length < destPos+length || srcArray.length < srcPos+length || destPos < 0 || srcPos < 0 || length < 0)
			ByteCode.throwException("IndexOutOfBoundsException");
		
		//If the src and dest arguments refer to the same array object, then the copying is performed as
		//if the components at positions srcPos through srcPos+length-1 were first copied to a temporary
		//array with length components and then the contents of the temporary array were copied into
		//positions destPos through destPos+length-1 of the destination array.
		var partialCopy = srcArray.clonePortion(srcPos, length);
		destArray.copyInto(destPos, partialCopy);
		MethodRun.createReturn();
	}
);

/*registerNativeFunction("java/lang/System", "identityHashCode", "(Ljava/lang/Object;)I", function(){
	var arrayOfArguments = getArguments("(Ljava/lang/Object;)I");
	var returnType = getReturnType("(Ljava/lang/Object;)I");
	}
);
registerNativeFunction("java/lang/System", "initProperties", "(Ljava/util/Properties;)Ljava/util/Properties;", function(){
	var arrayOfArguments = getArguments("(Ljava/util/Properties;)Ljava/util/Properties;");
	var returnType = getReturnType("(Ljava/util/Properties;)Ljava/util/Properties;");
	}
);
registerNativeFunction("java/lang/System", "mapLibraryName", "(Ljava/lang/String;)Ljava/lang/String;", function(){
	var arrayOfArguments = getArguments("(Ljava/lang/String;)Ljava/lang/String;");
	var returnType = getReturnType("(Ljava/lang/String;)Ljava/lang/String;");
	}
);*/

// ---OBJECT.CLASS---
registerNativeFunction("java/lang/Object", "registerNatives", "()V", function(){
		MethodRun.createReturn();
	}
);

//private static native java/lang/Class.registerNatives ()V
registerNativeFunction("java/lang/Class", "registerNatives", "()V", function(){
		MethodRun.createReturn();
	}
);

//java/lang/ClassLoader.registerNatives ()V
registerNativeFunction("java/lang/ClassLoader", "registerNatives", "()V", function(){
		MethodRun.createReturn();
	}
);

//java/lang/JVM.getClassLoader0 ()Ljava/lang/ClassLoader
registerNativeFunction("java/lang/Class", "getClassLoader0", "()Ljava/lang/ClassLoader;", function(){
		MethodRun.createReturn(null); //TODO: Implement.
	}
);

//java/lang/Class.desiredAssertionStatus0 (Ljava/lang/Class;)Z
registerNativeFunction("java/lang/Class", "desiredAssertionStatus0", "(Ljava/lang/Class;)Z", function(){
		MethodRun.createReturn(new Bool(0)); //TODO: Implement.
	}
);

//java/lang/ClassLoader.registerNatives ()V

// /sun/misc/Unsafe.registerNatives ()V
registerNativeFunction("sun/misc/Unsafe", "registerNatives", "()V", function(){
		MethodRun.createReturn();
	}
);
//sun/reflect/Reflection.getCallerClass (I)Ljava/lang/Class;
//sun/reflect/Reflection.getCallerClass (I)Ljava/lang/Class;
registerNativeFunction("sun/reflect/Reflection", "getCallerClass", "(I)Ljava/lang/Class;", function(){
	var theArguments = getArguments("(I)Ljava/lang/Class;");
	
	var numberOfFrames = theArguments[0].value;
	var frameOfInterest = JVM.getExecutingThread().getStack().stack[JVM.getExecutingThread().getStack().length -1 - numberOfFrames];
	
	MethodRun.createReturn(frameOfInterest.methodInfo.classInfo); //is the class
	
		//var frame = currentFrame();
		//var methodInfo
		//var exception = MethodRun.constructObject("java/lang/Class", "()V");

		//MethodRun.createReturn(exception); //Give it Class
	}
);
//java/security/AccessController.doPrivileged (Ljava/security/PrivilegedAction;)Ljava/lang/Object;
//java/security/AccessController.doPrivileged (Ljava/security/PrivilegedAction;)Ljava/lang/Object;
registerNativeFunction("java/security/AccessController", "doPrivileged", "(Ljava/security/PrivilegedAction;)Ljava/lang/Object;", function(){
	var theArguments = getArguments("(Ljava/security/PrivilegedAction;)Ljava/lang/Object;");
	
	var action = theArguments[0].classInfo.thisClassName;
	var obj = MethodRun.callFromNative(action, "run" ,"()Ljava/lang/Object;");
	//var obj = MethodRun.callFromNative("java/lang/Class\$3", "run" ,"()Ljava/lang/Object");
	MethodRun.createReturn(obj);
	}
);


/*registerNativeFunction("java/lang/Object", "getClass", "()Ljava/lang/Class;", function(){
	var arrayOfArguments = getArguments("()Ljava/lang/Class;");
	var returnType = getReturnType("()Ljava/lang/Class;");
	}
);
registerNativeFunction("java/lang/Object", "hashCode", "()I", function(){
	var arrayOfArguments = getArguments("()I");
	var returnType = getReturnType("()I");
	}
);
registerNativeFunction("java/lang/Object", "clone", "()Ljava/lang/Object;", function(){
	var arrayOfArguments = getArguments("()Ljava/lang/Object;");
	var returnType = getReturnType("()Ljava/lang/Object;");
	}
);
registerNativeFunction("java/lang/Object", "notify", "()V", function(){
	var arrayOfArguments = getArguments("()V");
	var returnType = getReturnType("()V");
	}
);
registerNativeFunction("java/lang/Object", "notifyAll", "()V", function(){
	var arrayOfArguments = getArguments("()V");
	var returnType = getReturnType("()V");
	}
);
registerNativeFunction("java/lang/Object", "wait", "(J)V", function(){
	var arrayOfArguments = getArguments("(J)V");
	var returnType = getReturnType("(J)V");
	}
);
// ---STRING.CLASS---
registerNativeFunction("java/lang/String", "intern", "()Ljava/lang/String;", function(){
	var arrayOfArguments = getArguments("()Ljava/lang/String;");
	var returnType = getReturnType("()Ljava/lang/String;");
	}
);

// ---CLASS.CLASS---
registerNativeFunction("java/lang/Class", "registerNatives", "()V", function(){
		var arrayOfArguments = getArguments("()V");
		var returnType = getReturnType("()V");
		//TODO: registerNatives
	}
);

registerNativeFunction("java/lang/Class", "forName0", "(Ljava/lang/String;ZLjava/lang/ClassLoader;)Ljava/lang/Class;", function(){
	var arrayOfArguments = getArguments("(Ljava/lang/String;ZLjava/lang/ClassLoader;)Ljava/lang/Class;");
	var returnType = getReturnType("(Ljava/lang/String;ZLjava/lang/ClassLoader;)Ljava/lang/Class;");
	}
);

registerNativeFunction("java/lang/Class", "isInstance", "(Ljava/lang/Object;)Z", function(){
	var arrayOfArguments = getArguments("(Ljava/lang/Object;)Z");
	var returnType = getReturnType("(Ljava/lang/Object;)Z");
	}
);

registerNativeFunction("java/lang/Class", "isAssignableFrom", "(Ljava/lang/Object;)Z", function(){
	var arrayOfArguments = getArguments("(Ljava/lang/Object;)Z");
	var returnType = getReturnType("(Ljava/lang/Object;)Z");
	}
);

registerNativeFunction("java/lang/Class", "isInterface", "()Z", function(){
	var arrayOfArguments = getArguments("()Z");
	var returnType = getReturnType("()Z");
	}
);

registerNativeFunction("java/lang/Class", "isArray", "()Z", function(){
	var arrayOfArguments = getArguments("()Z");
	var returnType = getReturnType("()Z");
	}
);

registerNativeFunction("java/lang/Class", "isPrimitive", "()Z", function(){
	var arrayOfArguments = getArguments("()Z");
	var returnType = getReturnType("()Z");
	}
);

registerNativeFunction("java/lang/Class", "getName0", "()Ljava/lang/String;", function(){
	var arrayOfArguments = getArguments("()Ljava/lang/String;");
	var returnType = getReturnType("()Ljava/lang/String;");
	}
);

registerNativeFunction("java/lang/Class", "getClassLoader0", "()Ljava/lang/ClassLoader;", function(){
	var arrayOfArguments = getArguments("()Ljava/lang/ClassLoader;");
	var returnType = getReturnType("()Ljava/lang/ClassLoader;");
	}
);

registerNativeFunction("java/lang/Class", "getSuperclass", "()Ljava/lang/Class;", function(){
	var arrayOfArguments = getArguments("()Ljava/lang/Class;");
	var returnType = getReturnType("()Ljava/lang/Class;");
	}
);

registerNativeFunction("java/lang/Class", "getInterfaces", "()[Ljava/lang/Class;", function(){
	var arrayOfArguments = getArguments("()[Ljava/lang/Class;");
	var returnType = getReturnType("()[Ljava/lang/Class;");
	}
);

registerNativeFunction("java/lang/Class", "getComponentType", "()Ljava/lang/Class;", function(){
	var arrayOfArguments = getArguments("()Ljava/lang/Class;");
	var returnType = getReturnType("()Ljava/lang/Class;");
	}
);

registerNativeFunction("java/lang/Class", "getModifiers", "()I", function(){
	var arrayOfArguments = getArguments("()I");
	var returnType = getReturnType("()I");
	}
);

registerNativeFunction("java/lang/Class", "getSigners", "()[Ljava/lang/Object;", function(){
	var arrayOfArguments = getArguments("()[Ljava/lang/Object;");
	var returnType = getReturnType("()[Ljava/lang/Object;");
	}
);

registerNativeFunction("java/lang/Class", "setSigners", "([Ljava/lang/Object;)V", function(){
	var arrayOfArguments = getArguments("([Ljava/lang/Object;)V");
	var returnType = getReturnType("([Ljava/lang/Object;)V");
	}
);

registerNativeFunction("java/lang/Class", "getEnclosingMethod0", "()[Ljava/lang/Object;", function(){
	var arrayOfArguments = getArguments("()[Ljava/lang/Object;");
	var returnType = getReturnType("()[Ljava/lang/Object;");
	}
);

registerNativeFunction("java/lang/Class", "getDeclaringClass", "()Ljava/lang/Class;", function(){
	var arrayOfArguments = getArguments("()Ljava/lang/Class;");
	var returnType = getReturnType("()Ljava/lang/Class;");
	}
);

registerNativeFunction("java/lang/Class", "getProtectionDomain0", "()Ljava/security/ProtectionDomain;", function(){
	var arrayOfArguments = getArguments("()Ljava/security/ProtectionDomain;");
	var returnType = getReturnType("()Ljava/security/ProtectionDomain;");
	}
);

registerNativeFunction("java/lang/Class", "setProtectionDomain0", "(Ljava/security/ProtectionDomain;)V", function(){
	var arrayOfArguments = getArguments("(Ljava/security/ProtectionDomain;)V");
	var returnType = getReturnType("(Ljava/security/ProtectionDomain;)V");
	}
);*/

registerNativeFunction("java/lang/Class", "getPrimitiveClass", "(Ljava/lang/String;)Ljava/lang/Class;", function(){
		var arrayOfArguments = getArguments("(Ljava/lang/String;)Ljava/lang/Class;");
		/*var string = arrayOfArguments[0];
		
		var charArray = MethodRun.callFromNative("java/lang/String", "toCharArray", "()[C", string);
		var js_string = "";
		
		for (var i = 0; i < charArray.length; i++) {
			var char_ = charArray.get(i);
			var charValue = char_.value;
			js_string += String.fromCharCode(charValue);
		}*/
		
		//TODO: We do not implement the Class object natively that it wants.
		MethodRun.createReturn(null);
	}
);

/*registerNativeFunction("java/lang/Class", "getGenericSignature", "()Ljava/lang/String;", function(){
	var arrayOfArguments = getArguments("()Ljava/lang/String;");
	var returnType = getReturnType("()Ljava/lang/String;");
	}
);

registerNativeFunction("java/lang/Class", "getRawAnnotations", "()[B", function(){
	var arrayOfArguments = getArguments("()[B");
	var returnType = getReturnType("()[B");
	}
);

registerNativeFunction("java/lang/Class", "getConstantPool", "()Lsun/reflect/ConstantPool;", function(){
	var arrayOfArguments = getArguments("()Lsun/reflect/ConstantPool;");
	var returnType = getReturnType("()Lsun/reflect/ConstantPool;");
	}
);

registerNativeFunction("java/lang/Class", "getDeclaredFields0", "(Z)[Ljava/lang/reflect/Field;", function(){
	var arrayOfArguments = getArguments("(Z)[Ljava/lang/reflect/Field;");
	var returnType = getReturnType("(Z)[Ljava/lang/reflect/Field;");
	}
);

registerNativeFunction("java/lang/Class", "getDeclaredMethods0", "(Z)[Ljava/lang/reflect/Method;", function(){
	var arrayOfArguments = getArguments("(Z)[Ljava/lang/reflect/Method;");
	var returnType = getReturnType("(Z)[Ljava/lang/reflect/Method;");
	}
);

registerNativeFunction("java/lang/Class", "getDeclaredConstructors0", "(Z)[Ljava/lang/reflect/Constructor;", function(){
	var arrayOfArguments = getArguments("(Z)[Ljava/lang/reflect/Constructor;");
	var returnType = getReturnType("(Z)[Ljava/lang/reflect/Constructor;");
	}
);

registerNativeFunction("java/lang/Class", "getDeclaredClasses0", "()[Ljava/lang/Class;", function(){
	var arrayOfArguments = getArguments("()[Ljava/lang/Class;");
	var returnType = getReturnType("()[Ljava/lang/Class;");
	}
);

registerNativeFunction("java/lang/Class", "desiredAssertionStatus0", "(Ljava/lang/Class;)Z", function(){
	var arrayOfArguments = getArguments("(Ljava/lang/Class;)Z");
	var returnType = getReturnType("(Ljava/lang/Class;)Z");
	}
);

// ---CLASSLOADER.CLASS---
registerNativeFunction("java/lang/ClassLoader", "registerNatives", "()V", function(){
		var arrayOfArguments = getArguments("()V");
		var returnType = getReturnType("()V");
		//TODO: registerNatives
	}
);

registerNativeFunction("java/lang/ClassLoader", "defineClass0", "(Ljava/lang/String;[BIILjava/security/ProtectionDomain;Z)Ljava/lang/Class;", function(){
	var arrayOfArguments = getArguments("(Ljava/lang/String;[BIILjava/security/ProtectionDomain;Z)Ljava/lang/Class;");
	var returnType = getReturnType("(Ljava/lang/String;[BIILjava/security/ProtectionDomain;Z)Ljava/lang/Class;");
	}
);

registerNativeFunction("java/lang/ClassLoader", "defineClass1", "(Ljava/lang/String;[BIILjava/security/ProtectionDomain;Ljava/lang/String;Z)Ljava/lang/Class;", function(){
	var arrayOfArguments = getArguments("(Ljava/lang/String;[BIILjava/security/ProtectionDomain;Ljava/lang/String;Z)Ljava/lang/Class;");
	var returnType = getReturnType("(Ljava/lang/String;[BIILjava/security/ProtectionDomain;Ljava/lang/String;Z)Ljava/lang/Class;");
	}
);

registerNativeFunction("java/lang/ClassLoader", "defineClass2", "(Ljava/lang/String;Ljava/nio/ByteBuffer;IILjava/security/ProtectionDomain;Ljava/lang/String;Z)Ljava/lang/Class;", function(){
	var arrayOfArguments = getArguments("(Ljava/lang/String;Ljava/nio/ByteBuffer;IILjava/security/ProtectionDomain;Ljava/lang/String;Z)Ljava/lang/Class;");
	var returnType = getReturnType("(Ljava/lang/String;Ljava/nio/ByteBuffer;IILjava/security/ProtectionDomain;Ljava/lang/String;Z)Ljava/lang/Class;");
	}
);

registerNativeFunction("java/lang/ClassLoader", "resolveClass0", "(Ljava/lang/Class;)V", function(){
	var arrayOfArguments = getArguments("(Ljava/lang/Class;)V");
	var returnType = getReturnType("(Ljava/lang/Class;)V");
	}
);

registerNativeFunction("java/lang/ClassLoader", "findBootstrapClass", "(Ljava/lang/String;)Ljava/lang/Class;", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("(Ljava/lang/String;)Ljava/lang/Class;");
	}
);

registerNativeFunction("java/lang/ClassLoader", "findLoadedClass0", "(Ljava/lang/String;)Ljava/lang/Class;", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("(Ljava/lang/String;)Ljava/lang/Class;");
	}
);

registerNativeFunction("java/lang/ClassLoader", "retrieveDirectives", "()Ljava/lang/AssertionStatusDirectives;", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("()Ljava/lang/AssertionStatusDirectives;");
	}
);

// ---CONSTANTPOOL.CLASS---
registerNativeFunction("sun/reflect/ConstantPool", "getSize0", "(Ljava/lang/Object;)I", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("(Ljava/lang/Object;)I");
	}
);

registerNativeFunction("sun/reflect/ConstantPool", "getClassAt0", "(Ljava/lang/Object;I)Ljava/lang/Class;", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("(Ljava/lang/Object;I)Ljava/lang/Class;");
	}
);

registerNativeFunction("sun/reflect/ConstantPool", "getClassAtIfLoaded0", "(Ljava/lang/Object;I)Ljava/lang/Class;", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("(Ljava/lang/Object;I)Ljava/lang/Class;");
	}
);

registerNativeFunction("sun/reflect/ConstantPool", "getMethodAt0", "(Ljava/lang/Object;I)Ljava/lang/reflect/Member;", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("(Ljava/lang/Object;I)Ljava/lang/reflect/Member;");
	}
);

registerNativeFunction("sun/reflect/ConstantPool", "getMethodAtIfLoaded0", "(Ljava/lang/Object;I)Ljava/lang/reflect/Member;", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("(Ljava/lang/Object;I)Ljava/lang/reflect/Member;");
	}
);

registerNativeFunction("sun/reflect/ConstantPool", "getFieldAt0", "(Ljava/lang/Object;I)Ljava/lang/reflect/Field;", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("(Ljava/lang/Object;I)Ljava/lang/reflect/Field;");
	}
);

registerNativeFunction("sun/reflect/ConstantPool", "getFieldAtIfLoaded0", "(Ljava/lang/Object;I)Ljava/lang/reflect/Field;", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("(Ljava/lang/Object;I)Ljava/lang/reflect/Field;");
	}
);

registerNativeFunction("sun/reflect/ConstantPool", "getMemberRefInfoAt0", "(Ljava/lang/Object;I)[Ljava/lang/String;", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("(Ljava/lang/Object;I)[Ljava/lang/String;");
	}
);

registerNativeFunction("sun/reflect/ConstantPool", "getIntAt0", "(Ljava/lang/Object;I)I", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("(Ljava/lang/Object;I)I");
	}
);

registerNativeFunction("sun/reflect/ConstantPool", "getLongAt0", "(Ljava/lang/Object;I)J", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("(Ljava/lang/Object;I)J");
	}
);

registerNativeFunction("sun/reflect/ConstantPool", "getFloatAt0", "(Ljava/lang/Object;I)F", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("(Ljava/lang/Object;I)F");
	}
);

registerNativeFunction("sun/reflect/ConstantPool", "getDoubleAt0", "(Ljava/lang/Object;I)D", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("(Ljava/lang/Object;I)D");
	}
);

registerNativeFunction("sun/reflect/ConstantPool", "getStringAt0", "(Ljava/lang/Object;I)Ljava/lang/String;", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("Ljava/lang/Object;I)Ljava/lang/String;");
	}
);

registerNativeFunction("sun/reflect/ConstantPool", "getUTF8At0", "(Ljava/lang/Object;I)Ljava/lang/String;", function(){
	var arrayOfArguments = getArguments();
	var returnType = getReturnType("Ljava/lang/Object;I)Ljava/lang/String;");
	}
);*/

//r public static native java/lang/Float.floatToRawIntBits (F)I
registerNativeFunction("java/lang/Float", "floatToRawIntBits", "(F)I", function(){
		var arrayOfArguments = getArguments("(F)I");
		var floatValue = arrayOfArguments[0].value;
		var s = floatValue < 0 ? 1 : 0;
		
		//Ensure magnitude is positive.
		if (floatValue < 0)
			floatValue *= -1;

		//e: 8 bits
		//Base conversion, bitches.
		var e = Math.floor(Math.log(floatValue) / Math.log(2)) + 127;
		
		//frac: 23 bits.
		var frac = floatValue / Math.pow(2, e-127);
		frac *= Math.pow(2, 23);
		frac &= 0x800000;
		
		//Combine into one!
		var result = 0;
		result |= s;
		//Make room for e
		result <<= 8;
		result |= e;
		//Make room for frac
		result <<= 23;
		result |= frac;
		
		var retval = new Integer(result);
		MethodRun.createReturn(retval);
	}
);

//public static native java/lang/Double.doubleToRawLongBits (D)J
registerNativeFunction("java/lang/Double", "doubleToRawLongBits", "(D)J", function(){
		var arrayOfArguments = getArguments("(D)J");
		/*var doubleValue = arrayOfArguments[0].value;*/
		
		//TODO: Actually implement.
		MethodRun.createReturn(new Long(0, 0));
	}
);

//
