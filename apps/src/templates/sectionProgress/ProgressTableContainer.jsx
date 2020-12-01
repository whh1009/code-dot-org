import React from 'react';
import _ from 'lodash';
import ProgressTableSummaryView from './summary/ProgressTableSummaryView';
import ProgressTableDetailView from './detail/ProgressTableDetailView';
import ProgressTableStudentList from './ProgressTableStudentList';
import i18n from '@cdo/locale';

/**
 * Since our progress tables are built out of standard HTML table elements,
 * we can get a big performance improvement and simplify code by using CSS
 * classes for all our styling in these components.
 */
import './progressTableStyles.scss';

export const SummaryViewContainer = synchronized(
  ProgressTableStudentList,
  ProgressTableSummaryView,
  [i18n.lesson()]
);

export const DetailViewContainer = synchronized(
  ProgressTableStudentList,
  ProgressTableDetailView,
  [i18n.lesson(), i18n.levelType()]
);

function synchronized(StudentList, ContentView, studentHeaders) {
  class Synchronized extends React.Component {
    constructor(props) {
      super(props);
      this.needTweakLastColumns = false;
      this.onScroll = this.onScroll.bind(this);
      this.studentList = null;
      this.contentView = null;
    }

    onScroll(e) {
      this.studentList.body.scrollTop = e.target.scrollTop;
      this.contentView.header.scrollLeft = e.target.scrollLeft;
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
        <div className="progress-table">
          <div className="student-list">
            <StudentList
              ref={r => (this.studentList = r)}
              headers={studentHeaders}
              {...this.props}
            />
          </div>
          <div className="content-view">
            <ContentView
              ref={r => (this.contentView = r)}
              onScroll={this.onScroll}
              {...this.props}
            />
          </div>
        </div>
      );
    }
  }
  Synchronized.displayName = `Synchronized(${getDisplayName(
    StudentList
  )},${getDisplayName(ContentView)})`;
  return Synchronized;
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
