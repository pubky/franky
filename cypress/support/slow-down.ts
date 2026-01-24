export const slowMs = 250;
export const fastMs = 20;
export const defaultMs = process.env['CI'] ? slowMs : fastMs;
