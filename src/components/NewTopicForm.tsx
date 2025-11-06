'use client';

import { useState } from 'react';
import { renderMarkdown } from '@/utils/markdown';
import { forumApi } from '../lib/supabase/forumApi';
import { useAuth } from '@/context/AuthContext';

interface NewTopicFormProps {
  onTopicCreated: () => void;
  onClose: () => void;
}

export default function NewTopicForm({ onTopicCreated, onClose }: NewTopicFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a topic.');
      return;
    }
    if (!title || !body || !category) {
      setError('Please fill out all fields.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const [data, err] = await forumApi.createTopic({
      categorySlug: category,
      title,
      body,
      // author_id will be set by RLS policy on the server
    });

    if (err) {
      setError(err.message);
    } else {
      onTopicCreated();
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <form id="new-topic-form" onSubmit={handleSubmit}>
      <div className="modal-header">
        <h3>Start New Topic</h3>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
      </div>
      <div className="modal-body">
        <div className="form-group">
          <label htmlFor="topic-title">Topic Title</label>
          <input
            type="text"
            id="topic-title"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="topic-category">Category</label>
          <select
            id="topic-category"
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            <option value="introductions">Introductions</option>
            <option value="everyday">Everyday Life</option>
            <option value="support">Support</option>
            <option value="resources">Resources</option>
            <option value="art">Art & Creativity</option>
            <option value="humor">Humor & Memes</option>
            <option value="relationships">Relationships</option>
            <option value="identity">Identity</option>
            <option value="offtopic">Off Topic</option>
          </select>
        </div>
        <div className="form-group">
          <div className="preview-toggle-row">
            <label htmlFor="topic-body">Message (Markdown supported)</label>
            <button type="button" className="btn" onClick={() => setShowPreview(p => !p)}>
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>
          {!showPreview && (
            <textarea
              id="topic-body"
              className="form-textarea enhanced-textarea"
              rows={10}
              placeholder="Share your thoughts..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          )}
          {showPreview && (
            <div
              className="post-body markdown-preview-box"
              dangerouslySetInnerHTML={{ __html: body ? renderMarkdown(body) : '<em>Nothing to preview…</em>' }}
            />
          )}
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Topic'}
        </button>
      </div>
    </form>
  );
}
