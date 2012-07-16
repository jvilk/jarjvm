define(['util/Util', 'vm/MethodRun', 'vm/Primitives', 'vm/ByteCode'],
  function(Util, MethodRun, Primitives, ByteCode) {
    NativeFunctions = {};

    /**
     * Stores all of the native functions.
     */
    NativeFunctions.fcns = [];

    /**
     * Registers a native function for the given class name, method name, and method descriptor.
     */
    NativeFunctions.registerNativeFunction = function(className, methodName, methodDescriptor, fcn)
    {
      if (!(className in NativeFunctions.fcns))
        NativeFunctions.fcns[className] = {};
        
      if (!(methodName in NativeFunctions.fcns[className]))
        NativeFunctions.fcns[className][methodName] = {};
        
      NativeFunctions.fcns[className][methodName][methodDescriptor] = fcn;
    };

    /**
     * Get the native function for the given class/method/descriptor combo.
     */
    NativeFunctions.getNativeFunction = function(className, methodName, methodDescriptor)
    {
      if (!(className in NativeFunctions.fcns) ||
        !(methodName in NativeFunctions.fcns[className]) ||
        !(methodDescriptor in NativeFunctions.fcns[className][methodName]))
        //throw "ERROR: No native function found for " + className + "." + methodName + " " + methodDescriptor;
        return function() {
          throw "ERROR: Native method " + className + "." + methodName + " " + methodDescriptor + " is not defined.";
        };
        
      return NativeFunctions.fcns[className][methodName][methodDescriptor];
    };

    /**
     * Returns the arguments from the stack in an array, so that the first argument for the method in the
     * first location of the array.
     */
    NativeFunctions.getArguments = function(methodDescriptor){
      var frame = JVM.getExecutingThread().getCurrentFrame();
      var numOfArgs = NativeFunctions.getNumOfArguments(methodDescriptor);
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
        if (methodArguments[i] !== undefined && (methodArguments[i].dataType === Enum.dataType.LONG || methodArguments[i].dataType === Enum.dataType.DOUBLE))
        {
          effectiveI++;
        }
        effectiveI++;
      }
      return methodArguments; //Array the represents the stack
    };

    NativeFunctions.getNumOfArguments = function(methodDescriptor){
      var parsedDescriptor = NativeFunctions.getTheMethodDescriptor(methodDescriptor); //Returns a MethodDescriptor Object
      var numOfArguments = parsedDescriptor.args.length;
      return numOfArguments;
    };

    NativeFunctions.getReturnType = function(methodDescriptor){
      var parsedDescriptor = NativeFunctions.getTheMethodDescriptor(methodDescriptor);
      var returnType = parsedDescriptor.returnType;
      return returnType;
    };

    NativeFunctions.getTheMethodDescriptor = function(methodDescriptor){
      return Util.parseMethodDescriptor(methodDescriptor); //Returns a MethodDescriptor Object
    };

    //Prints nothing to the console
    NativeFunctions.registerNativeFunction("java/io/PrintStream", "printStuff", "()V", function(){
      JVM.println("");
      MethodRun.createReturn();
      }
    );

    //Used to print a boolean for system.out.println
    NativeFunctions.registerNativeFunction("java/io/PrintStream", "printStuff", "(Z)V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(B)V");
      var booleanToPrint = arrayOfArguments[0];
      if (booleanToPrint.value === 1){
        JVM.println("True");
      }else{
        JVM.println("False");
      }
      MethodRun.createReturn();
      }
    );

    //Used to print a character for System.out.println
    NativeFunctions.registerNativeFunction("java/io/PrintStream", "printStuff", "(C)V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(C)V");
      var charToPrint = arrayOfArguments[0];
      JVM.println(String.fromCharCode(charToPrint.value));
      MethodRun.createReturn();
      }
    );

    //Used to print an interger for System.out.println
    NativeFunctions.registerNativeFunction("java/io/PrintStream", "printStuff", "(I)V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(I)V");
      var intToPrint = arrayOfArguments[0];
      JVM.println(intToPrint.value.toString());
      MethodRun.createReturn();
      }
    );

    //Print long
    NativeFunctions.registerNativeFunction("java/io/PrintStream", "printStuff", "(J)V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(J)V");
      var longToPrint = arrayOfArguments[0];
      JVM.println(longToPrint.toStringOld());
      MethodRun.createReturn();
      }
    );
    //Print double
    NativeFunctions.registerNativeFunction("java/io/PrintStream", "printStuff", "(D)V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(D)V");
      var doubleToPrint = arrayOfArguments[0];
      JVM.println(doubleToPrint.value.toString());
      MethodRun.createReturn();
      }
    );

    //Print float
    NativeFunctions.registerNativeFunction("java/io/PrintStream", "printStuff", "(F)V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(F)V");
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
    NativeFunctions.registerNativeFunction("java/io/PrintStream", "printStuff", "([C)V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("([C)V");
      var arrayToPrint = arrayOfArguments[0].array;
      printCharArrayToConsole(arrayToPrint);
      MethodRun.createReturn();
    });

    //Print string - Take the stirng object then get its field "value" which is a char[]. Then call our char array print
    NativeFunctions.registerNativeFunction("java/io/PrintStream", "printStuff", "(Ljava/lang/String;)V", function(){
      //alert("Printing String");
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/lang/String;)V");
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
    NativeFunctions.registerNativeFunction("java/io/PrintStream", "printStuff", "(Ljava/lang/Object)V", function(){
      
    });



    //NativeFunctions.registerNativeFunction(ClassName, methodName, method descriptor - ignore outer (), native function definition)
    //Yeah, you can pass functions as arguments in JavaScript! :)

    // ---SYSTEM.CLASS---

    //registerNatives doesn't do anything! I think it registers the native functions in a class, but we don't have to do that.
    NativeFunctions.registerNativeFunction("java/lang/System", "registerNatives", "()V", function(){
        MethodRun.createReturn();
      }
    );

    /*NativeFunctions.registerNativeFunction("java/lang/System", "setIn0", "(Ljava/io/InputStream;)V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/io/InputStream;)V");
      var returnType = NativeFunctions.getReturnType("(Ljava/io/InputStream;)V");
      //Probably Don't Need
      }
    );
    NativeFunctions.registerNativeFunction("java/lang/System", "setOut0", "(Ljava/io/PrintStream;)V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/io/PrintStream;)V");
      var returnType = NativeFunctions.getReturnType("(Ljava/io/PrintStream;)V");
      //Probably Don't Need
      }
    );
    NativeFunctions.registerNativeFunction("java/lang/System", "setErr0", "(Ljava/io/PrintStream;)V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/io/PrintStream;)V");
      var returnType = NativeFunctions.getReturnType("(Ljava/io/PrintStream;)V");
      //Probably Don't Need
      }
    );*/
    NativeFunctions.registerNativeFunction("java/lang/System", "currentTimeMillis", "()J", function(){
        var arrayOfArguments = NativeFunctions.getArguments("()J"); //This will be empty since currentTimeMillis doesn't take any arguments
        var returnType = NativeFunctions.getReturnType("()J");
        var long_= Primitives.getLongFromNumber(56456456456);
        //alert(long_.getLowBits());
        MethodRun.createReturn(long_);
        //returnFromNativeFunction(currentTime, returnType);
      }
    );
    /*NativeFunctions.registerNativeFunction("java/lang/System", "nanoTime", "()J", function(){
        var arrayOfArguments = NativeFunctions.getArguments("()J");
        var returnType = NativeFunctions.getReturnType("()J");
        var time = currentTime = Date.now()*1000000;
        // No better accuracy than Miliseconds in JS
        returnFromNativeFunction(currentTime, returnType);
      }
    );*/

    NativeFunctions.registerNativeFunction("java/lang/System", "arraycopy", "(Ljava/lang/Object;ILjava/lang/Object;II)V", function(){
        var arrayOfArguments = NativeFunctions.getArguments("(Ljava/lang/Object;ILjava/lang/Object;II)V");
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

    /*NativeFunctions.registerNativeFunction("java/lang/System", "identityHashCode", "(Ljava/lang/Object;)I", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/lang/Object;)I");
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Object;)I");
      }
    );
    NativeFunctions.registerNativeFunction("java/lang/System", "initProperties", "(Ljava/util/Properties;)Ljava/util/Properties;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/util/Properties;)Ljava/util/Properties;");
      var returnType = NativeFunctions.getReturnType("(Ljava/util/Properties;)Ljava/util/Properties;");
      }
    );
    NativeFunctions.registerNativeFunction("java/lang/System", "mapLibraryName", "(Ljava/lang/String;)Ljava/lang/String;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/lang/String;)Ljava/lang/String;");
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/String;)Ljava/lang/String;");
      }
    );*/

    // ---OBJECT.CLASS---
    NativeFunctions.registerNativeFunction("java/lang/Object", "registerNatives", "()V", function(){
        MethodRun.createReturn();
      }
    );

    //private static native java/lang/Class.registerNatives ()V
    NativeFunctions.registerNativeFunction("java/lang/Class", "registerNatives", "()V", function(){
        MethodRun.createReturn();
      }
    );

    //java/lang/ClassLoader.registerNatives ()V
    NativeFunctions.registerNativeFunction("java/lang/ClassLoader", "registerNatives", "()V", function(){
        MethodRun.createReturn();
      }
    );

    //java/lang/JVM.getClassLoader0 ()Ljava/lang/ClassLoader
    NativeFunctions.registerNativeFunction("java/lang/Class", "getClassLoader0", "()Ljava/lang/ClassLoader;", function(){
        MethodRun.createReturn(null); //TODO: Implement.
      }
    );

    //java/lang/Class.desiredAssertionStatus0 (Ljava/lang/Class;)Z
    NativeFunctions.registerNativeFunction("java/lang/Class", "desiredAssertionStatus0", "(Ljava/lang/Class;)Z", function(){
        MethodRun.createReturn(Primitives.getBool(0)); //TODO: Implement.
      }
    );

    //java/lang/ClassLoader.registerNatives ()V

    // /sun/misc/Unsafe.registerNatives ()V
    NativeFunctions.registerNativeFunction("sun/misc/Unsafe", "registerNatives", "()V", function(){
        MethodRun.createReturn();
      }
    );
    //sun/reflect/Reflection.getCallerClass (I)Ljava/lang/Class;
    //sun/reflect/Reflection.getCallerClass (I)Ljava/lang/Class;
    NativeFunctions.registerNativeFunction("sun/reflect/Reflection", "getCallerClass", "(I)Ljava/lang/Class;", function(){
      var theArguments = NativeFunctions.getArguments("(I)Ljava/lang/Class;");
      
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
    NativeFunctions.registerNativeFunction("java/security/AccessController", "doPrivileged", "(Ljava/security/PrivilegedAction;)Ljava/lang/Object;", function(){
      var theArguments = NativeFunctions.getArguments("(Ljava/security/PrivilegedAction;)Ljava/lang/Object;");
      
      var action = theArguments[0].classInfo.thisClassName;
      var obj = MethodRun.callFromNative(action, "run" ,"()Ljava/lang/Object;");
      //var obj = MethodRun.callFromNative("java/lang/Class\$3", "run" ,"()Ljava/lang/Object");
      MethodRun.createReturn(obj);
      }
    );


    /*NativeFunctions.registerNativeFunction("java/lang/Object", "getClass", "()Ljava/lang/Class;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()Ljava/lang/Class;");
      var returnType = NativeFunctions.getReturnType("()Ljava/lang/Class;");
      }
    );
    NativeFunctions.registerNativeFunction("java/lang/Object", "hashCode", "()I", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()I");
      var returnType = NativeFunctions.getReturnType("()I");
      }
    );
    NativeFunctions.registerNativeFunction("java/lang/Object", "clone", "()Ljava/lang/Object;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()Ljava/lang/Object;");
      var returnType = NativeFunctions.getReturnType("()Ljava/lang/Object;");
      }
    );
    NativeFunctions.registerNativeFunction("java/lang/Object", "notify", "()V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()V");
      var returnType = NativeFunctions.getReturnType("()V");
      }
    );
    NativeFunctions.registerNativeFunction("java/lang/Object", "notifyAll", "()V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()V");
      var returnType = NativeFunctions.getReturnType("()V");
      }
    );
    NativeFunctions.registerNativeFunction("java/lang/Object", "wait", "(J)V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(J)V");
      var returnType = NativeFunctions.getReturnType("(J)V");
      }
    );
    // ---STRING.CLASS---
    NativeFunctions.registerNativeFunction("java/lang/String", "intern", "()Ljava/lang/String;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()Ljava/lang/String;");
      var returnType = NativeFunctions.getReturnType("()Ljava/lang/String;");
      }
    );

    // ---CLASS.CLASS---
    NativeFunctions.registerNativeFunction("java/lang/Class", "registerNatives", "()V", function(){
        var arrayOfArguments = NativeFunctions.getArguments("()V");
        var returnType = NativeFunctions.getReturnType("()V");
        //TODO: registerNatives
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "forName0", "(Ljava/lang/String;ZLjava/lang/ClassLoader;)Ljava/lang/Class;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/lang/String;ZLjava/lang/ClassLoader;)Ljava/lang/Class;");
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/String;ZLjava/lang/ClassLoader;)Ljava/lang/Class;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "isInstance", "(Ljava/lang/Object;)Z", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/lang/Object;)Z");
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Object;)Z");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "isAssignableFrom", "(Ljava/lang/Object;)Z", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/lang/Object;)Z");
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Object;)Z");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "isInterface", "()Z", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()Z");
      var returnType = NativeFunctions.getReturnType("()Z");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "isArray", "()Z", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()Z");
      var returnType = NativeFunctions.getReturnType("()Z");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "isPrimitive", "()Z", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()Z");
      var returnType = NativeFunctions.getReturnType("()Z");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getName0", "()Ljava/lang/String;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()Ljava/lang/String;");
      var returnType = NativeFunctions.getReturnType("()Ljava/lang/String;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getClassLoader0", "()Ljava/lang/ClassLoader;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()Ljava/lang/ClassLoader;");
      var returnType = NativeFunctions.getReturnType("()Ljava/lang/ClassLoader;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getSuperclass", "()Ljava/lang/Class;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()Ljava/lang/Class;");
      var returnType = NativeFunctions.getReturnType("()Ljava/lang/Class;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getInterfaces", "()[Ljava/lang/Class;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()[Ljava/lang/Class;");
      var returnType = NativeFunctions.getReturnType("()[Ljava/lang/Class;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getComponentType", "()Ljava/lang/Class;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()Ljava/lang/Class;");
      var returnType = NativeFunctions.getReturnType("()Ljava/lang/Class;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getModifiers", "()I", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()I");
      var returnType = NativeFunctions.getReturnType("()I");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getSigners", "()[Ljava/lang/Object;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()[Ljava/lang/Object;");
      var returnType = NativeFunctions.getReturnType("()[Ljava/lang/Object;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "setSigners", "([Ljava/lang/Object;)V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("([Ljava/lang/Object;)V");
      var returnType = NativeFunctions.getReturnType("([Ljava/lang/Object;)V");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getEnclosingMethod0", "()[Ljava/lang/Object;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()[Ljava/lang/Object;");
      var returnType = NativeFunctions.getReturnType("()[Ljava/lang/Object;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getDeclaringClass", "()Ljava/lang/Class;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()Ljava/lang/Class;");
      var returnType = NativeFunctions.getReturnType("()Ljava/lang/Class;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getProtectionDomain0", "()Ljava/security/ProtectionDomain;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()Ljava/security/ProtectionDomain;");
      var returnType = NativeFunctions.getReturnType("()Ljava/security/ProtectionDomain;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "setProtectionDomain0", "(Ljava/security/ProtectionDomain;)V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/security/ProtectionDomain;)V");
      var returnType = NativeFunctions.getReturnType("(Ljava/security/ProtectionDomain;)V");
      }
    );*/

    NativeFunctions.registerNativeFunction("java/lang/Class", "getPrimitiveClass", "(Ljava/lang/String;)Ljava/lang/Class;", function(){
        var arrayOfArguments = NativeFunctions.getArguments("(Ljava/lang/String;)Ljava/lang/Class;");
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

    /*NativeFunctions.registerNativeFunction("java/lang/Class", "getGenericSignature", "()Ljava/lang/String;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()Ljava/lang/String;");
      var returnType = NativeFunctions.getReturnType("()Ljava/lang/String;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getRawAnnotations", "()[B", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()[B");
      var returnType = NativeFunctions.getReturnType("()[B");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getConstantPool", "()Lsun/reflect/ConstantPool;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()Lsun/reflect/ConstantPool;");
      var returnType = NativeFunctions.getReturnType("()Lsun/reflect/ConstantPool;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getDeclaredFields0", "(Z)[Ljava/lang/reflect/Field;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Z)[Ljava/lang/reflect/Field;");
      var returnType = NativeFunctions.getReturnType("(Z)[Ljava/lang/reflect/Field;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getDeclaredMethods0", "(Z)[Ljava/lang/reflect/Method;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Z)[Ljava/lang/reflect/Method;");
      var returnType = NativeFunctions.getReturnType("(Z)[Ljava/lang/reflect/Method;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getDeclaredConstructors0", "(Z)[Ljava/lang/reflect/Constructor;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Z)[Ljava/lang/reflect/Constructor;");
      var returnType = NativeFunctions.getReturnType("(Z)[Ljava/lang/reflect/Constructor;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "getDeclaredClasses0", "()[Ljava/lang/Class;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("()[Ljava/lang/Class;");
      var returnType = NativeFunctions.getReturnType("()[Ljava/lang/Class;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/Class", "desiredAssertionStatus0", "(Ljava/lang/Class;)Z", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/lang/Class;)Z");
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Class;)Z");
      }
    );

    // ---CLASSLOADER.CLASS---
    NativeFunctions.registerNativeFunction("java/lang/ClassLoader", "registerNatives", "()V", function(){
        var arrayOfArguments = NativeFunctions.getArguments("()V");
        var returnType = NativeFunctions.getReturnType("()V");
        //TODO: registerNatives
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/ClassLoader", "defineClass0", "(Ljava/lang/String;[BIILjava/security/ProtectionDomain;Z)Ljava/lang/Class;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/lang/String;[BIILjava/security/ProtectionDomain;Z)Ljava/lang/Class;");
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/String;[BIILjava/security/ProtectionDomain;Z)Ljava/lang/Class;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/ClassLoader", "defineClass1", "(Ljava/lang/String;[BIILjava/security/ProtectionDomain;Ljava/lang/String;Z)Ljava/lang/Class;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/lang/String;[BIILjava/security/ProtectionDomain;Ljava/lang/String;Z)Ljava/lang/Class;");
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/String;[BIILjava/security/ProtectionDomain;Ljava/lang/String;Z)Ljava/lang/Class;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/ClassLoader", "defineClass2", "(Ljava/lang/String;Ljava/nio/ByteBuffer;IILjava/security/ProtectionDomain;Ljava/lang/String;Z)Ljava/lang/Class;", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/lang/String;Ljava/nio/ByteBuffer;IILjava/security/ProtectionDomain;Ljava/lang/String;Z)Ljava/lang/Class;");
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/String;Ljava/nio/ByteBuffer;IILjava/security/ProtectionDomain;Ljava/lang/String;Z)Ljava/lang/Class;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/ClassLoader", "resolveClass0", "(Ljava/lang/Class;)V", function(){
      var arrayOfArguments = NativeFunctions.getArguments("(Ljava/lang/Class;)V");
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Class;)V");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/ClassLoader", "findBootstrapClass", "(Ljava/lang/String;)Ljava/lang/Class;", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/String;)Ljava/lang/Class;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/ClassLoader", "findLoadedClass0", "(Ljava/lang/String;)Ljava/lang/Class;", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/String;)Ljava/lang/Class;");
      }
    );

    NativeFunctions.registerNativeFunction("java/lang/ClassLoader", "retrieveDirectives", "()Ljava/lang/AssertionStatusDirectives;", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("()Ljava/lang/AssertionStatusDirectives;");
      }
    );

    // ---CONSTANTPOOL.CLASS---
    NativeFunctions.registerNativeFunction("sun/reflect/ConstantPool", "getSize0", "(Ljava/lang/Object;)I", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Object;)I");
      }
    );

    NativeFunctions.registerNativeFunction("sun/reflect/ConstantPool", "getClassAt0", "(Ljava/lang/Object;I)Ljava/lang/Class;", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Object;I)Ljava/lang/Class;");
      }
    );

    NativeFunctions.registerNativeFunction("sun/reflect/ConstantPool", "getClassAtIfLoaded0", "(Ljava/lang/Object;I)Ljava/lang/Class;", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Object;I)Ljava/lang/Class;");
      }
    );

    NativeFunctions.registerNativeFunction("sun/reflect/ConstantPool", "getMethodAt0", "(Ljava/lang/Object;I)Ljava/lang/reflect/Member;", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Object;I)Ljava/lang/reflect/Member;");
      }
    );

    NativeFunctions.registerNativeFunction("sun/reflect/ConstantPool", "getMethodAtIfLoaded0", "(Ljava/lang/Object;I)Ljava/lang/reflect/Member;", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Object;I)Ljava/lang/reflect/Member;");
      }
    );

    NativeFunctions.registerNativeFunction("sun/reflect/ConstantPool", "getFieldAt0", "(Ljava/lang/Object;I)Ljava/lang/reflect/Field;", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Object;I)Ljava/lang/reflect/Field;");
      }
    );

    NativeFunctions.registerNativeFunction("sun/reflect/ConstantPool", "getFieldAtIfLoaded0", "(Ljava/lang/Object;I)Ljava/lang/reflect/Field;", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Object;I)Ljava/lang/reflect/Field;");
      }
    );

    NativeFunctions.registerNativeFunction("sun/reflect/ConstantPool", "getMemberRefInfoAt0", "(Ljava/lang/Object;I)[Ljava/lang/String;", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Object;I)[Ljava/lang/String;");
      }
    );

    NativeFunctions.registerNativeFunction("sun/reflect/ConstantPool", "getIntAt0", "(Ljava/lang/Object;I)I", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Object;I)I");
      }
    );

    NativeFunctions.registerNativeFunction("sun/reflect/ConstantPool", "getLongAt0", "(Ljava/lang/Object;I)J", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Object;I)J");
      }
    );

    NativeFunctions.registerNativeFunction("sun/reflect/ConstantPool", "getFloatAt0", "(Ljava/lang/Object;I)F", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Object;I)F");
      }
    );

    NativeFunctions.registerNativeFunction("sun/reflect/ConstantPool", "getDoubleAt0", "(Ljava/lang/Object;I)D", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("(Ljava/lang/Object;I)D");
      }
    );

    NativeFunctions.registerNativeFunction("sun/reflect/ConstantPool", "getStringAt0", "(Ljava/lang/Object;I)Ljava/lang/String;", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("Ljava/lang/Object;I)Ljava/lang/String;");
      }
    );

    NativeFunctions.registerNativeFunction("sun/reflect/ConstantPool", "getUTF8At0", "(Ljava/lang/Object;I)Ljava/lang/String;", function(){
      var arrayOfArguments = NativeFunctions.getArguments();
      var returnType = NativeFunctions.getReturnType("Ljava/lang/Object;I)Ljava/lang/String;");
      }
    );*/

    //r public static native java/lang/Float.floatToRawIntBits (F)I
    NativeFunctions.registerNativeFunction("java/lang/Float", "floatToRawIntBits", "(F)I", function(){
        var arrayOfArguments = NativeFunctions.getArguments("(F)I");
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
        
        var retval = Primitives.getInteger(result);
        MethodRun.createReturn(retval);
      }
    );

    //public static native java/lang/Double.doubleToRawLongBits (D)J
    NativeFunctions.registerNativeFunction("java/lang/Double", "doubleToRawLongBits", "(D)J", function(){
        var arrayOfArguments = NativeFunctions.getArguments("(D)J");
        /*var doubleValue = arrayOfArguments[0].value;*/
        
        //TODO: Actually implement.
        MethodRun.createReturn(Primitives.getLong(0, 0));
      }
    );

    return NativeFunctions;
  }
);