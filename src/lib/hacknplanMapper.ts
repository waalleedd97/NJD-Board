import type {
  Task, TaskStatus, TaskPriority,
  DesignItem, DesignItemType,
  Project, TeamMember, Sprint,
} from '../data/mockData';

export type DetectedType = 'tasks' | 'design-items';

export interface ImportResult {
  type: DetectedType;
  projects: Project[];
  tasks: Task[];
  designItems: DesignItem[];
  teamMembers: TeamMember[];
  sprints: Sprint[];
}

// ─── Normalization ─────────────────────────────────────

function norm(s: string): string {
  return s.toLowerCase().trim().replace(/[\s_]+/g, ' ');
}

function col(row: Record<string, string>, ...names: string[]): string {
  const keys = Object.keys(row);
  for (const name of names) {
    const n = norm(name);
    const k = keys.find((k) => norm(k) === n);
    if (k && row[k]) return row[k];
  }
  for (const name of names) {
    const n = norm(name);
    const k = keys.find((k) => norm(k).includes(n));
    if (k && row[k]) return row[k];
  }
  return '';
}

// ─── Detection ─────────────────────────────────────────

export function detectDataType(headers: string[]): DetectedType {
  const h = headers.map(norm);
  if (h.some((x) => x.includes('work item') || x.includes('is bug') || x.includes('actual cost')))
    return 'tasks';
  if (h.some((x) => x.includes('design document') || x.includes('design doc')))
    return 'design-items';
  if (h.some((x) => x.includes('estimated cost') || x.includes('milestone')))
    return 'tasks';
  if (h.some((x) => x.includes('importance')) && !h.some((x) => x.includes('cost')))
    return 'design-items';
  return 'tasks';
}

// ─── Mapping Tables ────────────────────────────────────

const TASK_STATUS: Record<string, TaskStatus> = {
  planned: 'todo', 'to do': 'todo', todo: 'todo', open: 'todo', new: 'todo',
  backlog: 'todo', 'not started': 'todo',
  'in progress': 'in-progress', 'in-progress': 'in-progress', working: 'in-progress',
  active: 'in-progress', started: 'in-progress',
  testing: 'review', review: 'review', 'in review': 'review', 'in-review': 'review',
  qa: 'review', verification: 'review',
  done: 'done', completed: 'done', closed: 'done', resolved: 'done',
  archived: 'done', finished: 'done',
};

const DESIGN_STATUS: Record<string, DesignItem['status']> = {
  draft: 'draft', new: 'draft', open: 'draft', planned: 'draft', 'not started': 'draft',
  'in review': 'in-review', 'in-review': 'in-review', review: 'in-review',
  'in progress': 'in-review', testing: 'in-review',
  approved: 'approved', done: 'approved', completed: 'approved', closed: 'approved',
  finished: 'approved',
  revision: 'revision', rework: 'revision', rejected: 'revision',
  'changes requested': 'revision',
};

const PRIORITY: Record<string, TaskPriority> = {
  critical: 'critical', urgent: 'critical', blocker: 'critical', highest: 'critical',
  'very high': 'critical',
  high: 'high', important: 'high',
  medium: 'medium', normal: 'medium', moderate: 'medium', default: 'medium',
  low: 'low', minor: 'low', trivial: 'low', lowest: 'low',
  unassigned: 'medium', unset: 'medium', none: 'medium', '': 'medium',
};

const DESIGN_TYPE: Record<string, DesignItemType> = {
  ui: 'ui', 'user interface': 'ui', hud: 'ui', menu: 'ui', gui: 'ui', interface: 'ui',
  '3d': '3d-model', '3d model': '3d-model', model: '3d-model', modeling: '3d-model',
  animation: 'animation', anim: 'animation', vfx: 'animation', effects: 'animation',
  concept: 'concept-art', 'concept art': 'concept-art', art: 'concept-art',
  illustration: 'concept-art', visual: 'concept-art',
  icon: 'icon', icons: 'icon',
  texture: 'texture', textures: 'texture', material: 'texture',
};

const THUMBNAILS: Record<DesignItemType, string> = {
  'ui': '🎨', '3d-model': '🎮', 'animation': '🎬',
  'concept-art': '🖼️', 'icon': '✨', 'texture': '🧱',
};

const COLORS = [
  '#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#06B6D4', '#8B5CF6', '#14B8A6', '#F97316',
];

function uid(): string {
  return crypto.randomUUID();
}

// ─── Process Import ────────────────────────────────────

export function processImport(
  rows: Record<string, string>[],
  headers: string[],
  existingProjects: Project[],
  existingMembers: TeamMember[],
): ImportResult {
  const type = detectDataType(headers);

  const projectMap = new Map<string, Project>();
  existingProjects.forEach((p) => projectMap.set(p.name.toLowerCase(), p));

  const memberMap = new Map<string, TeamMember>();
  existingMembers.forEach((m) => memberMap.set(m.name.toLowerCase(), m));

  const sprintMap = new Map<string, Sprint>();

  // First pass: extract entities
  for (const row of rows) {
    const boardName = col(row, 'board', 'project');
    if (boardName && !projectMap.has(boardName.toLowerCase())) {
      projectMap.set(boardName.toLowerCase(), {
        id: uid(), name: boardName, nameAr: boardName,
        description: '', descriptionAr: '',
        progress: 0, color: COLORS[projectMap.size % COLORS.length],
        tasksTotal: 0, tasksCompleted: 0, status: 'active',
        startDate: new Date().toISOString().slice(0, 10), endDate: '',
        teamIds: [], tags: [], tagsAr: [],
      });
    }

    const assigneeName = col(row, 'assigned user', 'assigned to', 'assignee');
    if (assigneeName && !memberMap.has(assigneeName.toLowerCase())) {
      memberMap.set(assigneeName.toLowerCase(), {
        id: uid(), name: assigneeName, nameAr: assigneeName,
        role: 'Team Member', roleAr: 'عضو فريق',
        avatar: assigneeName.charAt(0).toUpperCase(),
        status: 'available', currentTask: '', currentTaskAr: '',
        workload: 0, email: '', phone: '',
        joinDate: new Date().toISOString().slice(0, 10),
        skills: [], skillsAr: [],
      });
    }

    if (type === 'tasks') {
      const milestone = col(row, 'milestone', 'sprint');
      if (milestone && !sprintMap.has(milestone.toLowerCase())) {
        sprintMap.set(milestone.toLowerCase(), {
          id: uid(), name: milestone, nameAr: milestone,
          status: 'active',
          startDate: new Date().toISOString().slice(0, 10), endDate: '',
          goals: [], goalsAr: [], taskIds: [],
          velocity: 0, totalPoints: 0, completedPoints: 0,
        });
      }
    }
  }

  // Second pass: map items
  const mappedTasks: Task[] = [];
  const mappedDesign: DesignItem[] = [];

  for (const row of rows) {
    const title = col(row, 'title', 'name');
    if (!title) continue;

    const boardName = col(row, 'board', 'project');
    const project = boardName ? projectMap.get(boardName.toLowerCase()) : undefined;
    const assigneeName = col(row, 'assigned user', 'assigned to', 'assignee');
    const member = assigneeName ? memberMap.get(assigneeName.toLowerCase()) : undefined;

    if (type === 'design-items') {
      const category = col(row, 'category', 'type');
      const designType = DESIGN_TYPE[norm(category)] || 'concept-art';
      const status = DESIGN_STATUS[norm(col(row, 'status', 'state'))] || 'draft';

      mappedDesign.push({
        id: uid(), title, titleAr: title,
        type: designType, status,
        assigneeId: member?.id || '', projectId: project?.id || '',
        thumbnail: THUMBNAILS[designType],
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        version: 1, comments: 0,
      });

      if (project) {
        project.tasksTotal++;
        if (status === 'approved') project.tasksCompleted++;
        if (member && !project.teamIds.includes(member.id)) project.teamIds.push(member.id);
      }
    } else {
      const status = TASK_STATUS[norm(col(row, 'status', 'state'))] || 'todo';
      const priority = PRIORITY[norm(col(row, 'priority', 'importance'))] || 'medium';
      const tags = col(row, 'tags', 'labels');
      const category = col(row, 'category');
      const milestone = col(row, 'milestone', 'sprint');
      const sprint = milestone ? sprintMap.get(milestone.toLowerCase()) : undefined;
      const points = parseInt(col(row, 'estimated cost', 'estimated time', 'story points', 'points')) || 0;
      const description = col(row, 'description', 'desc', 'details');
      const taskId = uid();

      mappedTasks.push({
        id: taskId, title, titleAr: title,
        description, descriptionAr: description,
        status, priority,
        assigneeId: member?.id || '', projectId: project?.id || '',
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : category ? [category] : [],
        tagsAr: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : category ? [category] : [],
        dueDate: col(row, 'due date', 'due', 'deadline'),
        createdAt: col(row, 'start date', 'start', 'created') || new Date().toISOString().slice(0, 10),
        storyPoints: points,
        sprintId: sprint?.id || '',
      });

      if (sprint) {
        sprint.taskIds.push(taskId);
        sprint.totalPoints += points;
        if (status === 'done') sprint.completedPoints += points;
      }
      if (project) {
        project.tasksTotal++;
        if (status === 'done') project.tasksCompleted++;
        if (member && !project.teamIds.includes(member.id)) project.teamIds.push(member.id);
      }
    }
  }

  // Compute project progress
  for (const p of projectMap.values()) {
    if (p.tasksTotal > 0) p.progress = Math.round((p.tasksCompleted / p.tasksTotal) * 100);
  }

  return {
    type,
    projects: [...projectMap.values()].filter((p) => !existingProjects.some((ep) => ep.id === p.id)),
    tasks: mappedTasks,
    designItems: mappedDesign,
    teamMembers: [...memberMap.values()].filter((m) => !existingMembers.some((em) => em.id === m.id)),
    sprints: [...sprintMap.values()],
  };
}
