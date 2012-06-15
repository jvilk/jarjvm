define(function() {
    /**
     * Contains all of the needed information to start running a method, including:
     * * Whether or not the program counter needs to be changed to some offset
     *   within the method.
     *
     * * If an exception was thrown, and the method is being searched for a matching
     *   catch statement.
     *
     * * If it's just a regular method call from the start of the method.
     *
     * This object is associated with the methodInfo object in the frame it is pushed
     * into.
     */
    function MethodRun(type, pc, exception) {
        //A MethodRun object always indicates some sort of Context Switch.
        JVM.getExecutingThread().setContextSwitch(true);
        
        this.type = type;
        
        //Is PC defined?
        if (pc !== undefined)
            this.pc = pc;
        else
            this.pc = 0;
            
        if (exception !== undefined)
            this.exception = exception;
        else
            this.exception = undefined;
        
        //JVM.debugPrint("Creating a methodrun " + this.type + " for " + JVM.getExecutingThread().getCurrentMethodInfo() + "  with PC " + this.pc);
    }

    /**
     * Executes the method using the information stored inside
     * the MethodRun object.
     */
    MethodRun.prototype.execute = function() {
        JVM.getExecutingThread().setPC(this.pc);
        currentMethodInfo = JVM.getExecutingThread().getCurrentMethodInfo();
        JVM.debugPrint("Executing a methodRun for " + currentMethodInfo + " with PC " + this.pc);
        if (this.type == MethodRun.type.EXCEPTION)
            currentMethodInfo.exception(this.exception);
        else
            currentMethodInfo.execute();
    };

    /**
     * Pretty print for the stack.
     */
    MethodRun.prototype.toString = function() {
        var typeStr = "";
        for (var type in MethodRun.type) {
            if (MethodRun.type[type] == this.type) {
                typeStr = type;
                break;
            }
        }
        
        return "[MethodRun " + typeStr + " " + this.pc + "]";
    };

    MethodRun.type = {
        CALL : 1,
        RESUME : 2,
        EXCEPTION : 3,
        RETURN: 4
    };

    /**
     * Creates a call to the method represented by methodInfo.
     * Pass in arguments after methodInfo to be used as arguments
     * to this function call.
     *
     * This function will take care of preparing the stack properly
     * for the function call. If you are calling this from bytecode,
     * please call MethodRun.createResume first.
     */
    MethodRun.createCall = function(methodInfo) {
        //Create the new frame.
        JVM.getExecutingThread().pushFrame(methodInfo);
        
        //Push arguments into locals
        var args = Array.prototype.slice.call(arguments);
        args.shift(); //Get rid of methodInfo.
        
        var effectiveI = 0;
        for (var i = 0; i < args.length; i++)
        {
            JVM.getExecutingThread().setLocal(effectiveI, args[i]);
            effectiveI = JVM.getExecutingThread().getLocalsLength();
            JVM.debugPrint("Arg " + i + ": " + args[i]);
        }
        
        //Create a MethodRun object.
        var methodRun = new MethodRun(MethodRun.type.CALL);
        
        //Push MethodRun onto the new frame.
        JVM.getExecutingThread().push(methodRun);
    };

    MethodRun.constructObject = function(className, methodDescriptor){
        var classInfo = JVM.getClass(className);
        var objectRef = classInfo.getInstantiation();
        var args = Array.prototype.slice.call(arguments);
        
        var nativeArgs = [className, "<init>", methodDescriptor, objectRef];
        for (var i = 2; i < args.length; i++){
            nativeArgs[i+2] = args[i];
        }

        MethodRun.callFromNative.apply(null, nativeArgs);
        
        return objectRef;
    };

    /**
     * Same syntax as create call, except this executes the function call immediately.
     * Useful for calling Java methods from native JavaScript methods.
     *
     * This will return the return value of the Java function.
     */
    //MethodRun.callFromNative = function(methodInfo) {
    MethodRun.callFromNative = function(className, methodName, methodDescriptor) {
        var oldPC = JVM.getExecutingThread().getPC();
        
        //Push on a dummy object to represent the 'resume' MethodRun object
        //that is expected.
        
        var nativeClass = JVM.getClass(className);
        var methodInfo = nativeClass.getMethodAssert(methodName, methodDescriptor);

        //If the stack isn't empty right now, create a resume object for the previous
        //method.
        //if (!JVM.getExecutingThread().isStackEmpty())
        //  MethodRun.createResume();

        //Create a bogus frame for execution [needed if stack is empty]
        //If stack is not empty, we still need it since we cannot easily tell
        //if a frame is bogus or legit.
        JVM.getExecutingThread().pushFrame(methodInfo);
        JVM.getExecutingThread().setPC(-1);
        MethodRun.createResume(); //Returning expects this object to be here.
        
        var oldStackLength = JVM.getExecutingThread().getStackLength();
        
        var args = Array.prototype.slice.call(arguments);
        //Get rid of className / methodName
        args.shift(); args.shift();
        args[0] = methodInfo; //Replace methodDesc with methodInfo.
        
        MethodRun.createCall.apply(null, args);
        
        while (JVM.getExecutingThread().getStackLength() != oldStackLength)
        {
            //Pop off the methodRun object.
            //JVM.debugPrint("Popping off a resume");
            var method = JVM.getExecutingThread().pop();
            try
            {
                //Execute it.
                method.execute();
                //JVM.debugPrint("Finished a function");
            }
            catch (err)
            {
                //Rethrow if the exception cannot be handled in the area of the stack made by this
                //native call.
                if (JVM.getExecutingThread().getStackLength() == oldStackLength)
                {
                    //Pop off our fake frame.
                    JVM.getExecutingThread().popFrame();
                    throw err;
                }
                    
                //If it has classInfo, it's a Java exception.
                if (typeof err !== "string" && typeof err !== "object")
                {
                    //If the stack is empty, there are no more functions to catch it.
                    if (JVM.getExecutingThread().isStackEmpty())
                    {
                        //TODO: Handle unhandled exceptions here. toString? Call stack?
                        JVM.printError("ERROR: Uncaught exception of type " + err.classInfo.thisClassName + ".");
                    }
                    
                    //If the stack is not empty, ignore the exception; it may still be caught.
                }
                //Otherwise, it's a JavaScript exception! Rethrow it for the main loop to catch.
                else
                {
                    throw err;
                }
            }
        }

        //JVM.debugPrint("FINISHED A NATIVE CALL");

        //Pop off our dummy resume object.
        JVM.getExecutingThread().pop();
        
        //By default, we return nothing if there's no return value.
        var retval;
        
        //Pop off the return value if it exists.
        if (!JVM.getExecutingThread().isFrameEmpty())
            retval = JVM.getExecutingThread().pop();
        
        //Pop off our bogus frame.
        JVM.getExecutingThread().popFrame();
        
        JVM.getExecutingThread().setPC(oldPC);
        
        //A call from JS should not cause a context switch. It may be called from within
        //another function!
        JVM.getExecutingThread().setContextSwitch(false);
        
        return retval;
    };

    /**
     * Performs all the logic necessary to throw a Java exception.
     */
    MethodRun.throwException = function(exception) {
        //Create a MethodRun object.
        var methodRun = new MethodRun(MethodRun.type.EXCEPTION, JVM.getExecutingThread().getPC(), exception);
        
        //Push it and the exception onto the stack, if the stack is not empty.
        if (!JVM.getExecutingThread().isStackEmpty())
        {
            JVM.getExecutingThread().push(exception);
            JVM.getExecutingThread().push(methodRun);
        }
        
        //Throw a JS exception.
        throw exception;
    };

    /**
     * Creates a MethodRun object to resume the method in currentFrame.
     *
     * Takes in one argument: the value of the PC for resuming.
     * If this argument is not defined, it uses the current value of
     * the PC for resuming, since it should point to the *next* instruction.
     */
    MethodRun.createResume = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args.length > 0)
            JVM.getExecutingThread().setPC(args[0]);
        
        var methodRun = new MethodRun(MethodRun.type.RESUME, JVM.getExecutingThread().getPC());
        JVM.getExecutingThread().push(methodRun);
    };

    /**
     * Does not actually require a MethodRun object, but performs the
     * commands needed to return from a method.
     *
     * Pass in the return value as an argument, if the method returns one.
     */
    MethodRun.createReturn = function() {
        //Pop off the old method's frame.
        JVM.getExecutingThread().popFrame();
        
        var args = Array.prototype.slice.call(arguments);
        //If we have a return value...
        if (args.length > 0)
        {
            //Pop off the saved PC, push the return value, push back on the saved PC.
            var savedPC = JVM.getExecutingThread().pop();
            JVM.getExecutingThread().push(args[0]);
            JVM.getExecutingThread().push(savedPC);
        }
        
        //Manually change the CONTEXTSWITCH variable.
        JVM.getExecutingThread().setContextSwitch(true);
    };

    return MethodRun;
});