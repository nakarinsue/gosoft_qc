let apiMap = {};
let loaded = false;

export async function loadApiLookup() {
  if (loaded) return apiMap;

  const res = await fetch("/APILOOKUP");
  const result = await res.json();

  if (!result.success) {
    throw new Error(result.message);
  }

  apiMap = Object.fromEntries(
    result.data.map(item => [item.KEY, item.URL])
  );

  loaded = true;
  console.log("API LOOKUP LOADED:", apiMap);

  return apiMap;
}

export function getApiUrl(key) {
  return apiMap[key];
}
