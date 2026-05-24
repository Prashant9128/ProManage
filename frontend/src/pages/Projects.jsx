import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, FolderOpen, Trash2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', key: '', color: '#6366f1' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/projects').then(res => {
      setProjects(res.data.projects || []);
    }).catch((err) => {
      toast.error('Failed to load projects');
    }).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', newProject);
      setProjects([res.data.project, ...projects]);
      setShowCreate(false);
      setNewProject({ name: '', description: '', key: '', color: '#6366f1' });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p._id !== projectId));
      toast.success('Project deleted');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-dark-400 mt-1">{projects.length} active projects</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
          className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 transition-all" />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl skeleton" />
                <div className="w-16 h-6 rounded-full skeleton" />
              </div>
              <div className="w-3/4 h-5 skeleton mb-2" />
              <div className="w-full h-3 skeleton mb-4" />
              <div className="pt-4 border-t border-dark-800/50 flex justify-between">
                <div className="w-16 h-3 skeleton" />
                <div className="w-24 h-1.5 skeleton rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-dark-800/50 flex items-center justify-center mb-4">
            <FolderOpen className="w-10 h-10 text-dark-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {search ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-dark-500 text-sm mb-6 max-w-sm">
            {search 
              ? `No projects matching "${search}". Try a different search term.` 
              : "Get started by creating your first project."}
          </p>
          {!search && (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500/15 text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-500/25 transition-all">
              <Plus className="w-4 h-4" /> Create First Project
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/app/projects/${p._id}`} className="block bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6 hover:border-dark-700/50 hover:-translate-y-0.5 transition-all group relative">
                <button onClick={(e) => handleDelete(e, p._id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete project">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: `${p.color || '#6366f1'}20` }}>{p.icon || '📁'}</div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : p.status === 'on-hold' ? 'bg-amber-500/10 text-amber-400' : 'bg-dark-700 text-dark-400'}`}>
                    {p.status}
                  </span>
                </div>
                <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{p.name}</h3>
                <p className="text-sm text-dark-500 mt-1 line-clamp-2">{p.description}</p>
                <div className="flex items-center gap-2 mt-4">
                  {p.tags?.slice(0, 3).map((tag, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-dark-800 text-dark-400">{tag}</span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-dark-800/50 flex items-center justify-between">
                  <span className="text-xs text-dark-500">{p.taskCount || 0} tasks</span>
                  <div className="w-24 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.taskCount ? (p.completedCount / p.taskCount * 100) : 0}%`, background: p.color || '#6366f1' }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-900 border border-dark-800 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-6">Create Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Project Name</label>
                <input type="text" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} required
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Key</label>
                <input type="text" value={newProject.key} onChange={e => setNewProject({ ...newProject, key: e.target.value.toUpperCase() })} required maxLength={6}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white uppercase focus:outline-none focus:border-primary-500/50 transition-all" placeholder="e.g. PM" />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Description</label>
                <textarea value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-dark-700 rounded-xl text-dark-300 hover:bg-dark-800/50 transition-colors text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl font-medium text-sm">Create</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

