import fs from 'fs';

const filePath = 'client/src/components/triage/SymptomChecklistTriage.jsx';
let code = fs.readFileSync(filePath, 'utf8');

// Clean en categories so they don't have Marathi in parentheses
code = code.replace(/en:\s*'Respiratory\s*\(श्वसन\)'/g, "en: 'Respiratory'");
code = code.replace(/en:\s*'General\s*\(सामान्य\)'/g, "en: 'General'");
code = code.replace(/en:\s*'Gastroenterology\s*\(पचनसंस्था\)'/g, "en: 'Gastroenterology'");
code = code.replace(/en:\s*'Supportive Care\s*\(सामान्य\)'/g, "en: 'Supportive Care'");
code = code.replace(/en:\s*'ENT\s*\(ईएनटी\)'/g, "en: 'ENT'");
code = code.replace(/en:\s*'Dental\s*\(दंतरोग\)'/g, "en: 'Dental'");
code = code.replace(/en:\s*'Infectious\s*\(संसर्गजन्य\)'/g, "en: 'Infectious'");
code = code.replace(/en:\s*'Dermatology\s*\(त्वचा\)'/g, "en: 'Dermatology'");
code = code.replace(/en:\s*'Emergency Medicine\s*\(आपत्कालीन\)'/g, "en: 'Emergency Medicine'");
code = code.replace(/en:\s*'Ophthalmology\s*\(नेत्ररोग\)'/g, "en: 'Ophthalmology'");
code = code.replace(/en:\s*'Emergency Toxicology\s*\(विषबाधा व सर्पदंश\)'/g, "en: 'Emergency Toxicology'");

// Fix fallback precedence to prioritize en when lang is not mr
code = code.replace(/item\.name\[lang\]\s*\|\|\s*item\.name\.mr\s*\|\|\s*item\.name\.en/g, 'item.name[lang] || item.name.en || item.name.mr');
code = code.replace(/item\.desc\[lang\]\s*\|\|\s*item\.desc\.mr\s*\|\|\s*item\.desc\.en/g, 'item.desc[lang] || item.desc.en || item.desc.mr');

// Fix ABHA to AR ID
code = code.replace(
  /ABHA:\s*\{selectedMember\?\.abhaId \|\| '14-2026-9812-4456'\}/g,
  "AR ID: {selectedMember?.arogyaId || selectedMember?.abhaId || 'AR-2026-00001'}"
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('✅ Successfully cleaned SymptomChecklistTriage.jsx categories & fallbacks');
