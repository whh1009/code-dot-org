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

export default class ProgressTableSummaryView extends React.Component {
  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    levelProgressByStudent: PropTypes.object,
    onScroll: PropTypes.func.isRequired,
    jumpToLessonDetails: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.lessonNumberFormatter = this.lessonNumberFormatter.bind(this);
    this.progressCellFormatter = this.progressCellFormatter.bind(this);
    this.header = null;
    this.body = null;
  }

  setScrollDelegate(scrollDelegate) {
    this.scrollDelegate = scrollDelegate;
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

  render() {
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
          ref={r => (this.header = r && r.getRef())}
          tableBody={this.body}
        />
        <Virtualized.Body
          rows={this.props.section.students}
          rowKey={'id'}
          onScroll={this.props.onScroll}
          // height={MAX_TABLE_SIZE}
          style={tableBodyStyle}
          ref={r => (this.body = r && r.getRef())}
          tableHeader={this.header}
        />
      </Table.Provider>
    );
  }
}
