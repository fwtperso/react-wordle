/**
 * Cell component - Represents a single letter cell in the Wordle grid.
 * Displays a letter and its status (correct, present, or absent) with appropriate styling and animations.
 */

import classNames from 'classnames';
import styles from './Cell.module.scss';

/**
 * Renders a single cell in the Wordle grid.
 *
 * @param {string} value - The letter to display in the cell
 * @param {string} status - The status of the letter ('correct', 'present', 'absent', or undefined)
 * @param {number} position - The position of the cell in the row (0-4), used for animation delay
 * @param {boolean} isCompleted - Whether this cell is part of a completed (submitted) guess
 * @returns {JSX.Element} The rendered cell component
 */
const Cell = ({ value, status, position, isCompleted }) => {
  const classes = classNames({
    [styles.cell]: true,
    [styles.absent]: status === 'absent',
    [styles.present]: status === 'present',
    [styles.correct]: status === 'correct',
    [styles.fill]: value,
    [styles.reveal]: isCompleted,
  });

  const animationDelay = `${position * 0.35}s`;

  return (
    <div className={classes} style={{ animationDelay }}>
      <span className={styles.letter} style={{ animationDelay }}>
        {value}
      </span>
    </div>
  );
};

export default Cell;
