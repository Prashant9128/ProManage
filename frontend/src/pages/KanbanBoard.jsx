import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, Tag, MessageSquare, Trash2, GripVertical, Layers, Loader2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const columns = [
  { id: 'todo', title: 'To Do', color: '#64748b', dot: 'bg-slate-400', gradient: 'from-slate-500/10 to-slate-500/5' },
  { id: 'in-progress', title: 'In Progress', color: '#3b82f6', dot: 'bg-blue-500', gradient: 'from-blue-500/10 to-blue-500/5' },
  { id: 'review', title: 'In Review', color: '#f59e0b', dot: 'bg-amber-500', gradient: 'from-amber-500/10 to-amber-500/5' },
  { id: 'completed', title: 'Completed', color: '#10b981', dot: 'bg-emerald-500', gradient: 'from-emerald-500/10 to-emerald-500/5' },
];

const priorityColors = { high: 'border-l-red-500', medium: 'border-l-amber-500', low: 'border-l-emerald-500' };
const priorityBadge = { high: 'bg-red-500/10 text-red-400', medium: 'bg-amber-500/10 text-amber-400', low: 'bg-emerald-500/10 text-emerald-400' };

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createInColumn, setCreateInColumn] = useState('todo');
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', status: 'todo', category: 'frontend', labels: '' });
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');

  // AI Task Estimation states
  const [aiPredicting, setAiPredicting] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/tasks'),
      api.get('/projects')
    ]).then(([tasksRes, projectsRes]) => {
      setTasks(tasksRes.data.tasks || []);
      setProjects(projectsRes.data.projects || []);
    }).catch((err) => {
      toast.error('Failed to load tasks');
    }).finally(() => setLoading(false));
  }, []);

  const filteredTasks = selectedProject === 'all' 
    ? tasks 
    : tasks.filter(t => {
        const projId = typeof t.project === 'object' ? t.project?._id : t.project;
        return projId === selectedProject;
      });

  // === Native HTML5 Drag & Drop ===
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task._id);
    if (e.target) {
      setTimeout(() => {
        e.target.style.opacity = '0.4';
      }, 0);
    }
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e, columnId) => {
    const relatedTarget = e.relatedTarget;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedTask || draggedTask.status === columnId) {
      setDraggedTask(null);
      return;
    }

    const oldStatus = draggedTask.status;
    setTasks(prev => prev.map(t => 
      t._id === draggedTask._id ? { ...t, status: columnId } : t
    ));

    try {
      await api.put(`/tasks/${draggedTask._id}`, { status: columnId });
      toast.success(`Moved to ${columns.find(c => c.id === columnId)?.title}`, { duration: 1500, icon: '✅' });
    } catch (err) {
      setTasks(prev => prev.map(t =>
        t._id === draggedTask._id ? { ...t, status: oldStatus } : t
      ));
      toast.error('Failed to move task');
    }
    setDraggedTask(null);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const labelsArray = newTask.labels 
        ? newTask.labels.split(',').map(l => l.trim()).filter(l => l.length > 0)
        : [];
      const taskData = { 
        ...newTask, 
        status: createInColumn,
        labels: labelsArray
      };
      const res = await api.post('/tasks', taskData);
      setTasks(prev => [...prev, res.data.task]);
      setShowCreate(false);
      setNewTask({ title: '', description: '', priority: 'medium', status: 'todo', category: 'frontend', labels: '' });
      setAiPrediction(null);
      toast.success('Task created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const openCreateInColumn = (columnId) => {
    setCreateInColumn(columnId);
    setNewTask({ title: '', description: '', priority: 'medium', status: columnId, category: 'frontend', labels: '' });
    setAiPrediction(null);
    setShowCreate(true);
  };

  const handleGetAiEstimation = async () => {
    if (!newTask.title) {
      toast.error('Please enter a task title first');
      return;
    }
    setAiPredicting(true);
    setAiPrediction(null);
    try {
      const res = await api.post('/analytics/predict-task', {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        category: newTask.category
      });
      if (res.data.success) {
        setAiPrediction(res.data.prediction);
        toast.success('AI estimation complete!');
      }
    } catch (err) {
      toast.error('Failed to get AI estimation');
    } finally {
      setAiPredicting(false);
    }
  };

  const applyAiEstimation = () => {
    if (!aiPrediction) return;
    const estText = `⏱️ AI Estimate: ${aiPrediction.estimatedHours} hours (${aiPrediction.estimatedDays} days)`;
    setNewTask(prev => {
      const newDesc = prev.description 
        ? `${prev.description}\n\n${estText}`
        : estText;
      
      const estLabel = `Est: ${aiPrediction.estimatedHours}h`;
      const currentLabels = prev.labels 
        ? prev.labels.split(',').map(s => s.trim()) 
        : [];
      if (!currentLabels.includes(estLabel)) {
        currentLabels.push(estLabel);
      }
      
      return {
        ...prev,
        description: newDesc,
        labels: currentLabels.join(', ')
      };
    });
    setAiPrediction(null);
    toast.success('Estimation applied to task details!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
          <p className="text-dark-400 mt-1">{filteredTasks.length} tasks across {columns.length} columns</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Project Filter */}
          <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
            className="px-3 py-2 bg-dark-800/50 border border-dark-700/50 rounded-xl text-sm text-dark-300 focus:outline-none focus:border-primary-500/50 transition-all">
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          <button onClick={() => openCreateInColumn('todo')} className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map(col => (
            <div key={col.id} className="bg-dark-900/30 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2.5 h-2.5 rounded-full skeleton" />
                <div className="w-20 h-4 skeleton rounded" />
                <div className="w-6 h-4 skeleton rounded-full" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-dark-900/80 border border-dark-800/50 rounded-xl p-3.5">
                    <div className="w-full h-4 skeleton rounded mb-2" />
                    <div className="w-2/3 h-3 skeleton rounded mb-3" />
                    <div className="flex gap-2">
                      <div className="w-12 h-3 skeleton rounded" />
                      <div className="w-12 h-3 skeleton rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-dark-800/50 flex items-center justify-center mb-4">
            <Layers className="w-10 h-10 text-dark-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No tasks yet</h3>
          <p className="text-dark-500 text-sm mb-6 max-w-sm">
            {selectedProject !== 'all' 
              ? "This project doesn't have any tasks yet." 
              : "Create your first task to get started with the Kanban board."}
          </p>
          <button onClick={() => openCreateInColumn('todo')} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500/15 text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-500/25 transition-all">
            <Plus className="w-4 h-4" /> Create First Task
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            const isOver = dragOverColumn === col.id && draggedTask?.status !== col.id;
            return (
              <div key={col.id} className="bg-dark-900/30 rounded-2xl p-3 flex flex-col">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <h3 className="text-sm font-semibold text-dark-300">{col.title}</h3>
                    <span className="text-xs text-dark-500 bg-dark-800 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                  </div>
                  <button onClick={() => openCreateInColumn(col.id)}
                    className="p-1 rounded-lg text-dark-500 hover:text-primary-400 hover:bg-dark-800/50 transition-all" title={`Add task to ${col.title}`}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Drop Zone */}
                <div
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={(e) => handleDragLeave(e, col.id)}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`space-y-2 min-h-[200px] rounded-xl p-1 transition-all duration-200 flex-1 ${
                    isOver 
                      ? `bg-gradient-to-b ${col.gradient} ring-1 ring-inset ring-${col.id === 'todo' ? 'slate' : col.id === 'in-progress' ? 'blue' : col.id === 'review' ? 'amber' : 'emerald'}-500/20` 
                      : ''
                  }`}
                >
                  <AnimatePresence mode="popLayout">
                    {colTasks.map((task) => (
                      <motion.div
                        key={task._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={`bg-dark-900/80 border border-dark-800/50 rounded-xl p-3.5 border-l-2 ${priorityColors[task.priority] || 'border-l-dark-600'} 
                          cursor-grab active:cursor-grabbing hover:border-dark-700/50 transition-all group
                          ${draggedTask?._id === task._id ? 'opacity-40 scale-95' : 'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20'}`}
                      >
                        {/* Task Title */}
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-3.5 h-3.5 text-dark-600 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <h4 className="text-sm font-medium text-dark-200 leading-snug flex-1">{task.title}</h4>
                          <button onClick={() => handleDeleteTask(task._id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-dark-600 hover:text-red-400 transition-all flex-shrink-0" title="Delete task">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Description snippet */}
                        {task.description && (
                          <p className="text-xs text-dark-400 mt-2 ml-5 line-clamp-2 whitespace-pre-line">{task.description}</p>
                        )}

                        {/* Project tag */}
                        {task.project && typeof task.project === 'object' && (
                          <div className="mt-2 ml-5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" 
                              style={{ background: `${task.project.color || '#6366f1'}15`, color: task.project.color || '#6366f1' }}>
                              {task.project.key || task.project.name}
                            </span>
                          </div>
                        )}

                        {/* Labels */}
                        {task.labels?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 ml-5">
                            {task.labels.slice(0, 3).map((l, j) => (
                              <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-800 text-dark-400">{l}</span>
                            ))}
                            {task.labels.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-800 text-dark-500">+{task.labels.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-dark-800/50">
                          <div className="flex items-center gap-2.5">
                            {task.deadline && (
                              <span className={`text-[10px] flex items-center gap-1 ${
                                new Date(task.deadline) < new Date() && task.status !== 'completed' 
                                  ? 'text-red-400' 
                                  : 'text-dark-500'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {new Date(task.deadline).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                            {task.comments?.length > 0 && (
                              <span className="text-[10px] text-dark-500 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />{task.comments.length}
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priorityBadge[task.priority] || 'bg-dark-700 text-dark-400'}`}>{task.priority}</span>
                        </div>

                        {/* Assignee */}
                        {task.assignee && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center text-[9px] font-semibold text-primary-400">
                              {(task.assignee.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[10px] text-dark-500">{task.assignee.name}</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Drop indicator when column is empty and being dragged over */}
                  {isOver && colTasks.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-2 border-dashed border-dark-600/50 rounded-xl p-8 flex items-center justify-center">
                      <p className="text-xs text-dark-500">Drop here</p>
                    </motion.div>
                  )}

                  {/* Drop indicator when being dragged over existing items */}
                  {isOver && colTasks.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="border-2 border-dashed border-primary-500/30 rounded-xl p-3 flex items-center justify-center bg-primary-500/5">
                      <p className="text-xs text-primary-400">Drop to move here</p>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowCreate(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-900 border border-dark-800 rounded-2xl p-6 w-full max-w-lg my-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-1">Create Task</h2>
            <p className="text-sm text-dark-500 mb-6">Adding to <span className="text-dark-300 font-medium">{columns.find(c => c.id === createInColumn)?.title}</span></p>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Title</label>
                <input type="text" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required autoFocus
                  placeholder="e.g. Implement user authentication"
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-600 focus:outline-none focus:border-primary-500/50 transition-all" />
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Description</label>
                <textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Provide task details or let AI append estimations..." rows={3}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-600 focus:outline-none focus:border-primary-500/50 transition-all resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-1.5">Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-1.5">Category</label>
                  <select value={newTask.category || 'frontend'} onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all">
                    <option value="frontend">Frontend / UI</option>
                    <option value="backend">Backend / API</option>
                    <option value="database">Database Schema</option>
                    <option value="devops">CI/CD & DevOps</option>
                    <option value="bug">Bug Fix</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {projects.length > 0 && (
                  <div>
                    <label className="block text-sm text-dark-300 mb-1.5">Project (optional)</label>
                    <select value={newTask.project || ''} onChange={e => setNewTask({ ...newTask, project: e.target.value || undefined })}
                      className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all">
                      <option value="">No Project</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-dark-300 mb-1.5">Labels (comma-separated)</label>
                  <input type="text" value={newTask.labels} onChange={e => setNewTask({ ...newTask, labels: e.target.value })}
                    placeholder="e.g. design, api, blocker"
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-600 focus:outline-none focus:border-primary-500/50 transition-all" />
                </div>
              </div>

              {/* AI Prediction Section */}
              <div className="border border-dark-800 bg-dark-950/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-ping" />
                    <span className="text-sm font-semibold text-white">AI Complexity Predictor</span>
                  </div>
                  <button type="button" onClick={handleGetAiEstimation} disabled={aiPredicting}
                    className="text-xs px-3 py-1.5 bg-primary-500/10 text-primary-400 border border-primary-500/25 hover:bg-primary-500/25 rounded-lg disabled:opacity-50 flex items-center gap-1 transition-all">
                    {aiPredicting && <Loader2 className="w-3 h-3 animate-spin" />}
                    ⚡ Ask AI Estimator
                  </button>
                </div>

                {aiPrediction && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-dark-800 pb-2">
                      <span className="text-dark-400">Estimated Duration:</span>
                      <strong className="text-white">{aiPrediction.estimatedHours} hours (~{aiPrediction.estimatedDays} days)</strong>
                    </div>
                    <div className="flex justify-between border-b border-dark-800 pb-2">
                      <span className="text-dark-400">Model Confidence:</span>
                      <strong className="text-emerald-400">{aiPrediction.confidenceScore}%</strong>
                    </div>
                    <div className="text-dark-500 pt-1">
                      <span className="font-medium text-dark-300 block mb-1">AI Breakdown:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {aiPrediction.breakdown.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <button type="button" onClick={applyAiEstimation}
                      className="w-full mt-2 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 rounded-lg font-medium transition-all text-center">
                      Apply Prediction to Task Details
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-dark-700 rounded-xl text-dark-300 hover:bg-dark-800/50 transition-colors text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all">Create</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

