// import { fetchCategories, fetchUserSettings } from '../backend/api';
// import { Category } from '../model/Category';
// import { UserSettings } from '../model/UserSettings';

// export let userSettingsHolder: UserSettings | null = null; // Use `null` to explicitly indicate uninitialized state
// export let categoriesHolder: Category[] = [];

// export const getHolderUserSettings = async (): Promise<UserSettings> => {
//   // Return cached settings if already loaded
//   if (userSettingsHolder) {
//     return userSettingsHolder;
//   }

//   // Fetch settings from the backend if not cached
//   const fetchedSettings = await fetchUserSettings();
//   if (fetchedSettings) {
//     userSettingsHolder = fetchedSettings;
//     localStorage.setItem('userSettings', JSON.stringify(userSettingsHolder)); // Cache the settings
//     return userSettingsHolder;
//   }

//   // Throw an error if settings cannot be fetched
//   throw new Error('Failed to fetch user settings.');
// };

// export const setHolderUserSettings = (settings: UserSettings): void => {
//   if (settings.title && settings.title.trim() !== '') {
//     document.title = settings.title;
//   }
//   userSettingsHolder = settings; // Update in-memory cache
// };

// export const getHolderCategories = async (): Promise<Category[]> => {
//   if (categoriesHolder.length > 0) {
//     return categoriesHolder;
//   }

//   // Fetch settings from the backend if not cached
//   const fetchedCategories = await fetchCategories();
//   if (fetchedCategories) {
//     categoriesHolder = fetchedCategories;
//     localStorage.setItem('categories', JSON.stringify(categoriesHolder)); // Cache the settings
//     return categoriesHolder;
//   }

//   // Throw an error if settings cannot be fetched
//   throw new Error('Failed to fetch user settings.');
// };

// export const setHolderCategories = (categories: Category[]): void => {
//   categoriesHolder = categories;
// };
