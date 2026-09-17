import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- VERIFYING NAVBAR VISIBILITY & REMOVAL OF CITIZEN MODE BADGE ---');

const navbarSource = fs.readFileSync(path.resolve(__dirname, '../client/src/components/common/Navbar.jsx'), 'utf8');

// 1. Verify Citizen Mode badge is deleted
const hasCitizenModeBadge = navbarSource.includes('nav_citizen_mode') || navbarSource.includes('Citizen Mode') || navbarSource.includes('नागरिक मोड');
console.log(`Citizen Mode badge in Navbar: ${hasCitizenModeBadge ? 'STILL PRESENT ❌' : 'COMPLETELY REMOVED ✅'}`);

// 2. Verify allNavItems and visibleNavItems logic
const hasVisibleNavItemsFilter = navbarSource.includes('visibleNavItems = isAuthenticated') && navbarSource.includes('.filter(');
console.log(`Auth-gated nav items filter: ${hasVisibleNavItemsFilter ? 'PRESENT ✅' : 'MISSING ❌'}`);

// 3. Verify WhatsApp bot button is guarded by isAuthenticated
const hasGuardedWhatsApp = navbarSource.includes('{isAuthenticated && (') && navbarSource.includes('WhatsApp Bot');
console.log(`WhatsApp Bot nav button gated behind auth: ${hasGuardedWhatsApp ? 'PRESENT ✅' : 'MISSING ❌'}`);

// 4. Verify mobile drawer also filters nav items and WhatsApp bot
const hasMobileAuthGating = navbarSource.includes('visibleNavItems.map(');
console.log(`Mobile drawer nav items gated behind auth: ${hasMobileAuthGating ? 'PRESENT ✅' : 'MISSING ❌'}`);

// 5. Verify role label inside profile dropdown
const hasProfileDropdownRole = navbarSource.includes("currentUser.role === 'kiosk_operator' ? 'Gram Panchayat Kiosk Operator' : 'Citizen Account'");
console.log(`Role label positioned inside profile dropdown: ${hasProfileDropdownRole ? 'PRESENT ✅' : 'MISSING ❌'}`);

// 6. Verify instantaneous logout handler resets auth state
const hasLogoutHandler = navbarSource.includes('handleLogoutAction') && navbarSource.includes('setProfileMenuOpen(false)');
console.log(`Instant logout handler without reload: ${hasLogoutHandler ? 'PRESENT ✅' : 'MISSING ❌'}`);

if (!hasCitizenModeBadge && hasVisibleNavItemsFilter && hasGuardedWhatsApp && hasMobileAuthGating && hasProfileDropdownRole && hasLogoutHandler) {
  console.log('\nALL NAVBAR & CITIZEN BADGE REMOVAL ASSERTIONS PASSED! ✅\n');
  process.exit(0);
} else {
  console.error('\nSOME ASSERTIONS FAILED! ❌\n');
  process.exit(1);
}
