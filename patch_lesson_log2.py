import re

with open('src/components/LessonLogList.tsx', 'r') as f:
    content = f.read()

# I will find the remaining chunk and remove it
bad_chunk = """      return dateObj.toLocaleDateString("th-TH", options) + " น.";
    } catch {
      return isoString || "";
    }
  };"""
content = content.replace(bad_chunk, "")

with open('src/components/LessonLogList.tsx', 'w') as f:
    f.write(content)
