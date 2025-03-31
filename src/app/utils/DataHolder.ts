import { fetchUserSettings } from '../backend/api';
import { UserSettings } from '../model/UserSettings';

export let userSettingsHolder: UserSettings | null = null; // Use `null` to explicitly indicate uninitialized state

export const getHolderUserSettings = async (): Promise<UserSettings> => {
  // Return cached settings if already loaded
  if (userSettingsHolder) {
    return userSettingsHolder;
  }

  // Check localStorage for cached settings
  const cachedSettings = localStorage.getItem('userSettings');
  if (cachedSettings) {
    userSettingsHolder = JSON.parse(cachedSettings);
    if (userSettingsHolder) {
      return userSettingsHolder; // Return cached settings if available
    }
  }

  // Fetch settings from the backend if not cached
  const fetchedSettings = await fetchUserSettings();
  if (fetchedSettings) {
    userSettingsHolder = fetchedSettings;
    localStorage.setItem('userSettings', JSON.stringify(userSettingsHolder)); // Cache the settings
    return userSettingsHolder;
  }

  // Throw an error if settings cannot be fetched
  throw new Error('Failed to fetch user settings.');
};

export const setHolderUserSettings = (settings: UserSettings): void => {
  userSettingsHolder = settings; // Update in-memory cache
  localStorage.setItem('userSettings', JSON.stringify(settings)); // Update localStorage cache
};

export const clearHolderUserSettings = (): void => {
  userSettingsHolder = null; // Clear in-memory cache
  localStorage.removeItem('userSettings'); // Clear localStorage cache
};
