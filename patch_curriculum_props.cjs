const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const searchStr = `export const CurriculumManager: React.FC = () => {`;
const replacementStr = `interface CurriculumManagerProps {
  currentUserRole?: string;
}

export const CurriculumManager: React.FC<CurriculumManagerProps> = ({ currentUserRole = 'teacher' }) => {
  const canEdit = currentUserRole === 'admin' || currentUserRole === 'academic' || currentUserRole === 'deputy' || currentUserRole === 'staff';
`;

if (content.includes(searchStr)) {
    content = content.replace(searchStr, replacementStr);
    console.log("Props patched.");
    fs.writeFileSync('src/components/CurriculumManager.tsx', content);
} else {
    console.log("Could not find search string in CurriculumManager.");
}
