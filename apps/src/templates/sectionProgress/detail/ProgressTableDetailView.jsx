import React from 'react';
import * as Table from 'reactabular-table';
import * as Sticky from 'reactabular-sticky';
import * as Virtualized from 'reactabular-virtualized';
import PropTypes from 'prop-types';
import {scriptDataPropType} from '../sectionProgressConstants';
import {studentLevelProgressType} from '@cdo/apps/templates/progress/progressTypes';
import {
  getIconForLevel,
  levelProgressWithStatus
} from '@cdo/apps/templates/progress/progressHelpers';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import StudentProgressDetailCell, {
  widthForLevels
} from '@cdo/apps/templates/sectionProgress/detail/StudentProgressDetailCell';
import SectionProgressLessonNumberCell from '@cdo/apps/templates/sectionProgress/SectionProgressLessonNumberCell';
import progressTableStyles from '../progressTableStyles.scss';
import {
  progressStyles,
  tooltipIdForLessonNumber
} from '@cdo/apps/templates/sectionProgress/multiGridConstants';
import color from '../../../util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import * as bubbleSizes from '@cdo/apps/templates/sectionProgress/SimpleProgressBubble';

const styles = {
  headerContainer: {
    height: '100%'
  },
  dummyProgress: {
    height: 0,
    opacity: 0
  },
  bubbleSetContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  bubbleSetBackground: {
    height: 10,
    backgroundColor: color.lighter_gray,
    position: 'absolute',
    left: 10,
    right: 10
    // dot size, plus borders, plus margin, minus our height of "background"
    // top: (progressStyles.DOT_SIZE + 4 + 6 - 10) / 2
  }
};

const dummyStudent = {id: -1, name: ''};

export default class ProgressTableDetailView extends React.Component {
  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    levelProgressByStudent: PropTypes.objectOf(
      PropTypes.objectOf(studentLevelProgressType)
    ).isRequired,
    onScroll: PropTypes.func.isRequired,
    onClickLesson: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.lessonNumberFormatter = this.lessonNumberFormatter.bind(this);
    this.levelTypeFormatter = this.levelTypeFormatter.bind(this);
    this.detailCellFormatter = this.detailCellFormatter.bind(this);
    this.renderDetailCell = this.renderDetailCell.bind(this);
    this.onLessonClick = this.onLessonClick.bind(this);
    this.header = null;
    this.body = null;
  }

  onLessonClick(lessonPosition) {
    this.props.onClickLesson(lessonPosition);
  }

  lessonNumberFormatter(_, {columnIndex}) {
    const stageData = this.props.scriptData.stages[columnIndex];
    const levels = stageData.levels;
    return (
      <div style={styles.headerContainer}>
        <div style={styles.dummyProgress}>
          {this.renderDetailCell(
            dummyStudent,
            levels,
            this.dummyProgressForLevels(levels)
          )}
        </div>
        <SectionProgressLessonNumberCell
          number={stageData.relative_position}
          lockable={stageData.lockable}
          highlighted={stageData.position === this.props.lessonOfInterest}
          tooltipId={tooltipIdForLessonNumber(columnIndex + 1)}
          onClick={() => this.onLessonClick(stageData.position)}
          includeArrow={true}
        />
      </div>
    );
  }

  levelTypeFormatter(_, {columnIndex}) {
    const stageData = this.props.scriptData.stages[columnIndex];
    return (
      <div>
        <span className="lesson-icon-header cell-content">
          {stageData.levels.map((level, i) => {
            const width = bubbleSizes.BIG_CONTAINER; // + (level.sublevels || []).length * 23; //bubbleSizes.SMALL_SIZE;
            return (
              <span key={`${level.id}_${level.levelNumber}`}>
                <span
                  style={{
                    width: width,
                    display: 'inline-block',
                    textAlign: 'center'
                  }}
                >
                  <FontAwesome icon={getIconForLevel(level, true)} />
                </span>
                {level.sublevels && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: level.sublevels.length * 23
                    }}
                  />
                )}
              </span>
            );
          })}
        </span>
      </div>
    );
  }

  dummyProgressForLevels(levels) {
    const progress = {};
    levels.forEach(level => {
      progress[level.id] = levelProgressWithStatus();
    });
    return progress;
  }

  renderDetailCell(student, levels, progress) {
    return (
      // <div style={styles.bubbleSetContainer}>
      //   <div style={styles.bubbleSetBackground} />
      <StudentProgressDetailCell
        studentId={student.id}
        sectionId={this.props.section.id}
        stageExtrasEnabled={this.props.section.stageExtras}
        levels={levels}
        studentProgress={progress}
      />
      // </div>
    );
  }

  // i = 1;
  detailCellFormatter(_, {rowData, columnIndex}) {
    // console.log('col', columnIndex);
    // debugger;
    const {levelProgressByStudent, scriptData} = this.props;
    const stageLevels = scriptData.stages[columnIndex].levels;
    return this.renderDetailCell(
      rowData,
      stageLevels,
      levelProgressByStudent[rowData.id]
    );
  }

  render() {
    console.log('detail render');
    const lessonHeaders = [];
    const levelHeaders = [];
    const columns = [];
    this.props.scriptData.stages.forEach((stage, index) => {
      columns.push({
        // props: {style: {width: widthForLevels(stage.levels)}},
        cell: {formatters: [this.detailCellFormatter]}
      });
      lessonHeaders.push({header: {formatters: [this.lessonNumberFormatter]}});
      levelHeaders.push({header: {formatters: [this.levelTypeFormatter]}});
    });

    return (
      <Table.Provider
        className="detail-view"
        renderers={{
          body: {
            wrapper: Virtualized.BodyWrapper,
            row: Virtualized.BodyRow
          }
        }}
        columns={columns}
      >
        <Sticky.Header
          style={{overflow: 'hidden'}}
          ref={r => (this.header = r && r.getRef())}
          tableBody={this.body}
          headerRows={[lessonHeaders, levelHeaders]}
        />
        <Virtualized.Body
          rows={this.props.section.students}
          rowKey={'id'}
          onScroll={this.props.onScroll}
          style={{
            overflow: 'auto',
            maxHeight: parseInt(progressTableStyles.MAX_BODY_HEIGHT)
          }}
          ref={r => (this.body = r && r.getRef())}
          tableHeader={this.header}
        />
      </Table.Provider>
    );
  }
}
