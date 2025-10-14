// Simple test to verify superadmin creator permissions
// Run this with: node test-superadmin-permissions.js

const { canCreateRole, canAssignRole } = require('./functions/functions/src/utils/permissions');

console.log('Testing Superadmin Creator Permissions\n');
console.log('=' .repeat(50));

// Test cases for canCreateRole
console.log('\n1. Testing canCreateRole function:\n');

const createTests = [
  { creator: 'superadmin', target: 'superadmin', expected: true },
  { creator: 'admin', target: 'superadmin', expected: false },
  { creator: 'teacher', target: 'superadmin', expected: false },
  { creator: 'superadmin', target: 'admin', expected: true },
  { creator: 'admin', target: 'admin', expected: false },
  { creator: 'superadmin', target: 'teacher', expected: true },
  { creator: 'admin', target: 'teacher', expected: true },
  { creator: 'superadmin', target: 'parent', expected: true },
  { creator: 'admin', target: 'parent', expected: true },
];

let createPassed = 0;
let createFailed = 0;

createTests.forEach(test => {
  const result = canCreateRole(test.creator, test.target);
  const status = result === test.expected ? '✅ PASS' : '❌ FAIL';
  
  if (result === test.expected) {
    createPassed++;
  } else {
    createFailed++;
  }
  
  console.log(`${status} - ${test.creator} can create ${test.target}: ${result} (expected: ${test.expected})`);
});

// Test cases for canAssignRole
console.log('\n2. Testing canAssignRole function:\n');

const assignTests = [
  { assigner: 'superadmin', target: 'superadmin', expected: true },
  { assigner: 'admin', target: 'superadmin', expected: false },
  { assigner: 'teacher', target: 'superadmin', expected: false },
  { assigner: 'superadmin', target: 'admin', expected: true },
  { assigner: 'admin', target: 'admin', expected: false },
  { assigner: 'superadmin', target: 'teacher', expected: true },
  { assigner: 'admin', target: 'teacher', expected: true },
  { assigner: 'superadmin', target: 'parent', expected: true },
  { assigner: 'admin', target: 'parent', expected: true },
];

let assignPassed = 0;
let assignFailed = 0;

assignTests.forEach(test => {
  const result = canAssignRole(test.assigner, test.target);
  const status = result === test.expected ? '✅ PASS' : '❌ FAIL';
  
  if (result === test.expected) {
    assignPassed++;
  } else {
    assignFailed++;
  }
  
  console.log(`${status} - ${test.assigner} can assign ${test.target}: ${result} (expected: ${test.expected})`);
});

// Summary
console.log('\n' + '=' .repeat(50));
console.log('\nTest Summary:');
console.log(`canCreateRole: ${createPassed}/${createTests.length} passed, ${createFailed} failed`);
console.log(`canAssignRole: ${assignPassed}/${assignTests.length} passed, ${assignFailed} failed`);

const totalPassed = createPassed + assignPassed;
const totalTests = createTests.length + assignTests.length;
const totalFailed = createFailed + assignFailed;

console.log(`\nTotal: ${totalPassed}/${totalTests} passed, ${totalFailed} failed`);

if (totalFailed === 0) {
  console.log('\n🎉 All tests passed! Superadmin creator feature is working correctly.\n');
  process.exit(0);
} else {
  console.log('\n⚠️ Some tests failed. Please review the implementation.\n');
  process.exit(1);
}
