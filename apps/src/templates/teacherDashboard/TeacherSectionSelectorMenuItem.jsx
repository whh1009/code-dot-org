import PropTypes from 'prop-types';
import React, {Component} from 'react';
import PopUpMenu from '../../lib/ui/PopUpMenu';
import FontAwesome from './../FontAwesome';
import color from '../../util/color';
import {sectionForDropdownShape} from './shapes';

const styles = {
  item: {
    height: 28,
    lineHeight: '28px',
    width: 270,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingLeft: 10
  },
  assigned: {
    marginRight: 5,
    color: color.level_perfect
  }
};

export default class TeacherSectionSelectorMenuItem extends Component {
  static propTypes = {
    section: sectionForDropdownShape,
    onClick: PropTypes.func.isRequired
  };

  render() {
    const {section, onClick} = this.props;
    return (
      <PopUpMenu.Item onClick={onClick} style={styles.item}>
        <span style={styles.assigned}>
          {section.isAssigned && <FontAwesome icon="check" />}
          {!section.isAssigned && <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>}
        </span>
        <span>{section.name}</span>
      </PopUpMenu.Item>
    );
  }
}
