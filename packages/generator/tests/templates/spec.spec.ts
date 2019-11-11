import spec from '../../src/templates/spec';
import test from 'ava';

test('generates file without any options', t => {
	const sourceText = spec();
	const template = `import { newSpecPage } from '@stencil/core/testing';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  it('builds', () => {
    expect(new MyComponent()).toBeTruthy();
  });
});

describe('my-component', () => {
  it('should render my-component', () => {
    const page = await newSpecPage({
      components: [MyComponent],
      html: '<my-component></my-component>'
    });

    expect(page.root).toEqualHtml('<my-component></my-component>');
  });
});
`;

	t.is(sourceText, template);
});

test('generates file with tabs', t => {
	const indent = '\t';
	const sourceText = spec({ indent });

	const lines = sourceText.split('\n').filter(ln => /^\s+/gm.test(ln));
	t.true(lines.every(ln => ln.startsWith(indent)));
});

test('generates file with 2 spaces', t => {
	const indent = '  ';
	const sourceText = spec({ indent });

	const lines = sourceText.split('\n').filter(ln => /^\s+/gm.test(ln));
	t.true(lines.every(ln => ln.startsWith(indent)));
});

test('generates file with 4 spaces', t => {
	const indent = '    ';
	const sourceText = spec({ indent });

	const lines = sourceText.split('\n').filter(ln => /^\s+/gm.test(ln));
	t.true(lines.every(ln => ln.startsWith(indent)));
});

test('generates file with single quotes', t => {
	const sourceText = spec({ quotes: `'` });
	const single = sourceText.indexOf(`'`) > -1;
	const double = sourceText.indexOf(`"`) > -1;

	t.true(single && !double, 'contains double quotes and no single quotes');
});

test('generates file with double quotes', t => {
	const sourceText = spec({ quotes: `"` });
	const double = sourceText.indexOf(`"`) > -1;
	const single = sourceText.indexOf(`'`) > -1;

	t.true(double && !single, 'contains double quotes and no single quotes');
});

test('describes selector', t => {
	const sourceText = spec({ selector: 'x-test' });
	t.regex(sourceText, /^describe\('x-test'/gm);
});

test('imports from tag', t => {
	const sourceText = spec({ tag: 'x-test' });
	t.regex(sourceText, /from '\.\/x\-test'\;/gm);
});

test('imports class name', t => {
	const sourceText = spec({ className: 'TestClass' });
	t.regex(sourceText, /^import \{ TestClass \}/gm);
});

test('expects new class name', t => {
	const sourceText = spec({ className: 'TestClass' });
	t.regex(sourceText, /expect\(new TestClass\(\)\)\.toBeTruthy\(\)\;/gm);
});
