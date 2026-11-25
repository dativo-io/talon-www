'use strict';
const fs = require('node:fs');
const path = require('node:path');

function attributes(tag) {
  const result = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) result[m[1].toLowerCase()] = m[2] ?? m[3];
  return result;
}
function tags(html, name) { return [...html.matchAll(new RegExp('<' + name + '\\b[^>]*>', 'gi'))].map(m => attributes(m[0])); }
function pageInfo(html) {
  const canonical = tags(html, 'link').filter(t => t.rel?.toLowerCase() === 'canonical').map(t => t.href);
  const noindex = tags(html, 'meta').some(t => ['robots','googlebot'].includes(t.name?.toLowerCase()) && /(?:^|[\s,])noindex(?:$|[\s,])/i.test(t.content || ''));
  return {canonical, noindex};
}
function redirectMap(root) {
  const file = path.join(root, '_redirects');
  const result = new Map();
  if (fs.existsSync(file)) for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const [from,to,status] = line.trim().split(/\s+/);
    if (from?.startsWith('/') && !/[*:]/.test(from) && to && /^(301|302|303|307|308)$/.test(status || '')) result.set(from,to);
  }
  return result;
}
function htmlPages(root) {
  const result = new Map();
  function walk(dir) {
    for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
      const file = path.join(dir,e.name);
      if (e.isDirectory()) walk(file);
      else if (e.isFile() && e.name.endsWith('.html')) {
        const rel = path.relative(root,file).split(path.sep).join('/');
        if (e.name === '404.html') continue;
        const route = '/' + (rel === 'index.html' ? '' : rel.endsWith('/index.html') ? rel.slice(0,-10) : rel.slice(0,-5) + '/');
        result.set(route,{file,html:fs.readFileSync(file,'utf8')});
      }
    }
  }
  walk(root); return result;
}
function indexable(root,origin) {
  const redirects = redirectMap(root);
  const pages = htmlPages(root);
  const indexed = new Map(), excluded = new Map();
  for (const [route,page] of pages) {
    const {canonical,noindex} = pageInfo(page.html);
    const reason = route === '/docs/talon/' ? 'historical alias' : redirects.has(route) || redirects.has(route.slice(0,-1)) ? 'redirect' : noindex ? 'noindex' : canonical.length && canonical[0] !== origin + route ? 'canonical alias' : null;
    if (reason) excluded.set(route,reason);
    else indexed.set(route,{...page,canonical});
  }
  return {pages,indexed,excluded,redirects};
}
module.exports = {attributes,tags,pageInfo,redirectMap,htmlPages,indexable};
