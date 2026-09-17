import fs from 'fs';

function checkHardcodedInFile(file) {
  console.log(`\n--- Checking ${file} ---`);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    // Look for JSX text that doesn't use t(...) or variable
    if (/>[A-Za-z\s]{4,}</.test(l) && !l.includes('t(') && !l.includes('{') && !l.includes('className') && !l.includes('import')) {
      console.log(`[HARDCODED TEXT] Line ${idx + 1}: ${l.trim()}`);
    }
  });
}

checkHardcodedInFile('client/src/components/home/HomePage.jsx');
checkHardcodedInFile('client/src/components/family/FamilyHub.jsx');
checkHardcodedInFile('client/src/components/triage/SymptomChecklistTriage.jsx');
