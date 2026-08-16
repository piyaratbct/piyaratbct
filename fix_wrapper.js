import fs from 'fs';

const file = 'src/components/ClassroomModule.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `<div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <div className="flex flex-col border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">`;

const replace1 = `<div className="flex flex-col border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden w-full">`;

if (content.includes(target1)) {
  content = content.replace(target1, replace1);
  const endTarget1 = `                  );
                })
              )}
            </div>
        </div>
      </div>`;
  const endReplace1 = `                  );
                })
              )}
            </div>`;
  content = content.replace(endTarget1, endReplace1);
  fs.writeFileSync(file, content);
  console.log('Fixed wrapper 2');
} else {
  console.log('wrapper 2 not found');
}

const target2 = `          <div>
            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto w-full">
                <div className="flex flex-col">`;

const replace2 = `          <div className="w-full">
            <div className="flex flex-col border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">`;

if (content.includes(target2)) {
  content = content.replace(target2, replace2);
  const endTarget2 = `                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>`;
  const endReplace2 = `                        </div>
                      );
                    })
                  )}
                </div>
              </div>
          </div>`;
  content = content.replace(endTarget2, endReplace2);
  fs.writeFileSync(file, content);
  console.log('Fixed wrapper 1');
} else {
  console.log('wrapper 1 not found');
}
