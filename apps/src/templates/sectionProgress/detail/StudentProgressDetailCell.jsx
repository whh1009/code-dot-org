import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {
  levelType,
  studentLevelProgressType
} from '@cdo/apps/templates/progress/progressTypes';
import i18n from '@cdo/locale';
import SimpleProgressBubble from '@cdo/apps/templates/progress/SimpleProgressBubble';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import color from '@cdo/apps/util/color';
import _ from 'lodash';

const bubbleSetStyles = {
  main: {
    position: 'relative',
    display: 'inline-block'
  },
  withBackground: {
    display: 'inline-block',
    position: 'relative'
  },
  background: {
    height: 10,
    backgroundColor: color.lighter_gray,
    position: 'absolute',
    left: 0,
    right: 0,
    // dot size, plus borders, plus margin, minus our height of "background"
    top: (progressStyles.DOT_SIZE + 4 + 6 - 10) / 2
  },
  backgroundDiamond: {
    top: (progressStyles.DIAMOND_DOT_SIZE + 4 + 12 - 10) / 2
  },
  backgroundPill: {
    // pill has height of 18, border of 2, padding of 6, margin of 3
    top: (18 + 4 + 12 + 6 - 10) / 2
  },
  backgroundSublevel: {
    top: 4
  },
  backgroundFirst: {
    left: 15
  },
  backgroundLast: {
    right: 15
  },
  container: {
    position: 'relative'
  },
  diamondContainer: {
    // Height needed only by IE to get diamonds to line up properly
    height: 36
  },
  pillContainer: {
    marginRight: 2,
    // Height needed only by IE to get pill to line up properly
    height: 37
  }
};

const pillStyles = {
  levelPill: {
    textAlign: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    color: color.charcoal,
    display: 'flex',
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 6,
    paddingBottom: 6,
    minWidth: 70,
    lineHeight: '18px',
    marginTop: 3,
    marginBottom: 3,
    position: 'relative'
  },
  text: {
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    letterSpacing: -0.12
  },
  textProgressStyle: {
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 12,
    letterSpacing: -0.12,
    width: 120,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  iconMargin: {
    marginLeft: 10
  }
};

const styles = {
  bubbles: {
    whiteSpace: 'nowrap'
  },
  cell: {
    padding: '1px 4px'
  }
};

export default class StudentProgressDetailCell extends Component {
  static whyDidYouRender = true;
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    stageId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    levels: PropTypes.arrayOf(levelType).isRequired,
    studentProgress: PropTypes.objectOf(studentLevelProgressType).isRequired,
    stageExtrasEnabled: PropTypes.bool
  };

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  buildBubbleUrl(level) {
    if (!level.url) {
      return null;
    }
    const {studentId, sectionId} = this.props;
    const url = new URL(level.url);
    url.searchParams.append('section_id', sectionId);
    url.searchParams.append('user_id', studentId);
    return url.toString();
  }

  renderUnplugged(level, status) {
    let url = this.buildBubbleUrl(level);
    let style = {
      ...pillStyles.levelPill,
      ...(url && progressStyles.hoverStyle),
      ...progressStyles.levelProgressStyle(status)
    };

    return (
      <a
        href={url}
        style={{textDecoration: 'none'}}
        className="uitest-ProgressPill"
      >
        <div style={style}>
          <div
            className="ProgressPillTextAndIcon"
            style={pillStyles.textProgressStyle}
          >
            {i18n.unpluggedActivity()}
          </div>
        </div>
      </a>
    );
  }

  renderBubble = (level, index, isSublevel) => {
    const {levels, studentProgress, stageExtrasEnabled} = this.props;
    const levelProgress = studentProgress[level.id];
    const status = levelProgress && levelProgress.status;
    const paired = levelProgress && levelProgress.paired;
    if (level.isUnplugged && !isSublevel) {
      return this.renderUnplugged(level, status);
    }
    const conceptStyle =
      (level.isConceptLevel && bubbleSetStyles.backgroundDiamond) || {};
    const subStyle = (isSublevel && bubbleSetStyles.backgroundSublevel) || {};
    const unpluggedStyle =
      (level.isUnplugged && bubbleSetStyles.backgroundPill) || {};
    const firstSyle =
      (!isSublevel && index === 0 && bubbleSetStyles.backgroundFirst) || {};
    const lastStyle =
      (!level.sublevels &&
        index === levels.length - 1 &&
        bubbleSetStyles.backgroundLast) ||
      {};
    const unpluggedContainer =
      (level.isUnplugged && bubbleSetStyles.pillContainer) || {};
    const conceptContainer =
      (level.isConceptLevel && bubbleSetStyles.diamondContainer) || {};
    return (
      <div style={bubbleSetStyles.withBackground} key={index}>
        <div
          style={{
            ...bubbleSetStyles.background,
            ...conceptStyle,
            ...subStyle,
            ...unpluggedStyle,
            ...firstSyle,
            ...lastStyle
          }}
        />
        <div
          style={{
            ...bubbleSetStyles.container,
            ...unpluggedContainer,
            ...conceptContainer
          }}
        >
          <SimpleProgressBubble
            levelStatus={status}
            disabled={!!level.bonus && !stageExtrasEnabled}
            smallBubble={isSublevel}
            bonus={level.bonus}
            paired={paired}
            concept={level.isConceptLevel}
            title={level.bubbleTitle}
            url={this.buildBubbleUrl(level)}
          />
        </div>
      </div>
    );
  };

  render() {
    return (
      <div
        style={{...styles.cell, ...styles.bubbles, ...bubbleSetStyles.main}}
        className="uitest-detail-cell"
      >
        {this.props.levels.map((level, index) => {
          return (
            <span key={index}>
              {this.renderBubble(level, index, false)}
              {level.sublevels &&
                level.sublevels.map((sublevel, index) => {
                  return (
                    <span key={index}>
                      {this.renderBubble(sublevel, index, true)}
                    </span>
                  );
                })}
            </span>
          );
        })}
      </div>
    );
  }
}
