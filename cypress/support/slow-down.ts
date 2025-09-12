export const slowMs = 1000;
export const fastMs = 100;
export const defaultMs = process.env['CI'] ? slowMs : fastMs;
