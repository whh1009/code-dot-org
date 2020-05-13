import CDOBlockly from '@code-dot-org/blockly';
import Blockly from 'blockly/core';
import locale from 'blockly/msg/en';
import 'blockly/blocks';
import 'blockly/javascript';
Blockly.setLocale(locale);

CDOBlockly.getMainWorkspace = function() {
  return CDOBlockly.mainBlockSpace;
};
window.CDOBlockly = CDOBlockly;

Blockly.Block.prototype.setHSV = function(h, s, v) {
  this.setColour(h);
};
Blockly.Xml.domToBlockSpace = Blockly.Xml.domToWorkspace;
Blockly.BlockSpace = {};
Blockly.BlockSpace.EVENTS = {};

/**
 * Called after the mainBlockSpace has been initialized and assigned to
 * the Blockly.mainBlockSpace global attribute, used by
 * onMainBlockSpaceCreated
 * @type {string}
 */
Blockly.BlockSpace.EVENTS.MAIN_BLOCK_SPACE_CREATED = 'mainBlockSpaceCreated';

/**
 * Called after a blockspace has been populated with a set of blocks
 * (e.g. when using domToBlockSpace)
 * @type {string}
 */
Blockly.BlockSpace.EVENTS.EVENT_BLOCKS_IMPORTED = 'blocksImported';

/**
 * Fired whenever blocklyBlockSpaceChange normally gets fired
 * @type {string}
 */
Blockly.BlockSpace.EVENTS.BLOCK_SPACE_CHANGE = 'blockSpaceChange';
Blockly.BlockSpace.EVENTS.BLOCK_SPACE_SCROLLED = 'blockSpaceScrolled';

/**
 * Fired by Code Studio when the run button is clicked.
 * @type {string}
 */
Blockly.BlockSpace.EVENTS.RUN_BUTTON_CLICKED = 'runButtonClicked';
window.Blockly = Blockly;
