// ── Status mapping (stage name → NJD Board status) ──

const STATUS_KEYWORDS = [
  { keywords: ['done', 'completed', 'closed', 'resolved', 'finished'], status: 'done' },
  { keywords: ['testing', 'review', 'qa', 'verify'], status: 'review' },
  { keywords: ['in progress', 'working', 'active', 'doing'], status: 'in-progress' },
  { keywords: ['to do', 'todo', 'unstarted', 'open', 'new', 'backlog', 'planned'], status: 'todo' },
];

export function buildStageMap(stages, projectId) {
  const map = {};
  if (!Array.isArray(stages) || stages.length === 0) return map;

  const sorted = [...stages].sort((a, b) => (a.stageId ?? 0) - (b.stageId ?? 0));

  for (const stage of sorted) {
    const name = (stage.name || '').toLowerCase();
    let mapped = null;

    for (const rule of STATUS_KEYWORDS) {
      if (rule.keywords.some((kw) => name.includes(kw))) {
        mapped = rule.status;
        break;
      }
    }

    if (!mapped) {
      if (stage === sorted[0]) mapped = 'todo';
      else if (stage === sorted[sorted.length - 1]) mapped = 'done';
      else mapped = 'todo';
    }

    map[`${projectId}:${stage.stageId}`] = mapped;
  }

  return map;
}

// ── Priority mapping (importanceLevel name → NJD Board priority) ──

const PRIORITY_NAME_MAP = {
  urgent: 'critical',
  critical: 'critical',
  high: 'high',
  normal: 'medium',
  medium: 'medium',
  low: 'low',
  none: 'low',
};

export function mapPriority(importanceLevel) {
  if (!importanceLevel) return 'medium';
  const name = (importanceLevel.name || '').toLowerCase();
  return PRIORITY_NAME_MAP[name] ?? 'medium';
}

// ── Sprint status mapping ──

export function mapSprintStatus(board) {
  // HacknPlan boards don't have start/end dates — default to planning
  return 'planning';
}

// ── Date helpers ──

export function toDate(val) {
  if (!val) return null;
  try {
    return new Date(val).toISOString().split('T')[0];
  } catch {
    return null;
  }
}

// ── Project mapper ──

export function mapProject(hnp) {
  return {
    name: hnp.name || 'Untitled',
    name_ar: hnp.name || 'Untitled',
    description: hnp.description || '',
    description_ar: hnp.description || '',
    progress: 0,
    color: '#7C3AED',
    status: 'active',
    start_date: toDate(hnp.creationDate) || new Date().toISOString().split('T')[0],
    created_by: null,
  };
}

// ── Sprint mapper ──

export function mapSprint(board, supabaseProjectId) {
  const today = new Date().toISOString().split('T')[0];
  return {
    name: board.name || 'Untitled Sprint',
    name_ar: board.name || 'Untitled Sprint',
    status: mapSprintStatus(board),
    start_date: toDate(board.creationDate) || today,
    end_date: today,
    goals: board.description ? [board.description] : [],
    goals_ar: board.description ? [board.description] : [],
    velocity: 0,
    total_points: 0,
    completed_points: 0,
    project_id: supabaseProjectId,
  };
}

// ── Task mapper ──

export function mapTask(item, supabaseProjectId, stageMap, sprintId, hnpProjectId) {
  const stageId = item.stage?.stageId;
  const stageKey = `${hnpProjectId}:${stageId}`;
  const status = stageMap[stageKey] || 'todo';

  const tags = [];
  if (item.category?.name) tags.push(item.category.name);
  if (Array.isArray(item.tags)) {
    for (const t of item.tags) {
      if (t.name) tags.push(t.name);
    }
  }

  return {
    title: item.title || 'Untitled',
    title_ar: item.title || 'Untitled',
    description: item.description || '',
    description_ar: item.description || '',
    status,
    priority: mapPriority(item.importanceLevel),
    assignee_id: null,
    project_id: supabaseProjectId,
    sprint_id: sprintId,
    tags,
    tags_ar: tags,
    due_date: null,
    story_points: item.estimatedCost ?? 0,
  };
}
