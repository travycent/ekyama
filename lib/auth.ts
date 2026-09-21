// Minimal demo auth for the counsellor console. This is a hackathon proof
// of concept — a real deployment needs proper per-counsellor accounts,
// audit logging and access review. See README "Known limitations".

export function checkCounsellorToken(token: string | null): boolean {
  const expected = process.env.COUNSELLOR_TOKEN || "demo-counsellor";
  return !!token && token === expected;
}
