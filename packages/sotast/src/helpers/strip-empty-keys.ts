export const stripEmptyKeys = (obj: Record<string, unknown>) => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value == null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (Object.keys(value).length === 0) continue;
      result[key] = stripEmptyKeys(value as any);
    } else {
      result[key] = value;
    }
  }

  return result;
};
