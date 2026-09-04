const fs = require('fs');
let code = fs.readFileSync('src/components/PrintTemplate.tsx', 'utf-8');

const oldLogo = `export function SchoolLogo({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <img 
      src="https://lh3.googleusercontent.com/d/1D4vTEwUZf9twSndugG7kUIn30OBUR3jH" 
      alt="School Logo" 
      referrerPolicy="no-referrer"
      className={\`\${className} object-contain\`} 
      id="school-emblem-svg"
    />
  );
}`;

const newLogo = `export function SchoolLogo({ className = "h-24 w-24" }: { className?: string }) {
  let logoSrc = "https://lh3.googleusercontent.com/d/1D4vTEwUZf9twSndugG7kUIn30OBUR3jH";
  try {
    const savedLogo = localStorage.getItem("lessonlog_custom_logo");
    if (savedLogo) {
      logoSrc = savedLogo;
    }
  } catch (e) {
    // Ignore localStorage errors in restricted iframes
  }

  return (
    <img 
      src={logoSrc} 
      alt="School Logo" 
      referrerPolicy="no-referrer"
      crossOrigin={logoSrc !== "https://lh3.googleusercontent.com/d/1D4vTEwUZf9twSndugG7kUIn30OBUR3jH" ? "anonymous" : undefined}
      className={\`\${className} object-contain\`} 
      id="school-emblem-svg"
    />
  );
}`;

code = code.replace(oldLogo, newLogo);
fs.writeFileSync('src/components/PrintTemplate.tsx', code, 'utf-8');
