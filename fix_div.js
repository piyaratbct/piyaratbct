import fs from 'fs';
const file = 'src/components/ClassroomModule.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                  )}
                </div>
            </div>
          </div>
        </div>
      )}
      );})()}`;

const replace = `                  )}
                </div>
            </div>
        </div>
      )}`;

if (content.includes(target)) {
  content = content.replace(target, replace);
  fs.writeFileSync(file, content);
  console.log("Fixed!");
} else {
  console.log("Not found, trying to find it manually.");
  const idx = content.indexOf('      );})()}');
  if (idx !== -1) {
    const before = content.substring(idx - 200, idx);
    console.log(before);
    
    // Let's just remove the first );})()} and one </div> before it.
    content = content.substring(0, idx - 18) + content.substring(idx + 14);
    fs.writeFileSync(file, content);
    console.log("Fixed manually!");
  }
}
