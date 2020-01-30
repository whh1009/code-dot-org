import _ from 'lodash';
import {navigateToHref} from '@cdo/apps/utils';
import {TeacherDashboardPath} from '@cdo/apps/templates/teacherDashboard/TeacherDashboardNavigation';
import firehoseClient from '../../lib/util/firehose';

export const switchToSection = (toSectionId, fromSectionId) => {
  const baseUrl = `/teacher_dashboard/sections/${toSectionId}/`;
  const currentTab = _.last(_.split(window.location.pathname, '/'));
  const teacherNavigationTabs = _.values(TeacherDashboardPath);
  const sectionUrl = _.includes(teacherNavigationTabs, `/${currentTab}`)
    ? baseUrl.concat(currentTab)
    : baseUrl;
  navigateToHref(sectionUrl);
};

export const recordSwitchToSection = (toSectionId, fromSectionId, studyGroup) => {
  console.log(`recording switching from ${fromSectionId} to ${toSectionId} for ${studyGroup}`)
  firehoseClient.putRecord(
    {
      study: 'teacher_dashboard_actions',
      study_group: studyGroup,
      event: 'change_section',
      data_json: JSON.stringify({
        section_id: fromSectionId,
        old_section_id: fromSectionId,
        new_section_id: toSectionId
      })
    },
    {includeUserId: true}
  );
}

export const recordOpenEditSectionDetails = (sectionId, studyGroup) => {
   console.log(`recording opening edit section details for ${sectionId} for study group ${studyGroup}`)
   firehoseClient.putRecord(
     {
       study: 'teacher_dashboard_actions',
       study_group: studyGroup,
       event:'open_edit_section_dashboard_header',
       data_json: JSON.stringify({
         section_id: sectionId
       })
     },
     {includeUserId: true}
   )
}
