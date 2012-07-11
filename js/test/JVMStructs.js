/**
 * NOTE: Ignore me. I'm a work in progress. :)
 */
define(['Struct'],
  function(Struct) {
    //
    // CONSTANT POOL
    //
    new Struct("cp_info",
      "u1 tag;u1 info[];"
    );

    new Struct("CONSTANT_Class_info",
      "u1 tag;u2 name_index;"
    );

    new Struct("CONSTANT_Fieldref_info",
      "u1 tag;u2 class_index;u2 name_and_type_index;"
    );

    new Struct("CONSTANT_Methodref_info",
       "u1 tag;u2 class_index;u2 name_and_type_index;"
    );

    new Struct("CONSTANT_InterfaceMethodref_info",
      "u1 tag;u2 class_index;u2 name_and_type_index;"
    );

    new Struct("CONSTANT_String_info",
       "u1 tag;u2 string_index;"
    );

    new Struct("CONSTANT_Integer_info",
      "u1 tag;u4 bytes; "
    );

    new Struct("CONSTANT_Float_info",
      "u1 tag;u4 bytes; "
    );

    new Struct("CONSTANT_Long_info",
      "u1 tag;u4 high_bytes;u4 low_bytes;"
    );

    new Struct("CONSTANT_Double_info",
      "u1 tag;u4 high_bytes;u4 low_bytes;"
    );

    new Struct("CONSTANT_NameAndType_info",
      "u1 tag;u2 name_index;u2 descriptor_index;"
    );

    new Struct("CONSTANT_Utf8_info",
      "u1 tag;u2 length;u1 bytes[length];"
    );

    //
    // FIELD_INFO
    //
    new Struct("field_info",
      "u2 access_flags;u2 name_index;u2 descriptor_index;u2 attributes_count;attribute_info attributes[attributes_count];"
    );

    //
    // METHODS
    //
    new Struct("method_info",
      "u2 access_flags;u2 name_index;u2 descriptor_index;u2 attributes_count;attribute_info attributes[attributes_count];"
    );

    //
    // ATTRIBUTES
    //
    new Struct("attribute_info",
      "u2 attribute_name_index;u4 attribute_length;u1 info[attribute_length];"
    );

    new Struct("ConstantValue_attribute",
      "u2 attribute_name_index;u4 attribute_length;u2 constantvalue_index;"
    );

    new Struct("exception_table_entry",
      "u2 start_pc;u2 end_pc;u2 handler_pc;u2 catch_type;"
    );

    new Struct("Code_attribute",
      "u2 attribute_name_index;u4 attribute_length;u2 max_stack;u2 max_locals;u4 code_length;u1 code[code_length];u2 exception_table_length;exception_table_entry exception_table[exception_table_length];u2 attributes_count;attribute_info attributes[attributes_count];"
    );

    //WTF is this...
    new Struct("StackMapTable_attribute",
      "u2 attribute_name_index;u4 attribute_length;u2 number_of_entries;stack_map_frame entries[number_of_entries];"
    );

    /*union stack_map_frame {
      same_frame;
      same_locals_1_stack_item_frame;
      same_locals_1_stack_item_frame_extended;
      chop_frame;
      same_frame_extended;
      append_frame;
      full_frame;
    };

    "same_frame" {
      u1 frame_type = SAME;// 0-63
    };

    "same_locals_1_stack_item_frame" {
      u1 frame_type = SAME_LOCALS_1_STACK_ITEM;// 64-127
      verification_type_info stack[1];
    };

    "same_locals_1_stack_item_frame_extended" {
      u1 frame_type = SAME_LOCALS_1_STACK_ITEM_EXTENDED;// 247
      u2 offset_delta;
      verification_type_info stack[1];
    };

    "chop_frame" {
      u1 frame_type=CHOP; // 248-250
      u2 offset_delta;
    };

    "same_frame_extended" {
      u1 frame_type = SAME_FRAME_EXTENDED; // 251
      u2 offset_delta;
    };

    "append_frame" {
      u1 frame_type = APPEND; // 252-254
      u2 offset_delta;
      verification_type_info locals[frame_type -251];
    };

    "full_frame" {
      u1 frame_type = FULL_FRAME; // 255
      u2 offset_delta;
      u2 number_of_locals;
      verification_type_info locals[number_of_locals];
      u2 number_of_stack_items;
      verification_type_info stack[number_of_stack_items];
    };

    union verification_type_info {
      Top_variable_info;
      Integer_variable_info;
      Float_variable_info;
      Long_variable_info;
      Double_variable_info;
      Null_variable_info;
      UninitializedThis_variable_info;
      Object_variable_info;
      Uninitialized_variable_info;
    };

    "Top_variable_info" {
      u1 tag = ITEM_Top; // 0
    };

    "Integer_variable_info" {
      u1 tag = ITEM_Integer; // 1
    };

    "Float_variable_info" {
      u1 tag = ITEM_Float; // 2
    };

    "Long_variable_info" {
      u1 tag = ITEM_Long; // 4
    };

    "Double_variable_info" {
      u1 tag = ITEM_Double; // 3
    };

    "Null_variable_info" {
      u1 tag = ITEM_Null; // 5
    };

    "UninitializedThis_variable_info" {
      u1 tag = ITEM_UninitializedThis; // 6
    };

    "Object_variable_info" {
      u1 tag = ITEM_Object; // 7
      u2 cpool_index;
    };

    "Uninitialized_variable_info" {
      u1 tag = ITEM_Uninitialized // 8
      u2 offset;
    };*/

    new Struct("Exceptions_attribute",
      "u2 attribute_name_index;u4 attribute_length;u2 number_of_exceptions;u2 exception_index_table[number_of_exceptions];"
    );

    new Struct("InnerClasses_table_entry",
      "u2 inner_class_info_index;u2 outer_class_info_index;u2 inner_name_index;u2 inner_class_access_flags;"
    );

    new Struct("InnerClasses_attribute",
      "u2 attribute_name_index;u4 attribute_length;u2 number_of_classes;innerclass_table_entry classes[number_of_classes];"
    );

    new Struct("EnclosingMethod_attribute",
      "u2 attribute_name_index;u4 attribute_length;u2 class_indexu2 method_index;"
    );

    new Struct("Synthetic_attribute",
      "u2 attribute_name_index;u4 attribute_length;"
    );

    new Struct("Signature_attribute",
      "u2 attribute_name_index;u4 attribute_length;u2 signature_index;"
    );

    new Struct("SourceFile_attribute",
      "u2 attribute_name_index;u4 attribute_length;u2 sourcefile_index;"
    );

    new Struct("SourceDebugExtension_attribute",
      "u2 attribute_name_index;u4 attribute_length;u1 debug_extension[attribute_length];"
    );

    new Struct("LineNumberTable_entry",
      "u2 start_pc;u2 line_number;"
    );

    new Struct("LineNumberTable_attribute",
      "u2 attribute_name_index;u4 attribute_length;u2 line_number_table_length;LineNumberTable_entry line_number_table[line_number_table_length];"
    );

    new Struct("LocalVariableTable_entry",
      "u2 start_pc;u2 length;u2 name_index;u2 descriptor_index;u2 index;"
    );

    new Struct("LocalVariableTable_attribute",
      "u2 attribute_name_index;u4 attribute_length;u2 local_variable_table_length;LocalVariableTable_entry local_variable_table[local_variable_table_length];"
    );

    new Struct("LocalVariableTypeTable_entry",
      "u2 start_pc;u2 length;u2 name_index;u2 signature_index;u2 index;"
    );

    new Struct("LocalVariableTypeTable_attribute",
      "u2 attribute_name_index;u4 attribute_length;u2 local_variable_type_table_length;LocalVariableTypeTable_entry local_variable_type_table[local_variable_type_table_length];"
    );

    new Struct("Deprecated_attribute",
      "u2 attribute_name_index;u4 attribute_length;"
    );

    //Nopenopenope
    /*new Struct("RuntimeVisibleAnnotations_attribute" : attribute_info {
      u2 attribute_name_index;
      u4 attribute_length;
      u2 num_annotations;
      annotation annotations[num_annotations];
    };

    new Struct("annotation_ElementNameTable_entry" {
      u2 element_name_index;
      element_value value;
    }

    new Struct("annotation" {
      u2 type_index;
      u2 num_element_value_pairs;
      annotation_ElementNameTable_entry element_value_pairs[num_element_value_pairs];
    };

    //TODO: WTF
    element_value {
      u1 tag;
      union {
        u2 const_value_index;
        {
          u2 type_name_index;
          u2 const_name_index;
        } enum_const_value;
        u2 class_info_index;
        annotation annotation_value;
        {
          u2 num_values;
          element_value values[num_values];
        } array_value;
      } value;
    };

    RuntimeInvisibleAnnotations_attribute : attribute_info {
      u2 attribute_name_index;
      u4 attribute_length;
      u2 num_annotations;
      annotation annotations[num_annotations];
    };

    RuntimeVisibleParameterAnnotations_entry {
      u2 num_annotations;
      annotation annotations[num_annotations];
    };

    RuntimeVisibleParameterAnnotations_attribute : attribute_info {
      u2 attribute_name_index;
      u4 attribute_length;
      u1 num_parameters;
      RuntimeVisibleParameterAnnotations_entry parameter_annotations[num_parameters];
    };

    RuntimeInvisibleParametersAnnotations_entry {
      u2 num_annotations;
      annotation annotations[num_annotations];
    };

    RuntimeInvisibleParameterAnnotations_attribute : attribute_info {
      u2 attribute_name_index;
      u4 attribute_length;
      u1 num_parameters;
      RuntimeInvisibleParametersAnnotations_entry parameter_annotations[num_parameters];
    };

    AnnotationDefault_attribute : attribute_info {
      u2 attribute_name_index;
      u4 attribute_length;
      element_value default_value;
    };*/

    //
    // CLASSES
    //

    new Struct("ClassFile",
      "u4 magic;u2 minor_version;u2 major_version;u2 constant_pool_count;cp_info constant_pool[constant_pool_count-1];u2 access_flags;u2 this_class;u2 super_class;u2 interfaces_count;u2 interfaces[interfaces_count];u2 fields_count;field_info fields[fields_count];u2 methods_count;method_info methods[methods_count];u2 attributes_count;attribute_info attributes[attributes_count];"
    );
  }
);