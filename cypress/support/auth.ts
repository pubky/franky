import * as path from 'path';

export const defaultBackupFilename = (): string => {
  // return `pubky_recovery_${moment().utc().format('YYYY-MM-DD')}.pkarr`
  return 'recovery_key.pkarr';
};

export const backupDownloadFilePath = (filename?: string): string => {
  const filenameWithExtension = filename ? `${filename}.pkarr` : defaultBackupFilename();
  const downloadsFolder = Cypress.config('downloadsFolder');
  return path.join(downloadsFolder, filenameWithExtension);
};
