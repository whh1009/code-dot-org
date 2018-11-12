import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { SignInState } from '@cdo/apps/code-studio/progressRedux';
import ShareAllowedDialog from './ShareAllowedDialog';
import ShareDisallowedDialog from './ShareDisallowedDialog';

class ShareDialog extends Component {
  static propTypes = {
    signInState: PropTypes.oneOf(Object.values(SignInState)),
    isProjectLevel: PropTypes.bool.isRequired,
    isDance: PropTypes.bool,
    // Only applicable to Dance Party projects, used to Tweet at song artist.
    selectedSong: PropTypes.string,
  };

  render() {
    const { signInState, isProjectLevel, isDance, ...otherProps } = this.props;
    // If we're on a project level (i.e. /projects/appname), always show signed
    // in version of the dialog

    if (signInState === SignInState.SignedIn || isProjectLevel || isDance) {
      return (
        <ShareAllowedDialog {...otherProps}/>
      );
    }

    return <ShareDisallowedDialog/>;
  }
}

export const UnconnectedShareDialog = ShareDialog;

export default connect(state => ({
  signInState: state.progress.signInState,
}))(ShareDialog);
