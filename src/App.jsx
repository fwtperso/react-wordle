/**
 * Main application component for the Wordle game.
 * Manages game state, user interactions, modals, and game logic.
 * Handles word validation, guess submission, win/loss conditions, and language selection.
 */

import { useState, useEffect } from 'react';
import Header from 'components/Header';
import Grid from 'components/Grid';
import Keyboard from 'components/Keyboard';
import Alert from 'components/Alert';
import InfoModal from 'components/InfoModal';
import SettingModal from 'components/SettingModal';
import StatsModal from 'components/StatsModal';
import useLocalStorage from 'hooks/useLocalStorage';
import useAlert from 'hooks/useAlert';
import { useSettings } from './context/SettingsContext';
import {
  getWordOfDay,
  getRandomWord,
  isWordValid,
  findFirstUnusedReveal,
  addStatsForCompletedGame,
} from 'lib/words';
import {
  ALERT_DELAY,
  MAX_CHALLENGES,
  MAX_WORD_LENGTH,
} from 'constants/settings';
import styles from './App.module.scss';
import 'styles/_transitionStyles.scss';

function App() {
  const [boardState, setBoardState] = useLocalStorage('boardState', {
    guesses: [],
    solutionIndex: '',
  });
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  const [highContrast, setHighContrast] = useLocalStorage(
    'high-contrast',
    false
  );
  const [hardMode, setHardMode] = useLocalStorage('hard-mode', false);
  const [stats, setStats] = useLocalStorage('gameStats', {
    winDistribution: Array.from(new Array(MAX_CHALLENGES), () => 0),
    gamesFailed: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    successRate: 0,
  });

  const [solution, setSolution] = useState('');
  const [solutionIndex, setSolutionIndex] = useState(0);
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [isJiggling, setIsJiggling] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameLost, setIsGameLost] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHardMode, setIsHardMode] = useState(hardMode);
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');
  const [isHighContrastMode, setIsHighContrastMode] = useState(highContrast);
  const { showAlert } = useAlert();
  const { selectedLanguage, setSelectedLanguage } = useSettings();

  /**
   * Fetches the word of the day based on the selected language.
   * Updates the solution and solution index state.
   */
  const fetchWord = async () => {
    const { solution, solutionIndex } = await getWordOfDay(selectedLanguage);
    setSolution(solution);
    setSolutionIndex(solutionIndex);
  };

  /**
   * Fetches a random word from the word list for the selected language.
   * Used when starting a new game.
   */
  const fetchRandomWord = async () => {
    const { solution, solutionIndex } = await getRandomWord(selectedLanguage);
    setSolution(solution);
    setSolutionIndex(solutionIndex);
  };

  /**
   * Effect: Fetches a new word and resets the game when the language changes.
   * This ensures users get a fresh game in their selected language.
   */
  useEffect(() => {
    fetchWord();
    // Reset game state when language changes
    setGuesses([]);
    setCurrentGuess('');
    setIsGameWon(false);
    setIsGameLost(false);
  }, [selectedLanguage]);

  // Show welcome modal
  useEffect(() => {
    if (!boardState.solutionIndex)
      setTimeout(() => setIsInfoModalOpen(true), 1000);
    // eslint-disable-next-line
  }, []);

  /**
   * Effect: Saves the current board state (guesses and solution index) to localStorage.
   * This allows the game to persist across browser sessions.
   */
  useEffect(() => {
    if (solutionIndex) {
      setBoardState({
        guesses,
        solutionIndex,
      });
    }
    // eslint-disable-next-line
  }, [guesses, solutionIndex]);

  /**
   * Effect: Loads saved guesses from localStorage if they match the current solution.
   * Resets guesses if the solution has changed.
   */
  useEffect(() => {
    if (boardState.solutionIndex === solutionIndex) {
      setGuesses(boardState.guesses);
    } else {
      setGuesses([]);
    }
  // eslint-disable-next-line
  }, [solutionIndex]);

  /**
   * Effect: Checks for win/loss conditions after each guess.
   * Shows appropriate alerts and opens the stats modal when the game ends.
   */
  useEffect(() => {
    if (solution && guesses.includes(solution.toUpperCase())) {
      setIsGameWon(true);
      setTimeout(() => showAlert('Well done', 'success'), ALERT_DELAY);
      setTimeout(() => setIsStatsModalOpen(true), ALERT_DELAY + 1000);
    } else if (solution && guesses.length === MAX_CHALLENGES) {
      setIsGameLost(true);
      setTimeout(
        () => showAlert(`The word was ${solution}`, 'error', true),
        ALERT_DELAY
      );
      setTimeout(() => setIsStatsModalOpen(true), ALERT_DELAY + 1000);
    }
    // eslint-disable-next-line
  }, [guesses, solution]);

  /**
   * Effect: Applies theme and contrast mode settings to the document body.
   * Updates data attributes that CSS uses for styling.
   */
  useEffect(() => {
    if (isDarkMode) document.body.setAttribute('data-theme', 'dark');
    else document.body.removeAttribute('data-theme');

    if (isHighContrastMode)
      document.body.setAttribute('data-mode', 'high-contrast');
    else document.body.removeAttribute('data-mode');
  }, [isDarkMode, isHighContrastMode]);

  /**
   * Toggles dark mode on/off and saves the preference to localStorage.
   */
  const handleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  /**
   * Toggles high contrast mode on/off for improved color vision accessibility.
   */
  const handleHighContrastMode = () => {
    setIsHighContrastMode(!isHighContrastMode);
    setHighContrast(!isHighContrastMode);
  };

  /**
   * Toggles hard mode on/off. In hard mode, revealed hints must be used in subsequent guesses.
   */
  const handleHardMode = () => {
    setIsHardMode(!isHardMode);
    setHardMode(!isHardMode);
  };

  /**
   * Handles letter key presses from the keyboard.
   * Adds the letter to the current guess if within length limits and game is not won.
   * @param {string} letter - The letter to add to the current guess
   */
  const handleKeyDown = letter =>
    currentGuess.length < MAX_WORD_LENGTH &&
    !isGameWon &&
    setCurrentGuess(currentGuess + letter);

  /**
   * Handles the delete/backspace action.
   * Removes the last letter from the current guess.
   */
  const handleDelete = () =>
    setCurrentGuess(currentGuess.slice(0, currentGuess.length - 1));

  /**
   * Handles the enter key press to submit a guess.
   * Validates the guess length, checks if it's a valid word,
   * enforces hard mode rules, and updates game state accordingly.
   */
  const handleEnter = () => {
    if (isGameWon || isGameLost) return;

    if (currentGuess.length < MAX_WORD_LENGTH) {
      setIsJiggling(true);
      return showAlert('Not enough letters', 'error');
    }

    if (!isWordValid(currentGuess)) {
      setIsJiggling(true);
      return showAlert('Not in word list', 'error');
    }

    if (isHardMode) {
      const firstMissingReveal = findFirstUnusedReveal(currentGuess, guesses, solution);
      if (firstMissingReveal) {
        setIsJiggling(true);
        return showAlert(firstMissingReveal, 'error');
      }
    }

    if (currentGuess === solution.toUpperCase()) {
      setStats(addStatsForCompletedGame(stats, guesses.length));
    } else if (guesses.length + 1 === MAX_CHALLENGES) {
      setStats(addStatsForCompletedGame(stats, guesses.length + 1));
    }

    setGuesses([...guesses, currentGuess]);
    setCurrentGuess('');
  };

  /**
   * Starts a new game with a random word.
   * Resets all game state including guesses, current input, and win/loss status.
   */
  const handleNewGame = () => {
    setGuesses([]);
    setCurrentGuess('');
    setIsGameWon(false);
    setIsGameLost(false);
    fetchRandomWord(); 
  };

  return (
    <div className={styles.container}>
      <Header
        setIsInfoModalOpen={setIsInfoModalOpen}
        setIsStatsModalOpen={setIsStatsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        onNewGame={handleNewGame} 
      />
      <Alert />
      <Grid
        currentGuess={currentGuess}
        guesses={guesses}
        isJiggling={isJiggling}
        setIsJiggling={setIsJiggling}
        solution={solution}
      />
      <Keyboard
        onEnter={handleEnter}
        onDelete={handleDelete}
        onKeyDown={handleKeyDown}
        guesses={guesses}
        solution={solution}
      />
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
      <SettingModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isHardMode={isHardMode}
        isDarkMode={isDarkMode}
        isHighContrastMode={isHighContrastMode}
        setIsHardMode={handleHardMode}
        setIsDarkMode={handleDarkMode}
        setIsHighContrastMode={handleHighContrastMode}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />
      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        gameStats={stats}
        numberOfGuessesMade={guesses.length}
        isGameWon={isGameWon}
        isGameLost={isGameLost}
        isHardMode={isHardMode}
        guesses={guesses}
        showAlert={showAlert}
        solution={solution}
        solutionIndex={solutionIndex}
        onNewGame={handleNewGame}
      />
    </div>
  );
}

export default App;
