with open('src/components/KindergartenPrintTemplate.tsx', 'r') as f:
    content = f.read()

helper_code = """
  const getDomainSummary = (scores: number[]) => {
    const validScores = scores.filter(s => s > 0);
    if (validScores.length === 0) return 0;
    const sum = validScores.reduce((a, b) => a + b, 0);
    return Math.round(sum / validScores.length);
  };
"""

if 'const getDomainSummary' not in content:
    content = content.replace(
        'const getScoreText = (score: number) => {',
        helper_code + '\n  const getScoreText = (score: number) => {'
    )

import re

# Insert domain summaries
def repl_student(m):
    return """        {students.map((student, idx) => {
          const assessment = assessments[student.id];
          if (!assessment) return null;
          
          const physicalScores = [assessment.standard1, assessment.standard2];
          const physicalSummary = getDomainSummary(physicalScores);

          const emotionalScores = [assessment.standard3, assessment.standard4, assessment.standard5];
          const emotionalSummary = getDomainSummary(emotionalScores);

          const socialScores = [assessment.standard6, assessment.standard7, assessment.standard8];
          const socialSummary = getDomainSummary(socialScores);

          const cognitiveScores = [assessment.standard9, assessment.standard10, assessment.standard11, assessment.standard12];
          const cognitiveSummary = getDomainSummary(cognitiveScores);

          const overallScores = [...physicalScores, ...emotionalScores, ...socialScores, ...cognitiveScores];
          const overallSummary = getDomainSummary(overallScores);

          return ("""

content = re.sub(r'\{\s*students\.map\(\(student,\s*idx\)\s*=>\s*\{.*?const\s+assessment\s*=\s*assessments\[student\.id\];.*?if\s*\(!assessment\)\s*return\s*null;.*?return\s*\(', repl_student, content, flags=re.DOTALL)

# Insert domain summary rows
content = content.replace(
    '<td className="border p-2 text-center w-24">{getScoreText(assessment.standard2)}</td>\n                      </tr>\n                    </tbody>',
    '<td className="border p-2 text-center w-24">{getScoreText(assessment.standard2)}</td>\n                      </tr>\n                      <tr className="bg-slate-100 font-bold">\n                        <td className="border p-2 text-right">สรุปผลด้านร่างกาย</td>\n                        <td className="border p-2 text-center text-pink-700">{getScoreText(physicalSummary)}</td>\n                      </tr>\n                    </tbody>'
)

content = content.replace(
    '<td className="border p-2 text-center w-24">{getScoreText(assessment.standard5)}</td>\n                      </tr>\n                    </tbody>',
    '<td className="border p-2 text-center w-24">{getScoreText(assessment.standard5)}</td>\n                      </tr>\n                      <tr className="bg-slate-100 font-bold">\n                        <td className="border p-2 text-right">สรุปผลด้านอารมณ์ จิตใจ</td>\n                        <td className="border p-2 text-center text-pink-700">{getScoreText(emotionalSummary)}</td>\n                      </tr>\n                    </tbody>'
)

content = content.replace(
    '<td className="border p-2 text-center w-24">{getScoreText(assessment.standard8)}</td>\n                      </tr>\n                    </tbody>',
    '<td className="border p-2 text-center w-24">{getScoreText(assessment.standard8)}</td>\n                      </tr>\n                      <tr className="bg-slate-100 font-bold">\n                        <td className="border p-2 text-right">สรุปผลด้านสังคม</td>\n                        <td className="border p-2 text-center text-pink-700">{getScoreText(socialSummary)}</td>\n                      </tr>\n                    </tbody>'
)

content = content.replace(
    '<td className="border p-2 text-center w-24">{getScoreText(assessment.standard12)}</td>\n                      </tr>\n                    </tbody>',
    '<td className="border p-2 text-center w-24">{getScoreText(assessment.standard12)}</td>\n                      </tr>\n                      <tr className="bg-slate-100 font-bold">\n                        <td className="border p-2 text-right">สรุปผลด้านสติปัญญา</td>\n                        <td className="border p-2 text-center text-pink-700">{getScoreText(cognitiveSummary)}</td>\n                      </tr>\n                    </tbody>'
)

overall_html = """              </div>

              <div className="mb-6 bg-pink-50 border border-pink-200 rounded-lg p-4 flex justify-between items-center">
                <span className="font-bold text-lg text-pink-800">สรุปผลการประเมินพัฒนาการทุกด้าน</span>
                <span className="font-black text-xl text-pink-700 bg-white px-4 py-1 rounded-full border border-pink-300 shadow-sm">
                  {getScoreText(overallSummary)}
                </span>
              </div>"""

content = content.replace('</div>\n              {assessment.teacherNotes && (', overall_html + '\n              {assessment.teacherNotes && (')

with open('src/components/KindergartenPrintTemplate.tsx', 'w') as f:
    f.write(content)

print("Updated print template")
