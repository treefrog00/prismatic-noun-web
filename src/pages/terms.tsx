import React from 'react';
import { pageStyles } from '../styles/shared';

const TermsOfService: React.FC = () => {
  return (
    <div className={pageStyles.policyContainer}>
      <div className={pageStyles.policyContent}>
        <h1 className={pageStyles.policyTitle}>
          Terms of Service
        </h1>
        <section className={pageStyles.policySection}>
          <p className={pageStyles.policyText}>
            By using Prismatic Noun, you agree to these terms:
          </p>
          <div className="space-y-4">
            <p className={pageStyles.policyText}>
              1. You must be at least 13 years old to use this service.
            </p>
            <p className={pageStyles.policyText}>
              2. Be nice to people. Abusive behavior will not be tolerated.
            </p>
            <p className={pageStyles.policyText}>
              3. This is meant to be a lighthearted role-playing game suitable for players ages 13 and up. Keep language respectful and appropriate. Do not post content that is:
            </p>
            <ul className="list-disc pl-8 space-y-2">
              <li className={pageStyles.policyText}>Abusive, threatening, obscene, or defamatory</li>
              <li className={pageStyles.policyText}>Racially, sexually, or religiously offensive</li>
              <li className={pageStyles.policyText}>Containing nudity, excessive violence, or other inappropriate subject matter</li>
              <li className={pageStyles.policyText}>Links to any of the above content</li>
            </ul>
            <p className={pageStyles.policyText}>
              4. You agree not to use the service for any illegal or unauthorized purpose.
            </p>
            <p className={pageStyles.policyText}>
              5. You agree not to attempt to hack, reverse engineer, or otherwise tamper with the service.
            </p>
            <p className={pageStyles.policyText}>
              6. If you have been banned from the service, you may not create new accounts to continue playing.
            </p>
            <p className={pageStyles.policyText}>
              7. You agree not to use the service to advertise, spam, or send chain letters to other players.
            </p>
            <p className={pageStyles.policyText}>
              8. The service is provided "as is" without any warranties, express or implied.
            </p>
            <p className={pageStyles.policyText}>
              9. We reserve the right to modify or terminate the service for any reason, without notice.
            </p>
            <p className={pageStyles.policyText}>
              10. We may update these terms at any time, and your continued use of the service constitutes acceptance of the updated terms.
            </p>
          </div>
        </section>
        <section className={pageStyles.policySection}>
          <p className={pageStyles.policyText}>
            If you have any questions about these terms, please contact us.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;