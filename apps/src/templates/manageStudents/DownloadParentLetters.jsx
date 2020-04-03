import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import ReactTooltip from 'react-tooltip';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';

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
            text="Download parent letters"
          />
        </span>
        <ReactTooltip
          id="download-letter"
          role="tooltip"
          effect="solid"
          delayShow={500}
        >
          <div>
            Download parent letters for all {this.props.numStudents} students in
            this section
          </div>
        </ReactTooltip>
        <BaseDialog
          useUpdatedStyles
          isOpen={this.state.isDialogOpen}
          style={styles.dialog}
          handleClose={this.closeDialog}
        >
          <h2>Parent letter for [section name]</h2>
          <div>
            Download a PDF letter to send to parents. The letter will include
            information about Code.org and how Code.org protects student
            privacy, plus tips for how parents can stay involved in their
            student’s computer science education.
          </div>
          <br />
          {LOGIN_TYPES_WITH_INDIVIDUAL_LETTERS_OPTION.includes(
            this.props.loginType
          ) && (
            <div>
              <strong>
                Do you want to include individual student login instructions
                (username and password) in the letter so students can sign in at
                home?
              </strong>
              <div>
                <input
                  style={styles.radioInput}
                  type="radio"
                  id={INDIVIDUAL}
                  checked={this.props.letterType === INDIVIDUAL}
                  onChange={this.onRadioChange}
                />
                <label htmlFor={INDIVIDUAL} style={styles.radioLabel}>
                  <strong>
                    Yes, include individualized login instructions for each
                    student
                  </strong>
                  <br />
                  This will download one letter per student as a .zip file.
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
                  <strong>
                    No, create one generic letter for all students
                  </strong>
                  <br />
                  This will download a single letter.
                </label>
              </div>
            </div>
          )}
          <DialogFooter rightAlign>
            <Button
              __useDeprecatedTag
              text="Download letter"
              onClick={this.download}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}
