import React from 'react';
import * as Table from 'reactabular-table';
import * as Sticky from 'reactabular-sticky';
import * as Virtualized from 'reactabular-virtualized';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {connect} from 'react-redux';
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
  PROGRESS_TABLE_WIDTH,
  tooltipIdForLessonNumber
} from '@cdo/apps/templates/sectionProgress/multiGridConstants';
import i18n from '@cdo/locale';
import SectionProgressNameCell from '@cdo/apps/templates/sectionProgress/SectionProgressNameCell';

class StudentProgressSummaryTable extends React.Component {
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
    this.needTweakLastColumns = false;
    this.onScrollMainTableBody = this.onScrollMainTableBody.bind(this);
    this.studentNameFormatter = this.studentNameFormatter.bind(this);
    this.lessonNumberFormatter = this.lessonNumberFormatter.bind(this);
    this.progressCellFormatter = this.progressCellFormatter.bind(this);
  }

  onScrollMainTableBody(e) {
    this.firstTableBody.scrollTop = e.target.scrollTop;
    this.secondTableHeader.scrollLeft = e.target.scrollLeft;
  }

  getTableHeaderHeight() {
    return 30;
  }

  studentNameFormatter(value, {rowData}) {
    // console.log('row data', rowData);
    const {section, scriptData} = this.props;
    return (
      <SectionProgressNameCell
        name={value}
        studentId={rowData.id}
        sectionId={section.id}
        scriptName={scriptData.name}
        scriptId={scriptData.id}
      />
    );
  }

  getStudentList() {
    const lessonsLabelStyle = {
      style: progressStyles.lessonHeading
    };
    const studentNameStyle = {
      style: progressStyles.nameColumn
    };
    return {
      property: 'name', // the json row need two levels
      props: {
        style: {
          // ...progressStyles.cell,
          width: NAME_COLUMN_WIDTH
          // ...progressStyles.lessonLabelContainer
        }
      },
      header: {
        label: i18n.lesson(),
        props: {
          style: {
            ...progressStyles.header,
            ...progressStyles.nameColumn
            // ...progressStyles.topLeft,
            // ...progressStyles.lessonLabelContainer
          }
        },
        transforms: [() => lessonsLabelStyle]
      },
      cell: {
        transforms: [() => studentNameStyle],
        formatters: [this.studentNameFormatter]
      }
    };
  }

  renderStudentList() {
    return (
      <Table.Provider
        style={{
          ...progressStyles.multigrid,
          width: NAME_COLUMN_WIDTH,
          clear: 'none',
          // position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
          borderCollapse: 'unset',
          display: 'inline-block'
        }}
        renderers={{
          body: {
            wrapper: Virtualized.BodyWrapper,
            row: Virtualized.BodyRow
          }
        }}
        columns={[this.getStudentList()]}
      >
        <Sticky.Header
          ref={r => (this.firstTableHeader = r && r.getRef())}
          tableBody={this.firstTableBody}
        />
        <Virtualized.Body
          rows={this.props.section.students}
          rowKey={'id'}
          style={{
            overflow: 'hidden',
            maxWidth: NAME_COLUMN_WIDTH,
            maxHeight: MAX_TABLE_SIZE
          }}
          ref={tableBody =>
            (this.firstTableBody = tableBody && tableBody.getRef())
          }
          tableHeader={this.firstTableHeader}
        />
      </Table.Provider>
    );
  }

  lessonNumberFormatter(value, {rowData, columnIndex, rowIndex, property}) {
    const stageData = this.props.scriptData.stages[columnIndex];
    return (
      <SectionProgressLessonNumberCell
        position={stageData.position}
        relativePosition={stageData.relative_position}
        lockable={stageData.lockable}
        tooltipId={tooltipIdForLessonNumber(columnIndex + 1)}
        onSelectDetailView={() =>
          this.props.jumpToLessonDetails(stageData.position)
        }
      />
    );
  }

  progressCellFormatter(value, {rowData, columnIndex, rowIndex, property}) {
    const stageData = this.props.scriptData.stages[columnIndex];
    const statusCounts = summarizeProgressInStage(
      this.props.levelProgressByStudent[rowData.id],
      stageData.levels
    );
    const assessmentStage = stageIsAllAssessment(stageData.levels);
    return (
      <StudentProgressSummaryCell
        studentId={rowData.id}
        statusCounts={statusCounts}
        assessmentStage={assessmentStage}
        style={progressStyles.summaryCell}
        onSelectDetailView={() =>
          this.props.jumpToLessonDetails(stageData.position)
        }
      />
    );
  }

  renderProgress() {
    const columnWidth =
      PROGRESS_TABLE_WIDTH / this.props.scriptData.stages.length;
    const headerStyle = {
      style: {
        ...progressStyles.header
      }
    };

    const tableBodyStyle = {
      // maxWidth: secondTableWidth,
      ...progressStyles.main,
      maxHeight: MAX_TABLE_SIZE,
      overflow: 'auto'
    };

    // console.log('firstTableWidth=', firstTableWidth);
    const tableStyle = {
      // width: secondTableWidth,
      ...progressStyles.multigrid,
      clear: 'none',
      // position: 'absolute', // make the fixed header fail
      top: 0,
      left: NAME_COLUMN_WIDTH,
      display: 'inline-block',
      zIndex: 1
    };
    // filling columns
    const columns = [];
    this.props.scriptData.stages.forEach((stage, index) => {
      columns.push({
        props: {
          style: {
            width: columnWidth
          }
        },
        header: {
          formatters: [this.lessonNumberFormatter],
          transforms: [() => headerStyle]
        },
        cell: {
          formatters: [this.progressCellFormatter]
        }
      });
    });

    // If firstTableWidth is zero, we assume there is NO fixed column
    // there is last column and there are two scroll bars (X and Y direction)
    // When we scroll to the right end of table using horizontal scroll table,
    // and if veritcal scrollbar exists, we need make sure the last column has
    // enough right cell padding to show the full cell content by adding a gutter.
    if (this.needTweakLastColumns) {
      // push an empty column which is 16 pixel wide
      const lastColumn = columns[columns.length - 1];
      if (lastColumn.property !== 'gutter') {
        const gutter = {
          property: 'gutter',
          props: {
            style: {
              minWidth: 20
            }
          },
          visible: true
        };
        columns.push(gutter);
      }
    }

    return (
      <Table.Provider
        style={tableStyle}
        width={PROGRESS_TABLE_WIDTH}
        renderers={{
          body: {
            wrapper: Virtualized.BodyWrapper,
            row: Virtualized.BodyRow
          }
        }}
        columns={columns}
      >
        <Sticky.Header
          ref={r => (this.secondTableHeader = r && r.getRef())}
          tableBody={this.secondTableBody}
        />
        <Virtualized.Body
          rows={this.props.section.students}
          rowKey={'id'}
          onScroll={this.onScrollMainTableBody}
          // height={MAX_TABLE_SIZE}
          style={tableBodyStyle}
          ref={r => (this.secondTableBody = r && r.getRef())}
          tableHeader={this.secondTableHeader}
        />
      </Table.Provider>
    );
  }

  onScrollTableBody(e) {
    // for some reason, reactabular refuse to scroll for the first time
    this.secondTableHeader.scrollLeft = e.target.scrollLeft;
    this.secondTableBody.scrollLeft = e.target.scrollLeft;
  }

  render() {
    // const {columns, rows, maxWidth} = this.props;
    // let {numOfFirstFixedColumns} = this.props;
    // if (!numOfFirstFixedColumns) {
    //   numOfFirstFixedColumns = 0;
    // }
    // const firstFixedColumns = columns.slice(0, numOfFirstFixedColumns),
    //   remainingColumns = columns.slice(numOfFirstFixedColumns),
    //   firstTableWidth = getColumnsTotalWidth(firstFixedColumns),
    //   secondTableWidth = maxWidth - firstTableWidth;

    // // IE is tricky, we have to control the scrollbar manually
    // const secondTableScrollWidth = getColumnsTotalWidth(remainingColumns);
    // const isSecondTableOverflowX = secondTableScrollWidth > secondTableWidth;
    // this.needTweakLastColumns = columns.length && isSecondTableOverflowX;

    return (
      <div
        style={{
          display: 'block',
          // position: 'relative',
          width: styleConstants['content-width'],
          maxHeight: MAX_TABLE_SIZE
        }}
      >
        {this.renderStudentList()}
        {this.renderProgress()}
      </div>
    );
  }
}
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
)(StudentProgressSummaryTable);
