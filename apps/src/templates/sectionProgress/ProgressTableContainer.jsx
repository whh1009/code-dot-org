import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styleConstants from '../../styleConstants';
import ProgressTableSummaryView from './summary/ProgressTableSummaryView';
import ProgressTableStudentList from './ProgressTableStudentList';
import {MAX_TABLE_SIZE} from '@cdo/apps/templates/sectionProgress/multiGridConstants';
import i18n from '@cdo/locale';

export const SummaryViewContainer = synchronized(
  ProgressTableStudentList,
  ProgressTableSummaryView,
  [i18n.lesson()]
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
        <div
          style={{
            display: 'block',
            width: styleConstants['content-width'],
            maxHeight: MAX_TABLE_SIZE
          }}
        >
          <StudentList
            ref={r => (this.studentList = r)}
            headers={studentHeaders}
            {...this.props}
          />
          <ContentView
            ref={r => (this.contentView = r)}
            onScroll={this.onScroll}
            {...this.props}
          />
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

class ProgressTableContainer extends React.Component {
  static propTypes = {
    studentList: PropTypes.node.isRequired,
    contentView: PropTypes.node.isRequired
  };

  constructor(props) {
    super(props);
    this.needTweakLastColumns = false;
    this.onScroll = this.onScroll.bind(this);
    this.props.contentView.setScrollDelegate(this);
  }
}
