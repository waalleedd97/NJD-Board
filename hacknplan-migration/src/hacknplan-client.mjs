const BASE = 'https://api.hacknplan.com/v0';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

let apiKey = '';

export function init(key) {
  apiKey = key;
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await delay(250);
      const res = await fetch(url, {
        headers: { Authorization: `ApiKey ${apiKey}` },
      });

      if (res.status === 429) {
        const wait = 2000 * (i + 1);
        console.warn(`  ⏳ Rate limited, waiting ${wait}ms...`);
        await delay(wait);
        continue;
      }

      if (res.status === 500 && i < retries - 1) {
        const wait = 1000 * (i + 1);
        console.warn(`  ⚠️  Server error 500, retry ${i + 1}/${retries} in ${wait}ms...`);
        await delay(wait);
        continue;
      }

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
      }

      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await delay(1000 * (i + 1));
    }
  }
}

export async function getProjects() {
  return fetchWithRetry(`${BASE}/projects`);
}

export async function getBoards(projectId) {
  return fetchWithRetry(`${BASE}/projects/${projectId}/boards`);
}

export async function getStages(projectId) {
  return fetchWithRetry(`${BASE}/projects/${projectId}/stages`);
}

export async function getCategories(projectId) {
  return fetchWithRetry(`${BASE}/projects/${projectId}/categories`);
}

export async function getTags(projectId) {
  return fetchWithRetry(`${BASE}/projects/${projectId}/tags`);
}

export async function getMilestones(projectId) {
  return fetchWithRetry(`${BASE}/projects/${projectId}/milestones`);
}

/** Fetch all work items for a project, handling pagination wrapper { totalCount, items } */
export async function getAllWorkItems(projectId) {
  const all = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const data = await fetchWithRetry(
      `${BASE}/projects/${projectId}/workitems?limit=${limit}&offset=${offset}`
    );

    // API returns { totalCount, offset, limit, items: [...] }
    const items = Array.isArray(data) ? data : data?.items ?? [];
    if (items.length === 0) break;

    all.push(...items);
    if (items.length < limit) break;
    offset += limit;
  }

  return all;
}

/** Fetch work items for a specific board */
export async function getWorkItemsForBoard(projectId, boardId) {
  const all = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const data = await fetchWithRetry(
      `${BASE}/projects/${projectId}/workitems?boardId=${boardId}&limit=${limit}&offset=${offset}`
    );

    const items = Array.isArray(data) ? data : data?.items ?? [];
    if (items.length === 0) break;

    all.push(...items);
    if (items.length < limit) break;
    offset += limit;
  }

  return all;
}
