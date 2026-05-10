import styles from '../styles/WeatherCover.module.css';

const ACCUWEATHER_URL = 'https://www.accuweather.com/';

export default function WeatherCover() {
  return (
    <section className={styles.page} aria-label="Weather Now">
      <div className={styles.sky}>
        <div className={styles.sun} aria-hidden="true" />
        <div className={styles.cloudOne} aria-hidden="true" />
        <div className={styles.cloudTwo} aria-hidden="true" />
      </div>

      <div className={styles.shell}>
        <p className={styles.location}>Current Conditions</p>
        <h1 className={styles.temperature}>72&deg;</h1>
        <p className={styles.summary}>Weather Now</p>

        <a className={styles.forecastLink} href={ACCUWEATHER_URL}>
          Open forecast
        </a>
      </div>
    </section>
  );
}
