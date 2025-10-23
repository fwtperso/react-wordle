import { createContext, useContext, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage('language', 'English');

  useEffect(() => {
    console.log(`Language changed to: ${selectedLanguage}`);
  }, [selectedLanguage]);

  const value = {
    selectedLanguage,
    setSelectedLanguage,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
