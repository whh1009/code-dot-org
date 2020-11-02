import {
  registerReducers,
  createStoreWithReducers,
  restoreRedux,
  stubRedux
} from '@cdo/apps/redux';
import sectionData, {setSection} from '@cdo/apps/redux/sectionDataRedux';
import sectionProgress, {
  addDataByScript
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import scriptSelection, {
  setValidScripts
} from '@cdo/apps/redux/scriptSelectionRedux';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {TestResults} from '@cdo/apps/constants';

export function createStore() {
  const section = {
    id: 11,
    script: scriptData,
    students: [],
    stageExtras: false
  };
  for (let i = 0; i < 200; i++) {
    section.students.push({id: i, name: 'Student' + i});
  }
  try {
    registerReducers({sectionProgress, sectionData, scriptSelection});
  } catch {}
  const store = createStoreWithReducers();
  store.dispatch(setSection(section));
  store.dispatch(setValidScripts([scriptData], [scriptData.id], [], section));
  store.dispatch(addDataByScript(buildSectionProgress(section.students)));
  return store;
}

function buildSectionProgress(students) {
  const lastUpdates = {};
  const progress = {};

  students.forEach(student => {
    lastUpdates[student.id] = {};
    progress[student.id] = {};
  });
  scriptData.stages.forEach(stage => {
    stage.levels.forEach(level => {
      students.forEach(student => {
        lastUpdates[student.id][level.id] = Date.now();
        progress[student.id][level.id] = randomProgress();
      });
    });
  });
  return {
    scriptDataByScript: {[scriptData.id]: scriptData},
    studentLevelProgressByScript: {[scriptData.id]: progress},
    studentLastUpdateByScript: {[scriptData.id]: lastUpdates}
  };
}

function randomProgress() {
  const rand = Math.floor(Math.random() * 3);
  const paired = Math.floor(Math.random() * 10) === 0;
  switch (rand) {
    case 0:
      return {
        status: LevelStatus.perfect,
        result: TestResults.MINIMUM_OPTIMAL_RESULT,
        paired: paired,
        time_spent: 5
      };
    case 1:
      return {
        status: LevelStatus.attempted,
        result: TestResults.LEVEL_STARTED,
        paired: paired,
        time_spent: 3
      };
    default:
      return {
        status: LevelStatus.not_tried,
        result: TestResults.NO_TESTS_RUN,
        paired: paired,
        time_spent: 0
      };
  }
}

const scriptData = {
  id: 97,
  csf: true,
  hasStandards: true,
  title: 'Course A (2020)',
  path: '//localhost-studio.code.org:3000/s/coursea-2020',
  stages: [
    {
      script_id: 97,
      script_name: 'coursea-2020',
      num_script_lessons: 12,
      id: 722,
      position: 1,
      relative_position: 1,
      name: 'Safety in My Online Neighborhood',
      key: 'Safety in My Online Neighborhood',
      assessment: null,
      title: 'Lesson 1: Safety in My Online Neighborhood',
      lesson_group_display_name: 'Digital Citizenship',
      lockable: false,
      levels: [
        {
          id: 16231,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/1/puzzle/1',
          kind: 'puzzle',
          icon: 'fa-file-text',
          isUnplugged: true,
          levelNumber: 1,
          isConceptLevel: true,
          bonus: null
        }
      ],
      description_student: 'Learn how to go places safely online.',
      description_teacher:
        '{: style="padding:10px 0"}This lesson was originally created by .The power of the internet allows students to experience and visit places they might not be able to see in person. But, just like traveling in the real world, it\'s important to be safe when traveling online. On this virtual field trip, kids can practice staying safe on online adventures.',
      unplugged: true,
      lesson_plan_html_url: 'https://curriculum.code.org/csf-20/coursea/1',
      lesson_plan_pdf_url:
        '//localhost.code.org:3000/curriculum/coursea-2020/1/Teacher.pdf',
      lesson_extras_level_url:
        'http://localhost-studio.code.org:3000/s/coursea-2020/stage/1/extras'
    },
    {
      script_id: 97,
      script_name: 'coursea-2020',
      num_script_lessons: 12,
      id: 723,
      position: 2,
      relative_position: 2,
      name: 'Learn to Drag and Drop',
      key: 'Learn to Drag and Drop',
      assessment: null,
      title: 'Lesson 2: Learn to Drag and Drop',
      lesson_group_display_name: 'Sequencing',
      lockable: false,
      levels: [
        {
          id: 21981,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/2/puzzle/1',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 1,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 21982,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/2/puzzle/2',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 2,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 21983,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/2/puzzle/3',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 3,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 21984,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/2/puzzle/4',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 4,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 21985,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/2/puzzle/5',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 5,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 21986,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/2/puzzle/6',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 6,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 21987,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/2/puzzle/7',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 7,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 21988,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/2/puzzle/8',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 8,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 21989,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/2/puzzle/9',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 9,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 21990,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/2/puzzle/10',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 10,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 21991,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/2/puzzle/11',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 11,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 21992,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/2/puzzle/12',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 12,
          isConceptLevel: false,
          bonus: null
        }
      ],
      description_student: 'Click and drag to finish the puzzles.',
      description_teacher:
        'This lesson will give students an idea of what to expect when they head to the computer lab. It begins with a brief discussion introducing them to computer lab manners, then they will progress into using a computer to complete online puzzles.',
      unplugged: false,
      lesson_plan_html_url: 'https://curriculum.code.org/csf-20/coursea/2',
      lesson_plan_pdf_url:
        '//localhost.code.org:3000/curriculum/coursea-2020/2/Teacher.pdf',
      lesson_extras_level_url:
        'http://localhost-studio.code.org:3000/s/coursea-2020/stage/2/extras'
    },
    {
      script_id: 97,
      script_name: 'coursea-2020',
      num_script_lessons: 12,
      id: 724,
      position: 3,
      relative_position: 3,
      name: 'Happy Maps',
      key: 'Programming: Happy Maps',
      assessment: null,
      title: 'Lesson 3: Happy Maps',
      lesson_group_display_name: 'Sequencing',
      lockable: false,
      levels: [
        {
          id: 17093,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/3/puzzle/1',
          kind: 'puzzle',
          icon: 'fa-file-text',
          isUnplugged: true,
          levelNumber: 1,
          isConceptLevel: true,
          bonus: null
        }
      ],
      description_student: 'Write instructions to get the Flurb to the fruit.',
      description_teacher:
        'This unplugged lesson brings together teams with a simple task: get the "flurb" to the fruit. Students will practice writing precise instructions as they work to translate instructions into the symbols provided. If problems arise in the code, students should also work together to recognize bugs and build solutions.',
      unplugged: true,
      lesson_plan_html_url: 'https://curriculum.code.org/csf-20/coursea/3',
      lesson_plan_pdf_url:
        '//localhost.code.org:3000/curriculum/coursea-2020/3/Teacher.pdf',
      lesson_extras_level_url:
        'http://localhost-studio.code.org:3000/s/coursea-2020/stage/3/extras'
    },
    {
      script_id: 97,
      script_name: 'coursea-2020',
      num_script_lessons: 12,
      id: 725,
      position: 4,
      relative_position: 4,
      name: 'Sequencing with Scrat',
      key: 'Sequencing with Scrat',
      assessment: null,
      title: 'Lesson 4: Sequencing with Scrat',
      lesson_group_display_name: 'Sequencing',
      lockable: false,
      levels: [
        {
          id: 11092,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/4/puzzle/1',
          progression: 'Maze Intro: Programming with Blocks',
          progressionDisplayName: 'Maze Intro: Programming with Blocks',
          kind: 'puzzle',
          icon: 'fa-video-camera',
          isUnplugged: false,
          levelNumber: 1,
          isConceptLevel: true,
          bonus: null
        },
        {
          id: 11472,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/4/puzzle/2',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 2,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11475,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/4/puzzle/3',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 3,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11478,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/4/puzzle/4',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 4,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11481,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/4/puzzle/5',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 5,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11484,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/4/puzzle/6',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 6,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11487,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/4/puzzle/7',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 7,
          isConceptLevel: false,
          bonus: null
        }
      ],
      description_student: 'Program Scrat to reach the acorn.',
      description_teacher:
        'Using Scrat from the Ice Age franchise, students will develop sequential algorithms to move a squirrel character from one side of a maze to the acorn at the other side. To do this they will stack code blocks together in a linear sequence.',
      unplugged: false,
      lesson_plan_html_url: 'https://curriculum.code.org/csf-20/coursea/4',
      lesson_plan_pdf_url:
        '//localhost.code.org:3000/curriculum/coursea-2020/4/Teacher.pdf',
      lesson_extras_level_url:
        'http://localhost-studio.code.org:3000/s/coursea-2020/stage/4/extras'
    },
    {
      script_id: 97,
      script_name: 'coursea-2020',
      num_script_lessons: 12,
      id: 726,
      position: 5,
      relative_position: 5,
      name: 'Programming with Scrat',
      key: 'Programming in Ice Age',
      assessment: null,
      title: 'Lesson 5: Programming with Scrat',
      lesson_group_display_name: 'Sequencing',
      lockable: false,
      levels: [
        {
          id: 14439,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/5/puzzle/1',
          progression: 'Pair Programming',
          progressionDisplayName: 'Pair Programming',
          kind: 'puzzle',
          icon: 'fa-video-camera',
          isUnplugged: false,
          levelNumber: 1,
          isConceptLevel: true,
          bonus: null
        },
        {
          id: 11650,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/5/puzzle/2',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 2,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11660,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/5/puzzle/3',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 3,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11664,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/5/puzzle/4',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 4,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11668,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/5/puzzle/5',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 5,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11099,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/5/puzzle/6',
          progression: 'Debugging with the Step Button',
          progressionDisplayName: 'Debugging with the Step Button',
          kind: 'puzzle',
          icon: 'fa-video-camera',
          isUnplugged: false,
          levelNumber: 6,
          isConceptLevel: true,
          bonus: null
        },
        {
          id: 11672,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/5/puzzle/7',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 7,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11676,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/5/puzzle/8',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 8,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11680,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/5/puzzle/9',
          progression: 'Challenge',
          progressionDisplayName: 'Challenge',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 9,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11637,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/5/puzzle/10',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 10,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11643,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/5/puzzle/11',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 11,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11647,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/5/puzzle/12',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 12,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11687,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/5/extras?level_name=courseB_maze_seq_challenge1_2020',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 13,
          isConceptLevel: false,
          bonus: true
        },
        {
          id: 11691,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/5/extras?level_name=courseB_maze_seq_challenge2_2020',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 14,
          isConceptLevel: false,
          bonus: true
        }
      ],
      description_student: 'Write programs to help Scrat reach the acorn.',
      description_teacher:
        'Using characters from the Ice Age, students will develop sequential algorithms to move Scrat from one side of a maze to the acorn at the other side. To do this they will stack code blocks together in a linear sequence, making them move straight, turn left, or turn right.',
      unplugged: false,
      lesson_plan_html_url: 'https://curriculum.code.org/csf-20/coursea/5',
      lesson_plan_pdf_url:
        '//localhost.code.org:3000/curriculum/coursea-2020/5/Teacher.pdf',
      lesson_extras_level_url:
        'http://localhost-studio.code.org:3000/s/coursea-2020/stage/5/extras'
    },
    {
      script_id: 97,
      script_name: 'coursea-2020',
      num_script_lessons: 12,
      id: 727,
      position: 6,
      relative_position: 6,
      name: 'Programming with Rey and BB-8',
      key: 'Programming with Rey and BB-8',
      assessment: null,
      title: 'Lesson 6: Programming with Rey and BB-8',
      lesson_group_display_name: 'Sequencing',
      lockable: false,
      levels: [
        {
          id: 10898,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/6/puzzle/1',
          progression: 'Programming with Rey and BB-8',
          progressionDisplayName: 'Programming with Rey and BB-8',
          kind: 'puzzle',
          icon: 'fa-video-camera',
          isUnplugged: false,
          levelNumber: 1,
          isConceptLevel: true,
          bonus: null
        },
        {
          id: 11761,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/6/puzzle/2',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 2,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11765,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/6/puzzle/3',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 3,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11769,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/6/puzzle/4',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 4,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11773,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/6/puzzle/5',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 5,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11777,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/6/puzzle/6',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 6,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11781,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/6/puzzle/7',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 7,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11785,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/6/puzzle/8',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 8,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11789,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/6/puzzle/9',
          progression: 'Challenge',
          progressionDisplayName: 'Challenge',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 9,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11793,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/6/puzzle/10',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 10,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11753,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/6/puzzle/11',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 11,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11757,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/6/puzzle/12',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 12,
          isConceptLevel: false,
          bonus: null
        }
      ],
      description_student: 'Help BB-8 collect the scrap metal.',
      description_teacher:
        'In this lesson, students will use their newfound programming skills in more complicated ways to navigate a tricky course with BB-8.',
      unplugged: false,
      lesson_plan_html_url: 'https://curriculum.code.org/csf-20/coursea/6',
      lesson_plan_pdf_url:
        '//localhost.code.org:3000/curriculum/coursea-2020/6/Teacher.pdf',
      lesson_extras_level_url:
        'http://localhost-studio.code.org:3000/s/coursea-2020/stage/6/extras'
    },
    {
      script_id: 97,
      script_name: 'coursea-2020',
      num_script_lessons: 12,
      id: 728,
      position: 7,
      relative_position: 7,
      name: 'Happy Loops',
      key: 'Loops: Happy Loops',
      assessment: null,
      title: 'Lesson 7: Happy Loops',
      lesson_group_display_name: 'Loops',
      lockable: false,
      levels: [
        {
          id: 17091,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/7/puzzle/1',
          kind: 'puzzle',
          icon: 'fa-file-text',
          isUnplugged: true,
          levelNumber: 1,
          isConceptLevel: true,
          bonus: null
        }
      ],
      description_student: 'Help the Flurb solve bigger problems using loops.',
      description_teacher:
        'This activity revisits Happy Maps. This time, student will be solving bigger, longer puzzles with their code, leading them to see utility in structures that let them write longer code in an easier way.',
      unplugged: true,
      lesson_plan_html_url: 'https://curriculum.code.org/csf-20/coursea/7',
      lesson_plan_pdf_url:
        '//localhost.code.org:3000/curriculum/coursea-2020/7/Teacher.pdf',
      lesson_extras_level_url:
        'http://localhost-studio.code.org:3000/s/coursea-2020/stage/7/extras'
    },
    {
      script_id: 97,
      script_name: 'coursea-2020',
      num_script_lessons: 12,
      id: 729,
      position: 8,
      relative_position: 8,
      name: 'Loops with Scrat',
      key: 'Loops in Ice Age',
      assessment: null,
      title: 'Lesson 8: Loops with Scrat',
      lesson_group_display_name: 'Loops',
      lockable: false,
      levels: [
        {
          id: 11607,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/8/puzzle/1',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 1,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11610,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/8/puzzle/2',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 2,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11632,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/8/puzzle/3',
          progression: 'Ice Age Loops',
          progressionDisplayName: 'Ice Age Loops',
          kind: 'puzzle',
          icon: 'fa-video-camera',
          isUnplugged: false,
          levelNumber: 3,
          isConceptLevel: true,
          bonus: null
        },
        {
          id: 11613,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/8/puzzle/4',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 4,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11616,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/8/puzzle/5',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 5,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11620,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/8/puzzle/6',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 6,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11623,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/8/puzzle/7',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 7,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11626,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/8/puzzle/8',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 8,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11629,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/8/puzzle/9',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 9,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11598,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/8/puzzle/10',
          progression: 'Challenge',
          progressionDisplayName: 'Challenge',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 10,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11601,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/8/puzzle/11',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 11,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11605,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/8/puzzle/12',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 12,
          isConceptLevel: false,
          bonus: null
        }
      ],
      description_student: 'Help Scrat cover more ground using loops.',
      description_teacher:
        'Building on the concept of repeating instructions from "Happy Loops," this stage will have students using loops to get to the acorn more efficiently on Code.org.',
      unplugged: false,
      lesson_plan_html_url: 'https://curriculum.code.org/csf-20/coursea/8',
      lesson_plan_pdf_url:
        '//localhost.code.org:3000/curriculum/coursea-2020/8/Teacher.pdf',
      lesson_extras_level_url:
        'http://localhost-studio.code.org:3000/s/coursea-2020/stage/8/extras'
    },
    {
      script_id: 97,
      script_name: 'coursea-2020',
      num_script_lessons: 12,
      id: 730,
      position: 9,
      relative_position: 9,
      name: 'Loops with Laurel',
      key: 'Loops in Collector',
      assessment: null,
      title: 'Lesson 9: Loops with Laurel',
      lesson_group_display_name: 'Loops',
      lockable: false,
      levels: [
        {
          id: 11096,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/puzzle/1',
          progression: 'The Collector',
          progressionDisplayName: 'The Collector',
          kind: 'puzzle',
          icon: 'fa-video-camera',
          isUnplugged: false,
          levelNumber: 1,
          isConceptLevel: true,
          bonus: null
        },
        {
          id: 11191,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/puzzle/2',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 2,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11195,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/puzzle/3',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 3,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11456,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/puzzle/4',
          progression: 'Using the Repeat Block',
          progressionDisplayName: 'Using the Repeat Block',
          kind: 'puzzle',
          icon: 'fa-video-camera',
          isUnplugged: false,
          levelNumber: 4,
          isConceptLevel: true,
          bonus: null
        },
        {
          id: 11199,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/puzzle/5',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 5,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11204,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/puzzle/6',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 6,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11208,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/puzzle/7',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 7,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11212,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/puzzle/8',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 8,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11216,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/puzzle/9',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 9,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11220,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/puzzle/10',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 10,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11224,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/puzzle/11',
          progression: 'Challenge',
          progressionDisplayName: 'Challenge',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 11,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11179,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/puzzle/12',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 12,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11183,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/puzzle/13',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 13,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11188,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/puzzle/14',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 14,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11233,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/extras?level_name=courseA_collector_loops_challenge2kp_2020',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 15,
          isConceptLevel: false,
          bonus: true
        },
        {
          id: 11228,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/extras?level_name=courseA_collector_loops_challenge1_2020',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 16,
          isConceptLevel: false,
          bonus: true
        }
      ],
      description_student:
        'Help Laurel the adventurer collect the treasure underground.',
      description_teacher:
        'In this lesson, students continue learning the concept of loops. In the previous lesson, students were introduced to loops by moving through a maze and picking corn. Here, loops are used to collect treasure in open cave spaces.',
      unplugged: false,
      lesson_plan_html_url: 'https://curriculum.code.org/csf-20/coursea/9',
      lesson_plan_pdf_url:
        '//localhost.code.org:3000/curriculum/coursea-2020/9/Teacher.pdf',
      lesson_extras_level_url:
        'http://localhost-studio.code.org:3000/s/coursea-2020/stage/9/extras'
    },
    {
      script_id: 97,
      script_name: 'coursea-2020',
      num_script_lessons: 12,
      id: 731,
      position: 10,
      relative_position: 10,
      name: 'Ocean Scene with Loops',
      key: 'Ocean Scene with Loops',
      assessment: null,
      title: 'Lesson 10: Ocean Scene with Loops',
      lesson_group_display_name: 'Loops',
      lockable: false,
      levels: [
        {
          id: 11807,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/puzzle/1',
          progression: 'The Artist in Code Studio',
          progressionDisplayName: 'The Artist in Code Studio',
          kind: 'puzzle',
          icon: 'fa-video-camera',
          isUnplugged: false,
          levelNumber: 1,
          isConceptLevel: true,
          bonus: null
        },
        {
          id: 11116,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/puzzle/2',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 2,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11120,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/puzzle/3',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 3,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11124,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/puzzle/4',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 4,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11469,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/puzzle/5',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: 'fa-video-camera',
          isUnplugged: false,
          levelNumber: 5,
          isConceptLevel: true,
          bonus: null
        },
        {
          id: 11128,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/puzzle/6',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 6,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11132,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/puzzle/7',
          progression: 'Repeat Blocks with the Artist',
          progressionDisplayName: 'Repeat Blocks with the Artist',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 7,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11136,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/puzzle/8',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 8,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11140,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/puzzle/9',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 9,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11145,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/puzzle/10',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 10,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11149,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/puzzle/11',
          progression: 'Challenge',
          progressionDisplayName: 'Challenge',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 11,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11104,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/puzzle/12',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 12,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11108,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/puzzle/13',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 13,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11113,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/puzzle/14',
          progression: 'Free Play',
          progressionDisplayName: 'Free Play',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 14,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11158,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/extras?level_name=courseA_artist_loops_challenge2a_2020',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 15,
          isConceptLevel: false,
          bonus: true
        },
        {
          id: 11153,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/extras?level_name=courseA_artist_loops_challenge1_2020',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 16,
          isConceptLevel: false,
          bonus: true
        }
      ],
      description_student: 'Use loops and patterns to finish the images.',
      description_teacher:
        'Returning to loops, students learn to draw images by looping simple sequences of instructions. In the previous plugged lesson, loops were used to traverse a maze and collect treasure. Here, loops are creating patterns. At the end of this stage, students will be given the opportunity to create their own images using loops.',
      unplugged: false,
      lesson_plan_html_url: 'https://curriculum.code.org/csf-20/coursea/10',
      lesson_plan_pdf_url:
        '//localhost.code.org:3000/curriculum/coursea-2020/10/Teacher.pdf',
      lesson_extras_level_url:
        'http://localhost-studio.code.org:3000/s/coursea-2020/stage/10/extras'
    },
    {
      script_id: 97,
      script_name: 'coursea-2020',
      num_script_lessons: 12,
      id: 732,
      position: 11,
      relative_position: 11,
      name: 'The Big Event Jr.',
      key: 'Events: The Big Event',
      assessment: null,
      title: 'Lesson 11: The Big Event Jr.',
      lesson_group_display_name: 'Events',
      lockable: false,
      levels: [
        {
          id: 15606,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/11/puzzle/1',
          kind: 'puzzle',
          icon: 'fa-file-text',
          isUnplugged: true,
          levelNumber: 1,
          isConceptLevel: true,
          bonus: null
        }
      ],
      description_student:
        'Move and shout when your teachers presses buttons on a giant remote.',
      description_teacher:
        'Events are a great way to add variety to a pre-written algorithm. Sometimes you want your program to be able to respond to the user exactly when the user wants it to. That is what events are for.',
      unplugged: true,
      lesson_plan_html_url: 'https://curriculum.code.org/csf-20/coursea/11',
      lesson_plan_pdf_url:
        '//localhost.code.org:3000/curriculum/coursea-2020/11/Teacher.pdf',
      lesson_extras_level_url:
        'http://localhost-studio.code.org:3000/s/coursea-2020/stage/11/extras'
    },
    {
      script_id: 97,
      script_name: 'coursea-2020',
      num_script_lessons: 12,
      id: 733,
      position: 12,
      relative_position: 12,
      name: 'On the Move with Events',
      key: 'Events in Play Lab',
      assessment: null,
      title: 'Lesson 12: On the Move with Events',
      lesson_group_display_name: 'Events',
      lockable: false,
      levels: [
        {
          id: 11465,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/12/puzzle/1',
          progression: 'Create a Story',
          progressionDisplayName: 'Create a Story',
          kind: 'puzzle',
          icon: 'fa-video-camera',
          isUnplugged: false,
          levelNumber: 1,
          isConceptLevel: true,
          bonus: null
        },
        {
          id: 11411,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/12/puzzle/2',
          progression: 'Free Play',
          progressionDisplayName: 'Free Play',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 2,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11415,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/12/puzzle/3',
          progression: 'Practice',
          progressionDisplayName: 'Practice',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 3,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11419,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/12/puzzle/4',
          progression: 'Mini-project: Jorge the Dog',
          progressionDisplayName: 'Mini-project: Jorge the Dog',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 4,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11423,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/12/puzzle/5',
          progression: 'Mini-project: Jorge the Dog',
          progressionDisplayName: 'Mini-project: Jorge the Dog',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 5,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11427,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/12/puzzle/6',
          progression: 'Mini-project: Jorge the Dog',
          progressionDisplayName: 'Mini-project: Jorge the Dog',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 6,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11431,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/12/puzzle/7',
          progression: 'Mini-project: Jorge the Dog',
          progressionDisplayName: 'Mini-project: Jorge the Dog',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 7,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11435,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/12/puzzle/8',
          progression: 'Mini-project: Jorge the Dog',
          progressionDisplayName: 'Mini-project: Jorge the Dog',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 8,
          isConceptLevel: false,
          bonus: null
        },
        {
          id: 11445,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/12/extras?level_name=courseA_playlab_events_challenge2_2020',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 9,
          isConceptLevel: false,
          bonus: true
        },
        {
          id: 11440,
          url:
            'http://localhost-studio.code.org:3000/s/coursea-2020/stage/12/extras?level_name=courseA_playlab_events_challenge1_2020',
          kind: 'puzzle',
          icon: null,
          isUnplugged: false,
          levelNumber: 10,
          isConceptLevel: false,
          bonus: true
        }
      ],
      description_student: 'Create your own game or story.',
      description_teacher:
        "In this online activity, students will have the opportunity to learn how to use events in Play Lab and to apply all of the coding skills they've learned to create an animated game. It's time to get creative and make a story in the Play Lab!",
      unplugged: false,
      lesson_plan_html_url: 'https://curriculum.code.org/csf-20/coursea/12',
      lesson_plan_pdf_url:
        '//localhost.code.org:3000/curriculum/coursea-2020/12/Teacher.pdf',
      lesson_extras_level_url:
        'http://localhost-studio.code.org:3000/s/coursea-2020/stage/12/extras'
    }
  ],
  family_name: 'coursea',
  version_year: '2020',
  name: 'coursea-2020'
};
