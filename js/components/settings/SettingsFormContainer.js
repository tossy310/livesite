import { connect } from 'react-redux';

import * as actions from '../../actions/index';
import SettingsForm from './SettingsForm';

const mapStateToProps = ({ settings }) => ({ settings });

const mapDispatchToProps = (dispatch) => ({
  toggleSetting(name) {
    dispatch(actions.toggleSetting(name));
  },
});

const SettingsFormContainer =
  connect(mapStateToProps, mapDispatchToProps)(SettingsForm);

export default SettingsFormContainer;