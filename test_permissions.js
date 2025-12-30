const { getPermissionState } = require('./lib/permissions');

console.log('Testing unified permission system:');
console.log('');

// Test 1: Owner as string
console.log('Test 1 - Owner as string:');
const config1 = { OWNER_NUM: '237694668970', SUDOERS: '243123456789,237987654321' };
const result1 = getPermissionState('237694668970@s.whatsapp.net', config1);
console.log('Config:', config1);
console.log('Sender: 237694668970@s.whatsapp.net');
console.log('Result:', result1);
console.log('');

// Test 2: Sudoer from comma-separated string
console.log('Test 2 - Sudoer from comma-separated string:');
const result2 = getPermissionState('243123456789@s.whatsapp.net', config1);
console.log('Config:', config1);
console.log('Sender: 243123456789@s.whatsapp.net');
console.log('Result:', result2);
console.log('');

// Test 3: Array configuration
console.log('Test 3 - Array configuration:');
const configArray = { OWNER_NUM: ['237694668970', '237111111111'], SUDOERS: ['243123456789'] };
const result3 = getPermissionState('237111111111@s.whatsapp.net', configArray);
console.log('Config:', configArray);
console.log('Sender: 237111111111@s.whatsapp.net');
console.log('Result:', result3);
console.log('');

// Test 4: Non-privileged user
console.log('Test 4 - Non-privileged user:');
const result4 = getPermissionState('999999999999@s.whatsapp.net', config1);
console.log('Config:', config1);
console.log('Sender: 999999999999@s.whatsapp.net');
console.log('Result:', result4);
console.log('');

// Test 5: Number input (should be normalized to JID)
console.log('Test 5 - Number input (should be normalized):');
const result5 = getPermissionState('237694668970', config1);
console.log('Config:', config1);
console.log('Sender: 237694668970 (number)');
console.log('Result:', result5);