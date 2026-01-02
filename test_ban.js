const { normalizeJid } = require('./lib/jid');
const { isBanned, banUser, unbanUser } = require('./lib/banManager');

console.log('Testing JID normalization:');
console.log('normalizeJid("1234567890@s.whatsapp.net"):', normalizeJid('1234567890@s.whatsapp.net'));
console.log('normalizeJid("1234567890-123456@g.us"):', normalizeJid('1234567890-123456@g.us'));
console.log('normalizeJid("1234567890"):', normalizeJid('1234567890'));

console.log('\nTesting ban system:');
const testJid = '1234567890@s.whatsapp.net';
console.log('Before ban - isBanned:', isBanned(testJid));
banUser(testJid);
console.log('After ban - isBanned:', isBanned(testJid));
unbanUser(testJid);
console.log('After unban - isBanned:', isBanned(testJid));

console.log('\nTesting different JID formats:');
const testJids = [
  '1234567890@s.whatsapp.net',
  '1234567890-123456@g.us',
  '1234567890',
  '1234567890@S.WHATSAPP.NET',
  '1234567890-123456@G.US'
];

testJids.forEach(jid => {
  console.log(`normalizeJid("${jid}"):`, normalizeJid(jid));
});

console.log('\n🔥 CRITICAL TEST: JID Mismatch Scenario');
console.log('This tests the core issue mentioned in the query');

// Simulate the scenario: ban a user with @s.whatsapp.net format
const userPhone = '2376969006';
const directJid = `${userPhone}@s.whatsapp.net`;
const groupJid = `${userPhone}-123456@g.us`;

console.log(`\n1. Banning user: ${directJid}`);
banUser(directJid);

console.log(`2. Checking if banned (direct JID): ${directJid}`);
console.log('   isBanned result:', isBanned(directJid));

console.log(`3. Checking if banned (group-like JID): ${groupJid}`);
console.log('   isBanned result:', isBanned(groupJid));

console.log(`4. Normalized JIDs:`);
console.log(`   normalizeJid("${directJid}"):`, normalizeJid(directJid));
console.log(`   normalizeJid("${groupJid}"):`, normalizeJid(groupJid));

if (isBanned(directJid) && isBanned(groupJid)) {
  console.log('\n✅ SUCCESS: Both JID formats are correctly identified as banned!');
  console.log('✅ The JID mismatch issue has been FIXED!');
} else {
  console.log('\n❌ FAILURE: JID mismatch still exists!');
}

// Clean up
unbanUser(directJid);
console.log('\n5. Cleaned up test ban');