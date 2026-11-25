'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {escapeMdxJsxOutsideCode:escape}=require('../docs-site/scripts/escape-mdx-prose.cjs');
test('onboarding commands and table placeholders stay literal',()=>{
 const row='| Register | \x60talon agents add <name> --owner <team>\x60 | once |';
 assert.equal(escape(row),row);
 assert.equal(escape('\x60talon agents show <name>\x60'),'\x60talon agents show <name>\x60');
 assert.equal(escape('Latency <15ms; use \x60<agent-key>\x60. Also <placeholder>.'),'Latency &lt;15ms; use \x60<agent-key>\x60. Also &lt;placeholder>.');
});
test('multiple delimiters, multiline code spans and literal code blocks',()=>{
 for(const code of ['\x60\x60a \x60 <name>\x60\x60','\x60line\n<name>\x60','\x60\x60\x60bash\ncurl <name>\n\x60\x60\x60','~~~~text\n<name>\n~~~\n<team>\n~~~~','\x60\x60\x60\x60md\n\x60\x60\x60\n<name>\n\x60\x60\x60\n\x60\x60\x60\x60']){
  assert.equal(escape(code),code);
 }
 assert.equal(escape('unmatched \x60 and <name>'),'unmatched \x60 and &lt;name>');
 assert.equal(escape('Already &lt; escaped, and \x60&lt;\x60 intentionally literal.'),'Already &lt; escaped, and \x60&lt;\x60 intentionally literal.');
});
