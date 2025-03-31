import { fetchUserSettings } from '../backend/api';
import { UserSettings } from '../model/UserSettings';

let userSetttings: UserSettings | undefined;

export const getUserSettings = async (): Promise<UserSettings> => {
  if (!userSetttings) {
    const fetchedSettings = await fetchUserSettings();
    if (fetchedSettings !== null) {
      userSetttings = fetchedSettings;
    }
  }
  if (!userSetttings) {
    throw new Error('User settings have not been initialized.');
  }
  return userSetttings;
};

export const setUserSettings = (settings: UserSettings): void => {
  userSetttings = settings;
};
