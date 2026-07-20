const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });

const text = (value, maxLength) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const validEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200;

const allowedOrigin = (request) => {
  const origin = request.headers.get('Origin');
  if (!origin) return true;

  try {
    const {hostname, protocol} = new URL(origin);
    if (protocol !== 'https:' && hostname !== 'localhost' && hostname !== '127.0.0.1') return false;
    return hostname === 'dativo.io'
      || hostname === 'www.dativo.io'
      || hostname.endsWith('.pages.dev')
      || hostname === 'localhost'
      || hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

export async function onRequestPost({request, env}) {
  if (!allowedOrigin(request)) return json({error: 'Request origin is not allowed.'}, 403);

  if (!env.RESEND_API_KEY || !env.PILOT_TO_EMAIL || !env.PILOT_FROM_EMAIL) {
    console.error('Pilot form environment is incomplete.');
    return json({error: 'The private pilot form is not configured yet.'}, 503);
  }

  let input;
  try {
    const contentType = request.headers.get('Content-Type') || '';
    input = contentType.includes('application/json')
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return json({error: 'Invalid form submission.'}, 400);
  }

  if (text(input.website, 200)) return json({ok: true});

  const submission = {
    name: text(input.name, 120),
    email: text(input.email, 200).toLowerCase(),
    company: text(input.company, 160),
    role: text(input.role, 160),
    useCase: text(input.use_case, 240),
    stack: text(input.stack, 300),
    problem: text(input.problem, 80),
    notes: text(input.notes, 3000),
    consent: text(input.consent, 20),
  };

  if (
    !submission.name
    || !validEmail(submission.email)
    || !submission.company
    || !submission.useCase
    || !submission.stack
    || !submission.problem
    || submission.consent !== 'yes'
  ) {
    return json({error: 'Please complete the required fields.'}, 400);
  }

  const problemLabels = {
    cost: 'Cost or budget control',
    reliability: 'Retries or provider fallback',
    policy: 'PII, models, tools or data destinations',
    sessions: 'Session visibility or incident explanation',
    other: 'Another bounded operating problem',
  };
  const problem = problemLabels[submission.problem] || submission.problem;
  const receivedAt = new Date().toISOString();

  const message = [
    'New Dativo Talon pilot request',
    '',
    `Name: ${submission.name}`,
    `Work email: ${submission.email}`,
    `Company: ${submission.company}`,
    `Role: ${submission.role || 'Not provided'}`,
    `AI use case: ${submission.useCase}`,
    `Current stack: ${submission.stack}`,
    `First problem: ${problem}`,
    '',
    'Notes:',
    submission.notes || 'Not provided',
    '',
    `Received: ${receivedAt}`,
    `Source IP hint: ${request.headers.get('CF-Connecting-IP') || 'Unavailable'}`,
  ].join('\n');

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.PILOT_FROM_EMAIL,
      to: [env.PILOT_TO_EMAIL],
      reply_to: submission.email,
      subject: `Talon pilot: ${submission.company} — ${problem}`,
      text: message,
    }),
  });

  if (!resendResponse.ok) {
    const providerMessage = await resendResponse.text();
    console.error(`Resend rejected pilot submission (${resendResponse.status}): ${providerMessage}`);
    return json({error: 'The request could not be delivered. Please try again.'}, 502);
  }

  return json({ok: true});
}

export function onRequestGet() {
  return json({error: 'Method not allowed.'}, 405);
}
