import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, CheckCircle2, XCircle, Loader2, Clock, Box, Server, Rocket, AlertTriangle } from 'lucide-react';
import api from '../utils/api';

const fallbackPipelines = [
  { id: 'p1', name: 'Frontend Deploy', repo: 'promanage/frontend', branch: 'main', status: 'success', duration: '3m 42s', commit: { message: 'feat: add dashboard analytics', hash: 'a1b2c3d', author: 'Alex Chen' }, stages: [{ name: 'Checkout', status: 'success' },{ name: 'Install', status: 'success' },{ name: 'Lint', status: 'success' },{ name: 'Test', status: 'success' },{ name: 'Build', status: 'success' },{ name: 'Deploy', status: 'success' }], environment: 'production', startedAt: new Date(Date.now()-1800000).toISOString() },
  { id: 'p2', name: 'Backend API', repo: 'promanage/backend', branch: 'develop', status: 'running', duration: '2m 15s', commit: { message: 'fix: resolve auth middleware', hash: 'e4f5g6h', author: 'Sarah Kim' }, stages: [{ name: 'Checkout', status: 'success' },{ name: 'Install', status: 'success' },{ name: 'Lint', status: 'success' },{ name: 'Test', status: 'running' },{ name: 'Build', status: 'pending' },{ name: 'Deploy', status: 'pending' }], environment: 'staging', startedAt: new Date(Date.now()-135000).toISOString() },
  { id: 'p3', name: 'Database Migration', repo: 'promanage/infra', branch: 'feature/schema-v2', status: 'failed', duration: '1m 58s', commit: { message: 'chore: update user schema', hash: 'i7j8k9l', author: 'Mike Johnson' }, stages: [{ name: 'Checkout', status: 'success' },{ name: 'Validate', status: 'success' },{ name: 'Backup', status: 'success' },{ name: 'Migrate', status: 'failed' },{ name: 'Verify', status: 'skipped' },{ name: 'Notify', status: 'skipped' }], environment: 'development', startedAt: new Date(Date.now()-3600000).toISOString() },
  { id: 'p4', name: 'Mobile App Build', repo: 'promanage/mobile', branch: 'main', status: 'success', duration: '8m 12s', commit: { message: 'release: v2.4.0', hash: 'm1n2o3p', author: 'Emily Davis' }, stages: [{ name: 'Checkout', status: 'success' },{ name: 'Install', status: 'success' },{ name: 'Test', status: 'success' },{ name: 'Build iOS', status: 'success' },{ name: 'Build Android', status: 'success' },{ name: 'Publish', status: 'success' }], environment: 'production', startedAt: new Date(Date.now()-7200000).toISOString() },
  { id: 'p5', name: 'E2E Tests', repo: 'promanage/e2e', branch: 'main', status: 'success', duration: '5m 30s', commit: { message: 'test: add kanban tests', hash: 'q4r5s6t', author: 'Alex Chen' }, stages: [{ name: 'Setup', status: 'success' },{ name: 'Start', status: 'success' },{ name: 'Auth', status: 'success' },{ name: 'Dashboard', status: 'success' },{ name: 'Tasks', status: 'success' },{ name: 'Teardown', status: 'success' }], environment: 'staging', startedAt: new Date(Date.now()-10800000).toISOString() },
];

const containers = [
  { name: 'promanage-api', image: 'promanage/api:latest', status: 'running', cpu: '12%', memory: '256MB', uptime: '5d 12h' },
  { name: 'promanage-web', image: 'promanage/web:latest', status: 'running', cpu: '8%', memory: '128MB', uptime: '5d 12h' },
  { name: 'promanage-db', image: 'mongo:7', status: 'running', cpu: '5%', memory: '512MB', uptime: '14d 3h' },
  { name: 'promanage-redis', image: 'redis:alpine', status: 'running', cpu: '2%', memory: '64MB', uptime: '14d 3h' },
  { name: 'promanage-worker', image: 'promanage/worker:latest', status: 'stopped', cpu: '0%', memory: '0MB', uptime: '-' },
];

const deployments = [
  { version: 'v2.4.0', environment: 'production', status: 'active', deployedBy: 'Alex Chen', deployedAt: new Date(Date.now()-86400000).toISOString() },
  { version: 'v2.4.1-rc.1', environment: 'staging', status: 'active', deployedBy: 'Sarah Kim', deployedAt: new Date(Date.now()-3600000).toISOString() },
  { version: 'v2.4.0-dev', environment: 'development', status: 'active', deployedBy: 'Mike Johnson', deployedAt: new Date(Date.now()-7200000).toISOString() },
  { version: 'v2.3.9', environment: 'production', status: 'superseded', deployedBy: 'Emily Davis', deployedAt: new Date(Date.now()-172800000).toISOString() },
  { version: 'v2.3.8', environment: 'production', status: 'superseded', deployedBy: 'Alex Chen', deployedAt: new Date(Date.now()-432000000).toISOString() },
  { version: 'v2.3.7', environment: 'production', status: 'rolled-back', deployedBy: 'Sarah Kim', deployedAt: new Date(Date.now()-604800000).toISOString() },
];

const StatusIcon = ({ status }) => {
  if (status === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === 'failed') return <XCircle className="w-4 h-4 text-red-400" />;
  if (status === 'running') return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
  if (status === 'pending') return <Clock className="w-4 h-4 text-dark-500" />;
  return <div className="w-4 h-4 rounded-full bg-dark-700" />;
};

const envBadge = { production: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', staging: 'bg-amber-500/10 text-amber-400 border-amber-500/20', development: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
const statusBg = { success: 'border-emerald-500/30', failed: 'border-red-500/30', running: 'border-blue-500/30' };

export default function CICDMonitoring() {
  const [pipelines, setPipelines] = useState(fallbackPipelines);
  const [tab, setTab] = useState('pipelines');

  useEffect(() => {
    api.get('/cicd/pipelines').then(res => { if (res.data.pipelines?.length) setPipelines(res.data.pipelines); }).catch(() => {});
  }, []);

  const timeAgo = (d) => { const h = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (h < 60) return `${h}m ago`; return `${Math.floor(h / 60)}h ago`; };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">CI/CD Monitor</h1>
        <p className="text-dark-400 mt-1">Pipeline status, containers, and deployments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pipelines', value: '156', sub: 'total runs', icon: GitBranch, color: 'text-primary-400 bg-primary-500/10' },
          { label: 'Success Rate', value: '94.2%', sub: 'last 30 days', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Avg Build', value: '4m 23s', sub: 'this week', icon: Clock, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'Containers', value: '4/5', sub: 'running', icon: Box, color: 'text-cyan-400 bg-cyan-500/10' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-dark-500 mt-0.5">{s.sub}</p>
              <p className="text-sm text-dark-400 mt-1">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-800/50 pb-3">
        {['pipelines', 'containers', 'deployments'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${tab === t ? 'bg-primary-500/15 text-primary-400' : 'text-dark-400 hover:text-white hover:bg-dark-800/50'}`}>{t}</button>
        ))}
      </div>

      {/* Pipelines */}
      {tab === 'pipelines' && (
        <div className="space-y-4">
          {pipelines.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-dark-900/50 border rounded-2xl p-5 ${statusBg[p.status] || 'border-dark-800/50'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <StatusIcon status={p.status} />
                  <div>
                    <h3 className="font-semibold text-white">{p.name}</h3>
                    <p className="text-xs text-dark-500">{p.repo} · {p.branch} · {p.commit.hash.slice(0, 7)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${envBadge[p.environment]}`}>{p.environment}</span>
                  <span className="text-xs text-dark-500">{p.duration}</span>
                  <span className="text-xs text-dark-600">{timeAgo(p.startedAt)}</span>
                </div>
              </div>
              <p className="text-sm text-dark-400 mb-4 truncate">💬 {p.commit.message} — {p.commit.author}</p>
              {/* Pipeline stages */}
              <div className="flex items-center gap-1">
                {p.stages.map((s, j) => (
                  <div key={j} className="flex-1 group relative">
                    <div className={`h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all cursor-default
                      ${s.status === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                        s.status === 'failed' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                        s.status === 'running' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20 animate-pulse' :
                        s.status === 'pending' ? 'bg-dark-800/50 text-dark-500 border border-dark-700/30' :
                        'bg-dark-800/30 text-dark-600 border border-dark-700/20'}`}>
                      <span className="hidden sm:inline">{s.name}</span>
                      <span className="sm:hidden"><StatusIcon status={s.status} /></span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Containers */}
      {tab === 'containers' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {containers.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-semibold text-white text-sm">{c.name}</h3>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${c.status === 'running' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </div>
              <p className="text-xs text-dark-500 mb-3">{c.image}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-dark-800/30 rounded-lg p-2 text-center"><p className="text-xs text-dark-500">CPU</p><p className="text-sm font-medium text-white">{c.cpu}</p></div>
                <div className="bg-dark-800/30 rounded-lg p-2 text-center"><p className="text-xs text-dark-500">Memory</p><p className="text-sm font-medium text-white">{c.memory}</p></div>
                <div className="bg-dark-800/30 rounded-lg p-2 text-center"><p className="text-xs text-dark-500">Uptime</p><p className="text-sm font-medium text-white">{c.uptime}</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Deployments */}
      {tab === 'deployments' && (
        <div className="space-y-3">
          {deployments.map((d, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-dark-900/50 border border-dark-800/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Rocket className={`w-4 h-4 ${d.status === 'active' ? 'text-emerald-400' : d.status === 'rolled-back' ? 'text-red-400' : 'text-dark-500'}`} />
                <div>
                  <span className="font-mono text-sm text-white font-medium">{d.version}</span>
                  <p className="text-xs text-dark-500">by {d.deployedBy} · {timeAgo(d.deployedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${envBadge[d.environment]}`}>{d.environment}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : d.status === 'rolled-back' ? 'bg-red-500/10 text-red-400' : 'bg-dark-800 text-dark-400'}`}>{d.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
