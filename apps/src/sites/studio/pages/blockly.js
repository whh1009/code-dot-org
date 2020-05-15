import experiments from '@cdo/apps/util/experiments';

import CDOBlockly from '@code-dot-org/blockly';

import Blockly from 'blockly/core';
import locale from 'blockly/msg/en';
import 'blockly/blocks';
import 'blockly/javascript';
Blockly.setLocale(locale);

import GoogleBlocklyWrapper from './googleBlocklyWrapper';
import CDOBlocklyWrapper from './cdoBlocklyWrapper';

if (experiments.isEnabled(experiments.GOOGLE_BLOCKLY)) {
  window.Blockly = new GoogleBlocklyWrapper(Blockly);
} else {
  window.Blockly = new CDOBlocklyWrapper(CDOBlockly);
}
