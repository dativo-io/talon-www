# Talon website redesign: UX design contract

Status: Proposed for review (step 1 of 8). This is a maintainer decision record, not public marketing copy. Each subsequent step is a separate PR against the latest merged main. No step authorizes a change to shipped product capabilities.

## Objective

Make Talon understandable on first contact, convincing to a buyer and credible to a technical evaluator. Show a concrete business outcome before explaining its implementation. Keep technical depth available on demand.

The primary problem is cognitive load, not simply page length. Repeated slogans, uppercase kickers, competing links and implementation terminology force visitors to decode the product before they see its value.

## Audience and positioning

- Primary commercial journey: teams already operating AI workflows and implementation partners managing production AI for customers. Start with a specific operational problem and a bounded pilot.
- Technical journey: developers and architects evaluating self-hosted OSS, supported integration paths and reproducible enforcement.
- Keep Talon runtime-agnostic. n8n is a focused acquisition/solution path, not the product category.
- Preserve the category: open-source, self-hosted AI control plane, with shared company policy for connected AI use cases.
- Present cost, policy (including data and actions), reliability and operational visibility/evidence as connected outcomes. Action control is a concrete differentiator, not the entire product.
- Do not introduce claims of guaranteed security, compliance, uptime, cost savings, or coverage of every AI action.

Candidate hero (to validate in step 3, not approved copy):

> Stay in control as AI scales
>
> Apply company policy, manage spending and keep connected AI workflows reliable with one self-hosted control plane.

Primary CTA candidate: Discuss a pilot (existing /pilot/ route). Secondary: See how it works (existing reproducible proof or on-page product demonstration). Quickstart and GitHub remain obvious evaluator paths, but must not compete as additional hero buttons. Do not promise a hosted free trial or generic demo booking if the actual offer is a scoped technical fit call.

## Baseline: inspected source on main

Homepage blob: a08d153497c528fcc00f4aaf0b18ff6fc84bc8f9 (`index.html`). These are source measurements, not a rendered browser or production analytics audit.

| Measure | Baseline |
| --- | ---: |
| Homepage HTML characters (JS string length) | 11,062 |
| Main-content words | 435 |
| First-section words | 132 |
| Main sections | 5 |
| Main-content anchor elements | 16 |
| Main H1/H2/H3 headings | 12 |
| Hero buttons | 2, plus additional quickstart and proof links |

Word-count method: extract the text between main tags, replace HTML tags with spaces, split on whitespace, count tokens containing a Unicode letter or digit; includes link labels and captions, excludes header, footer and metadata. Hero uses the first section only. Use the same method on later source snapshots; report rendered measurements separately.

Observed examples: "Same controls. Every connected use case.", "One problem. One useful next step.", "Keep your app.", "Apply the company rule.", "See what happened." The hero mixes the shared-policy promise with a technical verdict, dispatch counters, approval/claim detail and a reproducibility link.

Source CSS: `styles.css` uses a dark blue/black background, radial gradients, very tight headline tracking and pill-shaped gradient buttons. `homepage-clean.css` adds a separate dark case-page layer, uppercase spaced kickers, hard-coded colors and numerous bordered surfaces. `site-nav.css` owns responsive menu behavior and additional dark color literals. These are source observations; visual contrast and layout must be verified in browser previews.

## Design direction: Quiet Confidence

Reference approach: Wonderful (business outcomes first), WorkOS (infrastructure clarity), Linear (product craft) and Tailscale (technical accessibility). These are inspiration, not instructions to copy layouts, assets or branding.

- Predominantly light, warm neutral canvas; strong typography and whitespace; dark sections selectively for product proof.
- Candidate tokens: canvas #F6F5F0, ink #172522, primary #15594B, soft accent #D4E8DD, surface #FFFFFF. Validate contrast, states and existing Talon mark before approval; keep canonical logo and favicon.
- Use existing Inter/system fallback initially. No remote font or framework dependency merely for visual polish.
- Desktop reference: 64–80px hero, 40–48px section headings, 17–19px body, 1.5–1.65 line height, 100–140px major section spacing, ~1200px max container. Adapt fluidly to mobile and content; these are design targets, not fixed sizes.
- Prefer solid primary buttons, clear secondary links, selective borders, few decorative surfaces and consistent icons. Reserve monospace for code and technical evidence. Avoid stock AI imagery, decorative gradients and grids of identical cards.
- Sentence-case headings; no decorative trailing periods, em dashes, dot-separated fragments, slash labels or arrows in headings. Preserve necessary punctuation, technical identifiers and exact commands. Remove kickers unless they genuinely orient a visitor.
- One idea per section. Show product behavior, not an inventory of technical nouns. Captions and caveats must remain legible, adjacent to claims, and never hidden behind hover.

## Target information architecture

Seven storytelling modules, grouped initially into the existing five HTML sections to preserve the current focused-site contract:

1. Hero + compact verified compatibility cues: what Talon is, why it matters, primary and secondary CTA.
2. Business outcomes + simple how-it-works illustration: protect the business, manage cost, keep workflows running, understand decisions; connect, enforce, verify.
3. Relevant use cases and next steps: support, document processing (use the existing vendor-contract-review route until a validated broader route exists), People Analytics and coding; a clear developer quickstart.
4. Product proof: one meaningful synthetic scenario and one approved console image or clearly identified product visual. Link to reproducible proof; avoid a gallery.
5. Pilot CTA: one existing workflow, one rule, one scoped technical fit call.

Keep the seven modules as a narrative, not a requirement to add more section wrappers. Any later change to the five-section guard must be deliberately reviewed alongside equivalent focus checks. Preserve deep links: governed-actions, how-it-works, use-cases, operations-console, pilot. Keep canonical docs, use-case, enterprise, comparison and campaign routes available. No route is deleted merely to reduce homepage density.

Suggested main nav: Product/How it works, Solutions/Use cases, Developers/Docs, and one commercial CTA; keep enterprise and GitHub easy to find. Exact structure is a step 3 decision, not a commitment to dropdowns or new pages.

## Truth and publication invariants

- Policy only applies to model traffic and business actions routed through supported interception paths. Unobserved/bypassed actions stay outside control.
- Exact-action authorization and separate human approval do not themselves execute a refund or other business effect. Keep zero dispatch before approval and authorized claim, and distinguish policy verdict from downstream dispatch. The example is synthetic, uses a counting test adapter and is not real payments.
- MCP discovery/call controls and exact HTTP action authorization are distinct capabilities; do not conflate them.
- OSS Operations Console is read-only and displays observed activity. Signed evidence is tamper-evident, not a compliance certificate.
- Planned Enterprise is explicitly planned, not shipped. Integration logos are compatibility statements only when supported paths are verified; never imply customer or partner endorsements.
- No invented product screenshots, fake customer logos, unverified metrics or unreleased flagship demo assets. Illustrations/mockups must be labeled; real screenshots use the existing lock and upstream source. Never refresh the lock simply to make CI pass.

## Implementation boundaries

The repository is static HTML/CSS/JS plus Docusaurus, not an Astro/React migration. Prefer additive, scoped CSS during transition to avoid breaking legacy pages with hard-coded dark colors.

- `index.html`, `styles.css`, `homepage-clean.css`, `site-nav.css`, `growth.css`: review cascade and scope; growth styles load at build time after source styles.
- `scripts/normalize-site-nav.cjs` is the canonical built marketing navigation. Edit it and its tests when changing navigation; avoid source-only changes overwritten in dist.
- `scripts/apply-growth-optimizations.cjs` owns production metadata overrides and growth asset injection. Align updated homepage metadata there and in source; inspect actual dist.
- Keep `scripts/test-first-run-journeys.cjs` (five sections, <11,500 chars, route/anchor and synthetic proof assertions), nav checks, current-capabilities checks, brand checks, docs source contracts, screenshot lock and SEO guards. Update structural assertions only with a reviewed equivalent; never weaken truth assertions.
- Preserve Docusaurus first-run paths and upstream Talon docs provenance. Keep root/docs sitemaps, canonicals, redirects, internal links and indexing controls intact.
- Preserve existing growth intent/placement/primary attributes and Umami events, especially Funnel CTA and Pilot Booking Click. Do not duplicate tracking or log payloads, personal data, raw URLs or booking tokens. A click is not a booking.
- Use `./scripts/build-site-with-docs.sh` for deployable preview and CI; raw HTML preview lacks generated screenshots and build-time transformations. Do not deploy from feature branches or merge on behalf of the reviewer.

## Acceptance and measurement

| Check | Target |
| --- | --- |
| Hero headline | <= 8 words, communicates a meaningful outcome |
| Hero description | <= 30 words, category and concrete value |
| Hero CTAs | One primary and one secondary; evaluator links elsewhere |
| Main-content words | Aim for 220–300 including mandatory caveats and links (31–49% below 435); remove 60–70% of redundant explanatory marketing prose where practical, not safety-critical labels |
| Hero section | Aim for <= 80 words including necessary proof caption if proof remains there |
| Story | One message per module; no repetitive heading punctuation |
| Comprehension | In a 10-second test, at least 8/10 relevant first-time participants can explain what Talon does and identify a next step; report actual sample, not assumed success |
| Responsive | Built preview at 320, 390, 768, 1024 and 1440px; no horizontal overflow, clipped text or obscured menu |
| Accessibility | WCAG 2.2 AA target, keyboard navigation, visible focus, meaningful headings/alt text, contrast >=4.5:1 normal text and >=3:1 large text, reduced motion support |
| Performance | Compare built before/after Lighthouse on comparable mobile settings; target LCP <=2.5s, CLS <=0.1 and field INP <=200ms when sufficient data exists; no unreviewed major asset/dependency additions |
| Conversion | Homepage -> /pilot/ -> Pilot Booking Click; track evaluator proof/quickstart clicks separately; report confirmed bookings separately from clicks |

Compare raw and consistently filtered Umami traffic; exclude the known aocr.org referral pattern in the secondary view without assuming remaining traffic is human. No invented baseline conversion rate. Capture built desktop/mobile screenshots and performance baseline before visual implementation; this source-only PR does not establish them. With low traffic, use qualitative comprehension and pilot fit before interpreting conversion differences.

## Delivery sequence and approval gates

| Step | Goal and implementation | Review gate |
| --- | --- | --- |
| 1 | UX foundation: this contract and source baseline | Agree on audience, style, constraints and criteria; no live content changed |
| 2 | Visual identity: scoped design tokens, typography, spacing, buttons, representative built preview | Approve light/dark treatment and desktop/mobile screenshots; existing pages remain usable |
| 3 | Navigation and hero: outcome-first copy, canonical nav and CTA hierarchy, production metadata | 10-second first-impression review; links, tracking, menu and anchor checks |
| 4 | Homepage storytelling: implement focused modules and trim duplicated copy | Before/after word counts, narrative flow, all boundaries and existing entry paths |
| 5 | Product visualization and proof: clear synthetic scenario and approved product imagery | Proof accurately represents actual behavior; provenance and accessibility pass |
| 6 | Solutions and partner journeys: validated n8n and customer support/document processing paths; retain People Analytics sales proof and coding evaluator path | Validated claims, routes, CTA continuity and integration support |
| 7 | Secondary marketing pages: apply approved design language to pilot, use cases, product/comparison pages, footer; docs retain their developer-first IA | Consistency, no broken legacy pages or SEO/analytics changes without review |
| 8 | Quality and conversion validation: full built-site QA, accessibility, performance, SEO, telemetry and comprehension protocol | Document measured results, remaining issues and go/no-go for rollout |

Each PR contains scope, rationale, concrete diff, before/after evidence where applicable, tests actually run, known limitations and explicit reviewer checklist. Base subsequent branches on the latest merged main, not an unapproved predecessor. If the owner requests a revision, amend the current PR and stop before the next step.

## Step 1 review

- [ ] Agree on business-value-first storytelling while retaining the AI control-plane category.
- [ ] Agree on Quiet Confidence as the design hypothesis and keep the canonical mark.
- [ ] Agree on two distinct journeys, with the pilot as commercial CTA and proof/quickstart for evaluators.
- [ ] Agree on five focused section wrappers, seven narrative modules and revised word-count target.
- [ ] Agree on preserving product truth, technical depth, routes, provenance and analytics.
- [ ] Agree on the eight-step, owner-merged sequence.

Step 1 changes only this maintainer document under scripts/ (excluded by the production copy step). Browser testing, full build, screenshots and analytics measurement remain outstanding; no claim that they passed is made.
