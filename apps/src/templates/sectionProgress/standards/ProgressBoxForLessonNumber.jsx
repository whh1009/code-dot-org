import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ProgressBox from '../ProgressBox';
import firehoseClient from '../../../lib/util/firehose';
import {connect} from 'react-redux';

const styles = {
  lessonBox: {
    marginRight: 5,
    marginLeft: 5
  }
};

class ProgressBoxForLessonNumber extends Component {
  static propTypes = {
    completed: PropTypes.bool,
    lessonNumber: PropTypes.number,
    tooltipId: PropTypes.string,
    linkToLessonPlan: PropTypes.string,
    sectionId: PropTypes.number,
    scriptId: PropTypes.number
  };

  handleClick = () => {
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'click_lesson_progress_box',
        data_json: JSON.stringify({
          link: this.props.linkToLessonPlan,
          section_id: this.props.sectionId,
          script_id: this.props.scriptId
        })
      },
      {includeUserId: true}
    );
  };

  render() {
    const {completed, lessonNumber, tooltipId, linkToLessonPlan} = this.props;
    const progressBox = (
      <ProgressBox
        style={styles.lessonBox}
        started={completed}
        incomplete={completed ? 0 : 20}
        imperfect={0}
        perfect={completed ? 20 : 0}
        lessonNumber={lessonNumber}
      />
    );

    if (linkToLessonPlan) {
      return (
        <a
          href={linkToLessonPlan}
          target="_blank"
          data-for={tooltipId}
          data-tip
          onClick={this.handleClick}
        >
          {progressBox}
        </a>
      );
    } else {
      return progressBox;
    }
  }
}

export const UnconnectedProgressBoxForLessonNumber = ProgressBoxForLessonNumber;

export default connect(state => ({
  sectionId: state.sectionData.section.id,
  scriptId: state.scriptSelection.scriptId
}))(ProgressBoxForLessonNumber);
