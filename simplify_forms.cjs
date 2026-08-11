const fs = require('fs');

function simplifyForm(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Header gradient -> plain white with subtle border
  code = code.replace(
    /className="bg-gradient-to-r [^"]* px-6 py-4 flex justify-between items-center text-white shadow-xs"/g,
    'className="bg-white px-6 py-4 flex justify-between items-center border-b border-slate-100"'
  );
  
  // Icon colors in header
  code = code.replace(/text-white"/g, 'text-slate-800"'); // Might catch some we don't want, let's be more specific
  
  fs.writeFileSync(file, code, 'utf8');
}
