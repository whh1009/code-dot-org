import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import ProgressBubbleSet from './ProgressBubbleSet';
import color from '@cdo/apps/util/color';
import {levelType, studentLevelProgressType} from './progressTypes';
import {getIconForLevel} from './progressHelpers';
import ProgressPill from './ProgressPill';

const styles = {
  table: {
    marginTop: 12
  },
  nameText: {
    color: color.charcoal
  },
  text: {
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    letterSpacing: -0.12
  },
  col2: {
    paddingLeft: 20
  },
  linesAndDot: {
    whiteSpace: 'nowrap',
    marginLeft: '50%',
    marginRight: 14
  },
  verticalLine: {
    display: 'inline-block',
    backgroundColor: color.lighter_gray,
    height: 15,
    width: 3,
    position: 'relative',
    bottom: 2
  },
  horizontalLine: {
    display: 'inline-block',
    backgroundColor: color.lighter_gray,
    position: 'relative',
    top: -2,
    height: 3,
    width: '100%'
  },
  dot: {
    display: 'inline-block',
    position: 'relative',
    left: -2,
    top: 1,
    backgroundColor: color.lighter_gray,
    height: 10,
    width: 10,
    borderRadius: 10
  }
};

/**
 * A set of one or more levels that are part of the same progression
 */
class ProgressLevelSet extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    levels: PropTypes.arrayOf(levelType).isRequired,
    studentProgress: PropTypes.objectOf(studentLevelProgressType).isRequired,
    disabled: PropTypes.bool.isRequired,
    selectedSectionId: PropTypes.number
  };

  render() {
    const {
      name,
      levels,
      studentProgress,
      disabled,
      selectedSectionId
    } = this.props;

    const multiLevelStep = levels.length > 1;
    const url = multiLevelStep ? undefined : levels[0].url;

    let pillText;
    if (levels[0].isUnplugged || levels[levels.length - 1].isUnplugged) {
      // We explicitly don't want any text in this case
      pillText = '';
    } else {
      pillText = levels[0].levelNumber.toString();
      if (multiLevelStep) {
        pillText += `-${levels[levels.length - 1].levelNumber}`;
      }
    }

    const level = levels[0];
    const progress = studentProgress[level.id];
    return (
      <table style={styles.table}>
        <tbody>
          <tr>
            <td style={styles.col1}>
              <ProgressPill
                level={level}
                levelStatus={progress && progress.status}
                multilevel={multiLevelStep}
                icon={getIconForLevel(levels)}
                text={pillText}
                disabled={disabled}
                selectedSectionId={selectedSectionId}
              />
            </td>
            <td style={styles.col2}>
              <a href={url}>
                <div style={{...styles.nameText, ...styles.text}}>{name}</div>
              </a>
            </td>
          </tr>
          {multiLevelStep && (
            <tr>
              <td>
                <div style={styles.linesAndDot}>
                  <div style={styles.verticalLine} />
                  <div style={styles.horizontalLine} />
                  <div style={styles.dot} />
                </div>
              </td>
              <td style={styles.col2}>
                <ProgressBubbleSet
                  levels={levels}
                  studentProgress={studentProgress}
                  disabled={disabled}
                  selectedSectionId={selectedSectionId}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}

export default Radium(ProgressLevelSet);
