import re

with open('src/components/KindergartenAssessmentModal.tsx', 'r') as f:
    content = f.read()

helper_code = """
  const getDomainSummary = (scores: number[]) => {
    const validScores = scores.filter(s => s > 0);
    if (validScores.length === 0) return 0;
    const sum = validScores.reduce((a, b) => a + b, 0);
    return Math.round(sum / validScores.length);
  };

  const getScoreText = (score: number) => {
    if (score === 3) return "ดี";
    if (score === 2) return "พอใช้";
    if (score === 1) return "ควรส่งเสริม";
    return "-";
  };

  const physicalScores = [formData.standard1, formData.standard2];
  const physicalSummary = getDomainSummary(physicalScores);

  const emotionalScores = [formData.standard3, formData.standard4, formData.standard5];
  const emotionalSummary = getDomainSummary(emotionalScores);

  const socialScores = [formData.standard6, formData.standard7, formData.standard8];
  const socialSummary = getDomainSummary(socialScores);

  const cognitiveScores = [formData.standard9, formData.standard10, formData.standard11, formData.standard12];
  const cognitiveSummary = getDomainSummary(cognitiveScores);

  const overallScores = [...physicalScores, ...emotionalScores, ...socialScores, ...cognitiveScores];
  const overallSummary = getDomainSummary(overallScores);
"""

if 'const physicalScores' not in content:
    content = content.replace(
        'const getScoreColor = (score: number) => {',
        helper_code + '\n  const getScoreColor = (score: number) => {'
    )

content = content.replace(
    '''              <StandardRow
                title="มาตรฐานที่ 2"
                desc="กล้ามเนื้อใหญ่และกล้ามเนื้อเล็กแข็งแรงใช้ได้อย่างคล่องแคล่วและประสานสัมพันธ์กัน"
                value={formData.standard2}
                onChange={(val) => handleStandardChange('standard2', val)}
                getScoreColor={getScoreColor}
              />''',
    '''              <StandardRow
                title="มาตรฐานที่ 2"
                desc="กล้ามเนื้อใหญ่และกล้ามเนื้อเล็กแข็งแรงใช้ได้อย่างคล่องแคล่วและประสานสัมพันธ์กัน"
                value={formData.standard2}
                onChange={(val) => handleStandardChange('standard2', val)}
                getScoreColor={getScoreColor}
              />
              <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-700">สรุปผลด้านร่างกาย</span>
                <span className={`font-bold px-3 py-1 rounded-full text-sm border ${getScoreColor(physicalSummary)}`}>{getScoreText(physicalSummary)}</span>
              </div>'''
)

content = content.replace(
    '''              <StandardRow
                title="มาตรฐานที่ 5"
                desc="มีคุณธรรม จริยธรรมและมีจิตใจที่ดีงาม"
                value={formData.standard5}
                onChange={(val) => handleStandardChange('standard5', val)}
                getScoreColor={getScoreColor}
              />''',
    '''              <StandardRow
                title="มาตรฐานที่ 5"
                desc="มีคุณธรรม จริยธรรมและมีจิตใจที่ดีงาม"
                value={formData.standard5}
                onChange={(val) => handleStandardChange('standard5', val)}
                getScoreColor={getScoreColor}
              />
              <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-700">สรุปผลด้านอารมณ์ จิตใจ</span>
                <span className={`font-bold px-3 py-1 rounded-full text-sm border ${getScoreColor(emotionalSummary)}`}>{getScoreText(emotionalSummary)}</span>
              </div>'''
)

content = content.replace(
    '''              <StandardRow
                title="มาตรฐานที่ 8"
                desc="อยู่ร่วมกับผู้อื่นได้อย่างมีความสุขและปฏิบัติตนเป็นสมาชิกที่ดีของสังคมในระบอบประชาธิปไตยฯ"
                value={formData.standard8}
                onChange={(val) => handleStandardChange('standard8', val)}
                getScoreColor={getScoreColor}
              />''',
    '''              <StandardRow
                title="มาตรฐานที่ 8"
                desc="อยู่ร่วมกับผู้อื่นได้อย่างมีความสุขและปฏิบัติตนเป็นสมาชิกที่ดีของสังคมในระบอบประชาธิปไตยฯ"
                value={formData.standard8}
                onChange={(val) => handleStandardChange('standard8', val)}
                getScoreColor={getScoreColor}
              />
              <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-700">สรุปผลด้านสังคม</span>
                <span className={`font-bold px-3 py-1 rounded-full text-sm border ${getScoreColor(socialSummary)}`}>{getScoreText(socialSummary)}</span>
              </div>'''
)

content = content.replace(
    '''              <StandardRow
                title="มาตรฐานที่ 12"
                desc="มีเจตคติที่ดีต่อการเรียนรู้และมีความสามารถในการแสวงหาความรู้ได้เหมาะสมกับวัย"
                value={formData.standard12}
                onChange={(val) => handleStandardChange('standard12', val)}
                getScoreColor={getScoreColor}
              />''',
    '''              <StandardRow
                title="มาตรฐานที่ 12"
                desc="มีเจตคติที่ดีต่อการเรียนรู้และมีความสามารถในการแสวงหาความรู้ได้เหมาะสมกับวัย"
                value={formData.standard12}
                onChange={(val) => handleStandardChange('standard12', val)}
                getScoreColor={getScoreColor}
              />
              <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-700">สรุปผลด้านสติปัญญา</span>
                <span className={`font-bold px-3 py-1 rounded-full text-sm border ${getScoreColor(cognitiveSummary)}`}>{getScoreText(cognitiveSummary)}</span>
              </div>'''
)

overall_summary_html = """          </div>

          <div className="bg-pink-50 border border-pink-200 rounded-xl p-6 flex justify-between items-center">
            <h4 className="font-bold text-lg text-pink-800">สรุปผลการประเมินพัฒนาการทุกด้าน</h4>
            <span className={`font-black text-xl px-6 py-2 rounded-full border shadow-sm ${getScoreColor(overallSummary)}`}>
              {getScoreText(overallSummary)}
            </span>
          </div>

          {/* Teacher Notes */}"""

content = content.replace(
    '          </div>\n\n          {/* Teacher Notes */}',
    overall_summary_html
)

with open('src/components/KindergartenAssessmentModal.tsx', 'w') as f:
    f.write(content)

print("Updated modal")
