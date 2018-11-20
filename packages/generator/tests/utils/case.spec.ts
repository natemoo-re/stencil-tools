import { uppercase, lowercase, uppercaseFirst, lowercaseFirst, dashToCamel, dashToPascal } from '../../src/utils/case';
import test from 'ava';

test('lowercases', t => {
    const result = uppercase('test');
    t.is(result, 'TEST');
})

test('uppercases', t => {
    const result = lowercase('TEST');
    t.is(result, 'test');
})

test('lowercases first', t => {
    const result = uppercaseFirst('test');
    t.is(result, 'Test');
})

test('uppercases first', t => {
    const result = lowercaseFirst('TEST');
    t.is(result, 'tEST');
})

test('converts dash to camel', t => {
    const result = dashToCamel('test-dash-case');
    t.is(result, 'testDashCase');
})

test('converts dash to Pascal', t => {
    const result = dashToPascal('test-dash-case');
    t.is(result, 'TestDashCase');
})
