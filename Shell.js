/**
 * Contains logic for the shell.
 * Prints output to the console, which should have a 'print' method, a promptForInput command, and a promptForInputByCharacter command.
 * 'print' accepts the string to print, and an optional color of the text.
 * 'promptForInput' takes in four arguments -- the text for the prompt, whether or not to print the input cursor, inputMode, and [optional] text to put beside the prompt.
 * 'motd' is the message of the day -- printed at the top of the shell.
 */
function Shell(console, motd) {
	this.console = console;
	this.motd = motd;

	//Contains a lookup of commands by their name.
	this.commands = {};
	//Contains a lookup of commands by their category.
	this.commandsByCategory = {};

	//If set, input from the console will be passed to this input function.
	this.inputCallbackFcn = null;

	//Print the motd.
	this.stdout(motd);

	//TODO: Make this customizable.
	this.ps1 = "user@jarjvm:~$ ";

	//Stores command history.
	this.commandHistory = [];
	this.commandIndex = 0;
	this.commandHistory.push("");

	//Prompt for input.
	this.console.promptForInput(this.ps1);

	//Register commands.
	this.registerCommand(this); //'help' command.
	this.registerCommand(new ShellCommand("test", "Debug", "A test command that prints back the arguments fed to it.", commandTest));
	this.registerCommand(new ShellCommand("execute", "Java", "Execute the specified Java program.", execute));
	this.registerCommand(new ShellCommand("listloadedclasses", "Java", "List all of the currently loaded Java classes.", listLoadedClasses));
	this.registerCommand(new ShellCommand("clearstack", "Debug", "Clear the Java stack.", clearstack));
	this.registerCommand(new ShellCommand("toggledebug", "Debug", "Toggle debugging output (greatly slows down execution speed).", toggleDebug));
	this.registerCommand(new ShellCommand("printmethod", "Debug", "Print the bytecode of the specified method. Specify the full classname, method name, and descriptor as arguments.", printMethod));
}

/**
 * Register a command on the shell.
 */
Shell.prototype.registerCommand = function(shellCommand) {
	this.commands[shellCommand.getName()] = shellCommand;
	
	var category = shellCommand.getCategory();

	//Array has been defined for this category already.
	if (category in this.commandsByCategory) {
		this.commandsByCategory[category].push(shellCommand);
	}
	//We need to create an array for this category.
	else {
		this.commandsByCategory[category] = [ shellCommand ];
	}
};

/**
 * Processes input from the console character by character.
 */
Shell.prototype.inputCharacter = function(inputChar) {
	if (this.inputCallbackFcn !== null) {
		this.inputCallbackFcn(text);
		this.inputCallbackFcn = null;
		return;
	}
};

/**
 * Get a character from the console, and pass it to the callbackFcn.
 * TODO: Make it work for multithreaded programs. Need a queue or something.
 */
Shell.prototype.getCharacter = function(callbackFcn) {
	this.inputCallbackFcn = callbackFcn;
	this.console.promptForInput("", "", true, Console.inputMode.BY_CHAR);
};

/**
 * Get a line from the console, and pass it to the callbackFcn.
 * TODO: Make it work for multithreaded programs. Need a queue or something.
 */
Shell.prototype.getLine = function(callbackFcn) {
	this.inputCallbackFcn = callbackFcn;
	this.console.promptForInput("");
};

/**
 * Processes an input line from the user.
 * TODO: Allow for \ to continue input on next line.
 * TODO: Ignore more than one space.
 * TODO: Allow quotation marks around arguments.
 */
Shell.prototype.input = function(text) {
	if (this.inputCallbackFcn !== null) {
		var callbackFcn = this.inputCallbackFcn;
		this.inputCallbackFcn = null;
		callbackFcn(text);
		return;
	}

	//It's a command. Record it as it was typed.
	this.commandHistory[this.commandHistory.length-1] = text;
	//Create a new entry for the next command.
	this.commandIndex = this.commandHistory.push("") - 1;

	var args = text.split(" ");
	var arg, i, commandName, f, command;
	var numArgs = args.length;
	var processedArgs = [];

	for (i = 0; i < numArgs; i++) {
		arg = args[i];
		//TODO: This does not allow for any spaces in arguments.
		//Trim whitespace.
		arg.replace(/ /g, '');

		//If it's empty, it was purely whitespace.
		if (arg.length !== 0) {
			processedArgs.push(arg);
		}
	}

	//Call the applicable command with the arguments, or error if no such command exists.
	commandName = processedArgs.shift();
	//We always pass in the shell object as the first parameter.
	processedArgs.unshift(this);
	if (commandName in this.commands) {
		command = this.commands[commandName];
		command.run.apply(command, processedArgs);
	}
	else {
		this.stderr("Command " + commandName + " does not exist.\n");
	}

	//Reprompt when the above commands finish.
	this.console.promptForInput(this.ps1);
};

/**
 * Output the text to whatever we define is 'standard out'.
 * (We just print the text through the outputObject)
 */
Shell.prototype.stdout = function(text) {
	this.console.print(text);
};

/**
 * Output the text to whatever we define is 'standard error'.
 * (We just print the text as red through the outputObject)
 */
Shell.prototype.stderr = function(text) {
	//TODO: Finalize this interface. Maybe CONSOLE.color.colorhere?
	this.console.print(text, Console.colors.RED);
};

/**
 * Advance the command history by the indicated amount.
 * Can be positive or negative.
 */
Shell.prototype.advanceCommandHistory = function(delta, text) {
	var newIndex = this.commandIndex + delta;
	if (newIndex < 0 || newIndex > this.commandHistory.length-1) {
		return;
	}

	//Save the current entry.
	this.commandHistory[this.commandIndex] = text;
	this.commandIndex = newIndex;
	VM.getConsole().promptForInput(this.ps1, this.commandHistory[this.commandIndex]);
};

/*** ShellCommand Interface Functions ***/
/*** Allows the Shell to double as the 'help' shell command. ***/
Shell.prototype.getCategory = function() { return "Meta"; };
Shell.prototype.getName = function() { return "help"; };
Shell.prototype.getDescription = function() { return "Prints a handy list of commands."; };
Shell.prototype.run = function(shell) {
	var commandCategory, commandName, command, commandCategoryLength, dashLength, i, tempDashString, description, descriptionLength, commandNamePartLength, spacer, spacerArray, descriptionLineLength;
	var dash = "-";
	//Output as an array. We add strings to it and join them later.
	var output = [];
	var tempDashArray = [];
	for (commandCategory in this.commandsByCategory) {
		if (!this.commandsByCategory.hasOwnProperty(commandCategory)) {
			continue;
		}

		//Create nice looking header.
		commandCategoryLength = commandCategory.length;
		dashLength = Math.floor((80 - commandCategoryLength)/2) - 1;
		for (i = 0; i < dashLength; i++) {
			tempDashArray.push(dash);
		}
		tempDashString = tempDashArray.join("");
		tempDashArray = [];
		output.push(tempDashString, " ", commandCategory.toUpperCase(), " ", tempDashString);
		//Odd # of chars in commandCategory? Add an extra dash to the end.
		if ((tempDashString.length*2 + commandCategoryLength + 2) < 80) {
			output.push(dash);
		}
		output.push("\n");

		for (commandName in this.commandsByCategory[commandCategory]) {
			command = this.commandsByCategory[commandCategory][commandName];
			output.push(command.getName(), ": ");
			description = command.getDescription();
			descriptionLength = description.length;
			commandNamePartLength = command.getName().length + 2;
			descriptionLineLength = 80 - commandNamePartLength;

			if (descriptionLength > descriptionLineLength) {
				spacerArray = [];
				for (i = 0; i < commandNamePartLength; i++) {
					spacerArray.push(" ");
				}
				spacer = spacerArray.join("");
			}

			for (i = 0; i < descriptionLength; i += descriptionLineLength) {
				if (i !== 0) {
					output.push(spacer);
				}
				output.push(description.substring(i, (descriptionLength - i > descriptionLineLength) ? descriptionLineLength : descriptionLength - i), "\n");
			}
		}
		output.push("\n");
	}
	this.stdout(output.join(""));
};

/**
 * Represents a shell command.
 * commandName: The name of the command (e.g. 'cd')
 * commandCategory: The name of the category that this command should be
 *                  grouped under (used by the shell's 'help' command, which
 *                  lists all commands)
 * commandDescription: A general description of what the command does (NOT usage)
 * runFunction: The function that actually carries out the command.
 */
function ShellCommand(commandName, commandCategory, commandDescription, runFunction) {
	this.commandName = commandName;
	this.commandDescription = commandDescription;
	this.commandCategory = commandCategory;
	this.run = runFunction;
}

/**
 * Get the name of the category that this command should be grouped under.
 */
ShellCommand.prototype.getCategory = function() {
	return this.commandCategory;
};

/**
 * Get the name of this shell command.
 */
ShellCommand.prototype.getName = function() {
	return this.commandName;
};

/**
 * Get the description of this command.
 */
ShellCommand.prototype.getDescription = function() {
	return this.commandDescription;
};

/*** SHELL COMMANDS **/
/*** Do not call directly. **/

/**
 * Executes the main function of a given class.
 */
function execute(shell, className) { //+ arguments
	assert(JVM.getExecutingThread().isStackEmpty());
	
	var classInfo = JVM.getLoadedClass(className);

	//Ensure the class exists.
	if (classInfo === undefined)
	{
		shell.stderr("ERROR: " + className + " is not currently loaded.\n");
		return;
	}

	var mainMethod = classInfo.getMethodAssert("main", "([Ljava/lang/String;)V");
	
	var stringClass = JVM.getClass("java/lang/String");
	var args = new JavaArray(Data.type.OBJECT, stringClass, 1, arguments.length-1);
	
	for (var i = 1; i < arguments.length; i++)
	{
		//Create a String object.
		shell.stdout("Creating string w/ text " + arguments[i] + "\n");
		var stringObj = getJavaString(arguments[i]);
		
		args.set(i, stringObj);
	}
	
	MethodRun.createCall(mainMethod, args);

	//TODO: Move this into its own goddamn function which allows for function resumption.
	while (!JVM.getExecutingThread().isStackEmpty())
	{
		var method = JVM.getExecutingThread().pop();
		try
		{
			method.execute();
		}
		catch (err)
		{
			//If it has classInfo, it's a Java exception.
			if (typeof err !== "string" && typeof err !== "object")
			{
				//If the stack is empty, there are no more functions to catch it.
				if (JVM.getExecutingThread().isStackEmpty())
				{
					//TODO: Handle unhandled exceptions here. toString? Call stack?
					shell.stderr("ERROR: Uncaught exception of type " + err.classInfo.thisClassName + ".\n");
				}
				
				//If the stack is not empty, ignore the exception; it may still be caught.
			}
			//Otherwise, it's a JavaScript exception! Print it.
			else
			{
				shell.stderr("JVM Exception: " + err + "\n");

				shell.stdout(JVM.getExecutingThread().getCurrentMethodInfo().toStringWithCode(JVM.getExecutingThread().getPC()) + "\n");

				//Empty the stack. We are done executing.
				JVM.getExecutingThread().clearStack();
			}
		}
	}
	shell.stdout("\nProgram Ended\n");
	//TODO: Somehow trigger input without this function being responsible for it.
}

/**
 * Lists all of the currently loaded classes.
 */
function listLoadedClasses(shell) {
	shell.stdout("Currently Loaded Classes:\n");
	var classes = JVM.getListOfLoadedClasses();
	var i ;
	for (i=0; i < classes.length; i++)
	{
		shell.stdout("\t" + classes[i] + "\n");
	}
}

/**
 * Clears the stack. Useful for when things go bad.
 */
function clearstack(shell) {
	JVM.getExecutingThread().clearStack();
	shell.stduut("Stack is now clear.\n");
}

/**
 * Toggle debug mode on/off.
 */
function toggleDebug(shell) {
	JVM.setDebug(!JVM.isDebug());
	if (JVM.isDebug()) {
		shell.stdout("Debug mode is now ON.\n");
	}
	else {
		shell.stdout("Debug mode is now OFF.\n");
	}
}

/**
 * Prints a method with the given classname, methodname, and descriptor.
 */
function printMethod(shell, className, methodName, descriptor) {
	var klass = JVM.getClass(className);
	var method = klass.getMethodAssert(methodName, descriptor);
	shell.stdout(method.toStringWithCode());
}

/**
 * A command tester that prints out all of the arguments supplied to it.
 */
function commandTest(shell) {
	var args = arguments;
	var numArgs = args.length;
	var i;
	for (i = 0; i < numArgs; i++) {
		shell.stdout("Argument " + i + ": " + args[i] + "\n");
	}
}