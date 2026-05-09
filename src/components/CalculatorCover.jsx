import { useState } from 'react';
import styles from '../styles/CalculatorCover.module.css';

const BUTTONS = [
  'AC', '+/-', '%', '/',
  '7', '8', '9', 'x',
  '4', '5', '6', '-',
  '1', '2', '3', '+',
  '0', '.', '=',
];

const OPERATORS = ['/', 'x', '-', '+'];

export default function CalculatorCover() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const formatValue = (value) => {
    if (!Number.isFinite(value)) return 'Error';
    const rounded = Number.parseFloat(value.toFixed(10));
    return String(rounded);
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const inputDigit = (digit) => {
    if (display === 'Error') {
      setDisplay(digit);
      setWaitingForOperand(false);
      return;
    }

    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
      return;
    }

    setDisplay(display === '0' ? digit : `${display}${digit}`);
  };

  const inputDecimal = () => {
    if (display === 'Error') {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }

    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(`${display}.`);
    }
  };

  const calculate = (firstValue, secondValue, currentOperation) => {
    switch (currentOperation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case 'x':
        return firstValue * secondValue;
      case '/':
        return secondValue === 0 ? Number.NaN : firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const performOperation = (nextOperation) => {
    const inputValue = Number.parseFloat(display);

    if (!Number.isFinite(inputValue)) {
      clear();
      return;
    }

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const result = calculate(previousValue, inputValue, operation);
      setDisplay(formatValue(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const handleEquals = () => {
    if (!operation || previousValue === null) return;
    const inputValue = Number.parseFloat(display);
    const result = calculate(previousValue, inputValue, operation);

    setDisplay(formatValue(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const handleButtonClick = (value) => {
    if (/^\d$/.test(value)) {
      inputDigit(value);
      return;
    }

    if (OPERATORS.includes(value)) {
      performOperation(value);
      return;
    }

    switch (value) {
      case 'AC':
        clear();
        break;
      case '+/-':
        setDisplay((current) => (
          current === '0' || current === 'Error'
            ? current
            : formatValue(Number.parseFloat(current) * -1)
        ));
        break;
      case '%':
        setDisplay((current) => (
          current === 'Error'
            ? current
            : formatValue(Number.parseFloat(current) / 100)
        ));
        break;
      case '.':
        inputDecimal();
        break;
      case '=':
        handleEquals();
        break;
      default:
        break;
    }
  };

  return (
    <section className={styles.page} aria-label="Calculator">
      <div className={styles.calculator}>
        <div className={styles.display} aria-live="polite">
          {display}
        </div>

        <div className={styles.keypad}>
          {BUTTONS.map((button) => {
            const isOperator = OPERATORS.includes(button) || button === '=';
            const isZero = button === '0';

            return (
              <button
                className={[
                  styles.key,
                  isOperator ? styles.operatorKey : styles.numberKey,
                  isZero ? styles.zeroKey : '',
                ].join(' ')}
                key={button}
                type="button"
                onClick={() => handleButtonClick(button)}
              >
                {button}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
