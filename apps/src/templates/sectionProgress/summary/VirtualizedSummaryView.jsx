import PropTypes from 'prop-types';
import React, {Component} from 'react';
import _ from 'lodash';
import {connect} from 'react-redux';
import {MultiGrid} from 'react-virtualized';
import styleConstants from '../../../styleConstants';
import {jumpToLessonDetails} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {scriptDataPropType} from '../sectionProgressConstants';
import {
  summarizeProgressInStage,
  stageIsAllAssessment
} from '@cdo/apps/templates/progress/progressHelpers';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import StudentProgressSummaryCell from './StudentProgressSummaryCell';
import SectionProgressLessonNumberCell from '@cdo/apps/templates/sectionProgress/SectionProgressLessonNumberCell';
import color from '../../../util/color';
import {
  progressStyles,
  ROW_HEIGHT,
  LAST_ROW_MARGIN_HEIGHT,
  NAME_COLUMN_WIDTH,
  MAX_TABLE_SIZE,
  tooltipIdForLessonNumber
} from '@cdo/apps/templates/sectionProgress/multiGridConstants';
import i18n from '@cdo/locale';
import SectionProgressNameCell from '@cdo/apps/templates/sectionProgress/SectionProgressNameCell';

const SUMMARY_COLUMN_WIDTH = 40;

class VirtualizedSummaryView extends Component {
  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    levelProgressByStudent: PropTypes.object,
    onScroll: PropTypes.func,
    jumpToLessonDetails: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.setSummaryViewRef = this.setSummaryViewRef.bind(this);
    this.cellRenderer = this.cellRenderer.bind(this);
    this.studentCellRenderer = this.studentCellRenderer.bind(this);
    this.getColumnWidth = this.getColumnWidth.bind(this);
  }

  state = {
    fixedColumnCount: 1,
    fixedRowCount: 1,
    scrollToColumn: 0,
    scrollToRow: 0
  };
  summaryView = null;

  setSummaryViewRef(ref) {
    this.summaryView = ref;
  }

  cellRenderer({columnIndex, key, rowIndex, style}) {
    const {scriptData} = this.props;

    // Subtract 1 to account for the header row.
    const studentStartIndex = rowIndex - 1;
    // Subtract 1 to account for the student name column.
    const stageIdIndex = columnIndex - 1;

    // Override default cell style from multigrid
    let cellStyle = {
      ...style,
      ...progressStyles.cell
    };

    const stageData = columnIndex > 0 && scriptData.stages[columnIndex - 1];

    // Student rows
    if (studentStartIndex >= 0) {
      return this.studentCellRenderer(
        studentStartIndex,
        stageIdIndex,
        key,
        cellStyle,
        stageData.position
      );
    }

    // Header rows
    return (
      <div className={progressStyles.Cell} key={key} style={cellStyle}>
        {rowIndex === 0 && columnIndex === 0 && (
          <div style={progressStyles.lessonLabelContainer}>
            <div style={progressStyles.lessonHeading}>{i18n.lesson()}</div>
          </div>
        )}
        {rowIndex === 0 && columnIndex >= 1 && (
          <SectionProgressLessonNumberCell
            position={stageData.position}
            relativePosition={stageData.relative_position}
            lockable={stageData.lockable}
            tooltipId={tooltipIdForLessonNumber(columnIndex)}
            onSelectDetailView={() =>
              this.props.jumpToLessonDetails(stageData.position)
            }
          />
        )}
      </div>
    );
  }

  studentCellRenderer(studentStartIndex, stageIdIndex, key, style, position) {
    const {section, levelProgressByStudent, scriptData} = this.props;
    const student = section.students[studentStartIndex];
    let child;
    if (stageIdIndex < 0) {
      child = (
        <SectionProgressNameCell
          name={student.name}
          studentId={student.id}
          sectionId={section.id}
          scriptName={scriptData.name}
          scriptId={scriptData.id}
        />
      );
    } else {
      const stageLevels = scriptData.stages[stageIdIndex].levels;
      const statusCounts = summarizeProgressInStage(
        levelProgressByStudent[student.id],
        stageLevels
      );
      const assessmentStage = stageIsAllAssessment(stageLevels);
      child = (
        <StudentProgressSummaryCell
          studentId={student.id}
          statusCounts={statusCounts}
          assessmentStage={assessmentStage}
          style={progressStyles.summaryCell}
          onSelectDetailView={() => this.props.jumpToLessonDetails(position)}
        />
      );
    }

    // Alternate background colour of each row
    if (studentStartIndex % 2 === 1) {
      style = {
        ...style,
        backgroundColor: color.background_gray
      };
    }

    return (
      <div className={progressStyles.Cell} key={key} style={style}>
        {child}
      </div>
    );
  }

  getColumnWidth = ({index}) => {
    if (index === 0) {
      return NAME_COLUMN_WIDTH;
    }
    return SUMMARY_COLUMN_WIDTH;
  };

  componentDidUpdate(prevProps) {
    if (
      !_.isEqual(
        this.props.levelProgressByStudent,
        prevProps.levelProgressByStudent
      )
    ) {
      this.summaryView.forceUpdateGrids();
    }
  }

  render() {
    const {section, scriptData, lessonOfInterest, onScroll} = this.props;
    // Add 1 to account for the header row
    const rowCount = section.students.length + 1;
    // Add 1 to account for the student name column
    const columnCount = scriptData.stages.length + 1;
    // Calculate height based on the number of rows
    const tableHeightFromRowCount =
      ROW_HEIGHT * rowCount + LAST_ROW_MARGIN_HEIGHT;
    // Use a 'maxHeight' of 680 for when there are many rows
    const tableHeight = Math.min(tableHeightFromRowCount, MAX_TABLE_SIZE);

    return (
      <div>
        <MultiGrid
          {...this.state}
          cellRenderer={this.cellRenderer}
          columnWidth={this.getColumnWidth}
          columnCount={columnCount}
          ref={this.setSummaryViewRef}
          rowHeight={ROW_HEIGHT}
          height={tableHeight}
          scrollToColumn={lessonOfInterest}
          scrollToAlignment={'start'}
          rowCount={rowCount}
          style={progressStyles.multigrid}
          styleBottomLeftGrid={progressStyles.bottomLeft}
          styleTopLeftGrid={progressStyles.topLeft}
          // styleTopRightGrid={progressStyles.topRight}
          width={styleConstants['content-width']}
          onScroll={onScroll}
        />
      </div>
    );
  }
}

export const UnconnectedVirtualizedSummaryView = VirtualizedSummaryView;

export default connect(
  state => ({
    lessonOfInterest: state.sectionProgress.lessonOfInterest,
    levelProgressByStudent:
      state.sectionProgress.studentLevelProgressByScript[
        state.scriptSelection.scriptId
      ]
  }),
  dispatch => ({
    jumpToLessonDetails(lessonOfInterest) {
      dispatch(jumpToLessonDetails(lessonOfInterest));
    }
  })
)(VirtualizedSummaryView);
