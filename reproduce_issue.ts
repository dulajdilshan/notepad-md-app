
import { extractTodos } from './src/utils/todoParser';

const testCases = [
    {
        name: 'Standard todo',
        input: '- [ ] Task 1',
        shouldMatch: true
    },
    {
        name: 'Checked todo',
        input: '- [x] Task 1',
        shouldMatch: true
    },
    {
        name: 'Asterisk todo',
        input: '* [ ] Task 1',
        shouldMatch: true
    },
    {
        name: 'Ordered todo (numbered)',
        input: '1. [ ] Task 1',
        shouldMatch: true // Expect to fail currently
    },
    {
        name: 'Mixed indentation',
        input: '  - [ ] Task 1',
        shouldMatch: true
    },
    {
        name: 'Extra spaces',
        input: '- [ ]   Task 1',
        shouldMatch: true
    },
    {
        name: 'Empty todo',
        input: '- [ ]',
        shouldMatch: true // Expect to fail currently
    },
    {
        name: 'No space after bracket',
        input: '- [ ]Task',
        shouldMatch: false // Valid markdown needs space? usually yes.
    },
    {
        name: 'No space after dash',
        input: '-[ ] Task',
        shouldMatch: false
    }
];

testCases.forEach(test => {
    const result = extractTodos(test.input);
    const matched = result.length > 0;
    console.log(`${test.name}: ${matched === test.shouldMatch ? 'PASS' : 'FAIL'} (Expected ${test.shouldMatch}, got ${matched})`);
    if (matched && result.length > 0) {
        console.log(`  Captured text: "${result[0].text}"`);
    }
});
