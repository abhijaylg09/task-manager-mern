import React from "react";

const TaskCard = ({ task, onToggleStatus, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isCompleted = task.status === "completed";

  return (
    <div className={`task-card ${isCompleted ? "completed" : ""}`}>
      <div>
        <div className="task-header">
          <span className={`status-badge ${isCompleted ? "badge-completed" : "badge-pending"}`}>
            {task.status}
          </span>
          <div className="checkbox-wrapper" onClick={() => onToggleStatus(task)}>
            <div className={`custom-checkbox ${isCompleted ? "checked" : ""}`}>
              {isCompleted && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
          </div>
        </div>
        <h3 className="task-title" title={task.title}>{task.title}</h3>
        <p className="task-desc">{task.description || "No description provided."}</p>
      </div>

      <div className="task-footer">
        <span className="task-date">{formatDate(task.createdAt)}</span>
        <div className="task-actions">
          <button className="action-btn btn-edit" onClick={() => onEdit(task)} title="Edit Task" aria-label="Edit Task">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button className="action-btn btn-delete" onClick={() => onDelete(task._id)} title="Delete Task" aria-label="Delete Task">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
