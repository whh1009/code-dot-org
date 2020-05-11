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

window.Blockly = Blockly;
