import {fullyLockedStageMapping} from '@cdo/apps/code-studio/stageLockRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {isStageHiddenForSection} from '@cdo/apps/code-studio/hiddenStageRedux';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';
import {PUZZLE_PAGE_NONE} from './progressTypes';
import {TestResults} from '@cdo/apps/constants';
import {
  activityCssClass,
  resultFromStatus
} from '@cdo/apps/code-studio/activityUtils';
import _ from 'lodash';

/**
 * This is conceptually similar to being a selector, except that it operates on
 * the entire store state. It is used by components to determine whether a
 * particular lesson is visible, or hidden entirely.
 * @param {number} lesson - the lesson we're querying
 * @param {object} state - State of our entire redux store
 * @param {ViewType} viewAs - Are we interested in whether the lesson is viewable
 *   for students or teachers
 * @returns {boolean} True if the provided lesson is visible
 */
export function lessonIsVisible(lesson, state, viewAs) {
  if (!viewAs) {
    throw new Error('missing param viewAs in lessonIsVisible');
  }

  // Don't show stage if not authorized to see lockable
  if (lesson.lockable && !state.stageLock.lockableAuthorized) {
    return false;
  }

  const hiddenStageState = state.hiddenStage;
  const sectionId = state.teacherSections.selectedSectionId;

  const isHidden = isStageHiddenForSection(
    hiddenStageState,
    sectionId,
    lesson.id
  );
  return !isHidden || viewAs === ViewType.Teacher;
}

/**
 * Check to see if a stage/lesson is locked for all stages in the current section
 * or not. If called as a student, this should always return false since they
 * don't have a selected section.
 * @param {number} lessonId - Id representing the stage/lesson we're curious about
 * @param {object} state - State of our entire redux store
 * @returns {boolean} True if the given lesson is locked for all students in the
 *   currently selected section.
 */
export function lessonIsLockedForAllStudents(lessonId, state) {
  const currentSectionId = state.teacherSections.selectedSectionId;
  const currentSection = state.stageLock.stagesBySectionId[currentSectionId];
  const fullyLockedStages = fullyLockedStageMapping(currentSection);
  return !!fullyLockedStages[lessonId];
}

/**
 * @param {level[]} levels - A set of levels for a given stage
 * @returns {boolean} True if we should consider the stage to be locked for the
 *   current user.
 */
export function stageLocked(levels) {
  // For lockable stages, there is a requirement that they have exactly one LevelGroup,
  // and that it be the last level in the stage. Because LevelGroup's can have
  // multiple "pages", and single LevelGroup might appear as multiple levels/bubbles
  // on the client. However, it is the case that each page in the LG should have
  // an identical locked/unlocked state.
  // Given this, we should be able to look at the last level in our collection
  // to determine whether the LG (and thus the stage) should be considered locked.
  const level = levels[levels.length - 1];
  return (
    level.status === LevelStatus.locked ||
    (level.kind === 'assessment' && level.status === 'submitted')
  );
}

/**
 * @returns A friendly name for the icon name (that can be passed to FontAwesome)
 *   for the given level.
 */
export function getIconForLevel(level, inProgressView = false) {
  if (inProgressView && isLevelAssessment(level)) {
    return 'check-circle';
  }

  if (level.isUnplugged) {
    return 'scissors';
  }

  if (level.icon) {
    // Eventually I'd like to have dashboard return an icon type. For now, I'm just
    // going to treat the css class it sends as a type, and map it to an icon name.
    const match = /fa-(.*)/.exec(level.icon);
    if (!match || !match[1]) {
      throw new Error('Unknown iconType: ' + level.icon);
    }
    return match[1];
  }

  if (level.bonus) {
    return 'flag-checkered';
  }

  // default to desktop
  return 'desktop';
}

/**
 * @returns Whether a level is an assessment level.
 */
export function isLevelAssessment(level) {
  return level.kind === 'assessment';
}

/**
 * Checks if a whole lesson is assessment levels
 * @param {[]} levels An array of levels
 * @returns {bool} If all the levels in a lesson are assessment levels
 */
export function lessonIsAllAssessment(levels) {
  return levels.every(level => level.kind === LevelKind.assessment);
}

/**
 * Computes progress status percentages for a set of levels.
 * @param {{id:studentLevelProgressType}} studentLevelProgress An object keyed by
 * level id containing objects representing the student's progress in that level
 * @param {levelType[]} levels An array of levels
 * @returns {studentLessonProgressType} An object representing student's progress
 * in the lesson
 *
 * Note: this function will replace `summarizeProgressInStage` below once we
 * refactor the legacy StudentProgressSummaryCell component
 */
export function progressForLesson(studentLevelProgress, levels) {
  // Filter any bonus levels as they do not count toward progress.
  const filteredLevels = levels.filter(level => !level.bonus);
  const statuses = filteredLevels.map(level => {
    const levelProgress = studentLevelProgress[level.id];
    return (levelProgress && levelProgress.status) || LevelStatus.not_tried;
  });

  const completedStatuses = [
    LevelStatus.perfect,
    LevelStatus.submitted,
    LevelStatus.free_play_complete,
    LevelStatus.completed_assessment,
    LevelStatus.readonly
  ];

  const statusCounts = statuses.reduce(
    (counts, status) => {
      counts.attempted += status === LevelStatus.attempted;
      counts.imperfect += status === LevelStatus.passed;
      counts.completed += completedStatuses.includes(status);
      return counts;
    },
    {attempted: 0, imperfect: 0, completed: 0}
  );
  const incomplete =
    statuses.length - statusCounts.completed - statusCounts.imperfect;
  const isLessonStarted =
    statusCounts.attempted + statusCounts.imperfect + statusCounts.completed >
    0;

  const getPercent = count => (100 * count) / statuses.length;
  return {
    isStarted: isLessonStarted,
    imperfectPercent: getPercent(statusCounts.imperfect),
    completedPercent: getPercent(statusCounts.completed),
    incompletePercent: getPercent(incomplete)
  };
}

/**
 * Summarizes stage progress data.
 * @param {{id:studentLevelProgressType}} studentProgress An object keyed by
 * level id containing objects representing the student's progress in that level
 * @param {levelType[]} levels An array of the levels in a stage
 * @returns {object} An object with a total count of levels in each of the
 * following buckets: total, completed, imperfect, incomplete, attempted.
 */
export function summarizeProgressInStage(studentProgress, levels) {
  // Filter any bonus levels as they do not count toward progress.
  const filteredLevels = levels.filter(level => !level.bonus);

  // Get counts of statuses
  let statusCounts = {
    total: 0,
    completed: 0,
    imperfect: 0,
    incomplete: 0,
    attempted: 0
  };

  filteredLevels.forEach(level => {
    const levelProgress = studentProgress[level.id];
    statusCounts.total++;
    if (!levelProgress) {
      statusCounts.incomplete++;
      return;
    }
    switch (levelProgress.status) {
      case LevelStatus.perfect:
      case LevelStatus.submitted:
      case LevelStatus.free_play_complete:
      case LevelStatus.completed_assessment:
      case LevelStatus.readonly:
        statusCounts.completed++;
        break;
      case LevelStatus.not_tried:
        statusCounts.incomplete++;
        break;
      case LevelStatus.attempted:
        statusCounts.incomplete++;
        statusCounts.attempted++;
        break;
      case LevelStatus.passed:
        statusCounts.imperfect++;
        break;
      // All others are assumed to be not tried
      default:
        statusCounts.incomplete++;
    }
  });
  return statusCounts;
}

/**
 * The level object passed down to use via the server (and stored in stage.stages.levels)
 * contains more data than we need. This filters to the parts our views care about.
 */
export const processedLevel = level => {
  return {
    id: level.activeId || level.id,
    url: level.url,
    name: level.name,
    progression: level.progression,
    progressionDisplayName: level.progression_display_name,
    kind: level.kind,
    icon: level.icon,
    isUnplugged: level.display_as_unplugged,
    levelNumber: level.kind === LevelKind.unplugged ? undefined : level.title,
    bubbleText:
      level.kind === LevelKind.unplugged
        ? undefined
        : level.letter || level.title.toString(),
    isConceptLevel: level.is_concept_level,
    bonus: level.bonus,
    pageNumber:
      typeof level.page_number !== 'undefined'
        ? level.page_number
        : PUZZLE_PAGE_NONE,
    sublevels:
      level.sublevels && level.sublevels.map(level => processedLevel(level))
  };
};

export const getLevelResult = serverProgress => {
  if (serverProgress.status === LevelStatus.locked) {
    return TestResults.LOCKED_RESULT;
  }
  if (serverProgress.readonly_answers) {
    return TestResults.READONLY_SUBMISSION_RESULT;
  }
  if (serverProgress.submitted) {
    return TestResults.SUBMITTED_RESULT;
  }

  return serverProgress.result || resultFromStatus(serverProgress.status);
};

/**
 * Parse a level progress object that we get from the server using either
 * /api/user_progress or /dashboardapi/section_level_progress into our
 * canonical studentLevelProgressType shape.
 * @param {object} serverProgress A progress object from the server
 * @returns {studentLevelProgressType} Our canonical progress shape
 */
export const levelProgressFromServer = serverProgress => {
  return {
    status: serverProgress.status || LevelStatus.not_tried,
    result: getLevelResult(serverProgress),
    paired: serverProgress.paired || false,
    timeSpent: serverProgress.time_spent || 0,
    // `pages` is used by multi-page assessments, and its presence
    // (or absence) is how we distinguish those from single-page assessments
    pages:
      serverProgress.pages_completed &&
      serverProgress.pages_completed.length > 1
        ? serverProgress.pages_completed.map(
            pageResult =>
              (pageResult && levelProgressFromResult(pageResult)) ||
              levelProgressFromStatus(LevelStatus.not_tried)
          )
        : null
  };
};

/**
 * Given an object from the server with student progress data keyed by level ID,
 * parse the progress data into our canonical studentLevelProgressType
 * @param {{levelId:serverProgress}} serverStudentProgress
 * @returns {{levelId:studentLevelProgressType}}
 */
export const processServerStudentProgress = serverStudentProgress => {
  return _.mapValues(serverStudentProgress, progress =>
    levelProgressFromServer(progress)
  );
};

/**
 * Given an object from the server with section progress data keyed by student
 * ID and level ID, parse the progress data into our canonical
 * studentLevelProgressType
 * @param {{studenId:{levelId:serverProgress}}} serverSectionProgress
 * @returns {{studenId:{levelId:studentLevelProgressType}}}
 */
export const processServerSectionProgress = serverSectionProgress => {
  return _.mapValues(serverSectionProgress, student =>
    processServerStudentProgress(student)
  );
};

/**
 * Create a studentLevelProgressType object with the provided status string
 * @param {string} status
 * @returns {studentLevelProgressType}
 */
export const levelProgressFromStatus = status => {
  return levelProgressFromServer({status: status});
};

/**
 * Create a studentLevelProgressType object from the provided result value.
 * This is used to merge progress data from session storage which only includes
 * a result value into our data model that uses studentLevelProgressType objects.
 * @param {number} result
 * @returns {studentLevelProgressType}
 */
export const levelProgressFromResult = result => {
  return levelProgressFromStatus(activityCssClass(result));
};
