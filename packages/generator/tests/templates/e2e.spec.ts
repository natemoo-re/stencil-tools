import e2e from '../../src/templates/e2e';
import test from 'ava';

test('generates file without any options', t => {
	const sourceText = e2e();
	const template = `import { newE2EPage } from '@stencil/core/testing';

describe('my-component', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<my-component></my-component>');

    const element = await page.find('my-component');
    expect(element).not.toBeNull();
  });
});
`;

	t.is(sourceText, template);
});

test('ends with a newline', t => {
	const sourceText = e2e();
	t.true(sourceText.endsWith('\n'));
});

test('generates file with tabs', t => {
	const indent = '\t';
	const sourceText = e2e({ indent });

	const lines = sourceText.split('\n').filter(ln => /^\s+/gm.test(ln));
	t.true(lines.every(ln => ln.startsWith(indent)));
});

test('generates file with 2 spaces', t => {
	const indent = '  ';
	const sourceText = e2e({ indent });

	const lines = sourceText.split('\n').filter(ln => /^\s+/gm.test(ln));
	t.true(lines.every(ln => ln.startsWith(indent)));
});

test('generates file with 4 spaces', t => {
	const indent = '    ';
	const sourceText = e2e({ indent });

	const lines = sourceText.split('\n').filter(ln => /^\s+/gm.test(ln));
	t.true(lines.every(ln => ln.startsWith(indent)));
});

test('generates file with single quotes', t => {
	const sourceText = e2e({ quotes: `'` });
	const single = sourceText.indexOf(`'`) > -1;
	const double = sourceText.indexOf(`"`) > -1;

	t.true(single && !double, 'contains double quotes and no single quotes');
});

test('generates file with double quotes', t => {
	const sourceText = e2e({ quotes: `"` });
	const double = sourceText.indexOf(`"`) > -1;
	const single = sourceText.indexOf(`'`) > -1;

	t.true(double && !single, 'contains double quotes and no single quotes');
});

test('describes selector', t => {
	const sourceText = e2e({ selector: 'x-test' });
	t.regex(sourceText, /^describe\('x-test'/gm);
});

test('finds selector', t => {
	const sourceText = e2e({ selector: 'x-test' });
	t.regex(sourceText, /await page.find\('x-test'\)\;/gm);
});
