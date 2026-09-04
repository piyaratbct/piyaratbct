const fs = require('fs');
let code = fs.readFileSync('src/components/PDFPrintHelper.tsx', 'utf-8');

// We need to fetch the school config from Firestore, or from localStorage if we save it there.
// For PrintHeader, it is not an async component. But it can use state and effect.
// Let's modify PrintHeader to fetch school name.

if (!code.includes('import { useState, useEffect }')) {
    code = code.replace('import React, { useEffect, ReactNode }', 'import React, { useState, useEffect, ReactNode }');
}

const oldPrintHeader = `export const PrintHeader = ({
  title,
  subtitle,
  className = "",
}: {
  title: string;
  subtitle?: ReactNode;
  className?: string;
}) => (
  <div
    className={\`flex flex-col items-center text-center mb-8 relative \${className}\`}
  >
    <div className="absolute top-0 left-0 hidden sm:block print:block">
      <SchoolLogo className="h-20 w-20 text-[#e54a93] drop-shadow-sm" />
    </div>
    <div className="sm:hidden print:hidden mb-4">
      <SchoolLogo className="h-16 w-16 text-[#e54a93] drop-shadow-sm" />
    </div>
    <h1 className="text-2xl font-bold font-serif mb-1 text-slate-900">
      {title}
    </h1>
    <h2 className="text-lg font-black text-slate-900 mb-0.5 tracking-wide">
      โรงเรียนศิริมงคลศึกษา บางบัวทอง
    </h2>
    <p className="text-[9px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-100 mb-3 uppercase tracking-wider inline-block">
      Sirimongkolsuksa Bangbuathong School
    </p>
    {subtitle && <div className="w-full mt-1">{subtitle}</div>}
  </div>
);`;

const newPrintHeader = `import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const PrintHeader = ({
  title,
  subtitle,
  className = "",
}: {
  title: string;
  subtitle?: ReactNode;
  className?: string;
}) => {
  const [schoolName, setSchoolName] = useState("โรงเรียนศิริมงคลศึกษา บางบัวทอง");
  
  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const docRef = doc(db, "config", "school");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().schoolName) {
          setSchoolName(docSnap.data().schoolName);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSchool();
  }, []);

  return (
  <div
    className={\`flex flex-col items-center text-center mb-8 relative \${className}\`}
  >
    <div className="absolute top-0 left-0 hidden sm:block print:block">
      <SchoolLogo className="h-20 w-20 text-[#e54a93] drop-shadow-sm" />
    </div>
    <div className="sm:hidden print:hidden mb-4">
      <SchoolLogo className="h-16 w-16 text-[#e54a93] drop-shadow-sm" />
    </div>
    <h1 className="text-2xl font-bold font-serif mb-1 text-slate-900">
      {title}
    </h1>
    <h2 className="text-lg font-black text-slate-900 mb-0.5 tracking-wide">
      {schoolName}
    </h2>
    {subtitle && <div className="w-full mt-1">{subtitle}</div>}
  </div>
  );
};`;

code = code.replace(oldPrintHeader, newPrintHeader);
fs.writeFileSync('src/components/PDFPrintHelper.tsx', code, 'utf-8');
