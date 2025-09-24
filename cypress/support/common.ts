
import * as path from 'path';

export const defaultBackupFilename = (): string => {
  // return `pubky_recovery_${moment().utc().format('YYYY-MM-DD')}.pkarr`
  return 'recovery.pkarr';
};

export const backupDownloadFilePath = (filename?: string): string => {
  const filenameWithExtension = filename ? `${filename}.pkarr` : defaultBackupFilename();
  const downloadsFolder = Cypress.config('downloadsFolder');
  return path.join(downloadsFolder, filenameWithExtension);
};

export interface NetworkRequest {
  timestamp: string;
  method: string;
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestBody: any;
}

export const interceptNetworkRequest = (interceptedRequests: NetworkRequest[]) => {
  cy.intercept('**/api/invite-code', (req) => {
    const requestData: NetworkRequest = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      requestBody: req.body
    };
    interceptedRequests.push(requestData);
  });
};

export const saveNetworkRequestLog = (interceptedRequests: NetworkRequest[], testSuite: string) => {
  const logFilePath = `dist/cypress/apps/web-e2e/invite-code-network-logs/${testSuite}.json`;
  cy.writeFile(logFilePath, JSON.stringify(interceptedRequests, null, 2), { flag: 'w' }).then(() => {
    console.log('Network log saved to', logFilePath);
  });
};

export const verifyNotificationCounter = (expectedCount = '1') => {
  // Wait and reload if the counter doesn't appear
  cy.waitReloadWhileElementDoesNotExist('#header-notification-counter', 10);
  // Assert the counter text
  cy.get('#header-notification-counter').should('have.text', expectedCount);
};
