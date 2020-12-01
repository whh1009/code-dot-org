import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import * as progressStyles from '../progress/progressStyles';
import color from '@cdo/apps/util/color';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

const BIG_SIZE = 30;

// Hard-coded container size to ensure all big bubbles have the same width
// regardless of shape (circle vs. diamond).
// Two pixels on each side for margin, plus 2 x border width
export const BIG_CONTAINER =
  BIG_SIZE + 4 + 2 * progressStyles.BUBBLE_BORDER_WIDTH;

const SMALL_SIZE = 12;
const SMALL_MARGIN = 3;
const SMALL_PAD = 1;
export const SMALL_CONTAINER =
  SMALL_SIZE +
  2 * SMALL_MARGIN +
  SMALL_PAD +
  2 * progressStyles.BUBBLE_BORDER_WIDTH;

const styles = {
  container: {
    ...progressStyles.flex,
    width: BIG_CONTAINER
  },
  main: {
    ...progressStyles.flex,
    boxSizing: 'content-box',
    fontFamily: '"Gotham 5r", sans-serif',
    width: BIG_SIZE,
    height: BIG_SIZE,
    borderRadius: BIG_SIZE,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    fontSize: 16,
    letterSpacing: -0.11,
    transition:
      'background-color .2s ease-out, border-color .2s ease-out, color .2s ease-out',
    marginTop: 3,
    marginBottom: 3,
    position: 'relative'
  },
  largeDiamond: {
    width: progressStyles.DIAMOND_DOT_SIZE,
    height: progressStyles.DIAMOND_DOT_SIZE,
    borderRadius: 4,
    transform: 'rotate(45deg)',
    marginTop: 6,
    marginBottom: 6
  },
  small: {
    display: 'inline-block',
    width: SMALL_SIZE,
    height: SMALL_SIZE,
    borderRadius: SMALL_SIZE,
    lineHeight: '12px',
    fontSize: 12,
    margin: SMALL_MARGIN,
    paddingRight: SMALL_PAD,
    paddingBottom: SMALL_PAD,
    textAlign: 'center',
    verticalAlign: 'middle'
  },
  contents: {
    whiteSpace: 'nowrap',
    lineHeight: '16px'
  },
  diamondContents: {
    // undo the rotation from the parent
    transform: 'rotate(-45deg)'
  },
  bonusDisabled: {
    backgroundColor: color.lighter_gray,
    color: color.white
  },
  link: {
    textDecoration: 'none',
    display: 'inline-block'
  }
};

class SimpleProgressBubble extends React.PureComponent {
  static propTypes = {
    levelStatus: PropTypes.string,
    levelKind: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    smallBubble: PropTypes.bool,
    bonus: PropTypes.bool,
    paired: PropTypes.bool,
    concept: PropTypes.bool,
    title: PropTypes.string,
    url: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.recordBubbleClick = this.recordBubbleClick.bind(this);
  }

  recordBubbleClick() {
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'go_to_level'
      },
      {includeUserId: true}
    );
  }

  mainStyle() {
    const {levelStatus, levelKind, disabled} = this.props;
    return {
      ...styles.main,
      ...(!disabled && progressStyles.hoverStyle),
      ...progressStyles.levelProgressStyle(levelStatus, levelKind, disabled)
    };
  }

  bigStyle() {
    const {disabled, bonus, concept} = this.props;
    return {
      ...(concept && styles.largeDiamond),
      ...(disabled && bonus && styles.bonusDisabled)
    };
  }

  renderSmallBubble() {
    const {title} = this.props;
    return (
      <div>
        <div style={{...this.mainStyle(), ...styles.small}}>{title}</div>
      </div>
    );
  }

  content() {
    const {levelStatus, bonus, paired, title} = this.props;
    const locked = levelStatus === LevelStatus.locked;
    return locked ? (
      <FontAwesome icon="lock" />
    ) : paired ? (
      <FontAwesome icon="users" />
    ) : bonus ? (
      <FontAwesome icon="flag-checkered" />
    ) : (
      <span>{(title && title) || ''}</span>
    );
  }

  renderBigBubble() {
    const {
      levelStatus,
      levelKind,
      disabled,
      bonus,
      paired,
      concept
    } = this.props;

    const style = {...this.mainStyle(), ...this.bigStyle()};
    return (
      <div style={styles.container}>
        <div style={style} className="uitest-bubble">
          <div
            style={{
              fontSize: paired || bonus ? 14 : 16,
              ...styles.contents,
              ...(concept && styles.diamondContents),
              ...progressStyles.flex
              // margin: '3px 0px'
            }}
          >
            {this.content()}
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <a
        href={this.props.url}
        style={styles.link}
        className="uitest-ProgressBubble"
        onClick={this.recordBubbleClick}
      >
        {this.props.smallBubble
          ? this.renderSmallBubble()
          : this.renderBigBubble()}
      </a>
    );
  }
}

export default Radium(SimpleProgressBubble);
