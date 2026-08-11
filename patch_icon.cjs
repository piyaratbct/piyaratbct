const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

const oldIcon = `title="ดูข้อมูล Student 360°"
                              >
                                <UserPlus className="h-4 w-4" />
                              </button>`;

const newIcon = `title="ดูข้อมูล Student 360°"
                              >
                                <span className="text-[10px] font-black leading-none px-0.5 tracking-tighter">360&deg;</span>
                              </button>`;

if (content.includes(oldIcon)) {
  content = content.replace(oldIcon, newIcon);
  fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
  console.log('Icon updated');
} else {
  console.log('Icon not found');
}
