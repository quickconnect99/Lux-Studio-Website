"use client";

import { useMemo, useState } from "react";

const ALL = "All";

/**
 * Generic filter + pagination hook.
 *
 * @param items     - Full list of items to paginate.
 * @param categoryKey - Key on each item that holds the category string.
 * @param pageSize  - How many items to show per page.
 *
 * Returns a stable object whose `categories` array always starts with "All",
 * followed by the unique values found in `items[categoryKey]`.
 * `selectCategory` also resets pagination to page 1.
 *
 * @example
 * const { categories, activeCategory, selectCategory, visible, hasMore, remaining, loadMore } =
 *   useFilteredPagination(projects, "category", 6);
 */
export function useFilteredPagination<T extends Record<string, unknown>>(
  items: T[],
  categoryKey: keyof T & string,
  pageSize: number
) {
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const categories = useMemo(
    () => [ALL, ...new Set(items.map((item) => String(item[categoryKey])))],
    [items, categoryKey]
  );

  const filtered = useMemo(
    () =>
      activeCategory === ALL
        ? items
        : items.filter((item) => String(item[categoryKey]) === activeCategory),
    [activeCategory, items, categoryKey]
  );

  function selectCategory(cat: string) {
    setActiveCategory(cat);
    setVisibleCount(pageSize);
  }

  function loadMore() {
    setVisibleCount((n) => n + pageSize);
  }

  const visible   = filtered.slice(0, visibleCount);
  const hasMore   = visibleCount < filtered.length;
  const remaining = filtered.length - visibleCount;

  return { categories, activeCategory, selectCategory, visible, hasMore, remaining, loadMore };
}
