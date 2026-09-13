# School Context & System Vision

**Project Goal**: 
This application is a comprehensive School Management System designed to empower all school personnel—from homeroom teachers to top-level school administrators—to efficiently and conveniently manage school operations.

**Core Principles**:
1. **Role-Awareness**: Always consider the different roles using the system (e.g., `teacher`, `academic`, `admin`, `deputy`, `discipline`, `staff`). Features should respect these boundaries, ensuring appropriate access control and tailored UI states for each user type.
2. **Convenience & Usability**: The system must simplify daily administrative, academic, and pastoral tasks. The priority is reducing friction and paperwork for educators and staff.
3. **Holistic Management**: Maintain a broad view of the school's needs, connecting classroom-level data (e.g., lesson plans, student behavior) with high-level administrative workflows (e.g., admissions, student promotion, analytics).

*When building, fixing, or proposing features, always keep this broader educational context and the convenience of all school stakeholders as the top priority.*

## Academic Management & Curriculum Structure (Subject Mapping)
Based on our architectural decisions, the system handles complex curriculum structures (where multiple teachers teach sub-disciplines that roll up into one official subject, e.g., Art = Visual Arts + Music + Dance) using a **Parent-Child Subject Architecture**.

**Core Principles for Curriculum Mapping:**
1.  **Parent-Child Relationship**: Subjects can be "Parent Subjects" (e.g., ศ11101 ศิลปะ) or "Child Subjects" (e.g., ศ11101-1 ทัศนศิลป์).
2.  **Teacher Independence**: Teachers are assigned to, grade, and take attendance for *Child Subjects* completely independently. They do not share a gradebook.
3.  **Roll-up Aggregation**: The system automatically aggregates data from Child Subjects to the Parent Subject for official reporting (e.g., ปพ.1, ปพ.5).
    *   **Grades**: Calculated using predefined percentage weights (e.g., Visual Arts 40%, Music 30%, Dance 30%).
    *   **Attendance**: Hours are summed across child subjects to calculate total attendance percentage against the parent subject's required hours.
4.  **Indicator Allocation (ตัวชี้วัด)**: 
    *   The Parent Subject owns the master list of curriculum indicators.
    *   Academic admins map specific indicators to specific Child Subjects.
    *   Teachers only see and assess indicators assigned to their specific Child Subject.
    *   The system recombines the assessments into a unified indicator report for the Parent Subject at the end of the term.
