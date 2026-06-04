import Head from 'next/head';
import Link from 'next/link';
import { MorphingIcon } from '../components/marketing/index-icons';

export default function SecurityGuide() {
  return (
    <>
      <Head>
        <title>Security Guide — SafeHaven</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{ minHeight: '100dvh', background: 'var(--color-bg, #faf8f5)', color: 'var(--color-foreground, #2a241f)', fontFamily: 'var(--font-sans, Inter, sans-serif)' }}>
        <header style={{ padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border, #e8e0d4)' }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.05em', color: 'var(--color-foreground, #2a241f)', display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <MorphingIcon small />
            SafeHaven
          </Link>
          <Link href="/" style={{ background: 'rgba(252, 250, 247, 0.5)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(232, 223, 212, 0.6)', padding: '10px 22px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: 'var(--color-foreground, #2a241f)', textDecoration: 'none' }}>← Home</Link>
        </header>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 40px 140px' }}>

          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 8 }}>Security Guide</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted, #7a6e62)', marginBottom: 56 }}>Last updated: May 2026 · How SafeHaven protects you — and how to protect yourself</p>

          <Section title="How SafeHaven Hides Itself">
            SafeHaven is designed to be invisible to someone who picks up your phone. Rather than appearing as a safety or crisis app, it launches through a fully functional cover — a calculator, a news reader, or a weather app — that behaves exactly as expected. Your private space only opens through a deliberate gesture you configure.
            <br /><br />
            The app does not appear under its real name in recent apps on most devices. There is no "SafeHaven" icon on your home screen. The cover apps function independently and would pass casual inspection.
          </Section>

          <Section title="Your PIN and Entry Point">
            Your private mode is protected by a PIN you set during onboarding. A few things to keep in mind:
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Choose a PIN that is not your device unlock code or any other PIN someone in your life might know.</li>
              <li style={{ marginBottom: 6 }}>The entry gesture (tapping the discreet orange dot) is subtle but visible if someone watches you closely. Practice opening the app privately.</li>
              <li style={{ marginBottom: 6 }}>If you suspect someone knows your PIN, change it from within the app immediately.</li>
              <li style={{ marginBottom: 6 }}>Do not share your PIN with anyone, including people you trust, unless you fully understand the consequences.</li>
            </ul>
          </Section>

          <Section title="Data Encryption and Storage">
            SafeHaven stores your data in a MongoDB database. Here is what we do and do not protect:
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}><strong>Passwords</strong> are hashed with bcrypt before storage. We cannot recover your password, and neither can anyone who gains access to the database.</li>
              <li style={{ marginBottom: 6 }}><strong>Data in transit</strong> is encrypted over HTTPS/TLS between your device and the server.</li>
              <li style={{ marginBottom: 6 }}><strong>Journal entries and messages</strong> are stored in the database as-is. They are not end-to-end encrypted at the application layer. A server administrator with direct database access could read them. We do not do this, but you should be aware of it.</li>
              <li style={{ marginBottom: 6 }}><strong>Location data</strong> is stored only while you have sharing enabled and is only transmitted to trusted contacts you have explicitly added.</li>
            </ul>
            <strong>If you are in an extremely high-risk situation, treat any cloud-stored data as potentially accessible and use discretion about what you record.</strong>
          </Section>

          <Section title="The SOS System">
            The SOS feature is designed for rapid alerting, not guaranteed delivery. Before relying on it, understand its limitations:
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>SOS alerts are sent over the internet. They require an active network connection. If you have no signal, the alert will not send.</li>
              <li style={{ marginBottom: 6 }}>Delivery to trusted contacts depends on their devices receiving the notification. We cannot guarantee receipt.</li>
              <li style={{ marginBottom: 6 }}>Location accuracy depends on your device's GPS and network conditions. In some environments, location may be imprecise or unavailable.</li>
              <li style={{ marginBottom: 6 }}>SafeHaven is not a licensed emergency dispatch service. An SOS alert goes to people you trust, not to 911 or emergency services.</li>
            </ul>
            <strong>Always call 911 (or your local emergency number) if you are in immediate danger. SafeHaven is a supplemental tool, not a replacement for emergency services.</strong>
          </Section>

          <Section title="Trusted Contacts">
            Trusted contacts are people who will receive your SOS alerts and location. Choose them carefully:
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Add only people you trust completely and who know they are a trusted contact.</li>
              <li style={{ marginBottom: 6 }}>A trusted contact can see your location when you share it. Make sure this is someone who will keep that information confidential.</li>
              <li style={{ marginBottom: 6 }}>Remove contacts immediately if your relationship with them changes or if you no longer trust them.</li>
              <li style={{ marginBottom: 6 }}>Having zero trusted contacts means an SOS will not alert anyone. We recommend having at least two.</li>
            </ul>
          </Section>

          <Section title="AI Chat (SafeBot)">
            SafeHaven includes an AI support chat powered by a third-party model (OpenRouter / Google Gemma). A few important things:
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Messages you send to SafeBot are forwarded to the model provider's servers. Do not share your full name, address, identifying details, or anything you would not want a third party to process.</li>
              <li style={{ marginBottom: 6 }}>SafeBot is not a licensed counselor, therapist, or crisis line. It cannot call for help on your behalf.</li>
              <li style={{ marginBottom: 6 }}>AI responses may be inaccurate, incomplete, or inappropriate. Use your own judgment.</li>
              <li style={{ marginBottom: 6 }}>For trained crisis support, contact the National Domestic Violence Hotline at 1-800-799-7233 or text START to 88788.</li>
            </ul>
          </Section>

          <Section title="Device Security">
            SafeHaven's cover design only protects you if your device itself is secure:
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Use a strong device lock (PIN, biometric, or passphrase). Without it, anyone with your unlocked phone can access the app.</li>
              <li style={{ marginBottom: 6 }}>Be aware of shoulder surfing — people observing your screen or your entry gesture in public.</li>
              <li style={{ marginBottom: 6 }}>Keep your device's operating system and browser updated. Known vulnerabilities in outdated software can be exploited regardless of what apps you use.</li>
              <li style={{ marginBottom: 6 }}>If you believe your device is compromised by spyware or monitoring software, SafeHaven cannot protect against local surveillance. Consider using a separate device.</li>
              <li style={{ marginBottom: 6 }}>Clearing browser history does not remove your SafeHaven account data from the server — it only removes traces on the local device.</li>
            </ul>
          </Section>

          <Section title="Network and Browser Safety">
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Avoid using SafeHaven on shared or monitored Wi-Fi networks (e.g., a shared household network that someone else administers).</li>
              <li style={{ marginBottom: 6 }}>Mobile data (LTE/5G) is generally harder to monitor locally than home Wi-Fi.</li>
              <li style={{ marginBottom: 6 }}>Using a VPN can add a layer of protection on untrusted networks, but does not change what data is stored on our servers.</li>
              <li style={{ marginBottom: 6 }}>If someone can see your screen, browser history, or network traffic, the cover app reduces but does not eliminate risk.</li>
            </ul>
          </Section>

          <Section title="Reporting a Vulnerability">
            If you discover a security vulnerability in SafeHaven, please do not disclose it publicly until it has been addressed. Report it through the project's GitHub repository by opening a private security advisory or contacting the maintainers directly.
            <br /><br />
            We take security reports seriously and will work to address confirmed issues promptly. We ask for reasonable time to investigate and patch before any public disclosure.
          </Section>

          <Section title="Disclaimer">
            This guide describes the security properties of SafeHaven as designed. <strong>No application can guarantee your safety.</strong> Security depends on many factors outside our control — your device, your network, your environment, and the behavior of people around you.
            <br /><br />
            SafeHaven contributors make no warranty that the application will perform as described in all circumstances, and are not liable for any harm arising from its use or failure. See the <Link href="/privacy-policy" style={{ color: 'var(--color-accent, #b07040)' }}>Privacy Policy</Link> for full liability terms.
          </Section>

          <p style={{ marginTop: 72, fontSize: 13, color: 'var(--color-muted, #7a6e62)', borderTop: '1px solid var(--color-border, #e8e0d4)', paddingTop: 28, lineHeight: 1.7 }}>
            SafeHaven is a volunteer-maintained open-source project. This guide reflects the security design of the reference implementation. Self-hosted deployments may have different properties. If you are in immediate danger, call 911 or your local emergency number.
          </p>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>{title}</h2>
      <div style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--color-muted, #5a4e42)' }}>
        {children}
      </div>
    </section>
  );
}
