# Talon website measurement contract (v2)

Use Umami as the browser acquisition tracker. One shared growth.js listener; no legacy inline duplicate. A tracked click emits at most one custom click event. Pageviews and campaign landing events are distinct.

| Event | Meaning |
| --- | --- |
| Pilot Offer Click | Open /pilot/; supersedes generic Funnel CTA intent=pilot-offer |
| Pilot Booking Click | Open external calendar; NOT a booking |
| GitHub Click | Visit the OSS repository |
| Quickstart Demo Click | Open no-key demo |
| Product Demo Click | Open product demo |
| Evidence Click | Inspect evidence routes |
| Integration Example Click | n8n example, support or vendor-review example clicked from the n8n page |
| Console Screenshot Click | Open native-size real product image |
| Copy Install Command | Click copy on a recognized installation code block; not clipboard or execution success |
| Funnel CTA | Other governed navigation intents |
| Acquisition Campaign | Safe allowlisted UTM values on landing |
| Docs Click, Checklist Click, Demo Play | Existing evaluator signals |

Event version=2. Historical event names remain in historical exports; do not sum GitHub Click with Funnel CTA. No raw link text, query strings, fragments, clipboard, calendar link token, or arbitrary campaign text in custom properties. Do Not Track respected. Tracker configuration excludes search/hash. Do not claim anonymity or consent compliance from these settings alone.

## Campaign naming

Use lower-case fixed values:
- utm_source: linkedin, github, newsletter, google, bing, community, dativo
- utm_medium: organic_social, referral, email, organic, community, outreach
- utm_campaign: n8n_acquisition, ai_governance, oss, product_launch, talon, website_redesign
- utm_content: founder_post, company_post, dm, profile, article, template, readme, release

Example: https://dativo.io/solutions/n8n/?utm_source=linkedin&utm_medium=outreach&utm_campaign=n8n_acquisition&utm_content=dm

Never put a lead name, email, company-specific secret or user ID into UTM values. Because query collection is excluded, use the Acquisition Campaign event rather than assuming Umami's native UTM view is populated; verify in live account. Keep calendar attribution aggregate; do not add contact identifiers to analytics.

## Weekly report

Export Umami website_event.csv and run node scripts/report-traffic.cjs <export>. Report both raw and aocr.org referral-filtered distinct sessions, named-event sessions and ordered cohorts if url_path is supplied. Not human verification; cohorts overlap. Compare by deployment version/date, never blend v1 generic and v2 named click counts as identical. Cross-check Search Console impressions/clicks by landing page, GitHub traffic/release downloads where available and actual calendar bookings/qualified pilot conversations from their own systems. Do not infer confirmed installation from clicks or self-hosted usage.

## Live acceptance

On a production browser, verify one tracker, no Plausible, event_version=2, one named click event, current docs SPA route, no query/hash leakage, DNT behavior, canonical landing and campaign event. Check Umami dashboard and export. Credentials, API access and calendar confirmations are not in this repository.
