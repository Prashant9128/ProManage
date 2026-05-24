import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Clock, Tag, Users, FolderOpen } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const statusColors = { todo: 'bg-dark-500', 'in-progress': 'bg-blue-500', review: 'bg-amber-500', completed: 'bg-emerald-500' };
const priorityColors = { high: 'text-red-400 bg-red-500/10', medium: 'text-amber-400 bg-amber-500/10', low: 'text-emerald-400 bg-emerald-500/10' };

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', status: 'todo' });

  useEffect(() => {
    setLoading(true);
    api.get(`/projects/${id}`).then(res => {
      if (res.data.project) setProject(res.data.project);
      setTasks(res.data.tasks || []);
    }).catch((err) => {
      toast.error('Failed to load project');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tasks', { ...newTask, project: id });
      setTasks([...tasks, res.data.task]);
      setShowAddTask(false);
      setNewTask({ title: '', priority: 'medium', status: 'todo' });
      toast.success('Task added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const counts = { all: tasks.length, todo: tasks.filter(t => t.status === 'todo').length, 'in-progress': tasks.filter(t => t.status === 'in-progress').length, review: tasks.filter(t => t.status === 'review').length, completed: tasks.filter(t => t.status === 'completed').length };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/app/projects" className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/50 transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="space-y-2">
            <div className="w-48 h-5 skeleton" />
            <div className="w-32 h-3 skeleton" />
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FolderOpen className="w-16 h-16 text-dark-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Project Not Found</h2>
        <p className="text-dark-400 mb-6">The project you're looking for doesn't exist or has been deleted.</p>
        <Link to="/app/projects" className="px-5 py-2.5 bg-primary-500/15 text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-500/25 transition-all">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/app/projects" className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/50 transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: `${project.color || '#6366f1'}20` }}>{project.icon || '📁'}</div>
          <div>
            <h1 className="text-xl font-bold text-white">{project.name}</h1>
            <p className="text-sm text-dark-400">{project.key} · {project.description}</p>
          </div>
        </div>
        <button onClick={() => setShowAddTask(true)} className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'todo', 'in-progress', 'review', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30' : 'text-dark-400 border border-dark-800/50 hover:bg-dark-800/50'}`}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-dark-800/50 flex items-center justify-center mb-4">
            <FolderOpen className="w-10 h-10 text-dark-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No tasks yet</h3>
          <p className="text-dark-500 text-sm mb-6 max-w-sm">
            {filter === 'all' 
              ? "This project doesn't have any tasks yet. Click 'Add Task' to get started." 
              : `No tasks with status "${filter.replace('-', ' ')}".`}
          </p>
          {filter === 'all' && (
            <button onClick={() => setShowAddTask(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500/15 text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-500/25 transition-all">
              <Plus className="w-4 h-4" /> Add First Task
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task, i) => (
            <motion.div key={task._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-dark-900/50 border border-dark-800/50 rounded-xl p-4 hover:border-dark-700/50 transition-all group">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColors[task.status] || 'bg-dark-500'}`} />
                <h3 className="text-sm font-medium text-white flex-1 group-hover:text-primary-400 transition-colors">{task.title}</h3>
                <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className="text-xs px-2 py-1 rounded-lg bg-dark-800/50 border border-dark-700/50 text-dark-300 focus:outline-none focus:border-primary-500/50 cursor-pointer">
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority] || 'text-dark-400 bg-dark-700'}`}>{task.priority}</span>
                <button onClick={() => handleDeleteTask(task._id)} className="opacity-0 group-hover:opacity-100 text-dark-500 hover:text-red-400 transition-all p-1" title="Delete task">
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-4 mt-2.5 ml-5">
                {task.labels?.map((l, j) => <span key={j} className="text-xs text-dark-500 flex items-center gap-1"><Tag className="w-3 h-3" />{l}</span>)}
                {task.deadline && <span className="text-xs text-dark-500 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(task.deadline).toLocaleDateString()}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddTask(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-900 border border-dark-800 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-6">Add Task</h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Task Title</label>
                <input type="text" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" placeholder="e.g. Implement user authentication" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-1.5">Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-1.5">Status</label>
                  <select value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all">
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddTask(false)} className="flex-1 py-2.5 border border-dark-700 rounded-xl text-dark-300 hover:bg-dark-800/50 transition-colors text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl font-medium text-sm">Add Task</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
