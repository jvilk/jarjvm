define(
  function() {
    function ClassEntry(innerClassInfo, outerClassInfo, innerName, innerClassAccessFlags) {
      this.innerClassInfo = innerClassInfo;
      this.outerClassInfo = outerClassInfo;
      this.innerName = innerName;
      this.innerClassAccessFlags = innerClassAccessFlags;
    }

    return ClassEntry;
  }
);