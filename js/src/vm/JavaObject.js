define(
  function() {
    /**
     * This file should have objects that are used to represent actual java instantiations
     */

    function JavaObject(classInfo){
      this.classInfo = classInfo;
      //There are three basic types of data in the JVM: Objects, primitives, and
      //arrays. I'm an object.
      this.dataType = Data.type.OBJECT;
      
      /**
       * Array of fields.
       * 1st dimension: Classname
       * 2nd dimension: Field name
       * 3rd dimension: value
       *
       * We need to do this since an object may have multiple fields with the
       * same name from different parent classes due to things like private
       * fields.
       *
       * This array is instantiated with default values by
       * Class._populateObjectFields.
       */
      this.fields = [];
      classInfo._populateObjectFields(this);
    }

    /**
     * Checks if this Java object can be cast to the given type.
     */
    JavaObject.prototype.isA = function(classDescriptor) {
      //If it's an array, return false.
      if (classDescriptor.charAt(0) === '[')
        return false;
        
      return this.classInfo.isA(classInfo);
    };

    /**
     * Get the value of a field of this object. Need the classname because
     * super classes can have same-name fields.
     */
    JavaObject.prototype.getField = function(className, fieldName, fieldDescriptor)
    {
      if (className in this.fields && fieldName in this.fields[className])
      {
        return this.fields[className][fieldName];
      }
      
      var classInfo = JVM.getClass(className);
      return classInfo.getStatic(fieldName, fieldDescriptor);
    };

    /**
     * Same as getField, but it extracts the arguments from a fieldInfo object.
     */
    JavaObject.prototype.getFieldByFieldInfo = function(fieldInfo) {
      var className = fieldInfo.classInfo.thisClassName;
      var fieldName = fieldInfo.name;
      var fieldDescriptor = fieldInfo.descriptor;
      return this.getField(className, fieldName, fieldDescriptor);
    };

    /**
     * Same as setField, but it extracts className/fieldName/fieldDescriptor from a FieldInfo object.
     */
    JavaObject.prototype.setFieldByFieldInfo = function(fieldInfo, newValue) {
      var className = fieldInfo.classInfo.thisClassName;
      var fieldName = fieldInfo.name;
      var fieldDescriptor = fieldInfo.descriptor;
      this.setField(className, fieldName, fieldDescriptor, newValue);
    };

    /**
     * Set the value of a field of this object.
     */
    JavaObject.prototype.setField = function(className, fieldName, fieldDescriptor, newValue)
    {
      if (className in this.fields && fieldName in this.fields[className])
      {
        this.fields[className][fieldName] = newValue;
      }
      else
      {
        var classInfo = JVM.getClass(className);
        classInfo.setStatic(fieldName, fieldDescriptor, newValue);
      }
    };

    /**
     * Pretty print for the stack.
     */
    JavaObject.prototype.toString = function() {
      return "[" + this.classInfo.thisClassName + " ]";
    };

    /**
     * Create an identical copy of this object.
     */
    JavaObject.prototype.clone = function() {
      var copy = new JavaObject(this.classInfo);
      //Copy the fields array.
      for (var field in this.fields)
      {
        copy.fields[field] = this.fields[field].slice(0);
      }
      
      return copy;
    };

    return JavaObject;
  }
);