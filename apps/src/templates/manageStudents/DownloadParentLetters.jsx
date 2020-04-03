import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import ReactTooltip from 'react-tooltip';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';

const INDIVIDUAL = 'individual';

const GENERIC = 'generic';

const styles = {
  button: {
    marginLeft: 'auto'
  },
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  radioLabel: {
    display: 'inline-block'
  },
  radioInput: {
    height: 18,
    verticalAlign: 'middle'
  }
};

const LOGIN_TYPES_WITH_INDIVIDUAL_LETTERS_OPTION = [
  SectionLoginType.word,
  SectionLoginType.picture
];

export default class DownloadParentLetters extends Component {
  static propTypes = {
    numStudents: PropTypes.number.isRequired,
    letterType: PropTypes.string,
    onLetterTypeChanged: PropTypes.func.isRequired,
    loginType: PropTypes.string.isRequired
  };

  state = {
    isDialogOpen: false
  };

  openDialog = () => {
    this.setState({isDialogOpen: true});
  };

  closeDialog = () => {
    this.setState({isDialogOpen: false});
  };

  download = () => {
    this.setState({isDialogOpen: false});
  };

  onRadioChange = ({target}) => {
    this.props.onLetterTypeChanged(target.id);
  };

  render() {
    return (
      <div style={styles.button}>
        <span data-tip="" data-for="download-letter">
          <Button
            __useDeprecatedTag
            onClick={this.openDialog}
            color={Button.ButtonColor.gray}
            text={i18n.downloadParentLetter()}
            icon="file-text"
          />
        </span>
        <ReactTooltip
          id="download-letter"
          role="tooltip"
          effect="solid"
          delayShow={500}
        >
          <div>
            {i18n.downloadParentLetterTooltip({
              numStudents: this.props.numStudents
            })}
          </div>
        </ReactTooltip>
        <BaseDialog
          useUpdatedStyles
          isOpen={this.state.isDialogOpen}
          style={styles.dialog}
          handleClose={this.closeDialog}
        >
          <h2>{i18n.parentLetterDialogTitle({sectionName: '*******'})}</h2>
          <div>{i18n.parentLetterDialogDescription()}</div>
          <br />
          {LOGIN_TYPES_WITH_INDIVIDUAL_LETTERS_OPTION.includes(
            this.props.loginType
          ) && (
            <div>
              <strong>{i18n.parentLetterDialogQuestion()}</strong>
              <div>
                <input
                  style={styles.radioInput}
                  type="radio"
                  id={INDIVIDUAL}
                  checked={this.props.letterType === INDIVIDUAL}
                  onChange={this.onRadioChange}
                />
                <label htmlFor={INDIVIDUAL} style={styles.radioLabel}>
                  <strong>{i18n.parentLetterDialogQ1Main()}</strong>
                  <br />
                  {i18n.parentLetterDialogQ1Detail()}
                </label>
              </div>
              <div>
                <input
                  style={styles.radioInput}
                  type="radio"
                  id={GENERIC}
                  checked={this.props.letterType === GENERIC}
                  onChange={this.onRadioChange}
                />
                <label htmlFor={GENERIC} style={styles.radioLabel}>
                  <strong>{i18n.parentLetterDialogQ2Main()}</strong>
                  <br />
                  {i18n.parentLetterDialogQ2Detail()}
                </label>
              </div>
            </div>
          )}
          <DialogFooter rightAlign>
            <Button
              __useDeprecatedTag
              text={i18n.parentLetterDialogButton()}
              onClick={this.download}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}
