import React, {Component} from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '../FontAwesome';
import color from '../../util/color';

const styles = {
  container: {
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.charcoal,
    ':hover': {
      cursor: 'pointer'
    },
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0px 10px'
  },
  highlight: {
    backgroundColor: color.teal,
    color: color.white,
    fontSize: 18
  },
  line: {
    display: 'inline-block',
    width: '100%',
    height: 0,
    border: '1px solid ',
    margin: '0px -7px 0px 4px'
  },
  arrow: {
    display: 'inline-block',
    borderStyle: 'solid',
    borderWidth: '0px 2px 2px 0px',
    width: 6,
    height: 6,
    transform: 'rotate(-45deg)',
    WebkitTransform: 'rotate(-45deg)'
  }
};

export default class SectionProgressLessonNumberCell extends Component {
  static propTypes = {
    number: PropTypes.number.isRequired,
    lockable: PropTypes.bool.isRequired,
    highlighted: PropTypes.bool.isRequired,
    tooltipId: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    includeArrow: PropTypes.bool
  };

  render() {
    const {
      number,
      lockable,
      highlighted,
      includeArrow,
      tooltipId,
      onClick
    } = this.props;

    const highlightStyle = highlighted ? styles.highlight : {};
    return (
      <div
        style={{...styles.container, ...highlightStyle}}
        onClick={onClick}
        data-tip
        data-for={tooltipId}
      >
        {lockable ? <FontAwesome icon="lock" /> : number}
        {includeArrow && <span style={styles.line} />}
        {includeArrow && <span style={styles.arrow} />}
      </div>
    );
  }
}
