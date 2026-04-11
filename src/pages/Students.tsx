import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Avatar, StatusBadge } from "@/components/ui-custom/SharedComponents";
import { Plus, X, Edit2, Trash2, Search, Filter } from "lucide-react";
import { Student, ClassRoom } from "@/types";

function AddStudentModal({ onClose, onSave, classes }: { onClose: () => void; onSave: (s: Student) => void; classes: ClassRoom[] }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [classId, setClassId] = useState(classes[0]?.id || "");
  const [section, setSection] = useState("A");
  const [gender, setGender] = useState<"male" | "female">("male");

  const handleSave = () => {
    if (!name || !age || !classId) return;
    const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const newStudent: Student = {
      id: `s${Date.now()}`,
      name,
      age: Number(age),
      classId,
      section,
      parentId: "",
      avatar: initials,
      gender,
      enrollmentDate: new Date().toISOString().split("T")[0],
    };
    onSave(newStudent);
    onClose();
  };

  const selectedClass = classes.find(c => c.id === classId);

  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl max-w-md w-full p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-lg">Add New Student</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Full Name</label>
            <input placeholder="e.g. Aarav Kumar" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Age</label>
              <input type="number" min="2" max="7" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Class</label>
              <select value={classId} onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none">
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Section</label>
              <select value={section} onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none">
                {(selectedClass?.sections || ["A", "B"]).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleSave}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Add Student
          </button>
        </div>
      </div>
    </div>
  );
}

function ManageClassesModal({ onClose, classes, setClasses }: { onClose: () => void; classes: ClassRoom[]; setClasses: React.Dispatch<React.SetStateAction<ClassRoom[]>> }) {
  const [newClassName, setNewClassName] = useState("");
  const [newSections, setNewSections] = useState("A, B");

  const addClass = () => {
    if (!newClassName) return;
    const sections = newSections.split(",").map(s => s.trim()).filter(Boolean);
    const newClass: ClassRoom = {
      id: `c${Date.now()}`,
      name: newClassName,
      teacherId: "",
      sections,
      studentIds: [],
    };
    setClasses((prev) => [...prev, newClass]);
    setNewClassName("");
    setNewSections("A, B");
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter(c => c.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-lg">Manage Classes & Sections</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary"><X size={18} /></button>
        </div>

        {/* Existing classes */}
        <div className="space-y-3 mb-6">
          {classes.map((cls) => (
            <div key={cls.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <p className="text-sm font-medium">{cls.name}</p>
                <div className="flex gap-1.5 mt-1">
                  {cls.sections.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-primary-light text-primary text-xs rounded-full font-medium">
                      Section {s}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => deleteClass(cls.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add new class */}
        <div className="border-t border-border pt-4 space-y-3">
          <p className="text-sm font-medium">Add New Class</p>
          <input placeholder="Class name (e.g. Sunshine)" value={newClassName} onChange={(e) => setNewClassName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          <input placeholder="Sections (comma separated, e.g. A, B, C)" value={newSections} onChange={(e) => setNewSections(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={addClass}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Add Class
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Students() {
  const { currentUser, students, setStudents, classes, setClasses } = useApp();
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showManageClasses, setShowManageClasses] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");

  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";

  let displayStudents = students;

  // Teacher sees only their class students
  if (isTeacher && currentUser) {
    const myClass = classes.find(c => c.teacherId === currentUser.id);
    if (myClass) {
      displayStudents = students.filter(s => s.classId === myClass.id);
    }
  }

  // Filters
  if (searchTerm) {
    displayStudents = displayStudents.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  if (filterClass) {
    displayStudents = displayStudents.filter(s => s.classId === filterClass);
  }
  if (filterSection) {
    displayStudents = displayStudents.filter(s => s.section === filterSection);
  }

  const handleAddStudent = (student: Student) => {
    setStudents((prev) => [...prev, student]);
    // Also add to class studentIds
    setClasses((prev) => prev.map(c =>
      c.id === student.classId ? { ...c, studentIds: [...c.studentIds, student.id] } : c
    ));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter(s => s.id !== id));
    setClasses((prev) => prev.map(c => ({
      ...c, studentIds: c.studentIds.filter(sid => sid !== id)
    })));
  };

  const handleReassign = (studentId: string, newClassId: string, newSection: string) => {
    setStudents((prev) => prev.map(s =>
      s.id === studentId ? { ...s, classId: newClassId, section: newSection } : s
    ));
    // Update class studentIds
    setClasses((prev) => prev.map(c => {
      const withoutStudent = c.studentIds.filter(sid => sid !== studentId);
      if (c.id === newClassId) return { ...c, studentIds: [...withoutStudent, studentId] };
      return { ...c, studentIds: withoutStudent };
    }));
  };

  const allSections = [...new Set(classes.flatMap(c => c.sections))];

  return (
    <div>
      <PageHeader
        title="Students"
        description={isAdmin ? "Manage all students, classes & sections" : "Manage your class students"}
        action={
          <div className="flex gap-2 flex-wrap">
            {(isAdmin || isTeacher) && (
              <button onClick={() => setShowAddStudent(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
                <Plus size={16} /> Add Student
              </button>
            )}
            {isAdmin && (
              <button onClick={() => setShowManageClasses(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-sidebar-hover">
                <Edit2 size={16} /> Classes & Sections
              </button>
            )}
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-input bg-card text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {isAdmin && (
          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-input bg-card text-sm outline-none">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-input bg-card text-sm outline-none">
          <option value="">All Sections</option>
          {allSections.map(s => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold">{displayStudents.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Students</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold">{classes.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Classes</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold">{displayStudents.filter(s => s.gender === "male").length}</p>
          <p className="text-xs text-muted-foreground mt-1">Boys</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold">{displayStudents.filter(s => s.gender === "female").length}</p>
          <p className="text-xs text-muted-foreground mt-1">Girls</p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Student</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Class</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Section</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Age</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Gender</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4 hidden sm:table-cell">Enrolled</th>
                {(isAdmin || isTeacher) && (
                  <th className="text-right text-xs font-medium text-muted-foreground py-3 px-4">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {displayStudents.map((student) => {
                const cls = classes.find(c => c.id === student.classId);
                return (
                  <tr key={student.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={student.avatar} size="sm" />
                        <span className="text-sm font-medium">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{cls?.name || "—"}</td>
                    <td className="py-3 px-4">
                      {(isAdmin || isTeacher) ? (
                        <select
                          value={`${student.classId}|${student.section}`}
                          onChange={(e) => {
                            const [cId, sec] = e.target.value.split("|");
                            handleReassign(student.id, cId, sec);
                          }}
                          className="px-2 py-1 rounded-md border border-input bg-background text-xs outline-none"
                        >
                          {classes.flatMap(c =>
                            c.sections.map(s => (
                              <option key={`${c.id}|${s}`} value={`${c.id}|${s}`}>
                                {c.name} - {s}
                              </option>
                            ))
                          )}
                        </select>
                      ) : (
                        <span className="text-sm">{student.section}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">{student.age}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        student.gender === "male" ? "bg-[hsl(220,70%,55%)]/10 text-[hsl(220,70%,55%)]" : "bg-primary-light text-primary"
                      }`}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">{student.enrollmentDate}</td>
                    {(isAdmin || isTeacher) && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {displayStudents.length === 0 && (
        <div className="text-center py-16 text-muted-foreground"><p>No students found</p></div>
      )}

      {showAddStudent && <AddStudentModal onClose={() => setShowAddStudent(false)} onSave={handleAddStudent} classes={classes} />}
      {showManageClasses && <ManageClassesModal onClose={() => setShowManageClasses(false)} classes={classes} setClasses={setClasses} />}
    </div>
  );
}
