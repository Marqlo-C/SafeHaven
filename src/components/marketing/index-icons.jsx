import { Calculator, Newspaper, CloudSun, Shield } from 'lucide-react';
import styles from '../../styles/marketing/marketing.module.css';

export const ShieldIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const GhostIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2a9 9 0 0 0-9 9v7.5a3.5 3.5 0 0 0 6.39 2.04 4.5 4.5 0 0 0 5.22 0 3.5 3.5 0 0 0 6.39-2.04V11a9 9 0 0 0-9-9zm-3 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
  </svg>
);

export const ChatIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
  </svg>
);

export const ExitIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
  </svg>
);

export const FilledLockIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm3 11c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
  </svg>
);

export const CloudIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
  </svg>
);

export const RedLockIcon = ({ className }) => (
  <svg viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M7 11V8a5 5 0 0 1 10 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <rect x="4" y="11" width="16" height="13" rx="3" fill="currentColor" />
    <circle cx="12" cy="17" r="2" fill="white" />
    <rect x="11" y="18" width="2" height="3" rx="1" fill="white" />
  </svg>
);

export const HistoryIcon = () => (
  <svg viewBox="0 0 22 22" fill="white" width="20" height="20" aria-hidden="true">
    <rect x="2" y="3" width="3" height="3" rx="0.75" />
    <rect x="7" y="3.75" width="13" height="1.5" rx="0.75" />
    <rect x="2" y="9.5" width="3" height="3" rx="0.75" />
    <rect x="7" y="10.25" width="13" height="1.5" rx="0.75" />
    <rect x="2" y="16" width="3" height="3" rx="0.75" />
    <rect x="7" y="16.75" width="13" height="1.5" rx="0.75" />
  </svg>
);

export const SciToggleIcon = () => (
  <svg viewBox="0 0 26 32" width="15" height="18" aria-hidden="true">
    <rect x="1" y="1" width="24" height="30" rx="4" fill="none" stroke="white" strokeWidth="1.5" />
    <rect x="4.25" y="4.25" width="17.5" height="5.5" rx="1" fill="white" />
    <rect x="4.25" y="12.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="10.92" y="12.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="17.59" y="12.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="4.25" y="18.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="10.92" y="18.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="17.59" y="18.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="4.25" y="24.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="10.92" y="24.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="17.59" y="24.25" width="4.17" height="3.5" rx="0.7" fill="white" />
  </svg>
);

export const BackspaceIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 5H8c-.53 0-1.04.26-1.37.68L2 12l4.63 6.32c.33.43.84.68 1.37.68H20a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
    <line x1="11.5" y1="9.5" x2="16.5" y2="14.5" />
    <line x1="16.5" y1="9.5" x2="11.5" y2="14.5" />
  </svg>
);

export const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const ClockIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

export function MorphingIcon({ small = false }) {
  if (small) {
    return (
      <div className={styles.morphingIconContainerSm}>
        <Calculator className={styles.morphingIconSm} />
        <Newspaper className={styles.morphingIconSm} />
        <CloudSun className={styles.morphingIconSm} />
        <Shield className={styles.morphingIconSm} />
      </div>
    );
  }
  return (
    <div className={styles.morphingIconContainer}>
      <div className={styles.morphingGlow} />
      <Calculator className={styles.morphingIcon} />
      <Newspaper className={styles.morphingIcon} />
      <CloudSun className={styles.morphingIcon} />
      <Shield className={styles.morphingIcon} />
    </div>
  );
}
