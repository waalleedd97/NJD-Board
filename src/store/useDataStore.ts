import { create } from 'zustand';
import { supabaseData } from '../lib/supabase';
import type { Project, Task, DesignItem, TeamMember, Sprint, Activity } from '../data/mockData';

// ── Supabase row → client type mappers ──

function mapProject(row: Record<string, unknown>, tasks: Task[]): Project {
  const projectTasks = tasks.filter((t) => t.projectId === row.id);
  const total = projectTasks.length;
  const completed = projectTasks.filter((t) => t.status === 'done').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  return {
    id: row.id as string,
    name: (row.name as string) || '',
    nameAr: (row.name_ar as string) || '',
    description: (row.description as string) || '',
    descriptionAr: (row.description_ar as string) || '',
    progress,
    color: (row.color as string) || '#7C3AED',
    status: (row.status as Project['status']) || 'active',
    startDate: (row.start_date as string) || '',
    endDate: (row.end_date as string) || '',
    tags: (row.tags as string[]) || [],
    tagsAr: (row.tags_ar as string[]) || [],
    teamIds: [],
    tasksTotal: total,
    tasksCompleted: completed,
  };
}

function mapTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: (row.title as string) || '',
    titleAr: (row.title_ar as string) || '',
    description: (row.description as string) || '',
    descriptionAr: (row.description_ar as string) || '',
    status: (row.status as Task['status']) || 'todo',
    priority: (row.priority as Task['priority']) || 'medium',
    assigneeId: (row.assignee_id as string) || '',
    projectId: (row.project_id as string) || '',
    sprintId: (row.sprint_id as string) || '',
    tags: (row.tags as string[]) || [],
    tagsAr: (row.tags_ar as string[]) || [],
    dueDate: (row.due_date as string) || '',
    createdAt: (row.created_at as string) || '',
    storyPoints: (row.story_points as number) || 0,
  };
}

function mapSprint(row: Record<string, unknown>, tasks: Task[]): Sprint {
  const sprintTasks = tasks.filter((t) => t.sprintId === row.id);
  return {
    id: row.id as string,
    name: (row.name as string) || '',
    nameAr: (row.name_ar as string) || '',
    status: (row.status as Sprint['status']) || 'planning',
    startDate: (row.start_date as string) || '',
    endDate: (row.end_date as string) || '',
    goals: (row.goals as string[]) || [],
    goalsAr: (row.goals_ar as string[]) || [],
    taskIds: sprintTasks.map((t) => t.id),
    velocity: (row.velocity as number) || 0,
    totalPoints: (row.total_points as number) || 0,
    completedPoints: (row.completed_points as number) || 0,
  };
}

function mapDesignItem(row: Record<string, unknown>): DesignItem {
  return {
    id: row.id as string,
    title: (row.title as string) || '',
    titleAr: (row.title_ar as string) || '',
    type: (row.type as DesignItem['type']) || 'concept-art',
    status: (row.status as DesignItem['status']) || 'draft',
    assigneeId: (row.assignee_id as string) || '',
    projectId: (row.project_id as string) || '',
    thumbnail: (row.thumbnail as string) || '🎨',
    createdAt: (row.created_at as string) || '',
    updatedAt: (row.updated_at as string) || '',
    version: (row.version as number) || 1,
    comments: (row.comments_count as number) || 0,
  };
}

// ── Client type → Supabase row converters (camelCase → snake_case) ──

function projectToRow(p: Partial<Project>) {
  const row: Record<string, unknown> = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.nameAr !== undefined) row.name_ar = p.nameAr;
  if (p.description !== undefined) row.description = p.description;
  if (p.descriptionAr !== undefined) row.description_ar = p.descriptionAr;
  if (p.progress !== undefined) row.progress = p.progress;
  if (p.color !== undefined) row.color = p.color;
  if (p.status !== undefined) row.status = p.status;
  if (p.startDate !== undefined) row.start_date = p.startDate;
  if (p.endDate !== undefined) row.end_date = p.endDate;
  if (p.tags !== undefined) row.tags = p.tags;
  if (p.tagsAr !== undefined) row.tags_ar = p.tagsAr;
  return row;
}

function taskToRow(t: Partial<Task>) {
  const row: Record<string, unknown> = {};
  if (t.title !== undefined) row.title = t.title;
  if (t.titleAr !== undefined) row.title_ar = t.titleAr;
  if (t.description !== undefined) row.description = t.description;
  if (t.descriptionAr !== undefined) row.description_ar = t.descriptionAr;
  if (t.status !== undefined) row.status = t.status;
  if (t.priority !== undefined) row.priority = t.priority;
  if (t.assigneeId !== undefined) row.assignee_id = t.assigneeId || null;
  if (t.projectId !== undefined) row.project_id = t.projectId;
  if (t.sprintId !== undefined) row.sprint_id = t.sprintId || null;
  if (t.tags !== undefined) row.tags = t.tags;
  if (t.tagsAr !== undefined) row.tags_ar = t.tagsAr;
  if (t.dueDate !== undefined) row.due_date = t.dueDate || null;
  if (t.storyPoints !== undefined) row.story_points = t.storyPoints;
  return row;
}

function sprintToRow(s: Partial<Sprint> & { projectId?: string }) {
  const row: Record<string, unknown> = {};
  if (s.name !== undefined) row.name = s.name;
  if (s.nameAr !== undefined) row.name_ar = s.nameAr;
  if (s.status !== undefined) row.status = s.status;
  if (s.startDate !== undefined) row.start_date = s.startDate;
  if (s.endDate !== undefined) row.end_date = s.endDate;
  if (s.goals !== undefined) row.goals = s.goals;
  if (s.goalsAr !== undefined) row.goals_ar = s.goalsAr;
  if (s.velocity !== undefined) row.velocity = s.velocity;
  if (s.totalPoints !== undefined) row.total_points = s.totalPoints;
  if (s.completedPoints !== undefined) row.completed_points = s.completedPoints;
  if (s.projectId !== undefined) row.project_id = s.projectId;
  return row;
}

function designItemToRow(d: Partial<DesignItem>) {
  const row: Record<string, unknown> = {};
  if (d.title !== undefined) row.title = d.title;
  if (d.titleAr !== undefined) row.title_ar = d.titleAr;
  if (d.type !== undefined) row.type = d.type;
  if (d.status !== undefined) row.status = d.status;
  if (d.assigneeId !== undefined) row.assignee_id = d.assigneeId || null;
  if (d.projectId !== undefined) row.project_id = d.projectId;
  if (d.thumbnail !== undefined) row.thumbnail = d.thumbnail;
  if (d.version !== undefined) row.version = d.version;
  return row;
}

// ── Store ──

interface DataState {
  projects: Project[];
  tasks: Task[];
  designItems: DesignItem[];
  teamMembers: TeamMember[];
  sprints: Sprint[];
  activities: Activity[];
  isLoading: boolean;

  fetchAll: () => Promise<void>;

  addProject: (data: Partial<Project>) => Promise<Project | null>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  addTask: (data: Partial<Task>) => Promise<Task | null>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addSprint: (data: Partial<Sprint> & { projectId: string }) => Promise<Sprint | null>;
  updateSprint: (id: string, data: Partial<Sprint>) => Promise<void>;
  deleteSprint: (id: string) => Promise<void>;

  addDesignItem: (data: Partial<DesignItem>) => Promise<DesignItem | null>;
  updateDesignItem: (id: string, data: Partial<DesignItem>) => Promise<void>;
  deleteDesignItem: (id: string) => Promise<void>;

  importData: (data: {
    projects?: Project[];
    tasks?: Task[];
    designItems?: DesignItem[];
    teamMembers?: TeamMember[];
    sprints?: Sprint[];
  }) => void;
  clearAll: () => void;

  getTeamMember: (id: string) => TeamMember | undefined;
  getProject: (id: string) => Project | undefined;
  getTasksByProject: (projectId: string) => Task[];
  getTasksBySprint: (sprintId: string) => Task[];
  getDesignItemsByProject: (projectId: string) => DesignItem[];
  getProjectTeam: (project: Project) => TeamMember[];
}

export const useDataStore = create<DataState>()((set, get) => ({
  projects: [],
  tasks: [],
  designItems: [],
  teamMembers: [],
  sprints: [],
  activities: [],
  isLoading: false,

  // ── Fetch ──

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const { data: taskRows } = await supabaseData.from('tasks').select('*');
      const tasks = (taskRows || []).map((r) => mapTask(r as Record<string, unknown>));

      const [projectRes, sprintRes, designRes] = await Promise.all([
        supabaseData.from('projects').select('*'),
        supabaseData.from('sprints').select('*'),
        supabaseData.from('design_items').select('*'),
      ]);

      const projects = (projectRes.data || []).map((r) => mapProject(r as Record<string, unknown>, tasks));
      const sprints = (sprintRes.data || []).map((r) => mapSprint(r as Record<string, unknown>, tasks));
      const designItems = (designRes.data || []).map((r) => mapDesignItem(r as Record<string, unknown>));

      set({ projects, tasks, sprints, designItems, isLoading: false });
    } catch (err) {
      console.error('Failed to fetch data:', err);
      set({ isLoading: false });
    }
  },

  // ── Projects CRUD ──

  addProject: async (data) => {
    const row = projectToRow(data);
    const { data: inserted, error } = await supabaseData.from('projects').insert(row).select('*');
    if (error || !inserted?.[0]) { console.error('addProject:', error); return null; }
    const project = mapProject(inserted[0] as Record<string, unknown>, get().tasks);
    set((s) => ({ projects: [...s.projects, project] }));
    return project;
  },

  updateProject: async (id, data) => {
    const row = projectToRow(data);
    const { data: updated, error } = await supabaseData.from('projects').update(row).eq('id', id).select('*');
    if (error || !updated?.[0]) { console.error('updateProject:', error); return; }
    const project = mapProject(updated[0] as Record<string, unknown>, get().tasks);
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? project : p)) }));
  },

  deleteProject: async (id) => {
    const { error } = await supabaseData.from('projects').delete().eq('id', id);
    if (error) { console.error('deleteProject:', error); return; }
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      tasks: s.tasks.filter((t) => t.projectId !== id),
      sprints: s.sprints.filter((sp) => sp.id !== id),
      designItems: s.designItems.filter((d) => d.projectId !== id),
    }));
  },

  // ── Tasks CRUD ──

  addTask: async (data) => {
    const row = taskToRow(data);
    const { data: inserted, error } = await supabaseData.from('tasks').insert(row).select('*');
    if (error || !inserted?.[0]) { console.error('addTask:', error); return null; }
    const task = mapTask(inserted[0] as Record<string, unknown>);
    set((s) => ({ tasks: [...s.tasks, task] }));
    return task;
  },

  updateTask: async (id, data) => {
    const row = taskToRow(data);
    const { data: updated, error } = await supabaseData.from('tasks').update(row).eq('id', id).select('*');
    if (error || !updated?.[0]) { console.error('updateTask:', error); return; }
    const task = mapTask(updated[0] as Record<string, unknown>);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? task : t)) }));
  },

  deleteTask: async (id) => {
    const { error } = await supabaseData.from('tasks').delete().eq('id', id);
    if (error) { console.error('deleteTask:', error); return; }
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  // ── Sprints CRUD ──

  addSprint: async (data) => {
    const row = sprintToRow(data);
    const { data: inserted, error } = await supabaseData.from('sprints').insert(row).select('*');
    if (error || !inserted?.[0]) { console.error('addSprint:', error); return null; }
    const sprint = mapSprint(inserted[0] as Record<string, unknown>, get().tasks);
    set((s) => ({ sprints: [...s.sprints, sprint] }));
    return sprint;
  },

  updateSprint: async (id, data) => {
    const row = sprintToRow(data);
    const { data: updated, error } = await supabaseData.from('sprints').update(row).eq('id', id).select('*');
    if (error || !updated?.[0]) { console.error('updateSprint:', error); return; }
    const sprint = mapSprint(updated[0] as Record<string, unknown>, get().tasks);
    set((s) => ({ sprints: s.sprints.map((sp) => (sp.id === id ? sprint : sp)) }));
  },

  deleteSprint: async (id) => {
    const { error } = await supabaseData.from('sprints').delete().eq('id', id);
    if (error) { console.error('deleteSprint:', error); return; }
    set((s) => ({ sprints: s.sprints.filter((sp) => sp.id !== id) }));
  },

  // ── Design Items CRUD ──

  addDesignItem: async (data) => {
    const row = designItemToRow(data);
    const { data: inserted, error } = await supabaseData.from('design_items').insert(row).select('*');
    if (error || !inserted?.[0]) { console.error('addDesignItem:', error); return null; }
    const item = mapDesignItem(inserted[0] as Record<string, unknown>);
    set((s) => ({ designItems: [...s.designItems, item] }));
    return item;
  },

  updateDesignItem: async (id, data) => {
    const row = designItemToRow(data);
    const { data: updated, error } = await supabaseData.from('design_items').update(row).eq('id', id).select('*');
    if (error || !updated?.[0]) { console.error('updateDesignItem:', error); return; }
    const item = mapDesignItem(updated[0] as Record<string, unknown>);
    set((s) => ({ designItems: s.designItems.map((d) => (d.id === id ? item : d)) }));
  },

  deleteDesignItem: async (id) => {
    const { error } = await supabaseData.from('design_items').delete().eq('id', id);
    if (error) { console.error('deleteDesignItem:', error); return; }
    set((s) => ({ designItems: s.designItems.filter((d) => d.id !== id) }));
  },

  // ── Legacy (CSV import compat) ──

  importData: (data) =>
    set((state) => ({
      projects: data.projects ? [...state.projects, ...data.projects] : state.projects,
      tasks: data.tasks ? [...state.tasks, ...data.tasks] : state.tasks,
      designItems: data.designItems ? [...state.designItems, ...data.designItems] : state.designItems,
      teamMembers: data.teamMembers ? [...state.teamMembers, ...data.teamMembers] : state.teamMembers,
      sprints: data.sprints ? [...state.sprints, ...data.sprints] : state.sprints,
    })),

  clearAll: () =>
    set({ projects: [], tasks: [], designItems: [], teamMembers: [], sprints: [], activities: [] }),

  // ── Getters ──

  getTeamMember: (id) => get().teamMembers.find((m) => m.id === id),
  getProject: (id) => get().projects.find((p) => p.id === id),
  getTasksByProject: (pid) => get().tasks.filter((t) => t.projectId === pid),
  getTasksBySprint: (sid) => get().tasks.filter((t) => t.sprintId === sid),
  getDesignItemsByProject: (pid) => get().designItems.filter((d) => d.projectId === pid),
  getProjectTeam: (project) => {
    const members = get().teamMembers;
    return project.teamIds.map((id) => members.find((m) => m.id === id)).filter(Boolean) as TeamMember[];
  },
}));
