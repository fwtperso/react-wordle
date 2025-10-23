import { useEffect } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import styles from './LanguageSelector.module.scss';

const LanguageSelector = ({ selectedLanguage, setSelectedLanguage }) => {
  const languageOptions = ['English', 'Français', 'Dansk'];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Language</h2>
      <div className={styles.options}>
        {languageOptions.map((lang) => (
          <button
            key={lang}
            className={`${styles.option} ${selectedLanguage === lang ? styles.selected : ''}`}
            onClick={() => setSelectedLanguage(lang)}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
