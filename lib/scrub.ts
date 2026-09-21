// Lightweight, client-safe PII scrubber. Runs in the browser before any
// text leaves the device, and again on the server as a second pass.
// It is deliberately conservative (regex-based) rather than a model call,
// so it works with zero network access and never fails open.

const PHONE_RE = /(\+?256[\s-]?7\d{2}[\s-]?\d{3}[\s-]?\d{3})|(07\d{2}[\s-]?\d{3}[\s-]?\d{3})/g;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const NATIONAL_ID_RE = /\b[A-Z]{2}\d{10,14}\b/g;

export interface ScrubResult {
  text: string;
  redactions: number;
}

export function scrubText(input: string): ScrubResult {
  let redactions = 0;
  let text = input;

  text = text.replace(PHONE_RE, () => {
    redactions++;
    return "[phone number removed]";
  });
  text = text.replace(EMAIL_RE, () => {
    redactions++;
    return "[email removed]";
  });
  text = text.replace(NATIONAL_ID_RE, () => {
    redactions++;
    return "[ID number removed]";
  });

  return { text, redactions };
}
