"use client";
import React, { useState } from "react";
import type { HomeworkItem, HomeworkSubmission } from "../services/api";

interface Props {
  homework: HomeworkItem;
  studentId: string;
  token: string;
  initialSubmission?: HomeworkSubmission | null;
  onSubmitted: (submission: HomeworkSubmission) => void;
  onDeleted: () => void;
}

const HomeworkSubmissionForm: React.FC<Props> = ({
  homework,
  studentId,
  token,
  initialSubmission,
  onSubmitted,
  onDeleted,
}) => {
  // Status is always 'submitted' for parent
  const status: 'submitted' = 'submitted';
  const [comment, setComment] = useState(initialSubmission?.comment || "");
  const [attachments, setAttachments] = useState<string[]>(initialSubmission?.attachments || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { submitHomework } = await import("../services/api");
      const submission = await submitHomework(token, {
        homeworkId: homework.id,
        studentId,
        status,
        attachments,
        comment,
      });
      onSubmitted(submission);
    } catch (err: any) {
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete submission?")) return;
    setLoading(true);
    setError(null);
    try {
      const { deleteHomeworkSubmission } = await import("../services/api");
      await deleteHomeworkSubmission(token, homework.id, studentId);
      onDeleted();
    } catch (err: any) {
      setError(err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: "#f9f9f9", padding: 16, borderRadius: 8, marginTop: 16 }}>

      <div style={{ marginBottom: 12 }}>
        <label>Comment:</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} style={{ width: "100%", minHeight: 40 }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Attachments:</label>
        <input type="file" multiple onChange={e => {
          const files = e.target.files;
          if (!files) return;
          setAttachments(Array.from(files).map(f => f.name));
        }} />
        {attachments.length > 0 && <ul>{attachments.map((a, i) => <li key={i}>{a}</li>)}</ul>}
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button
        type="submit"
        disabled={loading}
        style={{
          background: initialSubmission ? '#388e3c' : '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          padding: '0.5rem 1.5rem',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          marginTop: 8
        }}
      >
        {loading
          ? (initialSubmission ? "Updating..." : "Submitting...")
          : (initialSubmission ? "Update Submission" : "Submit")}
      </button>
      {initialSubmission && <button type="button" onClick={handleDelete} disabled={loading} style={{ marginLeft: 8 }}>Delete</button>}
    </form>
  );
};

export default HomeworkSubmissionForm;
