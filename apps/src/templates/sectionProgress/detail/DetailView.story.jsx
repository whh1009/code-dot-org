import React from 'react';
import DetailView from './DetailView';
import {Provider} from 'react-redux';
import {createStore} from '../sectionProgressTestHelpers';

export default storybook => {
  const store = createStore();
  storybook
    .storiesOf('SectionProgress/VirtualizedDetailView', module)
    .addStoryTable([
      {
        name: 'test',
        story: () => {
          console.log('here');
          return (
            <Provider store={store}>
              <DetailView />
            </Provider>
          );
        }
      }
    ]);
};
