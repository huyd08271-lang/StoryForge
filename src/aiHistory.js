const KEY = "storyforge_ai_history_v1";

export function loadAIHistory() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function saveAIHistory(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify((items || []).slice(-100)));
  } catch {}
}

export function addAIHistory(entry) {
  const items = loadAIHistory();
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };
  saveAIHistory([...items, item]);
  return item;
}

export function clearAIHistory() {
  try { localStorage.removeItem(KEY); } catch {}
}
