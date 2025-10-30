import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import styles from './LanguageSelector.module.scss';

const LanguageSelector = ({ selectedLanguage, setSelectedLanguage }) => {
  const languageOptions = [
    { label: 'EN', value: 'English' },
    { label: 'FR', value: 'Français' },
    { label: 'DK', value: 'Dansk' }
  ];

  return (
    <div className={styles.row}>
      <div>
        <h2 className={styles.title}>Language</h2>
      </div>
      <ButtonGroup size="small" aria-label="Small button group" className={styles.buttonGroup}>
        {languageOptions.map((lang) => (
          <Button
            key={lang.value}
            onClick={() => setSelectedLanguage(lang.value)}
            variant={selectedLanguage === lang.value ? 'contained' : 'outlined'}
            className={styles.button}
          >
            {lang.label}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
};

export default LanguageSelector;
