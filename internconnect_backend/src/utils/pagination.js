const paginate = (page, limit, total) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const total_pages = Math.ceil(total / l);
  return {
    page: p,
    limit: l,
    total,
    total_pages,
    has_next: p < total_pages,
    has_prev: p > 1,
  };
};

module.exports = { paginate };
