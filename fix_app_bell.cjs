const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const bellHtml = `
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 relative text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl transition flex items-center justify-center"
                  title="การแจ้งเตือน"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 border border-white"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h4 className="text-sm font-bold text-slate-700">การแจ้งเตือน</h4>
                      {notifications.filter(n => !n.read).length > 0 && (
                        <button 
                          onClick={async () => {
                            const { writeBatch } = require('firebase/firestore');
                            const batch = writeBatch(db);
                            notifications.filter(n => !n.read).forEach(n => {
                              batch.update(doc(db, "notifications", n.id), { read: true });
                            });
                            await batch.commit();
                          }}
                          className="text-[10px] text-indigo-600 font-medium hover:underline"
                        >
                          อ่านทั้งหมด
                        </button>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                          <Bell className="h-6 w-6 opacity-20" />
                          <span>ไม่มีการแจ้งเตือนใหม่</span>
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={async () => {
                              if (!notif.read) {
                                await updateDoc(doc(db, "notifications", notif.id), { read: true });
                              }
                              setShowNotifications(false);
                            }}
                            className={\`p-3 border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer flex gap-3 items-start \${notif.read ? 'opacity-60' : 'bg-indigo-50/30'}\`}
                          >
                            <div className="mt-0.5">
                              {notif.type === 'co_teacher_invite' ? (
                                <Users className={\`h-4 w-4 \${notif.read ? 'text-slate-400' : 'text-indigo-500'}\`} />
                              ) : (
                                <Bell className={\`h-4 w-4 \${notif.read ? 'text-slate-400' : 'text-indigo-500'}\`} />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={\`text-xs leading-relaxed \${notif.read ? 'text-slate-600' : 'text-slate-800 font-medium'}\`}>
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {formatThaiDate(notif.createdAt)}
                              </p>
                            </div>
                            {!notif.read && (
                              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
`;

code = code.replace(/<button\n\s*onClick=\{showSettingsMenu\}/, bellHtml + '\n              <button\n                onClick={showSettingsMenu}');

fs.writeFileSync('src/App.tsx', code, 'utf8');
