/** Parse & clamp pagination query params. */
export function getPagination(query, { defaultLimit = 10, maxLimit = 50 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(query.limit, 10) || defaultLimit)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/** Build a consistent paginated payload. */
export function paginated(items, total, { page, limit }) {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasMore: page * limit < total,
    },
  };
}

/** URL-safe slug from an arbitrary string. */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
