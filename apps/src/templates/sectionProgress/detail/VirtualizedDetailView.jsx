import PropTypes from 'prop-types';
import React, {Component} from 'react';
import _ from 'lodash';
import {connect} from 'react-redux';
import {MultiGrid} from 'react-virtualized';
import StudentProgressDetailCell from '@cdo/apps/templates/sectionProgress/detail/StudentProgressDetailCell';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import styleConstants from '../../../styleConstants';
import {setLessonOfInterest} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {scriptDataPropType} from '../sectionProgressConstants';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import {studentLevelProgressType} from '@cdo/apps/templates/progress/progressTypes';
import {getIconForLevel} from '@cdo/apps/templates/progress/progressHelpers';
import color from '../../../util/color';
import {
  progressStyles,
  ROW_HEIGHT,
  LAST_ROW_MARGIN_HEIGHT,
  MAX_TABLE_SIZE,
  PROGRESS_BUBBLE_WIDTH,
  DIAMOND_BUBBLE_WIDTH,
  NAME_COLUMN_WIDTH,
  PILL_BUBBLE_WIDTH,
  tooltipIdForLessonNumber
} from '@cdo/apps/templates/sectionProgress/multiGridConstants';
import {SMALL_DOT_SIZE} from '@cdo/apps/templates/progress/progressStyles';
import i18n from '@cdo/locale';
import SectionProgressNameCell from '@cdo/apps/templates/sectionProgress/SectionProgressNameCell';

const ARROW_PADDING = 60;
// Only show arrow next to lesson numbers if column is larger than a single small bubble and it's margin.
const MAX_COLUMN_WITHOUT_ARROW =
  Math.max(PROGRESS_BUBBLE_WIDTH, DIAMOND_BUBBLE_WIDTH) + 10;

const styles = {
  numberHeader: {
    ...progressStyles.lessonNumberHeading,
    margin: 0,
    paddingLeft: 16
  },
  lessonHeaderContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: 2,
    borderBottom: '2px solid',
    borderColor: color.border_gray,
    height: 42
  },
  // Arrow ---> built with CSS requires negative margin
  lessonLine: {
    marginTop: 18,
    marginRight: -8,
    width: 100,
    height: 2,
    backgroundColor: color.charcoal
  },
  lessonArrow: {
    border: 'solid ' + color.charcoal,
    borderWidth: '0 2px 2px 0',
    display: 'inline-block',
    padding: 3,
    marginTop: 15,
    marginRight: 2,
    transform: 'rotate(-45deg)',
    WebkitTransform: 'rotate(-45deg)'
  },
  bubbleSet: {
    paddingLeft: 4
  }
};

/**
 * Calculate the width of each column in the detail view based on types of levels
 * @returns {Array} array of integers indicating the length of each column
 */
const getColumnWidthsForStages = stages => {
  let columnLengths = [NAME_COLUMN_WIDTH];

  for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
    const levels = stages[stageIndex].levels;
    // Left and right padding surrounding bubbles
    let width = 10;
    for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
      if (levels[levelIndex].isUnplugged) {
        // Pill shaped bubble
        width = width + PILL_BUBBLE_WIDTH;
      } else if (levels[levelIndex].is_concept_level) {
        // Diamond shaped bubble
        width = width + DIAMOND_BUBBLE_WIDTH;
      } else {
        // Circle bubble
        width = width + PROGRESS_BUBBLE_WIDTH;
      }
      if (levels[levelIndex].sublevels) {
        width =
          width + levels[levelIndex].sublevels.length * SMALL_DOT_SIZE * 2;
      }
    }
    columnLengths.push(width || 0);
  }
  return columnLengths;
};

class VirtualizedDetailView extends Component {
  static whyDidYouRender = true;
  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    levelProgressByStudent: PropTypes.objectOf(
      PropTypes.objectOf(studentLevelProgressType)
    ).isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    setLessonOfInterest: PropTypes.func.isRequired,
    onScroll: PropTypes.func,
    scriptName: PropTypes.string,
    scriptId: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.setDetailViewRef = this.setDetailViewRef.bind(this);
    this.onClickLevel = this.onClickLevel.bind(this);
    this.cellRenderer = this.cellRenderer.bind(this);
    this.studentCellRenderer = this.studentCellRenderer.bind(this);
    this.getColumnWidth = this.getColumnWidth.bind(this);
    this.columnWidths = getColumnWidthsForStages(props.scriptData.stages);
  }

  state = {
    fixedColumnCount: 1,
    fixedRowCount: 2,
    scrollToColumn: 0,
    scrollToRow: 0
  };
  detailView = null;

  componentWillReceiveProps(nextProps) {
    // When we replace the script, re-compute the column widths
    if (this.props.scriptData.id !== nextProps.scriptData.id) {
      this.detailView.recomputeGridSize();
      this.detailView.measureAllCells();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      !_.isEqual(
        this.props.levelProgressByStudent,
        prevProps.levelProgressByStudent
      )
    ) {
      this.detailView.forceUpdateGrids();
    }
  }

  setDetailViewRef(ref) {
    this.detailView = ref;
  }

  onClickLevel(lessonOfInterest) {
    this.props.setLessonOfInterest(lessonOfInterest);
  }

  cellRenderer({columnIndex, key, rowIndex, style}) {
    const {scriptData} = this.props;
    // Subtract 2 to account for the 2 header rows.
    // We don't want leave off the first 2 students.
    const studentStartIndex = rowIndex - 2;
    // Subtract 1 to account for the student name column.
    const stageIdIndex = columnIndex - 1;

    // Override default cell style from multigrid
    let cellStyle = {
      ...style,
      ...progressStyles.cell
    };

    // Student rows
    if (studentStartIndex >= 0) {
      return this.studentCellRenderer(
        studentStartIndex,
        stageIdIndex,
        key,
        cellStyle
      );
    }

    const stageData = columnIndex > 0 && scriptData.stages[columnIndex - 1];

    // Header rows
    return (
      <div className={progressStyles.Cell} key={key} style={cellStyle}>
        {rowIndex === 0 && columnIndex === 0 && (
          <div style={progressStyles.lessonLabelContainer}>
            <span style={progressStyles.lessonHeading}>{i18n.lesson()}</span>
          </div>
        )}
        {rowIndex === 0 && columnIndex >= 1 && (
          <div style={styles.lessonHeaderContainer}>
            <div
              onClick={() => this.onClickLevel(columnIndex)}
              style={styles.numberHeader}
              data-tip
              data-for={tooltipIdForLessonNumber(columnIndex)}
            >
              {stageData.lockable ? (
                <FontAwesome icon="lock" />
              ) : (
                stageData.relative_position
              )}
            </div>
            {this.columnWidths[columnIndex] > MAX_COLUMN_WITHOUT_ARROW && (
              <div
                style={{
                  ...styles.lessonLine,
                  width: this.columnWidths[columnIndex] - ARROW_PADDING
                }}
              />
            )}
            {this.columnWidths[columnIndex] > MAX_COLUMN_WITHOUT_ARROW && (
              <div>
                <i style={styles.lessonArrow} />
              </div>
            )}
          </div>
        )}
        {rowIndex === 1 && columnIndex === 0 && (
          <div style={progressStyles.lessonLabelContainer}>
            <div style={progressStyles.lessonHeading}>{i18n.levelType()}</div>
          </div>
        )}
        {rowIndex === 1 && columnIndex >= 1 && (
          <span style={styles.bubbleSet}>
            {scriptData.stages[stageIdIndex].levels.map((level, i) => {
              return (
                <span key={i}>
                  <FontAwesome
                    icon={getIconForLevel(level, true)}
                    style={
                      level.isUnplugged
                        ? progressStyles.unpluggedIcon
                        : progressStyles.icon
                    }
                  />
                  {level.sublevels &&
                    level.sublevels.map((sublevel, i) => {
                      return (
                        <span
                          className="filler"
                          key={i}
                          style={{
                            width: 17,
                            display: 'inline-block',
                            color: color.background_gray
                          }}
                        >
                          .
                        </span>
                      );
                    })}
                </span>
              );
            })}
          </span>
        )}
      </div>
    );
  }

  studentCellRenderer(studentStartIndex, stageIdIndex, key, style) {
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
      child = (
        <StudentProgressDetailCell
          studentId={student.id}
          sectionId={section.id}
          stageId={stageIdIndex}
          stageExtrasEnabled={section.stageExtras}
          levels={stageLevels}
          studentProgress={levelProgressByStudent[student.id]}
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

  getColumnWidth({index}) {
    return this.columnWidths[index] || 0;
  }

  render() {
    console.log('virtualized detail render');
    const {section, scriptData, lessonOfInterest, onScroll} = this.props;
    // Add 2 to account for the 2 header rows
    const rowCount = section.students.length + 2;
    // Add 1 to account for the student name column
    const columnCount = scriptData.stages.length + 1;
    // Calculate height based on the number of rows
    const tableHeightFromRowCount =
      ROW_HEIGHT * rowCount + LAST_ROW_MARGIN_HEIGHT;
    // Use a 'maxHeight' of 680 for when there are many rows
    const tableHeight = Math.min(tableHeightFromRowCount, MAX_TABLE_SIZE);

    return (
      <MultiGrid
        {...this.state}
        cellRenderer={this.cellRenderer}
        columnWidth={this.getColumnWidth}
        columnCount={columnCount}
        enableFixedColumnScroll={true}
        rowHeight={ROW_HEIGHT}
        height={tableHeight}
        scrollToColumn={lessonOfInterest}
        scrollToAlignment={'start'}
        rowCount={rowCount}
        style={progressStyles.multigrid}
        styleBottomLeftGrid={progressStyles.bottomLeft}
        styleTopLeftGrid={progressStyles.topLeft}
        styleTopRightGrid={progressStyles.topRight}
        width={styleConstants['content-width']}
        ref={this.setDetailViewRef}
        onSectionRendered={onScroll}
      />
    );
  }
}

export const UnconnectedVirtualizedDetailView = VirtualizedDetailView;

export default connect(
  state => ({
    lessonOfInterest: state.sectionProgress.lessonOfInterest,
    levelProgressByStudent:
      state.sectionProgress.studentLevelProgressByScript[
        state.scriptSelection.scriptId
      ]
  }),
  dispatch => ({
    setLessonOfInterest(lessonOfInterest) {
      dispatch(setLessonOfInterest(lessonOfInterest));
    }
  })
)(VirtualizedDetailView);
