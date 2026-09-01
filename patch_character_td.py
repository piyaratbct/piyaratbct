import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Find where the mapping of TRAITS ends, which is followed by </tr>
    old_tds = """                        );
                      })}
                    </tr>"""

    new_tds = """                        );
                      })}
                      <td className={`px-2 py-2 text-center text-xs border-l border-slate-200 ${summary.class}`}>
                        {summary.label}
                      </td>
                    </tr>"""

    if old_tds in code:
        code = code.replace(old_tds, new_tds)
    else:
        print("Could not find tds pattern")
        
    old_empty = """                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">"""
    new_empty = """                  <td colSpan={11} className="px-4 py-8 text-center text-slate-500">"""
    if old_empty in code:
        code = code.replace(old_empty, new_empty)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/CharacterAssessmentView.tsx')
