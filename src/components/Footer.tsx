import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.copyright}>
        &copy; {new Date().getFullYear()} The Unadulting Society. All rights reserved.
      </div>
      <div className={styles.comfortElement}>
        <div className={styles.pixelHeart}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 1H3V2H2V3H1V4H0V7H1V8H2V9H3V10H4V11H5V12H6V13H7V14H9V13H10V12H11V11H12V10H13V9H14V8H15V7H16V4H15V3H14V2H13V1H12V0H10V1H9V2H7V1H6V0H4V1Z" fill="#FF69B4"/>
            <path d="M4 2H3V3H2V4H1V7H2V8H3V9H4V10H5V11H6V12H7V13H9V12H10V11H11V10H12V9H13V8H14V7H15V4H14V3H13V2H12V1H10V2H9V3H7V2H6V1H4V2Z" fill="#FF89C4"/>
          </svg>
        </div>
        <span className={styles.comfortText}>You are not alone.</span>
      </div>
    </footer>
  );
};

export default Footer;
