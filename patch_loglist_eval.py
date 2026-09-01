import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Add onEvaluate to Props
    props_search = """  onEdit: (record: LessonRecord) => void;
  onDelete: (id: string) => void;
  onPrintPreview: (record: LessonRecord) => void;
}"""
    props_replace = """  onEdit: (record: LessonRecord) => void;
  onDelete: (id: string) => void;
  onPrintPreview: (record: LessonRecord) => void;
  onEvaluate?: (record: LessonRecord) => void;
}"""
    if "onEvaluate?:" not in code:
        code = code.replace(props_search, props_replace)

    # Add to destructuring
    destruct_search = """  onEdit,
  onDelete,
  onPrintPreview,
}: LessonLogListProps) {"""
    destruct_replace = """  onEdit,
  onDelete,
  onPrintPreview,
  onEvaluate,
}: LessonLogListProps) {"""
    if "onEvaluate," not in code:
        code = code.replace(destruct_search, destruct_replace)

    # Add button
    btn_search = """                  <button
                    onClick={() => onPrintPreview(record)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold transition cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>พิมพ์รายงาน / ส่งออก PDF</span>
                  </button>"""
    btn_replace = """                  <button
                    onClick={() => onPrintPreview(record)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold transition cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>พิมพ์รายงาน / ส่งออก PDF</span>
                  </button>
                  
                  {onEvaluate && (
                    <button
                      onClick={() => onEvaluate(record)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold transition cursor-pointer"
                      title="ประเมินผลรายบุคคล"
                    >
                      <ClipboardCheck className="h-3.5 w-3.5" />
                      <span>ประเมินผล</span>
                    </button>
                  )}"""
    if "onEvaluate(record)" not in code:
        code = code.replace(btn_search, btn_replace)
        
    # Also add ClipboardCheck to lucide-react import
    import_search = """  Lock,
} from "lucide-react";"""
    import_replace = """  Lock,
  ClipboardCheck,
} from "lucide-react";"""
    if "ClipboardCheck," not in code:
        code = code.replace(import_search, import_replace)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/LessonLogList.tsx')
