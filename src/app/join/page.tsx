import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: 'Guidelines for The Unadulting Society community.',
};

export default function JoinPage() {
  return (
    <>
      <header className="header">
        <h1 className="site-title" data-heading="tus" data-text="UR NOT ALONE">UR NOT ALONE</h1>
      </header>

      <main className="page-main">
        <div className="guidelines-container">
          <div className="guidelines-intro">
            <p>Life is complicated. We're all dealing with our own challenges—whether it's mental health, financial stress, political anxieties, or just trying to navigate a world that feels overwhelming. Corporate social media often feels filled with noise, bots, and bad actors, making genuine connection difficult. This space exists as an alternative—a place where we can have real conversations about what we're going through. These guidelines help us maintain the kind of environment where everyone feels welcome to share their truth.</p>
          </div>

          <div className="guidelines-grid">
            <div className="guideline-card">
              <div className="glow"></div>
              <div className="inner">
                <span className="card-icon">🤝</span>
                <h3 className="card-title">What We Stand For</h3>
                <div className="card-content">
                  <p>This community is built on a few key principles:</p>
                  <ul>
                    <li><strong>Empathy First:</strong> We're all navigating different challenges—approach conversations with understanding</li>
                    <li><strong>Judgment-Free Space:</strong> Share your authentic self—all are welcome here</li>
                    <li><strong>Mutual Respect:</strong> Honor people's boundaries and perspectives</li>
                    <li><strong>Authenticity Encouraged:</strong> Being real is the whole point</li>
                    <li><strong>Diverse Experiences:</strong> Different backgrounds make us stronger together</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="guideline-card">
              <div className="glow"></div>
              <div className="inner">
                <span className="card-icon">💚</span>
                <h3 className="card-title">Respectful Interaction</h3>
                <div className="card-content">
                  <p>Creating a welcoming space for everyone:</p>
                  <ul>
                    <li>No harassment, hate speech, or targeted abuse</li>
                    <li>Debate ideas respectfully, not people personally</li>
                    <li>Different perspectives help us grow</li>
                    <li>Stay curious and open to diverse experiences</li>
                    <li>Support each other through challenges and celebrate wins</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="guideline-card">
              <div className="glow"></div>
              <div className="inner">
                <span className="card-icon">⚠️</span>
                <h3 className="card-title">Content Warnings Matter</h3>
                <div className="card-content">
                  <p>We welcome conversations about difficult topics. Help others navigate safely with content warnings:</p>
                  <ul>
                    <li>Use CWs for self-harm, violence, abuse, eating disorders, or substance use discussions</li>
                    <li>Be specific—"CW: anxiety discussion" is more helpful than just "trigger warning"</li>
                    <li>This gives people choice in what they engage with</li>
                    <li>When uncertain, add a warning—it takes a moment</li>
                    <li>Warnings protect everyone's mental space</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="guideline-card">
              <div className="glow"></div>
              <div className="inner">
                <span className="card-icon">🔒</span>
                <h3 className="card-title">Privacy & Safety</h3>
                <div className="card-content">
                  <p>Maintaining a safe environment for all members:</p>
                  <ul>
                    <li>Never share someone's personal information without consent</li>
                    <li>Anonymity is valid—don't pressure people to reveal details</li>
                    <li>What's shared here stays here</li>
                    <li>Report concerns to moderators</li>
                    <li>No shock content or surprise NSFW material</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="guideline-card">
              <div className="glow"></div>
              <div className="inner">
                <span className="card-icon">✨</span>
                <h3 className="card-title">Quality Participation</h3>
                <div className="card-content">
                  <p>Help us maintain a meaningful community:</p>
                  <ul>
                    <li>No spam, MLM pitches, or self-promotion</li>
                    <li>Use categories thoughtfully</li>
                    <li>Search before posting repeat questions</li>
                    <li>Share thoughtful responses, not just "+1"</li>
                    <li>Your perspective contributes meaningfully</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="guideline-card">
              <div className="glow"></div>
              <div className="inner">
                <span className="card-icon">🆘</span>
                <h3 className="card-title">When You Need More Support</h3>
                <div className="card-content">
                  <p>This community offers peer support and solidarity, but we're not equipped for crisis intervention. If you're in crisis, please reach out to trained professionals:</p>
                  <ul>
                    <li><strong>988</strong> - Suicide & Crisis Lifeline (call or text, 24/7)</li>
                    <li><strong>741741</strong> - Crisis Text Line (text "HELLO")</li>
                    <li>Call 911 or go to your nearest ER for immediate danger</li>
                    <li>Professional help is available and you deserve it</li>
                    <li>Asking for help is a sign of strength</li>
                  </ul>
                  <p className="crisis-note"><strong>You matter. Professional support is there when you need it.</strong></p>
                </div>
              </div>
            </div>

            <div className="guideline-card">
              <div className="glow"></div>
              <div className="inner">
                <span className="card-icon">🛡️</span>
                <h3 className="card-title">How Moderation Works</h3>
                <div className="card-content">
                  <p>Our moderators help maintain a healthy community environment:</p>
                  <ul>
                    <li>First-time mistakes usually receive a friendly warning</li>
                    <li>Repeated violations may result in temporary or permanent bans</li>
                    <li>Use the report button for concerning content</li>
                    <li>Moderation decisions can be discussed respectfully</li>
                    <li>Disagreements aren't violations—harassment is</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="guideline-card">
              <div className="glow"></div>
              <div className="inner">
                <span className="card-icon">🌱</span>
                <h3 className="card-title">Take Care of Yourself</h3>
                <div className="card-content">
                  <p>Your wellbeing comes first:</p>
                  <ul>
                    <li>Step away from discussions when you need to</li>
                    <li>You're not obligated to engage in every thread</li>
                    <li>Use mute and block features to protect your space</li>
                    <li>Set your own boundaries around time and energy</li>
                    <li>Healing and growth aren't linear—all progress is valid</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="guideline-card cta-card">
              <div className="glow"></div>
              <div className="inner">
                <span className="card-icon">🏠</span>
                <h3 className="card-title">Come Join Us</h3>
                <div className="card-content">
                  <p>If this feels right to you, we'd love to have you. We're building something genuine here—a place where diverse experiences and perspectives make us stronger together.</p>
                  <Link href="/forum" className="cta-button">Enter The Clubhouse</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
