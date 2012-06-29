define(['Util', 'JavaClassReader', 'ClassFactory'],
  function(Util, JavaClassReader, ClassFactory) {
    function ClassLoader() {
      this.classes = [];
    }

    /**
     * Returns an already loaded class with the given className, or undefined if it
     * has not been loaded.
     */
    ClassLoader.prototype.getLoadedClass = function(className) {
      if (className in this.classes) return this.classes[className];
      return undefined;
    };

    /**
     * Returns an array of names of all of the currently loaded classes.
     */
    ClassLoader.prototype.getListOfLoadedClasses = function() {
      var loadedClasses = [];
      var aClass;
      for (aClass in this.classes) {
        loadedClasses.push(aClass);
      }

      return loadedClasses;
    };

    /**
     * Our "class loader". Given a class name, it either loads it
     * from the array, or, failing that, loads it from the JRE.
     */
    ClassLoader.prototype.getClass = function(className) {
      //Check if it's in the array.
      if (className in this.classes)
        return this.classes[className];
        
      JVM.debugPrint("Loading class: " + className);
     
      var url = document.URL; //Url now has the url up to the current directory without the trailing slash
      url = url.substr(0, url.lastIndexOf('/'));

      //Synchronously get the JRE class.
      var request = new XMLHttpRequest();
      request.overrideMimeType('text/plain; charset=x-user-defined');
      request.open('GET', url + "/jre/" + className + ".class", false);
      request.send(null);

      //Ensure success.
      Util.assert(request.status === 200);

      //Wrap the data so it's interpreted correctly.
      var contentWrapped = {};
      contentWrapped.content = request.responseText;
      contentWrapped.length = contentWrapped.content.length;
      contentWrapped.charCodeAt = function(x) { return this.content.charCodeAt(x) & 0xFF; };
      
      //Load the class.
      var javaClassReader = new JavaClassReader(contentWrapped);
      //The Class constructor will call 'registerClass' itself.
      var aClass = ClassFactory.parseClass(javaClassReader);
      
      return aClass;
    };

    /**
     * Register a class object with the given name.
     */
    ClassLoader.prototype.registerClass = function(className, classObj) {
      this.classes[className] = classObj;
    };

    return ClassLoader;
  }
);