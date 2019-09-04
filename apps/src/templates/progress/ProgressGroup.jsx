import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import DetailProgressTable from './DetailProgressTable';
import SummaryProgressTable from './SummaryProgressTable';
import FontAwesome from '../FontAwesome';
import {levelType, lessonType} from './progressTypes';
import color from '@cdo/apps/util/color';
import {isStageHiddenForSection} from '@cdo/apps/code-studio/hiddenStageRedux';

const styles = {
  main: {
    marginBottom: 20
  },
  header: {
    padding: 20,
    backgroundColor: color.purple,
    fontSize: 18,
    fontFamily: '"Gotham 5r", sans-serif',
    color: 'white',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    cursor: 'pointer'
  },
  headerBlue: {
    backgroundColor: color.cyan
  },
  headingText: {
    marginLeft: 10
  },
  contents: {
    backgroundColor: color.lighter_purple,
    padding: 20
  },
  contentsBlue: {
    backgroundColor: color.lightest_cyan
  },
  bottom: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4
  }
};

/**
 * A component that shows a group of lessons. That group has a name and is
 * collapsible. It can show the lessons in either a detail or a summary view.
 */

class ProgressGroup extends React.Component {
  static propTypes = {
    groupName: PropTypes.string.isRequired,
    lessons: PropTypes.arrayOf(lessonType).isRequired,
    levelsByLesson: PropTypes.arrayOf(PropTypes.arrayOf(levelType))
      .isRequired,
    isPlc: PropTypes.bool.isRequired,
    isSummaryView: PropTypes.bool.isRequired,
    hiddenStageState: PropTypes.object
  };

  componentDidMount() {
    this.checkVisibility(
      this.props.lessons,
      this.props.hiddenStageState,
      this.props.sectionId
    )
  }

  state = {
    collapsed: false,
    hidden: true
  };

  toggleCollapsed = () =>
    this.setState({
      collapsed: !this.state.collapsed
    });

  checkVisibility = (lessons, hiddenStageState, sectionId) =>
    lessons.forEach((lesson) => {
      console.log("lesson.id", lesson.id)
      if (!isStageHiddenForSection(hiddenStageState, sectionId, lesson.id)) {
        this.setState({
          hidden: false
        });
      };
    });


  render() {
    const {
      groupName,
      lessons,
      levelsByLesson,
      isSummaryView,
      isPlc,
      hiddenStageState,
      sectionId
    } = this.props;

    const TableType = isSummaryView
      ? SummaryProgressTable
      : DetailProgressTable;
    const icon = this.state.collapsed ? 'caret-right' : 'caret-down';
    console.log("this.state.hidden", this.state.hidden)
    return (
      <div style={styles.main}>
        {!this.state.hidden && (
          <div>
            <div
              style={[
                styles.header,
                isPlc && styles.headerBlue,
                this.state.collapsed && styles.bottom
              ]}
              onClick={this.toggleCollapsed}
            >
              <FontAwesome icon={icon} />
              <span style={styles.headingText}>{groupName}</span>
            </div>
            {!this.state.collapsed && (
              <div
                style={[
                  styles.contents,
                  isPlc && styles.contentsBlue,
                  styles.bottom
                ]}
              >
                <TableType lessons={lessons} levelsByLesson={levelsByLesson} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}


export default connect(
  state => ({
    hiddenStageState: state.hiddenStage,
    scriptId: state.progress.scriptId,
  })
)(Radium(ProgressGroup));
