import re

with open('src/components/KindergartenAssessmentModal.tsx', 'r') as f:
    content = f.read()

overall_summary_html = """          </div>

          <div className="bg-pink-50 border border-pink-200 rounded-xl p-6 flex justify-between items-center">
            <h4 className="font-bold text-lg text-pink-800">สรุปผลการประเมินพัฒนาการทุกด้าน</h4>
            <span className={`font-black text-xl px-6 py-2 rounded-full border shadow-sm ${getScoreColor(overallSummary)}`}>
              {getScoreText(overallSummary)}
            </span>
          </div>

          <div className="space-y-2">"""

content = content.replace(
    '          </div>\n\n          <div className="space-y-2">',
    overall_summary_html
)

with open('src/components/KindergartenAssessmentModal.tsx', 'w') as f:
    f.write(content)

print("Updated modal overall summary")
