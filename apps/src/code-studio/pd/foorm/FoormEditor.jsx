// Interface for admins to try out Foorm configurations in real-time.
// Includes a json editor with a starting configuration, along with
// a preview button to preview the configuration in Foorm

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import Foorm from './Foorm';

const sampleSurveyData = {
  facilitators: [
    {
      facilitatorId: 1,
      facilitatorName: 'Alice'
    },
    {
      facilitatorId: 2,
      facilitatorName: 'Bob'
    },
    {
      facilitatorId: 3,
      facilitatorName: 'Chris'
    }
  ],
  workshop_course: 'Sample Course'
};

class FoormEditor extends React.Component {
  static propTypes = {
    populateCodeMirror: PropTypes.func.isRequired,
    formName: PropTypes.string,
    formVersion: PropTypes.number,
    // populated by redux
    formQuestions: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      formKey: 0,
      formPreviewQuestions: null
    };
  }

  componentDidMount() {
    this.props.populateCodeMirror();
  }

  previewFoorm = () => {
    // fill in form with any library items
    $.ajax({
      url: '/api/v1/pd/foorm/form_with_library_items',
      type: 'post',
      contentType: 'application/json',
      processData: false,
      data: JSON.stringify({
        form_questions: this.props.formQuestions
      })
    }).done(result => {
      console.log(result);
      this.setState({
        formKey: this.state.formKey + 1,
        formPreviewQuestions: result
      });
    });
  };

  render() {
    return (
      <div>
        {this.props.formName && (
          <h3>{`${this.props.formName}, version ${this.props.formVersion}`}</h3>
        )}
        <textarea
          ref="content"
          // 3rd parameter specifies number of spaces to insert into the output JSON string for readability purposes.
          // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
          value={JSON.stringify(this.props.formQuestions, null, 2)}
          // Change handler is required for this element, but changes will be handled by the code mirror.
          onChange={() => {}}
        />
        <Button onClick={this.previewFoorm}>Preview</Button>
        {this.state.formPreviewQuestions && (
          // key allows us to force re-render when preview is clicked
          <Foorm
            formQuestions={this.state.formPreviewQuestions}
            formName={'preview'}
            formVersion={0}
            submitApi={'/none'}
            key={`form-${this.state.formKey}`}
            surveyData={sampleSurveyData}
          />
        )}
      </div>
    );
  }
}

export default connect(
  state => ({formQuestions: state.foorm.formQuestions || {}}),
  dispatch => ({})
)(FoormEditor);
