import component from '../../src/templates/component';
import test from 'ava';

test('generates file without any options', t => {
  const sourceText = component();
  const template = `import { Component } from '@stencil/core';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true
})
export class MyComponent {

  render() {
    return (
      <div>
        <p>Hello <code>my-component</code></p>
      </div>
    );
  }
}
`;
  
  t.is(sourceText, template);
})

test('ends with a newline', t => {
  const sourceText = component();
  t.true(sourceText.endsWith('\n'));
})

test('generates file with tabs', t => {
  const indent = '\t';
  const sourceText = component({ indent });

  const lines = sourceText.split('\n').filter(ln => /^\s+/gm.test(ln));
  t.true(lines.every(ln => ln.startsWith(indent)));
})

test('generates file with 2 spaces', t => {
  const indent = '  ';
  const sourceText = component({ indent });

  const lines = sourceText.split('\n').filter(ln => /^\s+/gm.test(ln));
  t.true(lines.every(ln => ln.startsWith(indent)));
})

test('generates file with 4 spaces', t => {
  const indent = '    ';
  const sourceText = component({ indent });

  const lines = sourceText.split('\n').filter(ln => /^\s+/gm.test(ln));
  t.true(lines.every(ln => ln.startsWith(indent)));
})

test('generates file with single quotes', t => {
  const sourceText = component({ quotes: `'` });
  const single = sourceText.indexOf(`'`) > -1;
  const double = sourceText.indexOf(`"`) > -1;

  t.true(single && !double, 'contains double quotes and no single quotes');
})

test('generates file with double quotes', t => {
  const sourceText = component({ quotes: `"` });
  const double = sourceText.indexOf(`"`) > -1;
  const single = sourceText.indexOf(`'`) > -1;
  
  t.true(double && !single, 'contains double quotes and no single quotes');
})

test('sets styleUrl based on tag', t => {
  const sourceText = component({ tag: 'x-test' });
  t.regex(sourceText, /styleUrl\: 'x-test\.css'/gm);
})

test('sets selector', t => {
  const sourceText = component({ selector: 'x-test' });
  t.regex(sourceText, /tag\: 'x-test'/gm);
})

test('sets class name', t => {
  const sourceText = component({ className: 'XTest' });
  t.regex(sourceText, /^export class XTest \{/gm);
})

test('sets imports', t => {
  const sourceText = component({ imports: ['Prop'] });
  t.regex(sourceText, /^import \{ Component, Prop \} from '@stencil\/core'/gm)
});

test('sets style extension', t => {
  const sourceText = component({ styleExt: 'scss' });
  t.regex(sourceText, /styleUrl\: 'my-component\.scss'/gm);
})

test('sets shadow', t => {
  const sourceText = component({ shadow: false });
  t.false(/shadow/gm.test(sourceText));
})