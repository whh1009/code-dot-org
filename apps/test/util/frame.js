import Blockly from 'blockly/core';
import locale from 'blockly/msg/en';
import 'blockly/blocks';
import 'blockly/javascript';
Blockly.setLocale(locale);
/**
 * Provides the basic frame for running Blockly.  In particular, this will
 * create a basic dom, load blockly.js  and put the contents into the global
 * space as global.Blockly.
 */

function setGlobals() {
  // Initialize browser environment.
  document.body.innerHTML = '<div id="codeApp"><div id="app"></div></div>';
  // locale file requires Blockly as a global
  Blockly.Workspace.prototype.getBlockCount = function() {
    return this.getAllBlocks().length;
  };
  Blockly.Block.prototype.getTitles = function() {
    let fields = [];
    this.inputList.forEach(input => {
      input.fieldRow.forEach(field => {
        fields.push(field);
      });
    });
    return fields;
  };
  Blockly.Input.prototype.appendTitle = function(a, b) {
    return this.appendField(a, b);
  };
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
}
module.exports = setGlobals;
