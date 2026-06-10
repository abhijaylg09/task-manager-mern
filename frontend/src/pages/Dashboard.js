import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API from "../api";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  // Search, Filter, Pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Debounce search term input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new searches
    }, 450);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/tasks", {
        params: {
          q: debouncedSearch,
          status: statusFilter,
          page,
          limit: 6,
        },
      });
      setTasks(res.data.tasks);
      setTotalPages(res.data.totalPages || 1);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
      showToast("Could not load tasks. Please refresh.", "error");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page, showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle Add/Edit task submission
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        // Edit Task
        const res = await API.put(`/tasks/${editingTask._id}`, taskData);
        showToast("Task updated successfully!", "success");
        // Update local task list
        setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? res.data : t)));
      } else {
        // Add Task
        const res = await API.post("/tasks", taskData);
        showToast("Task created successfully!", "success");
        // Prepend new task
        setTasks((prev) => [res.data, ...prev].slice(0, 6));
      }
      fetchTasks(); // Refresh to update statistics and proper pagination state
    } catch (error) {
      showToast("Failed to save task. Try again.", "error");
    }
  };

  // Toggle status of a task
  const handleToggleStatus = async (task) => {
    // Optimistic UI update
    const updatedStatus = task.status === "completed" ? "pending" : "completed";
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: updatedStatus } : t))
    );

    // Optimistically update counts
    setStats((prev) => {
      const isCompleting = updatedStatus === "completed";
      return {
        ...prev,
        completed: isCompleting ? prev.completed + 1 : Math.max(0, prev.completed - 1),
        pending: isCompleting ? Math.max(0, prev.pending - 1) : prev.pending + 1,
      };
    });

    try {
      await API.patch(`/tasks/${task._id}/toggle`);
      showToast(
        `Task marked as ${updatedStatus === "completed" ? "completed" : "pending"}!`,
        "info"
      );
    } catch (error) {
      // Revert if API call fails
      fetchTasks();
      showToast("Failed to update status.", "error");
    }
  };

  // Delete task
  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      showToast("Task deleted successfully.", "success");
      fetchTasks();
    } catch (error) {
      showToast("Failed to delete task.", "error");
    }
  };

  const openAddModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const getCompletionRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <nav className="navbar">
        <h1 className="nav-brand" onClick={() => navigate("/")}>TaskFlow</h1>
        <div className="nav-user">
          <div className="user-badge">
            <div className="user-avatar">{user?.name ? user.name[0].toUpperCase() : "U"}</div>
            <span className="user-name">{user?.name || "User"}</span>
          </div>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        {/* Statistics Bar */}
        <section className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-info">
              <h3>Total Tasks</h3>
              <div className="stat-number">{stats.total}</div>
            </div>
            <div className="stat-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>

          <div className="stat-card stat-completed">
            <div className="stat-info">
              <h3>Completed</h3>
              <div className="stat-number">{stats.completed}</div>
            </div>
            <div className="stat-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>

          <div className="stat-card stat-pending">
            <div className="stat-info">
              <h3>Pending</h3>
              <div className="stat-number">{stats.pending}</div>
            </div>
            <div className="stat-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>

          <div className="stat-card stat-rate">
            <div className="stat-info">
              <h3>Completion Rate</h3>
              <div className="stat-number">{getCompletionRate()}%</div>
            </div>
            <div className="stat-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
        </section>

        {/* Controls Bar (Search, Filters, Add Button) */}
        <section className="controls-bar">
          <div className="search-wrapper">
            <span className="search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-actions">
            <div className="status-filter">
              <button
                className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => { setStatusFilter("all"); setPage(1); }}
              >
                All
              </button>
              <button
                className={`filter-btn ${statusFilter === "pending" ? "active" : ""}`}
                onClick={() => { setStatusFilter("pending"); setPage(1); }}
              >
                Pending
              </button>
              <button
                className={`filter-btn ${statusFilter === "completed" ? "active" : ""}`}
                onClick={() => { setStatusFilter("completed"); setPage(1); }}
              >
                Completed
              </button>
            </div>

            <button className="btn btn-primary btn-add-task" onClick={openAddModal}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Task
            </button>
          </div>
        </section>

        {/* Tasks Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
            <p>Loading tasks from database...</p>
          </div>
        ) : tasks.length > 0 ? (
          <section className="tasks-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggleStatus={handleToggleStatus}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
              />
            ))}
          </section>
        ) : (
          <section className="empty-state">
            <h3>No Tasks Found</h3>
            <p>
              {debouncedSearch || statusFilter !== "all"
                ? "No tasks match your filter criteria. Try expanding your search query."
                : "Your workspace is clear! Ready to plan your day?"}
            </p>
            {!debouncedSearch && statusFilter === "all" && (
              <button className="btn btn-primary" onClick={openAddModal}>
                Create Your First Task
              </button>
            )}
          </section>
        )}

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <section className="pagination">
            <button
              className={`page-item ${page === 1 ? "disabled" : ""}`}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous Page"
            >
              &laquo;
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
              <button
                key={p}
                className={`page-item ${page === p ? "active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className={`page-item ${page === totalPages ? "disabled" : ""}`}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next Page"
            >
              &raquo;
            </button>
          </section>
        )}
      </main>

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  );
};

export default Dashboard;
