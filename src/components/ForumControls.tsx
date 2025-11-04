
'use client';

import { useState, useEffect } from 'react';
import { forumApi } from '@/lib/supabase/forumApi';

interface Category {
  id: number;
  slug: string;
  name: string;
}

interface ForumControlsProps {
  onFilterChange: (filters: { category: string; sort: string; search: string }) => void;
}

export default function ForumControls({ onFilterChange }: ForumControlsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('latest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      const [data, error] = await forumApi.listCategories();
      if (data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
        onFilterChange({ category, sort, search });
    }, 500); // Debounce search input

    return () => {
        clearTimeout(handler);
    };
  }, [category, sort, search, onFilterChange]);

  return (
    <div className="forum-filters">
      <div className="form-group">
        <label htmlFor="category-filter">Category</label>
        <select
          id="category-filter"
          className="form-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="sort-order">Sort by</label>
        <select
          id="sort-order"
          className="form-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="latest">Latest Activity</option>
          <option value="newest">Newest Created</option>
          <option value="most-replies">Most Replies</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="search-query">Search</label>
        <input
          type="text"
          id="search-query"
          className="form-input"
          placeholder="Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
