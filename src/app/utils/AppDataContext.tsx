import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  use,
  useEffect,
} from 'react';
import { Category } from '../model/Category';
import { UserSettings } from '../model/UserSettings';

interface AppDataContextType {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  userSettings: UserSettings | null;
  setUserSettings: (settings: UserSettings) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    if (
      userSettings &&
      userSettings.title &&
      userSettings.title.trim() !== ''
    ) {
      document.title = userSettings.title;
    }
  }, [userSettings]);

  return (
    <AppDataContext.Provider
      value={{ categories, setCategories, userSettings, setUserSettings }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
};
