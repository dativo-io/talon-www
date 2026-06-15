const GOOGLE_ANALYTICS_ID = "G-827PWS9VRR";

const GOOGLE_ANALYTICS_SNIPPET = `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${GOOGLE_ANALYTICS_ID}');
</script>`;

class GoogleAnalyticsInjector {
  element(element) {
    element.append(GOOGLE_ANALYTICS_SNIPPET, { html: true });
  }
}

function isHtmlResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  return contentType.toLowerCase().includes("text/html");
}

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);

    if (request.method !== "GET" || !isHtmlResponse(response)) {
      return response;
    }

    return new HTMLRewriter()
      .on("head", new GoogleAnalyticsInjector())
      .transform(response);
  },
};
