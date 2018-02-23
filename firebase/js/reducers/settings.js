import applyPartialUpdate from 'react-addons-update';

const updateSettings = (settings) => {
  if (settings.version === undefined) {
    const serialized = localStorage.getItem('settings');
    if (serialized) {
      try {
        settings = JSON.parse(serialized);
      } catch (e) {}
    }
    if (settings.version === undefined) {
      settings = { version: 0 };
    }
  }
  if (settings.version < 1) {
    settings = applyPartialUpdate(
      settings,
      {
        version: {$set: 1},
        pinnedTeamIds: {$set: []},
      }
    );
  }
  if (settings.version < 2) {
    settings = applyPartialUpdate(
      settings,
      {
        version: {$set: 2},
        invertColor: {$set: false},
        autoscroll: {$set: false},
      }
    );
  }
  return settings;
};

const settings = (settings = {}, action) => {
  settings = updateSettings(settings);
  if (action.type == 'UPDATE_SETTINGS') {
    settings = applyPartialUpdate(settings, action.settingsUpdate);
  }
  return settings;
};

export default settings;