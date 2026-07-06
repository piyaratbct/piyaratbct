import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace the Module Selector flex container with a responsive grid/wrap container
target_selector = """        {/* Module Selector */}
        <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 overflow-x-auto print:hidden">"""
replacement_selector = """        {/* Module Selector */}
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 print:hidden gap-1.5">"""

if target_selector in content:
    content = content.replace(target_selector, replacement_selector)
    print("Patched Module Selector layout")
else:
    print("Module Selector layout target not found")

# Fix the button class strings to be more responsive (flex-col sm:flex-row)
def patch_button(btn_target, btn_repl):
    global content
    if btn_target in content:
        content = content.replace(btn_target, btn_repl)
        print("Patched a button")
    else:
        print("Button target not found:", btn_target[:40])

patch_button(
    """className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all min-w-[200px] ${""",
    """className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 ${"""
)

# And similarly for the other buttons in the selector? Wait, they all share that same template string because of the ${ block?
# Let's just do a regex replace on that specific className structure.

content = re.sub(
    r'className=\{\`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all min-w-\[200px\] \$\{',
    r'className={`flex flex-col xl:flex-row items-center justify-center gap-1 xl:gap-2 px-2 xl:px-6 py-3 rounded-xl text-xs xl:text-sm font-bold transition-all xl:min-w-[200px] flex-1 text-center ${',
    content
)

# Wait, `min-w-[200px]` was keeping it wide. Let's make sure text is centered and it flexes.

with open('src/App.tsx', 'w') as f:
    f.write(content)
