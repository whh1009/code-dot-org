import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import FoormEditorManager from '@cdo/apps/code-studio/pd/foorm/FoormEditorManager';
import foorm, {
  setFormQuestions
} from '@cdo/apps/code-studio/pd/foorm/foormEditorRedux';

import 'survey-react/survey.css';

$(document).ready(function() {
  registerReducers({foorm});
  const store = getStore();
  ReactDOM.render(
    <Provider store={store}>
      <FoormEditorManager
        updateFormQuestions={updateFormQuestions}
        populateCodeMirror={populateCodeMirror}
        {...getScriptData('props')}
      />
    </Provider>,
    document.getElementById('editor-container')
  );
});

function populateCodeMirror() {
  const codeMirrorArea = document.getElementsByTagName('textarea')[0];
  initializeCodeMirror(codeMirrorArea, 'application/json', {
    callback: onChange
  });
}

function onChange(editor) {
  try {
    const formQuestions = JSON.parse(editor.getValue());
    getStore().dispatch(setFormQuestions(formQuestions));
  } catch (e) {
    // There is a JSON error.
    getStore().dispatch(setFormQuestions({}));
  }
}

const updateFormQuestions = formQuestions => {
  getStore().dispatch(setFormQuestions(formQuestions));
};
