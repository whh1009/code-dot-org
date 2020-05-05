import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';

const styles = {
  header: {
    color: color.teal,
    fontSize: 20,
    fontWeight: 900,
    marginTop: 15,
    marginBottom: 15,
    textAlign: 'left',
    lineHeight: '25px'
  },
  content: {
    marginTop: 20,
    marginBottom: 10,
    marginRight: 20,
    color: color.charcoal,
    whiteSpace: 'normal',
    textAlign: 'left'
  }
};

/**
 * Confirmation dialog for when unlocking a hidden assessment or an assessment in a hidden unit
 */
export default class UnlockHiddenAssessmentDialog extends Component {
  static propTypes = {
    assessmentHidden: PropTypes.bool,
    unitHidden: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired
  };

  render() {
    const {assessmentHidden, unitHidden, onClose, onConfirm} = this.props;
    if (!(assessmentHidden || unitHidden)) {
      return null;
    }

    const header = unitHidden
      ? 'This assessment is part of a unit that is currently hidden from the section'
      : 'This assessment is currently hidden from the section';
    const content = unitHidden
      ? 'Are you sure you want to unlock this assessment and make the unit visible?'
      : 'Are you sure you want to unlock this assessment and make it visible?';

    return (
      <BaseDialog isOpen={true} handleClose={onClose}>
        <div style={styles.header}>{header}</div>
        <div style={styles.content}>{content}</div>
        <div style={{textAlign: 'right'}}>
          <Button
            text={i18n.dialogCancel()}
            onClick={onClose}
            color={Button.ButtonColor.gray}
          />
          <Button
            id="confirm-unhide"
            text={i18n.unhideUnitAndAssign()}
            style={{marginLeft: 5}}
            onClick={onConfirm}
            color={Button.ButtonColor.orange}
          />
        </div>
      </BaseDialog>
    );
  }
}
