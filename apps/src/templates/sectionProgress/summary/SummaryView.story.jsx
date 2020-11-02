import React from 'react';
import SummaryViewStory from './SummaryViewStory';
import {Provider} from 'react-redux';
import {createStore} from '../sectionProgressTestHelpers';

export default storybook => {
  const store = createStore();
  storybook.storiesOf('SectionProgress/SummaryView', module).addStoryTable([
    {
      name: 'SummaryView',
      story: () => {
        return (
          <div className="main" style={{width: 970, display: 'block'}}>
            <Provider store={store}>
              <SummaryViewStory />
            </Provider>
          </div>
        );
      }
    }
  ]);
};
