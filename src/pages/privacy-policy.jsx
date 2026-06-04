import Head from 'next/head';
import Link from 'next/link';
import { MorphingIcon } from '../components/marketing/index-icons';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — SafeHaven</title>
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

          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted, #7a6e62)', marginBottom: 56 }}>Last updated: May 2026 · Applies to the SafeHaven reference deployment</p>

          <Section title="Overview">
            SafeHaven is an open-source personal safety application. This Privacy Policy describes how data is handled in the reference deployment maintained by the SafeHaven project contributors. Because this project is open-source and self-hostable, operators who run their own instance are solely responsible for their own data practices. This policy does not apply to third-party deployments.
            <br /><br />
            By using SafeHaven, you acknowledge that you have read and understood this policy. If you do not agree, you should not use the application.
          </Section>

          <Section title="Data We Collect">
            Depending on the features you use, SafeHaven may collect the following data:
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}><strong>Account credentials</strong> — an anonymous username and a bcrypt-hashed password. Plaintext passwords are never stored or logged.</li>
              <li style={{ marginBottom: 6 }}><strong>Journal entries and attachments</strong> — stored in association with your account and not accessible to other users.</li>
              <li style={{ marginBottom: 6 }}><strong>Location data</strong> — collected only when you explicitly opt in to location sharing. You may disable this at any time from within the app.</li>
              <li style={{ marginBottom: 6 }}><strong>Chat messages</strong> — messages are stored for delivery to friends you have accepted. They are not moderated or read by maintainers.</li>
              <li style={{ marginBottom: 6 }}><strong>SOS events</strong> — when you trigger an SOS, your current location and a timestamp are shared with your pre-approved trusted contacts only.</li>
              <li style={{ marginBottom: 6 }}><strong>AI chat messages</strong> — messages sent to the SafeBot AI feature are forwarded to a third-party model provider (see Third-Party Services below). Do not include personally identifying information in AI conversations.</li>
            </ul>
            We do not collect advertising identifiers, device fingerprints, browsing history, or behavioral analytics of any kind.
          </Section>

          <Section title="How Your Data Is Used">
            Data is used exclusively to provide the features you request within the application:
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Authentication and session management</li>
              <li style={{ marginBottom: 6 }}>Delivering messages to friends you have accepted</li>
              <li style={{ marginBottom: 6 }}>Storing and retrieving your private journal entries</li>
              <li style={{ marginBottom: 6 }}>Sending SOS alerts and location to your trusted contacts</li>
              <li style={{ marginBottom: 6 }}>Routing your messages to the AI support model</li>
            </ul>
            We do not sell, rent, trade, or otherwise transfer your data to any third party for commercial, marketing, or analytics purposes. We do not build user profiles.
          </Section>

          <Section title="Data Storage and Security">
            All application data is stored in a MongoDB database. Data in transit is encrypted via HTTPS/TLS. Passwords are hashed with bcrypt before storage and cannot be recovered by maintainers.
            <br /><br />
            We take reasonable precautions to protect stored data. However, <strong>no system is completely secure</strong>, and we cannot guarantee the absolute security of your information. You use this application at your own risk.
            <br /><br />
            The SafeHaven source code is publicly available. If you discover a security vulnerability, please report it responsibly through the project repository rather than disclosing it publicly.
          </Section>

          <Section title="Data Retention">
            Your data is retained as long as your account exists. To request deletion of your account and associated data, contact the instance administrator. Self-hosters may remove their records directly from the database at any time.
            <br /><br />
            We do not maintain backups that persist after account deletion in the reference deployment, but we cannot guarantee that all residual copies are purged from third-party infrastructure (e.g., cloud provider snapshots).
          </Section>

          <Section title="Third-Party Services">
            The reference deployment integrates with third-party services. Each is subject to its own privacy policy, which you should review independently:
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}><strong>Mapbox</strong> — powers map rendering and location display. Your location coordinates may be transmitted to Mapbox when using location features. See the <a href="https://www.mapbox.com/legal/privacy" style={{ color: 'var(--color-accent, #b07040)' }}>Mapbox Privacy Policy</a>.</li>
              <li style={{ marginBottom: 6 }}><strong>OpenRouter / Google Gemma</strong> — processes AI chat messages. Messages you send to SafeBot are forwarded to this provider and subject to their data handling policies. Do not share sensitive personal details in AI conversations.</li>
              <li style={{ marginBottom: 6 }}><strong>MongoDB Atlas</strong> (if applicable) — provides database hosting. Data at rest may be stored on Atlas infrastructure subject to <a href="https://www.mongodb.com/legal/privacy-policy" style={{ color: 'var(--color-accent, #b07040)' }}>MongoDB's privacy policy</a>.</li>
            </ul>
            SafeHaven contributors are not responsible for the data practices of these third-party providers. By using features that rely on them, you agree to their respective terms.
          </Section>

          <Section title="Children's Privacy">
            SafeHaven is not directed at children under the age of 13 and does not knowingly collect personal information from minors. If you believe a minor has registered an account, please notify the project maintainers immediately so we can take appropriate action.
          </Section>

          <Section title="Open-Source Disclaimer">
            SafeHaven is provided as free, open-source software. The reference deployment is operated on a best-effort basis by volunteer contributors with no obligation of service, uptime, or data preservation.
            <br /><br />
            <strong>The software and service are provided "as is" and "as available," without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, reliability, or non-infringement.</strong>
            <br /><br />
            Operators who fork or self-host SafeHaven are solely responsible for their own deployments, data practices, legal compliance, and user obligations. The original contributors bear no liability for third-party deployments.
          </Section>

          <Section title="Limitation of Liability">
            <strong>To the maximum extent permitted by applicable law, the SafeHaven contributors, maintainers, and affiliated parties shall not be liable for any direct, indirect, incidental, special, consequential, exemplary, or punitive damages of any kind arising out of or in connection with your use of or inability to use this software or service — including but not limited to loss of data, loss of privacy, service interruption, personal injury, or any other harm — even if advised of the possibility of such damages.</strong>
            <br /><br />
            This includes but is not limited to:
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Failure of an SOS alert to reach a trusted contact for any reason</li>
              <li style={{ marginBottom: 6 }}>Exposure of user data due to a security breach or misconfiguration</li>
              <li style={{ marginBottom: 6 }}>Inaccurate, delayed, or unavailable location data</li>
              <li style={{ marginBottom: 6 }}>Harm arising from reliance on AI-generated responses</li>
              <li style={{ marginBottom: 6 }}>Data loss due to service outages or infrastructure failures</li>
              <li style={{ marginBottom: 6 }}>Any outcome resulting from use or misuse of the application in an emergency</li>
            </ul>
            <strong>SafeHaven is not a licensed emergency response service and is not a substitute for calling 911 or your local emergency number.</strong> If you are in immediate danger, contact local emergency services.
            <br /><br />
            Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability for certain types of damages. In such jurisdictions, our liability is limited to the fullest extent permitted by law. In no event shall our aggregate liability exceed $0 USD, reflecting that this is a free, volunteer-maintained open-source project.
          </Section>

          <Section title="Indemnification">
            You agree to indemnify, defend, and hold harmless the SafeHaven contributors and maintainers from and against any claims, liabilities, damages, judgments, awards, losses, costs, or expenses (including reasonable attorneys' fees) arising out of or relating to your violation of this policy, your use of the application, or your violation of any applicable law or the rights of any third party.
          </Section>

          <Section title="Governing Law">
            This policy is governed by and construed in accordance with the laws of the State of California, United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of California to the extent permitted by law.
          </Section>

          <Section title="Changes to This Policy">
            We reserve the right to update this policy at any time. Changes will be committed to the public project repository. Your continued use of the application after changes are posted constitutes your acceptance of the revised policy. We recommend checking this page periodically.
          </Section>

          <Section title="Contact">
            For questions about this privacy policy, data deletion requests, or security disclosures, please open an issue in the SafeHaven GitHub repository or contact the project maintainers directly through the repository.
          </Section>

          <p style={{ marginTop: 72, fontSize: 13, color: 'var(--color-muted, #7a6e62)', borderTop: '1px solid var(--color-border, #e8e0d4)', paddingTop: 28, lineHeight: 1.7 }}>
            SafeHaven is a volunteer-maintained open-source project. This policy applies to the reference deployment only. Operators of self-hosted instances are independently responsible for their own privacy practices and legal compliance. Nothing in this policy constitutes legal advice.
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
