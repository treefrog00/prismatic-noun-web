import React from "react";
import { pageStyles } from "../styles/shared";

const Privacy: React.FC = () => {
  return (
    <div className={pageStyles.policyContainer}>
      <div className={pageStyles.policyContent}>
        <h1 className={pageStyles.policyTitle}>Privacy Policy</h1>

        <section className={pageStyles.policySection}>
          <h2 className={pageStyles.policySubtitle}>Information We Collect</h2>
          <p className={pageStyles.policyText}>
            We collect the following types of information:
          </p>
          <ul className={pageStyles.policyList}>
            <li>Discord username (when you authenticate)</li>
            <li>
              In-game prompts sent to AI models (for monitoring, and potentially
              also for fine-tuning improved AI models)
            </li>
            <li>Error logs and performance data</li>
          </ul>
        </section>

        <section className={pageStyles.policySection}>
          <h2 className={pageStyles.policySubtitle}>
            How We Use Your Information
          </h2>
          <p className={pageStyles.policyText}>We use your information to:</p>
          <ul className={pageStyles.policyList}>
            <li>Provide and improve the game experience</li>
            <li>Monitor and analyze game performance</li>
            <li>Debug and fix technical issues</li>
            <li>Enhance AI model responses</li>
          </ul>
        </section>

        <section className={pageStyles.policySection}>
          <h2 className={pageStyles.policySubtitle}>
            Data Storage and Security
          </h2>
          <p className={pageStyles.policyText}>
            Prompts sent to the AI models are retained and may be used for
            improving the models behind the game.
          </p>
          <p className={pageStyles.policyText}>
            In-game chat messages are only kept ephemerally for the purposes of
            sharing them via websockets, and are never viewed or permanently
            stored.
          </p>
          <p className={pageStyles.policyText}>
            Your Discord username is only used for authentication, and will not
            be used for marketing or other purposes.
          </p>
          <p className={pageStyles.policyText}>
            We implement appropriate security measures to protect your
            information, including encryption and secure storage practices.
          </p>
        </section>

        <section className={pageStyles.policySection}>
          <h2 className={pageStyles.policySubtitle}>Your Rights</h2>
          <p className={pageStyles.policyText}>You have the right to:</p>
          <ul className={pageStyles.policyList}>
            <li>Request deletion of your account and all associated data</li>
            <li>Contact us with any concerns</li>
          </ul>
        </section>

        <section className={pageStyles.policySection}>
          <h2 className={pageStyles.policySubtitle}>Contact Us</h2>
          <p className={pageStyles.policyText}>
            If you have any questions about this Privacy Policy, please contact
            us through our Discord server.
          </p>
        </section>

        <section className={pageStyles.policySection}>
          <h2 className={pageStyles.policySubtitle}>Updates to This Policy</h2>
          <p className={pageStyles.policyText}>
            We may update this privacy policy from time to time.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
