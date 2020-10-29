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
            ...progressStyles.topLeft,
            ...progressStyles.lessonLabelContainer
          }
        },
        transforms: [() => lessonsLabelStyle]
      },
      cell: {
        formatters: [this.studentNameFormatter]
      }
    };
  }

  renderStudentList() {
    return (
      <Table.Provider
        style={{
          // ...progressStyles.multigrid,
          width: NAME_COLUMN_WIDTH,
          clear: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2
          // borderRight: '2px solid red'
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
          // style={{
          //   backgroundColor: '#E0E0E0',
          //   maxWidth: firstTableWidth,
          //   overflow: 'hidden',
          //   height: this.getTableHeaderHeight()
          // }}
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
    console.log(
      'column',
      columnIndex,
      this.props.scriptData.stages[columnIndex]
    );
    const stageData = this.props.scriptData.stages[columnIndex];
    if (!stageData) {
      return 'uh oh';
    }
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

  renderProgress() {
    // const tableWidth = MAX_TABLE_SIZE - NAME_COLUMN_WIDTH;
    const tableBodyStyle = {
      // maxWidth: secondTableWidth,
      maxHeight: MAX_TABLE_SIZE,
      overflow: 'auto'
    };

    // console.log('firstTableWidth=', firstTableWidth);
    const tableStyle = {
      // width: secondTableWidth,
      clear: 'none',
      position: 'absolute', // make the fixed header fail
      top: 0,
      left: NAME_COLUMN_WIDTH,
      zIndex: 1
    };
    // filling columns
    const columns = [];
    for (let j = 0; j < 10; j++) {
      columns.push({
        props: {
          style: {
            minWidth: 40
          }
        },
        header: {
          label: `${j + 1}`,
          formatters: [this.lessonNumberFormatter]
          // transforms: [() => headerCellStyle]
        },
        cell: {
          formatters: [
            (value, {rowData, columnIndex, rowIndex, property}) => {
              // console.log('row data', rowData);
              return `${rowIndex}:${columnIndex}`;
            }
          ]
        }
      });
    }

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
        width={styleConstants['content-width']}
        renderers={{
          body: {
            wrapper: Virtualized.BodyWrapper,
            row: Virtualized.BodyRow
          }
        }}
        columns={columns}
      >
        <Sticky.Header
          style={{
            // backgroundColor: '#E0E0E0',
            // maxWidth: secondTableWidth,
            overflow: 'hidden',
            height: 42
          }}
          ref={r => (this.secondTableHeader = r && r.getRef())}
          tableBody={this.secondTableBody}
        />
        <Virtualized.Body
          rows={this.props.section.students}
          rowKey={'id'}
          onScroll={this.onScrollMainTableBody}
          height={MAX_TABLE_SIZE}
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
          width: 970,
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

function getColumnsTotalWidth(myCols) {
  let sum = 0;
  // sanity check
  if (!myCols) {
    return sum;
  }

  // sum of all columns width
  for (const c of myCols) {
    sum += c.props.style.minWidth;
  }
  return sum;
}

class FixedColumnsTable extends React.Component {
  constructor(props) {
    super(props);
    this.needTweakLastColumns = false;
    this.onScrollMainTableBody = this.onScrollMainTableBody.bind(this);
  }

  onScrollMainTableBody(e) {
    this.firstTableBody.scrollTop = e.target.scrollTop;
    this.secondTableHeader.scrollLeft = e.target.scrollLeft;
  }

  getTableHeaderHeight() {
    return 30;
  }

  renderFirstTable(rows, columns, firstTableWidth) {
    if (!firstTableWidth || !columns || !columns.length) {
      return null;
    }

    return (
      <Table.Provider
        style={{
          width: firstTableWidth,
          clear: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
          borderRight: '2px solid red'
        }}
        renderers={{
          body: {
            wrapper: Virtualized.BodyWrapper,
            row: Virtualized.BodyRow
          }
        }}
        columns={columns}
      >
        <Sticky.Header
          style={{
            backgroundColor: '#E0E0E0',
            maxWidth: firstTableWidth,
            overflow: 'hidden',
            height: this.getTableHeaderHeight()
          }}
          ref={r => (this.firstTableHeader = r && r.getRef())}
          tableBody={this.firstTableBody}
        />
        <Virtualized.Body
          rows={rows}
          rowKey={this.props.rowKey}
          style={{
            overflow: 'hidden',
            maxWidth: firstTableWidth,
            maxHeight: this.props.maxHeight
          }}
          ref={tableBody =>
            (this.firstTableBody = tableBody && tableBody.getRef())
          }
          tableHeader={this.firstTableHeader}
        />
      </Table.Provider>
    );
  }

  renderSecondTable(rows, columns, firstTableWidth, secondTableWidth) {
    const tableBodyStyle = {
      maxWidth: secondTableWidth,
      maxHeight: this.props.maxHeight,
      overflow: 'auto'
    };

    console.log('firstTableWidth=', firstTableWidth);
    const tableStyle = {
      width: secondTableWidth,
      clear: 'none',
      position: 'absolute', // make the fixed header fail
      top: 0,
      left: firstTableWidth,
      zIndex: 1
    };

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
        renderers={{
          body: {
            wrapper: Virtualized.BodyWrapper,
            row: Virtualized.BodyRow
          }
        }}
        columns={columns}
      >
        <Sticky.Header
          style={{
            backgroundColor: '#E0E0E0',
            maxWidth: secondTableWidth,
            overflow: 'hidden',
            height: this.getTableHeaderHeight()
          }}
          ref={r => (this.secondTableHeader = r && r.getRef())}
          tableBody={this.secondTableBody}
        />
        <Virtualized.Body
          rows={rows}
          rowKey={this.props.rowKey}
          onScroll={this.onScrollMainTableBody}
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
    const {columns, rows, maxWidth} = this.props;
    let {numOfFirstFixedColumns} = this.props;
    if (!numOfFirstFixedColumns) {
      numOfFirstFixedColumns = 0;
    }
    const firstFixedColumns = columns.slice(0, numOfFirstFixedColumns),
      remainingColumns = columns.slice(numOfFirstFixedColumns),
      firstTableWidth = getColumnsTotalWidth(firstFixedColumns),
      secondTableWidth = maxWidth - firstTableWidth;

    // IE is tricky, we have to control the scrollbar manually
    const secondTableScrollWidth = getColumnsTotalWidth(remainingColumns);
    const isSecondTableOverflowX = secondTableScrollWidth > secondTableWidth;
    this.needTweakLastColumns = columns.length && isSecondTableOverflowX;
    return (
      <div
        style={{
          position: 'relative',
          maxWidth: maxWidth,
          maxHeight: this.props.maxHeight
        }}
      >
        {numOfFirstFixedColumns
          ? this.renderFirstTable(rows, firstFixedColumns, firstTableWidth)
          : null}
        {this.renderSecondTable(
          rows,
          remainingColumns,
          firstTableWidth,
          secondTableWidth
        )}
      </div>
    );
  }
}

function generateRandomTableData() {
  const tableData = {
    rows: [],
    columns: []
  };

  const columnNum = 50;
  const rowNum = 300;
  const width = 80;

  // filling rows
  for (let i = 0; i < rowNum; i++) {
    const tmpRow = {id: i};
    for (let j = 0; j < columnNum; j++) {
      tmpRow[`col${j}`] = Math.floor(Math.random() * 100) - 50;
    }
    tableData.rows.push(tmpRow);
  }

  const headerCellStyle = {
    style: {
      paddingTop: 6,
      paddingBottom: 6,
      borderLeft: '1px solid black',
      borderBottom: '1px solid black'
    }
  };

  const bodyCellStyle = {
    style: {
      paddingTop: 8,
      borderLeft: '1px solid black',
      textAlign: 'center'
    }
  };
  // id column should always exist
  tableData.columns.push({
    property: 'id', // the json row need two levels
    props: {
      style: {
        minWidth: width
      }
    },
    header: {
      label: 'id',
      transforms: [() => headerCellStyle]
    },
    cell: {
      transforms: [() => bodyCellStyle]
    }
  });

  // filling columns
  for (let j = 0; j < columnNum; j++) {
    tableData.columns.push({
      property: `col${j}`, // the json row need two levels
      props: {
        style: {
          minWidth: width
        }
      },
      header: {
        label: `col${j}`,
        transforms: [() => headerCellStyle]
      },
      cell: {
        transforms: [() => bodyCellStyle]
      }
    });
  }
  return tableData;
}
class StudentProgressSummaryTable2 extends React.Component {
  render() {
    const tableData = generateRandomTableData();
    const width = 800;
    const height = 300;
    const headerHeight = 30;
    return (
      <div
        style={{height: height + headerHeight, width: width, display: 'block'}}
      >
        <FixedColumnsTable
          numOfFirstFixedColumns={1}
          rows={tableData.rows}
          rowKey="id"
          columns={tableData.columns}
          maxWidth={width}
          maxHeight={height}
        />
      </div>
    );
  }
}
