import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import ProgressTableDetailView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableDetailView';
import ProgressTableContainer from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableContainer';
import ProgressTableContentView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableContentView';
import ProgressTableDetailCell from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableDetailCell';
import ProgressTableLevelIcon from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLevelIcon';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
import {unitTestExports} from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLessonNumber';
import * as Sticky from 'reactabular-sticky';
import {createStore, combineReducers} from 'redux';
import progress from '@cdo/apps/code-studio/progressRedux';
import sectionData from '@cdo/apps/redux/sectionDataRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import scriptSelection from '@cdo/apps/redux/scriptSelectionRedux';
import locales from '@cdo/apps/redux/localesRedux';
import {fakeProgressTableReduxInitialState} from '@cdo/apps/templates/progress/progressTestHelpers';

const initialState = fakeProgressTableReduxInitialState();

const setUp = () => {
  const store = createStore(
    combineReducers({
      progress,
      sectionData,
      sectionProgress,
      scriptSelection,
      locales
    }),
    initialState
  );
  return mount(
    <Provider store={store}>
      <ProgressTableDetailView />
    </Provider>
  );
};

describe('ProgressTableDetailView', () => {
  it('renders the ProgressTableContainer', () => {
    const wrapper = setUp();
    expect(wrapper.find(ProgressTableContainer)).to.have.length(1);
  });

  it('renders ProgressTableDetailCells', () => {
    const wrapper = setUp();
    // 2 students * 2 lessons = 4
    expect(wrapper.find(ProgressTableDetailCell)).to.have.length(4);
  });

  it('renders header arrows', () => {
    const wrapper = setUp();
    // 1 arrow for LESSON_2 with 2 levels
    expect(wrapper.find(unitTestExports.LessonArrow)).to.have.length(1);
  });

  it('renders extra header rows', () => {
    const wrapper = setUp();
    // there are two tableHeaders, 1 for the student list, and 1 for the content view
    // both should have two rows
    const tableHeaders = wrapper.find(Sticky.Header);
    expect(tableHeaders.at(0).props().headerRows.length).to.equal(2);
    expect(tableHeaders.at(1).props().headerRows.length).to.equal(2);
  });

  it('formats extra header with ProgressTableLevelIcons in the content view', () => {
    const wrapper = setUp();
    const contentViewHeaders = wrapper
      .find(ProgressTableContentView)
      .find(Sticky.Header);
    // one ProgressTableLevelIcon for each of the 2 lessons
    expect(contentViewHeaders.find(ProgressTableLevelIcon)).to.have.length(2);
  });

  it('renders the ProgressLegend', () => {
    const wrapper = setUp();
    expect(wrapper.find(ProgressLegend)).to.have.length(1);
  });
});
