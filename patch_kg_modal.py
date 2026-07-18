with open('src/components/KindergartenAssessmentModal.tsx', 'r') as f:
    content = f.read()

# Fix interface
old_interface = """  existingAssessment: KindergartenAssessment;
  onClose: () => void;
  onSave: (assessment: KindergartenAssessment) => void;"""
new_interface = """  existingAssessment: KindergartenAssessment;
  onClose: () => void;
  onSave: (assessment: KindergartenAssessment, weight?: number, height?: number) => void;"""
content = content.replace(old_interface, new_interface)

# Fix component states
old_states = """export const KindergartenAssessmentModal: React.FC<KindergartenAssessmentModalProps> = ({
  student,
  existingAssessment,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<KindergartenAssessment>(existingAssessment);"""
new_states = """export const KindergartenAssessmentModal: React.FC<KindergartenAssessmentModalProps> = ({
  student,
  existingAssessment,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<KindergartenAssessment>(existingAssessment);
  const [weight, setWeight] = useState<number | ''>((existingAssessment as any).weight !== undefined ? (existingAssessment as any).weight : (student.weight || ''));
  const [height, setHeight] = useState<number | ''>((existingAssessment as any).height !== undefined ? (existingAssessment as any).height : (student.height || ''));"""
content = content.replace(old_states, new_states)

# Add health data section before Legend
old_legend = """          {/* Legend */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex flex-wrap gap-4 items-center justify-center text-sm font-medium">"""
new_legend = """          {/* Health Data Section */}
          <section>
            <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              ข้อมูลน้ำหนักและส่วนสูง (สำหรับการคำนวณ BMI ในหน้าข้อมูลสุขภาพ)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  น้ำหนัก (กิโลกรัม)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="150"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-pink-500"
                  placeholder="เช่น 15.5"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  ส่วนสูง (เซนติเมตร)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="80"
                  max="200"
                  value={height}
                  onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-pink-500"
                  placeholder="เช่น 110"
                />
              </div>
            </div>
          </section>

          {/* Legend */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex flex-wrap gap-4 items-center justify-center text-sm font-medium">"""
content = content.replace(old_legend, new_legend)

# Update save button
old_save = """          <button
            onClick={() => onSave(formData)}"""
new_save = """          <button
            onClick={() => {
              const saveWeight = weight === '' ? undefined : weight;
              const saveHeight = height === '' ? undefined : height;
              onSave(
                {...formData, weight: saveWeight, height: saveHeight} as any, 
                saveWeight, 
                saveHeight
              );
            }}"""
content = content.replace(old_save, new_save)

with open('src/components/KindergartenAssessmentModal.tsx', 'w') as f:
    f.write(content)
