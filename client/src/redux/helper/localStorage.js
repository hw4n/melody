export function loadState(object) {
  try {
    const serialized = localStorage.getItem('state');
    if (serialized === null) {
      return object;
    }
    const loaded = JSON.parse(serialized);
    return Object.assign(object, loaded);
  } catch {
    // ignore
  }
}

export function saveState(state) {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem('state', serialized);
  } catch {
    // ignore aswell
  }
}
