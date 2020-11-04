import React from 'react';
import * as Table from 'reactabular-table';
import * as Sticky from 'reactabular-sticky';
import * as Virtualized from 'reactabular-virtualized';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import _ from 'lodash';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import {scriptDataPropType} from './sectionProgressConstants';
import {
  progressStyles,
  NAME_COLUMN_WIDTH,
  MAX_TABLE_SIZE,
  ROW_HEIGHT
} from '@cdo/apps/templates/sectionProgress/multiGridConstants';
import SectionProgressNameCell from '@cdo/apps/templates/sectionProgress/SectionProgressNameCell';

export default class ProgressTableStudentList extends React.Component {
  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    headers: PropTypes.arrayOf(PropTypes.string).isRequired
  };

  constructor(props) {
    super(props);
    this.studentNameFormatter = this.studentNameFormatter.bind(this);
    this.header = null;
    this.body = null;
  }

  studentNameFormatter(value, {rowData}) {
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

  getHeader(label) {
    const lessonsLabelStyle = {
      style: progressStyles.lessonHeading
    };
    return [
      {
        props: {
          style: {
            width: NAME_COLUMN_WIDTH
          }
        },
        header: {
          label: label,
          props: {
            style: {
              ...progressStyles.header,
              ...progressStyles.nameColumn
            }
          },
          transforms: [() => lessonsLabelStyle]
        }
      }
    ];
  }

  getStudentList() {
    const studentNameStyle = {
      style: progressStyles.nameColumn
    };
    return {
      property: 'name',
      props: {
        style: {
          width: NAME_COLUMN_WIDTH
        }
      },
      cell: {
        transforms: [() => studentNameStyle],
        formatters: [this.studentNameFormatter]
      }
    };
  }

  render() {
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
          ref={r => (this.header = r && r.getRef())}
          tableBody={this.body}
          headerRows={this.props.headers.map(header => this.getHeader(header))}
        />
        <Virtualized.Body
          rows={this.props.section.students}
          rowKey={'id'}
          style={{
            overflow: 'hidden',
            maxWidth: NAME_COLUMN_WIDTH,
            maxHeight: MAX_TABLE_SIZE
          }}
          ref={tableBody => (this.body = tableBody && tableBody.getRef())}
          tableHeader={this.header}
        />
      </Table.Provider>
    );
  }
}
