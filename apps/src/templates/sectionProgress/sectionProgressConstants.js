import PropTypes from 'prop-types';

/**
 * Shape for scriptData
 * The data we get from the server's call to script.summarize. The format
 * ends up being similar to that which we send to initProgress in progressRedux.
 * The important part is scriptData.stages, which gets used by levelsWithLesson
 */
export const scriptDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  csf: PropTypes.bool,
  hasStandards: PropTypes.bool,
  title: PropTypes.string,
  path: PropTypes.string,
  stages: PropTypes.arrayOf(
    PropTypes.shape({
      levels: PropTypes.arrayOf(PropTypes.object).isRequired
    })
  ),
  family_name: PropTypes.string,
  version_year: PropTypes.string,
  name: PropTypes.string
});

// Types of views of the progress tab
export const ViewType = {
  SUMMARY: 'summary', // lessons
  DETAIL: 'detail', // levels
  STANDARDS: 'standards'
};

export const tooltipIdForStudent = studentId =>
  `tooltipIdForStudent${studentId}`;

export const scrollbarWidth = getScrollbarWidth();

function getScrollbarWidth() {
  // Creating invisible container
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll'; // forcing scrollbar to appear
  outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
  document.body.appendChild(outer);

  // Creating inner element and placing it in the container
  const inner = document.createElement('div');
  outer.appendChild(inner);

  // Calculating difference between container's full width and the child width
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

  // Removing temporary elements from the DOM
  outer.parentNode.removeChild(outer);

  return scrollbarWidth;
}
