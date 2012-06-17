define(['Thread', 'Console', 'ClassLoader', 'MethodRun', 'Enum'],
  function (Thread, Console, ClassLoader, MethodRun, Enum) {
    /**
     * Create a new VM.
     * consoleID is the ID of the page object that holds the console.
     * motd is the `message of the day' for the shell.
     */
    function VM(consoleID, motd) {
      this.executingThread = new Thread();
      this.debugMode = false;
      this.console = new Console(consoleID, motd);
      this.loadedClasses = [];
      this.classLoader = new ClassLoader();

      //TODO: Functions that manage this threadpool. :D
      this.threadPool = [ this.executingThread ];
      this.initialized = false;
    }

    /**
     * Start up the VM!
     */
    VM.prototype.initialize = function() {
      this.initialized = true;
      this.println("Preloading system classes. This may take a moment...");
      this.getClass("java/lang/System");
      MethodRun.callFromNative("java/lang/System", "initializeSystemClass", "()V");
      this.println("System classes initialized!");
    };

    /**
     * Returns the object representing the console / terminal.
     */
    VM.prototype.getConsole = function() {
      return this.console;
    };

    /**
     * Returns the currently executing thread.
     */
    VM.prototype.getExecutingThread = function() {
      return this.executingThread;
    };

    /**
     * Returns 'true' if we are running in debug mode, 'false' otherwise.
     */
    VM.prototype.isDebug = function() {
      return this.debugMode;
    };

    /**
     * Sets debug to the indicated value. Should be a boolean.
     */
    VM.prototype.setDebug = function(newDebug) {
      this.debugMode = newDebug;
    };

    /** CONSOLE PROXY METHODS **/

    /**
     * Print debug information to the console.
     */
    VM.prototype.debugPrint = function(text)  {
      if (this.debugMode) {
        this.console.print(text);
      }
    };

    /**
     * Print an error to the console.
     */
    VM.prototype.printError = function(text) {
      this.console.print(text + "\n", Enum.textColorClass.RED);
    };

    /**
     * Print a warning to the console.
     */
    VM.prototype.printWarning = function(text) {
      this.console.print(text + "\n", Enum.textColorClass.YELLOW);
    };

    /**
     * Print regular ole text to the console.
     */
    VM.prototype.println = function(text) {
      this.console.print(text + "\n");
    };

    VM.prototype.print = function(text) {
      this.console.print(text);
    };

    /** CLASSLOADER PROXY METHODS **/

    VM.prototype.getLoadedClass = function(className) {
      return this.classLoader.getLoadedClass(className);
    };

    VM.prototype.registerClass = function(className, classObj) {
      this.classLoader.registerClass(className, classObj);
    };

    VM.prototype.getClass = function(className) {
      return this.classLoader.getClass(className);
    };

    VM.prototype.getListOfLoadedClasses = function() {
      return this.classLoader.getListOfLoadedClasses();
    };

    return VM;
  }
);