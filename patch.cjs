const fs = require('fs');
let code = fs.readFileSync('src/components/MilkReportPrintTemplate.tsx', 'utf8');
code = code.replace(/<style dangerouslySetInnerHTML=\{\{__html: `[\s\S]*?`\}\} \/>/, `<style dangerouslySetInnerHTML={{__html: \`
        @media print {
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
          #root {
            display: none !important;
          }
          .print-root-wrap {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
          }
          * { 
             -webkit-print-color-adjust: exact !important;
             print-color-adjust: exact !important;
          }
        }
      \`}} />`);
fs.writeFileSync('src/components/MilkReportPrintTemplate.tsx', code);
