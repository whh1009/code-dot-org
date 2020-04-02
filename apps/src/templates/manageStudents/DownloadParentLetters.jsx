import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import ReactTooltip from 'react-tooltip';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';

const DIALOG_WIDTH = 800;

const styles = {
  button: {
    marginLeft: 'auto'
  },
  dialog: {
    padding: 20,
    width: DIALOG_WIDTH,
    marginLeft: -(DIALOG_WIDTH / 2)
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
