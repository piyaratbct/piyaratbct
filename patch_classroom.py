import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# Add import
if "import { formatThaiDateTime } from '../lib/dateUtils';" not in content:
    content = content.replace("import { Download, Search, Plus, User, HeartPulse, MoreVertical, X, Filter, AlertCircle, FileText, BarChart3, Clock, HelpCircle, Save, Trash2, Printer } from 'lucide-react';", "import { Download, Search, Plus, User, HeartPulse, MoreVertical, X, Filter, AlertCircle, FileText, BarChart3, Clock, HelpCircle, Save, Trash2, Printer } from 'lucide-react';\nimport { formatThaiDateTime } from '../lib/dateUtils';")

# Remove internal thaiFormatDateTime
target = """  const thaiFormatDateTime = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };"""

content = content.replace(target, "")

# Replace usage of thaiFormatDateTime with formatThaiDateTime
content = content.replace("thaiFormatDateTime(", "formatThaiDateTime(")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
