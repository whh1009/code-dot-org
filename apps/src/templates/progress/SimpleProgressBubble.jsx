import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  DOT_SIZE,
  DIAMOND_DOT_SIZE,
  SMALL_DOT_SIZE,
  SMALL_DIAMOND_SIZE,
  levelProgressStyle,
  hoverStyle
} from './progressStyles';
import color from '@cdo/apps/util/color';
import firehoseClient from '@cdo/apps/lib/util/firehose';

const styles = {
  main: {
    boxSizing: 'content-box',
    fontFamily: '"Gotham 5r", sans-serif',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    fontSize: 16,
    letterSpacing: -0.11,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition:
      'background-color .2s ease-out, border-color .2s ease-out, color .2s ease-out',
    marginTop: 3,
    marginBottom: 3,
    position: 'relative'
  },
  largeDiamond: {
    width: DIAMOND_DOT_SIZE,
    height: DIAMOND_DOT_SIZE,
    borderRadius: 4,
    transform: 'rotate(45deg)',
    marginTop: 6,
    marginBottom: 6
  },
  small: {
    width: SMALL_DOT_SIZE,
    height: SMALL_DOT_SIZE,
    borderRadius: SMALL_DOT_SIZE,
    fontSize: 0,
    alignItems: 'none'
  },
  smallDiamond: {
    width: SMALL_DIAMOND_SIZE,
    height: SMALL_DIAMOND_SIZE,
    borderRadius: 2,
    fontSize: 0,
    transform: 'rotate(45deg)',
    marginLeft: 1,
    marginRight: 1
  },
  contents: {
    whiteSpace: 'nowrap',
    lineHeight: '16px'
  },
  diamondContents: {
    // undo the rotation from the parent
    transform: 'rotate(-45deg)'
  },
  disabledStageExtras: {
    backgroundColor: color.lighter_gray,
    color: color.white
  }
};

export default class SimpleProgressBubble extends React.PureComponent {
  static propTypes = {
    levelStatus: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    smallBubble: PropTypes.bool,
    bonus: PropTypes.bool,
    paired: PropTypes.bool,
    concept: PropTypes.bool,
    title: PropTypes.string,
    url: PropTypes.string
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

  render() {
    const {
      levelStatus,
      smallBubble,
      disabled,
      bonus,
      paired,
      concept,
      title,
      url
    } = this.props;

    const style = {
      ...styles.main,
      ...(!disabled && hoverStyle),
      ...(smallBubble && styles.small),
      ...(concept && (smallBubble ? styles.smallDiamond : styles.largeDiamond)),
      ...levelProgressStyle(levelStatus, disabled),
      ...(disabled && bonus && styles.disabledStageExtras)
    };

    const content = paired ? (
      <FontAwesome icon="users" />
    ) : bonus ? (
      <FontAwesome icon="flag-checkered" />
    ) : (
      <span>{(title && title) || ''}</span>
    );

    // Two pixels on each side for border, 2 pixels on each side for margin.
    const width = (smallBubble ? SMALL_DOT_SIZE : DOT_SIZE) + 8;

    // Outer div here is used to make sure our bubbles all take up equivalent
    // amounts of space, whether they're diamonds or circles
    let bubble = (
      <div
        style={{
          // two pixels on each side for border, 2 pixels on each side for margin
          width: width,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div style={style} className="uitest-bubble">
          <div
            style={{
              fontSize: paired || bonus ? 14 : 16,
              ...styles.contents,
              ...(concept && styles.diamondContents)
            }}
          >
            {content}
          </div>
        </div>
      </div>
    );
    if (!url) {
      return bubble;
    }

    return (
      <a
        href={url}
        style={{textDecoration: 'none'}}
        className="uitest-ProgressBubble"
        onClick={this.recordProgressTabProgressBubbleClick}
      >
        {bubble}
      </a>
    );
  }
}
