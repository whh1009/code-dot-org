import {SET_SECTION} from '@cdo/apps/redux/sectionDataRedux';

 /**
 * Initial state of sectionAssessmentsRedux
 * The redux state matches the structure of our API calls and our views don't
 * use this structure directly. Selectors filter and transform data to what they need.
 *
 * assessmentResponsesByScript - object - keys are scriptIds, values are objects of
 *  student ids to student response data for each assessment
 * assessmentQuestionsByScript - object - keys are scriptIds, values are objects of
 *   assessmentIds to question and answer information for each assessment
 * surveysByScript - object - keys are scriptIds, values are objects of
 *   assessmentIds to survey questions and anonymous responses
 * isLoading - boolean - indicates that requests for assessments and surveys have been
 * sent to the server but the client has not yet received a response
 * assessmentId - int - the level_group id of the assessment currently in view
 */
const initialState = {
  assessmentResponsesByScript: {},
  assessmentQuestionsByScript: {},
  surveysByScript: {},
  isLoading: false,
  assessmentId: 0,
};

// Action type constants
const SET_ASSESSMENT_RESPONSES = 'sectionAssessments/SET_ASSESSMENT_RESPONSES';
const SET_ASSESSMENTS_QUESTIONS = 'sectionAssessments/SET_ASSESSMENTS_QUESTIONS';
const SET_SURVEYS = 'sectionAssessments/SET_SURVEYS';
const START_LOADING_ASSESSMENTS = 'sectionAssessments/START_LOADING_ASSESSMENTS';
const FINISH_LOADING_ASSESSMENTS = 'sectionAssessments/FINISH_LOADING_ASSESSMENTS';
const SET_ASSESSMENT_ID = 'sectionAssessments/SET_ASSESSMENT_ID';

// Action creators
export const setAssessmentResponses = (scriptId, assessments) =>
  ({ type: SET_ASSESSMENT_RESPONSES, scriptId, assessments});
export const setAssessmentQuestions = (scriptId, assessments) =>
  ({ type: SET_ASSESSMENTS_QUESTIONS, scriptId, assessments});
export const startLoadingAssessments = () => ({ type: START_LOADING_ASSESSMENTS });
export const finishLoadingAssessments = () => ({ type: FINISH_LOADING_ASSESSMENTS });
export const setAssessmentId = (assessmentId) => ({ type: SET_ASSESSMENT_ID, assessmentId: assessmentId });
export const setSurveys = (scriptId, surveys) => ({ type: SET_SURVEYS, scriptId, surveys });

export const asyncLoadAssessments = (sectionId, scriptId) => {
  return async (dispatch, getState) => {
    const state = getState().sectionAssessments;

    // Don't load data if it's already stored in redux.
    if (state.assessmentResponsesByScript[scriptId]) {
      return;
    }

    dispatch(startLoadingAssessments());

    const loadResponses = loadAssessmentResponsesFromServer(sectionId, scriptId);
    const loadQuestions = loadAssessmentQuestionsFromServer(scriptId);
    const loadSurveys = loadSurveysFromServer(sectionId, scriptId);
    const [responses, questions, surveys] = await Promise.all([loadResponses, loadQuestions, loadSurveys]);

    dispatch(setAssessmentResponses(scriptId, responses));
    dispatch(setAssessmentQuestions(scriptId, questions));
    dispatch(setSurveys(scriptId, surveys));

    dispatch(finishLoadingAssessments());
  };
};

export default function sectionAssessments(state=initialState, action) {
  if (action.type === SET_SECTION) {
    /**
     * Setting the section is the first action to be called when switching
     * sections, which requires us to reset our state. This might need to change
     * once switching sections is in react/redux.
     */
    return {
      ...initialState
    };
  }
  if (action.type === SET_ASSESSMENT_ID) {
    return {
      ...state,
      assessmentId: action.assessmentId,
    };
  }
  if (action.type === SET_ASSESSMENT_RESPONSES) {
    return {
      ...state,
      assessmentResponsesByScript: {
        ...state.assessmentResponsesByScript,
        [action.scriptId]: action.assessments
      }
    };
  }
  if (action.type === SET_SURVEYS) {
    return {
      ...state,
      surveysByScript: {
        ...state.surveysByScript,
        [action.scriptId]: action.surveys
      }
    };
  }
  if (action.type === SET_ASSESSMENTS_QUESTIONS) {
    return {
      ...state,
      assessmentQuestionsByScript: {
        ...state.assessmentQuestionsByScript,
        [action.scriptId]: action.assessments
      },
      // Default the assessmentId to the first assessment in the structure
      assessmentId: parseInt(Object.keys(action.assessments)[0]),
    };
  }
  if (action.type === START_LOADING_ASSESSMENTS) {
    return {
      ...state,
      isLoading: true
    };
  }
  if (action.type === FINISH_LOADING_ASSESSMENTS) {
    return {
      ...state,
      isLoading: false
    };
  }

  return state;
}

// Selector functions

// Returns an array of objects, each indicating an assessment name and it's id
// for the assessments and surveys in the current script.
export const getCurrentScriptAssessmentList = (state) => {
  const assessmentStructure = state.sectionAssessments.assessmentQuestionsByScript[state.scriptSelection.scriptId] || {};
  const assessments = Object.values(assessmentStructure).map(assessment => {
    return {
      id: assessment.id,
      name: assessment.name,
    };
  });

  const surveysStructure = state.sectionAssessments.surveysByScript[state.scriptSelection.scriptId] || {};
  const surveys = Object.keys(surveysStructure).map(surveyId => {
    return {
      id: parseInt(surveyId),
      name: surveysStructure[surveyId].stage_name,
    };
  });

  return assessments.concat(surveys);
};

// Get the student responses for assessments in the current script and current assessment
export const getAssessmentResponsesForCurrentScript = (state) => {
  return state.sectionAssessments.assessmentResponsesByScript[state.scriptSelection.scriptId] || {};
};

// Get the question structure for assessments in the current script and current assessment
export const getCurrentAssessmentQuestions = (state) => {
  const currentScriptData = state.sectionAssessments.assessmentQuestionsByScript[state.scriptSelection.scriptId]
    || {};
  return currentScriptData[state.sectionAssessments.assessmentId];
};

/**
 * Returns an array of objects, each of type questionStructurePropType
 * indicating the question and correct answers for each multiple choice
 * question in the currently selected assessment.
 */
export const getMultipleChoiceStructureForCurrentAssessment = (state) => {
  const assessmentsStructure = getCurrentAssessmentQuestions(state);
  if (!assessmentsStructure) {
    return [];
  }

  const questionData = assessmentsStructure.questions;

  // Transform that data into what we need for this particular table, in this case
  // questionStructurePropType structure.
  return questionData.filter(question => question.type === 'Multi').map(question => {
    return {
      id: question.level_id,
      question: question.question_text,
      correctAnswer: getCorrectAnswer(question.answers),
    };
  });
};

/**
 * Returns an array of objects, each of type studentAnswerDataPropType
 * indicating the student responses to multiple choice questions for the
 * currently selected assessment.
 */
export const getStudentMCResponsesForCurrentAssessment = (state) => {
  const studentResponses = getAssessmentResponsesForCurrentScript(state);
  if (!studentResponses) {
    return [];
  }

  const studentResponsesArray = Object.keys(studentResponses).map(studentId => {
    studentId = parseInt(studentId);
    const studentObject = studentResponses[studentId];
    const currentAssessmentId = state.sectionAssessments.assessmentId;
    const studentAssessment = studentObject.responses_by_assessment[currentAssessmentId];

    // If the student has not submitted this assessment, don't display results.
    if (!studentAssessment) {
      return;
    }

    // Transform that data into what we need for this particular table, in this case
    // is the structure studentAnswerDataPropType
    return {
      id: studentId,
      name: studentObject.student_name,
      studentResponses: studentAssessment.level_results.filter(answer => answer.status !== "free_response")
        .map(answer => {
          return {
            responses: answer.student_result || '',
            isCorrect: answer.status === 'correct',
          };
        })
    };
  }).filter(studentData => studentData);

  return studentResponsesArray;
};

/**
 * Returns an array of objects, each of type freeResponseQuestionsPropType
 * indicating the question and responses to free response questions for the
 * currently selected survey.
 */
export const getSurveyFreeResponseQuestions = (state) => {
  const surveysStructure = state.sectionAssessments.surveysByScript[state.scriptSelection.scriptId] || {};
  const currentSurvey = surveysStructure[state.sectionAssessments.assessmentId];
  if (!currentSurvey) {
    return [];
  }

  const questionData = currentSurvey.levelgroup_results;

  return questionData.filter(question => question.type === 'free_response').map(question => {
    return {
      questionText: question.question,
      answers: question.results.map((response, index) => {
        return {index: index, response: response.result};
      }),
    };
  });
};

/**
 * Returns an array of objects, each of type multipleChoiceSurveyDataPropType
 * indicating a multiple choice question and the percent of responses received
 * for each answer.
 */
export const getMultipleChoiceSurveyResults = (state) => {
  const surveysStructure = state.sectionAssessments.surveysByScript[state.scriptSelection.scriptId] || {};
  const currentSurvey = surveysStructure[state.sectionAssessments.assessmentId];
  if (!currentSurvey) {
    return [];
  }

  const questionData = currentSurvey.levelgroup_results;

  // Filter to multiple choice questions.
  return questionData.filter(question => question.type === 'multi').map((question, index) => {
    // Calculate the total responses for each answer.

    const totalAnswered = question.results.length;
    // Each value of answerTotals represents the number of responses received for
    // the answer in that index.
    const answerTotals = [];
    // Initialize each answer to 0 responses.
    for (let i = 0; i< question.answer_texts.length; i++) {
      answerTotals[i] = 0;
    }
    let notAnswered = 0;

    // For each response, add 1 to the correct value in answerTotals.
    for (let i = 0; i<totalAnswered; i++) {
      const answerIndex = question.results[i].answer_index;
      if (answerIndex >= 0) {
        answerTotals[answerIndex]++;
      } else {
        notAnswered++;
      }
    }

    // TODO(caleybrock): Make a better way to get letter options, here and below.
    return {
      id: index,
      question: question.question,
      answers: question.answer_texts.map((answer, index) => {
        return {
          multipleChoiceOption: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][index],
          percentAnswered: Math.floor((answerTotals[index]/totalAnswered) * 100),
        };
      }),
      notAnswered: Math.floor((notAnswered/totalAnswered) * 100),
    };
  });
};

/** Get data for students assessments multiple choice table
 * Returns an object, each of type studentOverviewDataPropType with
 * the value of the key being an object that contains the number
 * of multiple choice answered correctly by a student, total number
 * of multiple choice options, check for if the student submitted the
 * assessment and a timestamp that indicates when a student submitted
 * the assessment.
 */
export const getStudentsMCSummaryForCurrentAssessment = (state) => {
  const summaryOfStudentsMCData = getAssessmentResponsesForCurrentScript(state);
  if (!summaryOfStudentsMCData) {
    return [];
  }

  const studentsSummaryArray = Object.keys(summaryOfStudentsMCData).map(studentId => {
    studentId = parseInt(studentId);
    const studentsObject = summaryOfStudentsMCData[studentId];
    const currentAssessmentId = state.sectionAssessments.assessmentId;
    const studentsAssessment = studentsObject.responses_by_assessment[currentAssessmentId];

    // If the student has not submitted this assessment, don't display results.
    if (!studentsAssessment) {
      return;
    }
    // Transform that data into what we need for this particular table, in this case
    // it is the structure studentOverviewDataPropType
    return {
      id: studentId,
      name: studentsObject.student_name,
      numMultipleChoiceCorrect: studentsAssessment.multi_correct,
      numMultipleChoice: studentsAssessment.multi_count,
      isSubmitted: studentsAssessment.submitted,
      submissionTimeStamp: studentsAssessment.timestamp,
    };
  }).filter(studentOverviewData => studentOverviewData);

  return studentsSummaryArray;
};

// Helpers

/**
 * Takes in an array of objects {answerText: '', correct: true/false} and
 * returns the corresponding letters to the options with the correct answers.
 *
 * TODO(caleybrock): Add letter options to response from the server so they are
 * consistent with the structure, but for now look up letter in this array.
 * If this code is left client side, it needs tests.
 *
 * Ex - [{correct: false}, {correct: true}] --> returns 'B'
 */
const getCorrectAnswer = (answerArr) => {
  if (!answerArr) {
    return '';
  }

  const letterArr = ['A','B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const correctLetters = [];
  for (let i = 0; i < answerArr.length; i++) {
    if (answerArr[i].correct) {
      correctLetters.push(letterArr[i]);
    }
  }
  return correctLetters.join(', ');
};

// Requests to the server for assessment data

// Loads the assessment responses.
const loadAssessmentResponsesFromServer = (sectionId, scriptId) => {
  let payload = {section_id: sectionId};
  if (scriptId) {
    payload.script_id = scriptId;
  }
  return $.ajax({
    url: `/dashboardapi/assessments/section_responses`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8',
    data: payload
  });
};

// Loads the assessment question structure.
const loadAssessmentQuestionsFromServer = (scriptId) => {
  const payload = {script_id: scriptId};
  return $.ajax({
    url: `/dashboardapi/assessments`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8',
    data: payload,
  });
};

// Loads survey questions and anonymous responses.
const loadSurveysFromServer = (sectionId, scriptId) => {
  const payload = {script_id: scriptId, section_id: sectionId};
  return $.ajax({
    url: `/dashboardapi/assessments/section_surveys`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8',
    data: payload,
  });
};
