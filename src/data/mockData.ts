// ── Types ──────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  avatar: string;
  status: 'available' | 'busy' | 'away';
  currentTask: string;
  currentTaskAr: string;
  workload: number;
  email: string;
  phone: string;
  joinDate: string;
  skills: string[];
  skillsAr: string[];
}

export interface Project {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  progress: number;
  color: string;
  tasksTotal: number;
  tasksCompleted: number;
  status: 'active' | 'on-hold' | 'completed';
  startDate: string;
  endDate: string;
  teamIds: string[];
  tags: string[];
  tagsAr: string[];
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  projectId: string;
  tags: string[];
  tagsAr: string[];
  dueDate: string;
  createdAt: string;
  storyPoints: number;
  sprintId: string;
}

export type DesignItemType = 'ui' | '3d-model' | 'animation' | 'concept-art' | 'icon' | 'texture';

export interface DesignItem {
  id: string;
  title: string;
  titleAr: string;
  type: DesignItemType;
  status: 'draft' | 'in-review' | 'approved' | 'revision';
  assigneeId: string;
  projectId: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  comments: number;
}

export type SprintStatus = 'planning' | 'active' | 'completed';

export interface Sprint {
  id: string;
  name: string;
  nameAr: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  goals: string[];
  goalsAr: string[];
  taskIds: string[];
  velocity: number;
  totalPoints: number;
  completedPoints: number;
}

export interface Activity {
  id: string;
  user: TeamMember;
  action: string;
  actionAr: string;
  target: string;
  targetAr: string;
  time: string;
  timeAr: string;
}

export interface KPI {
  labelEn: string;
  labelAr: string;
  value: number;
  change: number;
  color: string;
  icon: string;
}

export interface BoardColumn {
  id: TaskStatus;
  titleEn: string;
  titleAr: string;
  color: string;
}

// ── Data ───────────────────────────────────────────────

export const teamMembers: TeamMember[] = [];

export const projects: Project[] = [];

export const boardColumns: BoardColumn[] = [
  { id: 'todo', titleEn: 'To Do', titleAr: 'قيد الانتظار', color: '#6B7280' },
  { id: 'in-progress', titleEn: 'In Progress', titleAr: 'قيد التنفيذ', color: '#3B82F6' },
  { id: 'review', titleEn: 'Review', titleAr: 'مراجعة', color: '#F59E0B' },
  { id: 'done', titleEn: 'Done', titleAr: 'مكتمل', color: '#10B981' },
];

export const tasks: Task[] = [];

export const designItems: DesignItem[] = [];

export const sprints: Sprint[] = [];

export const activities: Activity[] = [];

export const kpis: KPI[] = [
  {
    labelEn: 'Total Tasks',
    labelAr: 'إجمالي المهام',
    value: 0,
    change: 0,
    color: '#7C3AED',
    icon: 'clipboard',
  },
  {
    labelEn: 'Completed',
    labelAr: 'مكتملة',
    value: 0,
    change: 0,
    color: '#10B981',
    icon: 'check-circle',
  },
  {
    labelEn: 'In Progress',
    labelAr: 'قيد التنفيذ',
    value: 0,
    change: 0,
    color: '#3B82F6',
    icon: 'timer',
  },
  {
    labelEn: 'Overdue',
    labelAr: 'متأخرة',
    value: 0,
    change: 0,
    color: '#EF4444',
    icon: 'alert-triangle',
  },
];

export const sprintInfo = {
  nameEn: '',
  nameAr: '',
  teamName: 'NJD Games',
};

// ── Helpers ────────────────────────────────────────────

export function getTeamMember(id: string): TeamMember | undefined {
  return teamMembers.find((m) => m.id === id);
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getTasksByStatus(status: TaskStatus): Task[] {
  return tasks.filter((t) => t.status === status);
}

export function getTasksByProject(projectId: string): Task[] {
  return tasks.filter((t) => t.projectId === projectId);
}

export function getTasksBySprint(sprintId: string): Task[] {
  return tasks.filter((t) => t.sprintId === sprintId);
}

export function getDesignItemsByProject(projectId: string): DesignItem[] {
  return designItems.filter((d) => d.projectId === projectId);
}

export function getProjectTeam(project: Project): TeamMember[] {
  return project.teamIds.map((id) => getTeamMember(id)).filter(Boolean) as TeamMember[];
}
