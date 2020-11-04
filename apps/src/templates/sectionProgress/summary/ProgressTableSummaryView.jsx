import React from 'react';
import * as Table from 'reactabular-table';
import * as Sticky from 'reactabular-sticky';
import * as Virtualized from 'reactabular-virtualized';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {jumpToLessonDetails} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {scriptDataPropType} from '../sectionProgressConstants';
import {
  summarizeProgressInStage,
  stageIsAllAssessment
} from '@cdo/apps/templates/progress/progressHelpers';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import StudentProgressSummaryCell from './StudentProgressSummaryCell';
import SectionProgressLessonNumberCell from '@cdo/apps/templates/sectionProgress/SectionProgressLessonNumberCell';
import {tooltipIdForLessonNumber} from '@cdo/apps/templates/sectionProgress/multiGridConstants';
import progressTableStyles from '../progressTableStyles.scss';

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

  lessonNumberFormatter(_, {columnIndex}) {
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

  progressCellFormatter(_, {rowData, columnIndex}) {
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
        onSelectDetailView={() =>
          this.props.jumpToLessonDetails(stageData.position)
        }
      />
    );
  }

  render() {
    const columnWidth =
      progressTableStyles.CONTENT_VIEW_WIDTH /
      this.props.scriptData.stages.length;

    const columns = [];
    this.props.scriptData.stages.forEach(_ => {
      columns.push({
        props: {style: {width: columnWidth}},
        header: {formatters: [this.lessonNumberFormatter]},
        cell: {formatters: [this.progressCellFormatter]}
      });
    });

    return (
      <Table.Provider
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
