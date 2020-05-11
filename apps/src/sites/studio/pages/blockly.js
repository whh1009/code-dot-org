import Blockly from 'blockly/core';
import locale from 'blockly/msg/en';
import 'blockly/blocks';
import 'blockly/javascript';
Blockly.setLocale(locale);

Blockly.BlockValueType = {
  NONE: 'None', // Typically as a connection/input check means "accepts any type"
  STRING: 'String',
  NUMBER: 'Number',
  IMAGE: 'Image',
  BOOLEAN: 'Boolean',
  FUNCTION: 'Function',
  COLOUR: 'Colour',
  ARRAY: 'Array',

  // p5.play Sprite
  SPRITE: 'Sprite',

  /**
   * {Object} Behavior
   * {function} Behavior.func
   * {Array} Behavior.extraArgs
   */
  BEHAVIOR: 'Behavior',

  /**
   * {Object} Location
   * {number} Location.x
   * {number} Location.y
   */
  LOCATION: 'Location'
};

/** Flyout category to separate procedure names from variables and generated functions. */
Blockly.Procedures.NAME_TYPE = 'PROCEDURE';

/** Flyout category type for functional variables, which are procedures under the covers */
Blockly.Procedures.NAME_TYPE_FUNCTIONAL_VARIABLE = 'FUNCTIONAL_VARIABLE';

Blockly.Procedures.DEFINITION_BLOCK_TYPES = [
  'procedures_defnoreturn',
  'procedures_defreturn',
  'functional_definition'
];

Blockly.Procedures.PROCEDURAL_TO_FUNCTIONAL_CALL_TYPE =
  'procedural_to_functional_call';

window.Blockly = Blockly;
