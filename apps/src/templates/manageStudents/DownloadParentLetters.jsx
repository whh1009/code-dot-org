import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import ReactTooltip from 'react-tooltip';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';

const styles = {
  button: {
    marginLeft: 'auto'
  },
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  }
};

export default class DownloadParentLetters extends Component {
  static propTypes = {
    numStudents: PropTypes.number.isRequired
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
    console.log('downloading!');
    this.setState({isDialogOpen: false});
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
          <div>
            <strong>
              Do you want to include individual student login instructions
              (username and password) in the letter so students can sign in at
              home?
            </strong>
          </div>
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
