const fs = require('fs');

function fix(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    "import { DESIRABLE_CHARACTERISTICS } from '../data'; from '../lib/dateUtils';",
    "import { DESIRABLE_CHARACTERISTICS } from '../data';\nimport { formatThaiDate } from '../lib/dateUtils';"
  );
  code = code.replace(
    "import { formatThaiDate } from '../lib/dateUtils';\nimport { DESIRABLE_CHARACTERISTICS } from '../data'; from '../lib/dateUtils';",
    "import { formatThaiDate } from '../lib/dateUtils';\nimport { DESIRABLE_CHARACTERISTICS } from '../data';"
  );
  fs.writeFileSync(file, code);
  console.log("Fixed " + file);
}

fix('src/components/LessonLogForm.tsx');
fix('src/components/PBLLessonLogForm.tsx');
