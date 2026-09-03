const fs = require('fs');
let code = fs.readFileSync('src/components/PDFPrintHelper.tsx', 'utf-8');

const oldSignatureBox = `export const PrintSignatureBox = ({
  role,
  name,
  date,
  signature,
  label,
}: {
  role: string;
  name?: string;
  date?: string;
  signature?: string;
  label: string;
}) => (
  <div className="flex flex-col items-center justify-end h-full">
    <p className="text-sm text-slate-600 mb-2">{label}</p>
    <div className="w-40 border-b border-slate-400 mb-2 flex items-center justify-center min-h-[40px] relative">
      {signature && (
        <img
          src={signature}
          alt={\`ลายเซ็น\${name || ""}\`}
          className="h-10 object-contain absolute bottom-0"
          crossOrigin="anonymous"
        />
      )}
    </div>
    <p className="text-sm font-medium text-slate-900">
      {name ? \`(\${name})\` : "(............................................)"}
    </p>
    <p className="text-xs text-slate-500 mt-1">{role}</p>
    <p className="text-xs text-slate-500 mt-1">
      วันที่ {date ? date : "......./......./......."}
    </p>
  </div>
);`;

const newSignatureBox = `export const PrintSignatureBox = ({
  role,
  name,
  date,
  signature,
  label,
}: {
  role: string;
  name?: string;
  date?: string;
  signature?: string;
  label?: string;
}) => (
  <div className="flex flex-col items-center justify-end h-full mt-4">
    <div className="flex items-end mb-2">
      <span className="text-sm text-slate-800 mr-2 font-medium">ลงชื่อ</span>
      <div className="w-48 border-b border-slate-500 border-dotted flex items-center justify-center min-h-[20px] relative">
        {signature && (
          <img
            src={signature}
            alt={\`ลายเซ็น\${name || ""}\`}
            className="h-10 object-contain absolute bottom-0"
            crossOrigin="anonymous"
          />
        )}
      </div>
    </div>
    <p className="text-sm font-medium text-slate-900 mt-1">
      ({name ? name : "............................................"})
    </p>
    <p className="text-sm text-slate-800 mt-1">{role}</p>
    <p className="text-sm text-slate-800 mt-1">
      วันที่ {date ? date : "......./......./......."}
    </p>
  </div>
);`;

code = code.replace(oldSignatureBox, newSignatureBox);
fs.writeFileSync('src/components/PDFPrintHelper.tsx', code, 'utf-8');
console.log("Patched PrintSignatureBox");
