import React from 'react';
import SimpleProgressBubble from './SimpleProgressBubble';
import {levelProgressWithStatus} from '@cdo/apps/templates/progress/progressHelpers';
import {LevelKind, LevelStatus} from '@cdo/apps/util/sharedConstants';
import color from '@cdo/apps/util/color';

const statuses = [
  LevelStatus.not_tried,
  LevelStatus.attempted,
  LevelStatus.passed,
  LevelStatus.perfect
];
const assessmentStatuses = [
  LevelStatus.not_tried,
  LevelStatus.attempted,
  LevelStatus.submitted,
  LevelStatus.completed_assessment
];
const perfectProgress = levelProgressWithStatus(LevelStatus.perfect);

const wrapperStyle = {
  width: 50,
  height: 50,
  backgroundColor: color.background_gray,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

function wrapped(component) {
  return <div style={wrapperStyle}>{component}</div>;
}

function wrapMultiple(components) {
  return (
    <div style={{...wrapperStyle, width: null, height: null}}>
      {components.map(component => component)}
    </div>
  );
}

export default storybook => {
  storybook
    .storiesOf('SectionProgress/SimpleProgressBubble', module)
    .addStoryTable(
      [
        {
          name: 'small bubbles',
          story: () =>
            wrapMultiple([
              <SimpleProgressBubble
                levelStatus={LevelStatus.perfect}
                disabled={false}
                smallBubble={true}
                title={'a'}
                url={'/foo/bar'}
              />,
              <SimpleProgressBubble
                levelStatus={LevelStatus.attempted}
                disabled={false}
                smallBubble={true}
                title={'b'}
                url={'/foo/bar'}
              />,
              <SimpleProgressBubble
                levelStatus={LevelStatus.not_tried}
                disabled={false}
                smallBubble={true}
                title={'c'}
                url={'/foo/bar'}
              />
            ])
        }
      ]
        .concat(
          statuses.map(status => ({
            name: `regular bubble status: ${status}`,
            story: () =>
              wrapped(
                <SimpleProgressBubble
                  levelStatus={status}
                  levelKind={LevelKind.level}
                  disabled={status === LevelStatus.locked}
                  title={'3'}
                  url={'/foo/bar'}
                />
              )
          }))
        )
        .concat(
          statuses.map(status => ({
            name: `concept bubble status: ${status}`,
            story: () =>
              wrapped(
                <SimpleProgressBubble
                  levelStatus={status}
                  levelKind={LevelKind.level}
                  disabled={status === LevelStatus.locked}
                  title={'3'}
                  url={'/foo/bar'}
                  concept={true}
                />
              )
          }))
        )
        .concat(
          assessmentStatuses.map(status => ({
            name: `assessment bubble status: ${status}`,
            story: () =>
              wrapped(
                <SimpleProgressBubble
                  levelStatus={status}
                  levelKind={LevelKind.assessment}
                  disabled={status === LevelStatus.locked}
                  title={'3'}
                  url={'/foo/bar'}
                />
              )
          }))
        )
        .concat([
          {
            name: 'small bubbles',
            story: () =>
              wrapped(
                <div>
                  <SimpleProgressBubble
                    levelStatus={LevelStatus.perfect}
                    disabled={false}
                    smallBubble={true}
                    title={'a'}
                    url={'/foo/bar'}
                  />
                  <SimpleProgressBubble
                    levelStatus={LevelStatus.attempted}
                    disabled={false}
                    smallBubble={true}
                    title={'b'}
                    url={'/foo/bar'}
                  />
                  <SimpleProgressBubble
                    levelStatus={LevelStatus.not_tried}
                    disabled={false}
                    smallBubble={true}
                    title={'c'}
                    url={'/foo/bar'}
                  />
                </div>
              )
          }
          //   {
          //     name: 'bubble with no url',
          //     story: () => (
          //       <SimpleProgressBubble
          //         level={{
          //           id: 1,
          //           levelNumber: 3,
          //           icon: 'fa-document',
          //           kind: LevelKind.level
          //         }}
          //         studentLevelProgress={perfectProgress}
          //         disabled={false}
          //       />
          //     )
          //   },
          //   {
          //     name: 'disabled bubble',
          //     description: 'Should not be clickable or show progress',
          //     story: () => (
          //       <SimpleProgressBubble
          //         level={{
          //           id: 1,
          //           levelNumber: 3,
          //           icon: 'fa-document',
          //           kind: LevelKind.level,
          //           url: '/foo/bar'
          //         }}
          //         studentLevelProgress={perfectProgress}
          //         disabled={true}
          //       />
          //     )
          //   },
          //   {
          //     name: 'hidden tooltips bubble',
          //     description: 'should not have tooltips',
          //     story: () => (
          //       <SimpleProgressBubble
          //         level={{
          //           id: 1,
          //           levelNumber: 3,
          //           kind: LevelKind.level,
          //           url: '/foo/bar',
          //           icon: 'fa-document'
          //         }}
          //         studentLevelProgress={perfectProgress}
          //         hideToolTips={true}
          //         disabled={false}
          //       />
          //     )
          //   },
          //   {
          //     name: 'pairing icon bubble - perfect',
          //     description: 'should show the paring icon, completed perfectly',
          //     story: () => (
          //       <SimpleProgressBubble
          //         level={{
          //           id: 1,
          //           levelNumber: 3,
          //           kind: LevelKind.level,
          //           url: '/foo/bar',
          //           icon: 'fa-document'
          //         }}
          //         studentLevelProgress={{...perfectProgress, paired: true}}
          //         hideToolTips={true}
          //         disabled={false}
          //         pairingIconEnabled={true}
          //       />
          //     )
          //   },
          //   {
          //     name: 'pairing icon bubble - attempted',
          //     description: 'should show the paring icon, attempted',
          //     story: () => (
          //       <SimpleProgressBubble
          //         level={{
          //           id: 1,
          //           levelNumber: 3,
          //           kind: LevelKind.level,
          //           url: '/foo/bar',
          //           icon: 'fa-document'
          //         }}
          //         studentLevelProgress={{
          //           ...levelProgressWithStatus(LevelStatus.attempted),
          //           paired: true
          //         }}
          //         hideToolTips={true}
          //         disabled={false}
          //         pairingIconEnabled={true}
          //       />
          //     )
          //   }
        ])
    );
};
