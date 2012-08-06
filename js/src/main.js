requirejs.config({
  //By default load any module IDs from the current directory
  baseUrl: './js/src'
});

require(['vm/VM', 'vm/Enum', 'util/JavaClassReader', 'vm/ClassFactory', 'util/Util'],
  function (VM, Enum, JavaClassReader, ClassFactory, Util) {
    "use strict";
    
    /**
     * Prevent Chrome from going back a page when backspace is hit.
     */
    function suppressBackspace(evt) {
      evt = evt || window.event;
      var target = evt.target || evt.srcElement;
      if ((evt.keyCode === 8 || evt.keyCode === Enum.controlCharacter.UP || evt.keyCode === Enum.controlCharacter.DOWN ||
        evt.keyCode === Enum.controlCharacter.END || evt.keyCode === Enum.controlCharacter.HOME || evt.keyCode === 191) &&
        !/input|textarea/i.test(target.nodeName)) {
        return false;
      }
    }

    //Suppresses Chrome's backspace behavior (goes back a page).
    document.onkeydown = suppressBackspace;
    document.onkeypress = suppressBackspace;

    JVM = new VM("console", "Welcome the the JAR Javascript JVM!\nIf you need help with this console type 'help' and press Enter\n--------------------------------------------------------------------------------\n");
    JVM.initialize();

    function handleFileSelect(evt) {
      //Initialize system.
      JVM.println("Loading User Classes...\n");
      var files = evt.target.files;
      // FileList object

      for(var i = 0, f; f = files[i]; i++) {

        var reader = new FileReader();

        reader.onloadend = function(evt) {
          if(evt.target.readyState === FileReader.DONE) {
            JVM.println("File Read In");
            var bytes = evt.target.result;
            var javaClassReader = new JavaClassReader(bytes);
            var aClass = ClassFactory.parseClass(javaClassReader);
            Util.assert(javaClassReader.getOffset() === javaClassReader.data.length);
          }
        };

        //reader.readAsArrayBuffer(f);
        reader.readAsBinaryString(f);
      }
    }

    document.getElementById('files').addEventListener('change', handleFileSelect, false);
  }
);