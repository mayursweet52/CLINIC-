const fs = require('fs');

let f = fs.readFileSync('src/app/(dashboard)/doctor/patients/[id]/page.tsx', 'utf8');

if (f.includes('value="prescriptions"')) {
  // Let's just find where it renders the prescriptions
  // Since it was a simple dummy implementation in Step 8, let's see what is there
  console.log("File exists");
}
