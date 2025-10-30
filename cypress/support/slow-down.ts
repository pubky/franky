export const slowMs = 200;
export const fastMs = 20;
export const defaultMs = process.env['CI'] ? slowMs : fastMs;
