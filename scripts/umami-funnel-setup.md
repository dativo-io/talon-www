# Dativo Talon — Umami conversion setup (operator runbook)

**Status:** Website events are implemented in `growth.js` and the build-injected
`scripts/inject-umami.cjs` helper. **This file is a setup specification, not
evidence that Umami Cloud Goals, Funnels, filters or Boards already exist.**
Creating those saved reports requires authenticated access to the actual
Umami Cloud workspace.

Website tracker: `dativo.io` and `www.dativo.io`, website ID
`e9e60801-c09d-4f9f-8890-7b76cb6fdbcb` (public client-side identifier).
Do **not** put Umami API credentials or recipient contact details into
this repository, browser scripts or GitHub issues.

## 1. Conversion definitions

| Signal | Umami type | Interpretation |
| --- | --- | --- |
| `/pilot/` | Viewed page | Visited the pilot proposition; no booking intent proven |
| `Pilot Booking Click` | Triggered event | Opened the outbound Google Calendar scheduler; **not a booking** |
| `Funnel CTA` + `intent=pilot-offer` | Triggered event with property filter | Clicked through to the pilot landing page; not an actual booking |
| `Quickstart Demo Click` | Triggered event | Followed the no-key demo link; not proof of completion |
| `Product Demo Click` | Triggered event | Followed the multi-use-case demo link; not proof of completion |
| `Demo Play` | Triggered event | Clicked the applicable on-page demo play button |
| `GitHub Click` | Triggered event | Opened a Talon OSS GitHub repository link |
| `Evidence Click` / `Docs Click` | Triggered events | Supporting technical-evaluation activity |

`Funnel CTA` is a generic classified click with non-sensitive `page`,
`intent`, `placement`, `destination`, and CTA-label metadata. It can
coexist with a legacy named event on the **same** click: do not add event
counts together to infer unique evaluators. `Pilot Booking Click` is
deliberately not duplicated as `Funnel CTA`.

The build-injected named-event helper only reports the current page path
and a safe destination (internal pathname or external hostname). Never
record raw link URLs, query strings, booking tokens, email addresses,
visitor IDs, appointment details or customer payloads in custom events.
Umami's pageview URL/UTM handling is separate; keep campaign URLs anonymous.

## 2. Create these Goals in Umami Cloud

In the selected `dativo.io` website, use **Goals → Add Goal**:

| Goal name | Type | Condition |
| --- | --- | --- |
| Pilot page reached | Viewed page | `/pilot/` |
| Calendar opened | Triggered event | `Pilot Booking Click` |
| No-key demo interest | Triggered event | `Quickstart Demo Click` |
| Full demo interest | Triggered event | `Product Demo Click` |

Optionally create a **Pilot CTA clicked** goal using `Funnel CTA`
filtered to property `intent=pilot-offer` where the Umami UI/version
supports goal-property filters. Otherwise use Events filtered by that
property; never equate every generic `Funnel CTA` with pilot intent.

Primary website KPI: **unique pilot visitors who triggered
`Pilot Booking Click` / unique pilot-page visitors** over the same
time range (an outbound **scheduling intent rate**, not a booking rate).

Keep **actual confirmed Google Calendar meetings**, accepted/qualified
meetings and opened pilots in a separate private lead ledger. Do not
send meeting invitees' identities to Umami. Reconcile count totals
periodically; no user-level identity stitching.

## 3. Create these ordered Funnels

In **Funnels → Add Funnel**, use the `dativo.io` website and a
60-minute step window as a first operating baseline. Steps must occur
in order; other pageviews between them are allowed.

| Funnel | Ordered steps | Question |
| --- | --- | --- |
| Buyer to calendar | Viewed `/` → Viewed `/pilot/` → Event `Pilot Booking Click` | Does the homepage convert into scheduling intent? |
| Proof to calendar | Viewed `/talon/docs/action-gateway-proof/` → Viewed `/pilot/` → Event `Pilot Booking Click` | Do evaluators seeing reproducible proof enter a pilot conversation? |
| Docs to calendar | Viewed `/talon/docs/` → Viewed `/pilot/` → Event `Pilot Booking Click` | Does the docs front door reach commercial intent? |
| Pilot landing efficiency | Viewed `/pilot/` → Event `Pilot Booking Click` | What is the scheduling-link click rate for pilot-page visitors? |

Optional separately saved experiment: docs front door → no-key demo page
→ pilot page → calendar click. Do not force all visitors through that
path: some will arrive at the pilot page from an outbound campaign.

If funnels support per-step property filters, use them for source-specific
analyses; avoid requiring `Funnel CTA` as an extra step because
`/pilot/` pageviews are a more stable canonical step.

## 4. Clean traffic and attribution

- Use **UTM source, medium and campaign** for actual outbound links. All
  values must represent campaigns/placements, never people. Example:
  `?utm_source=linkedin&utm_medium=outreach&utm_campaign=pilot_nov2026`.
- Analyze **raw** traffic and a **filtered** view excluding known
  `aocr.org` referrer noise. The exclusion is heuristic and cannot
  establish that retained sessions are human. Preserve both counts.
- Separate internal/QA sessions by clean, aggregate criteria when
  available. Do not use an email, IP or distinct ID as a custom event property.
- Report per landing page/campaign: clean visitors, pilot views,
  `Pilot Booking Click` visitors, and meetings manually confirmed.
- Compare the period before/after the new homepage with consistent
  filters; avoid claiming causal uplift without a controlled experiment.

## 5. QA and acceptance

1. Verify the deployed hostname is `dativo.io`, that the Umami tracker
   appears only once and that local/previews aren't recorded.
2. In a fresh browser, open `/pilot/`, click the calendar CTA once,
   then confirm **one** `Pilot Booking Click` event with
   `page=/pilot/` and `channel=google_calendar`. This alone is not
   evidence of a scheduled appointment.
3. On `/`, click **Pilot one use case** and confirm
   `Funnel CTA`, `intent=pilot-offer`, then a `/pilot/` pageview.
4. Click the no-key demo and action proof links; check relevant named
   events and safe internal-path properties without URL query strings.
5. Test a campaign URL with anonymous UTM values. Verify source
   attribution appears in the Umami dashboard.
6. In a separate private check, book and cancel one real test meeting;
   verify the Google Calendar invite, not Umami, proves completion.
7. Record whether all Goals and Funnels above were **actually created**
   in the workspace. This cannot be inferred from a successful website
   build or this runbook.

Code tests:
`node scripts/test-pilot-conversion.cjs`,
`node scripts/test-umami-event-privacy.cjs`, and
`node scripts/test-report-traffic.cjs`.

Documentation: https://docs.umami.is/docs/goals and
https://docs.umami.is/docs/funnel.
