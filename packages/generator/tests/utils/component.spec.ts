import { createSelector, guessPrefix } from '../../src/utils/component';
import test from 'ava';

test('works without a prefix', t => {
    const selector = createSelector('x-test');
    t.is(selector, 'x-test');
})

test('works with a prefix', t => {
    const selector = createSelector('x-test', 'my');
    t.is(selector, 'my-x-test');
})

test('ignores prefix with trailing dash', t => {
    const selector = createSelector('x-test', 'my-');
    t.is(selector, 'my-x-test');
})

test('ignores duplicated prefix', t => {
    const selector = createSelector('test-x-element', 'test');
    t.is(selector, 'test-x-element');
})

test('ignores duplicated prefix with trailing slash', t => {
    const selector = createSelector('test-x-element', 'test-');
    t.is(selector, 'test-x-element');
})

test('guesses prefix if shared', t => {
    const prefix = guessPrefix({
        'test-a': true,
        'test-b': true,
        'test-c': true
    })
    t.is(prefix, 'test');
})

test('unable to guess prefix if different', t => {
    const prefix = guessPrefix({
        'a-element': true,
        'b-element': true,
        'c-element': true
    })
    t.is(prefix, null);
})