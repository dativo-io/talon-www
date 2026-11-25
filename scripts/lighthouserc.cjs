module.exports = {
  ci: {
    collect: {
      url: ['http://127.0.0.1:8080/','http://127.0.0.1:8080/use-cases/','http://127.0.0.1:8080/solutions/n8n/','http://127.0.0.1:8080/pilot/','http://127.0.0.1:8080/talon/docs/'],
      numberOfRuns: 3,
      settings: {chromeFlags:'--no-sandbox',throttlingMethod:'simulate',formFactor:'mobile',blockedUrlPatterns:['*cloud.umami.is*','*static.cloudflareinsights.com*'],onlyCategories:['performance','accessibility','best-practices','seo']},
    },
    assert: {
      assertions: Object.fromEntries([
        ['categories:performance',{minScore:0.95,aggregationMethod:'median-run'}],
        ['categories:accessibility',{minScore:1,aggregationMethod:'median-run'}],
        ['categories:best-practices',{minScore:0.95,aggregationMethod:'median-run'}],
        ['categories:seo',{minScore:1,aggregationMethod:'median-run'}],
        ['largest-contentful-paint',{maxNumericValue:2500,aggregationMethod:'median-run'}],
        ['cumulative-layout-shift',{maxNumericValue:0.1,aggregationMethod:'median-run'}],
      ].map(([key,limits])=>[key,[process.env.TALON_RELEASE_GATE==='1'?'error':'warn',limits]])),
    },
    upload: {target:'filesystem',outputDir:'site-qa/lighthouse'},
  },
};
