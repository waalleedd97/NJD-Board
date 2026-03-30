import 'dotenv/config';
import * as hnp from './src/hacknplan-client.mjs';
import { init as initSupabase, getClient } from './src/supabase-client.mjs';
import idMap from './src/id-map.mjs';
import {
  buildStageMap,
  mapProject,
  mapSprint,
  mapTask,
} from './src/mappers.mjs';
import { writeFileSync, mkdirSync } from 'fs';

// ── Config ──

const { HACKNPLAN_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

if (!HACKNPLAN_API_KEY) { console.error('❌ Missing HACKNPLAN_API_KEY in .env'); process.exit(1); }
if (!SUPABASE_URL) { console.error('❌ Missing SUPABASE_URL in .env'); process.exit(1); }
if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY.includes('PASTE')) {
  console.error('❌ Missing or placeholder SUPABASE_SERVICE_KEY in .env');
  console.error('   Go to Supabase → Project Settings → API Keys → Secret key → copy & paste it');
  process.exit(1);
}

hnp.init(HACKNPLAN_API_KEY);
initSupabase(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const supabase = getClient();

// ── Stats ──

const stats = { projects: 0, sprints: 0, tasks: 0, design: 0 };
const errors = [];

function logError(context, err, rawData) {
  errors.push({ context, message: err.message || String(err), rawData: rawData ? JSON.stringify(rawData).slice(0, 500) : undefined });
  console.error(`  ❌ Error [${context}]: ${err.message || err}`);
}

// ── Insert helper ──

async function insert(table, rows) {
  if (!rows || rows.length === 0) return [];
  const { data, error } = await supabase.from(table).insert(rows).select('id');
  if (error) throw new Error(`Supabase insert into ${table}: ${error.message}`);
  return data;
}

// ── Main ──

async function migrate() {
  console.log('');
  console.log('🚀 Starting HacknPlan → NJD Board Migration...');
  console.log('');

  // 1. Verify HacknPlan connectivity
  let projects;
  try {
    projects = await hnp.getProjects();
  } catch (err) {
    console.error('❌ Failed to connect to HacknPlan API:', err.message);
    process.exit(1);
  }

  if (!Array.isArray(projects) || projects.length === 0) {
    console.error('❌ No projects found in HacknPlan');
    process.exit(1);
  }

  // 2. Verify Supabase connectivity
  try {
    const { error } = await supabase.from('projects').select('id').limit(1);
    if (error) throw error;
  } catch (err) {
    console.error('❌ Failed to connect to Supabase:', err.message);
    process.exit(1);
  }

  console.log(`📦 Found ${projects.length} projects in HacknPlan`);
  console.log('');

  // 3. Migrate each project
  for (let i = 0; i < projects.length; i++) {
    const hnpProject = projects[i];
    const hnpId = hnpProject.id;
    const projectName = hnpProject.name || `Project ${hnpId}`;

    console.log(`[${i + 1}/${projects.length}] Migrating: ${projectName}`);

    // ── Insert project ──
    let supabaseProjectId;
    try {
      const mapped = mapProject(hnpProject);
      const [inserted] = await insert('projects', [mapped]);
      supabaseProjectId = inserted.id;
      idMap.projects[hnpId] = supabaseProjectId;
      stats.projects++;
      console.log(`  ├─ ✅ Project created (id: ${supabaseProjectId.slice(0, 8)}...)`);
    } catch (err) {
      logError(`project:${hnpId}`, err, hnpProject);
      console.log(`  └─ ❌ Skipping project due to error`);
      continue;
    }

    // ── Fetch stages & build status map ──
    let stageMap = {};
    try {
      const stages = await hnp.getStages(hnpId);
      const stageList = Array.isArray(stages) ? stages : stages?.items ?? [];
      stageMap = buildStageMap(stageList, hnpId);
      Object.assign(idMap.stages, stageMap);
    } catch (err) {
      logError(`stages:${hnpId}`, err);
    }

    // ── Fetch & insert boards → sprints ──
    let boardList = [];
    const boardIdMap = {}; // hnpBoardId → supabaseSprintUUID
    try {
      const boards = await hnp.getBoards(hnpId);
      boardList = Array.isArray(boards) ? boards : boards?.items ?? [];

      if (boardList.length > 0) {
        console.log(`  ├─ 📋 Found ${boardList.length} boards → Migrating sprints...`);
        const sprintRows = boardList.map((b) => mapSprint(b, supabaseProjectId));
        const inserted = await insert('sprints', sprintRows);

        const names = [];
        for (let j = 0; j < boardList.length; j++) {
          const bid = boardList[j].boardId;
          boardIdMap[bid] = inserted[j].id;
          idMap.boards[bid] = inserted[j].id;
          names.push(boardList[j].name || `Sprint ${j + 1}`);
          stats.sprints++;
        }
        console.log(`  │  ├─ ✅ ${names.join(', ')}`);
      } else {
        console.log(`  ├─ 📋 No boards found`);
      }
    } catch (err) {
      logError(`boards:${hnpId}`, err);
    }

    // ── Fetch & insert work items → tasks (per board for correct sprint mapping) ──
    let totalTasks = 0;
    try {
      if (boardList.length > 0) {
        // Fetch per board so each task gets the right sprint_id
        for (const board of boardList) {
          const bid = board.boardId;
          const sprintId = boardIdMap[bid] ?? null;
          const items = await hnp.getWorkItemsForBoard(hnpId, bid);
          if (items.length === 0) continue;

          const taskRows = [];
          for (const item of items) {
            try {
              taskRows.push(mapTask(item, supabaseProjectId, stageMap, sprintId, hnpId));
            } catch (err) {
              logError(`task-map:${item.workItemId ?? 'unknown'}`, err, item);
            }
          }

          // Insert in batches of 50
          for (let batch = 0; batch < taskRows.length; batch += 50) {
            const chunk = taskRows.slice(batch, batch + 50);
            try {
              await insert('tasks', chunk);
              totalTasks += chunk.length;
            } catch (err) {
              logError(`tasks-insert:project${hnpId}:board${bid}:offset${batch}`, err);
            }
          }
        }
      } else {
        // No boards — fetch all work items without sprint
        const items = await hnp.getAllWorkItems(hnpId);
        if (items.length > 0) {
          const taskRows = [];
          for (const item of items) {
            try {
              taskRows.push(mapTask(item, supabaseProjectId, stageMap, null, hnpId));
            } catch (err) {
              logError(`task-map:${item.workItemId ?? 'unknown'}`, err, item);
            }
          }

          for (let batch = 0; batch < taskRows.length; batch += 50) {
            const chunk = taskRows.slice(batch, batch + 50);
            try {
              await insert('tasks', chunk);
              totalTasks += chunk.length;
            } catch (err) {
              logError(`tasks-insert:project${hnpId}:offset${batch}`, err);
            }
          }
        }
      }

      stats.tasks += totalTasks;
      if (totalTasks > 0) {
        console.log(`  ├─ 📝 ✅ ${totalTasks} tasks migrated`);
      } else {
        console.log(`  ├─ 📝 No work items found`);
      }
    } catch (err) {
      logError(`workitems:${hnpId}`, err);
    }

    // ── Update sprint metrics ──
    try {
      for (const [, supabaseSprintId] of Object.entries(boardIdMap)) {
        const { data: sprintTasks } = await supabase
          .from('tasks')
          .select('story_points, status')
          .eq('sprint_id', supabaseSprintId);

        if (sprintTasks && sprintTasks.length > 0) {
          const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.story_points || 0), 0);
          const completedPoints = sprintTasks
            .filter((t) => t.status === 'done')
            .reduce((sum, t) => sum + (t.story_points || 0), 0);

          await supabase
            .from('sprints')
            .update({ total_points: totalPoints, completed_points: completedPoints })
            .eq('id', supabaseSprintId);
        }
      }
    } catch (err) {
      logError(`sprint-metrics:${hnpId}`, err);
    }

    console.log(`  └─ ✅ Project complete!`);
    console.log('');
  }

  // ── Summary ──
  console.log('📊 Migration Summary:');
  console.log(`  Projects: ${stats.projects}`);
  console.log(`  Sprints:  ${stats.sprints}`);
  console.log(`  Tasks:    ${stats.tasks}`);
  console.log(`  Design:   ${stats.design}`);
  console.log(`  Errors:   ${errors.length}${errors.length > 0 ? ' (see log file)' : ''}`);
  console.log('');

  // ── Save log ──
  mkdirSync('logs', { recursive: true });
  const logFile = `logs/migration-${new Date().toISOString().split('T')[0]}.json`;
  writeFileSync(logFile, JSON.stringify({ stats, errors, idMap }, null, 2));
  console.log(`📄 Log saved to ${logFile}`);
  console.log('');
  console.log('✅ Migration complete!');
}

migrate().catch((err) => {
  console.error('');
  console.error('💥 Fatal error:', err.message);
  process.exit(1);
});
