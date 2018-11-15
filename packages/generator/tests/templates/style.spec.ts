import style from '../../src/templates/style';
import test from 'ava';

test('generates file without any options', t => {
  const sourceText = style();
  const template = `:host {
  /* display: block; */
}
`;
  
  t.is(sourceText, template);
})

test('generates file with tabs', t => {
  const indent = '\t';
  const sourceText = style({ indent });

  const lines = sourceText.split('\n').filter(ln => /^\s+/gm.test(ln));
  t.true(lines.every(ln => ln.startsWith(indent)));
})

test('generates file with 2 spaces', t => {
  const indent = '  ';
  const sourceText = style({ indent });

  const lines = sourceText.split('\n').filter(ln => /^\s+/gm.test(ln));
  t.true(lines.every(ln => ln.startsWith(indent)));
})

test('generates file with 4 spaces', t => {
  const indent = '    ';
  const sourceText = style({ indent });

  const lines = sourceText.split('\n').filter(ln => /^\s+/gm.test(ln));
  t.true(lines.every(ln => ln.startsWith(indent)));
})

test('generates file without shadow', t => {
  const sourceText = style({ shadow: false });
  t.regex(sourceText, /^my\-component \{/gm);
})

test('sets selector', t => {
  const sourceText = style({ selector: 'x-test', shadow: false });
  t.regex(sourceText, /^x-test \{/gm);
})

test('supports indented syntax for "sass" file', t => {
  const sourceText = style({ styleExt: 'sass' });
  t.true(sourceText.indexOf('{') === -1);
})
