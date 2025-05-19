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
            <li>Discord username and user ID (when you authenticate)</li>
            <li>
              In-game prompts sent to AI models (for monitoring and improvement)
            </li>
            <li>Error logs and performance data</li>
            <li>Any adventures you create or play</li>
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
            In-game chat messages are never stored, but prompts sent to the AI
            models are logged for monitoring and improvement. Your data will
            never be sold or used for any other purpose.
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
            <li>View your game data and adventures</li>
            <li>Request deletion of your game data</li>
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
