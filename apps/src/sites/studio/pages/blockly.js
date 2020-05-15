// import Blockly from '@code-dot-org/blockly';
import Blockly from 'blockly/core';
import locale from 'blockly/msg/en';
import 'blockly/blocks';
import 'blockly/javascript';
Blockly.setLocale(locale);

import GoogleBlocklyWrapper from './googleBlocklyWrapper';

window.Blockly = new GoogleBlocklyWrapper(Blockly);
