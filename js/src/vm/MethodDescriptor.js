/**
 * Represents a MethodDescriptor. Provides handy comparison functions,
 * and validates the descriptor in its constructor
 */
define(['util/Util', 'vm/FieldDescriptor', 'vm/ReturnDescriptor'],
  function(Util, FieldDescriptor, ReturnDescriptor) {

    /**
     * Creates the method descriptor object.
     * Also performs verification.
     */
    function MethodDescriptor(descriptor) {
      this._descriptor = descriptor;
      this._parameters = FieldDescriptor.parseFromMethodDescriptor(descriptor);
      this._returnType = new ReturnDescriptor(descriptor.substr(descriptor.indexOf(')')+1));
    }

    /**
     * Returns the string form of this descriptor.
     */
    MethodDescriptor.prototype.toString = function() {
      return this._descriptor;
    };

    return MethodDescriptor;
  }
);