# Roshni front end source

The public design in this directory was synced from the private GitHub repository
`roshniempress/EmpAINewWebsite`, branch `main`, commit
`fbedf5cc62757720d4f9b7975ec0e61e8e48e838` (October 5, 2026).

The production integration keeps the site's existing backend and applies these
necessary adaptations to Roshni's source:

- Newsletter and waitlist forms use the site's same-origin CSRF and email capture
  API. The Health Intelligence intake uses the existing handoff API.
- The 12-question free assessment waits for durable storage before showing a
  result. With no symptoms reported, it avoids naming a priority domain or
  recommending products. Its paid upgrade leads to the account's Stripe flow.
- The redesigned account uses the existing member logic for yearly billing,
  assessment handoff, Stripe test labeling, saved results, and Premium gift
  claims.
- Pricing and assessment copy reflects the current membership configuration.
- `scripts/copy-legacy-html-to-public.mjs` publishes the dedicated
  `free-assessment.html` and keeps the old `assessment.html` prototype and
  `logo-options.html` design review page internal.

When syncing a newer upstream revision, preserve these integration behaviors
and run `node scripts/test-launch-red-flows.mjs` after the build staging step.
