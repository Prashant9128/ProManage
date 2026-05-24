import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, BarChart3, Users, GitBranch, Shield, Columns3, ArrowRight, Check, Star, ChevronRight } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const features = [
  { icon: Columns3, title: 'Kanban Boards', desc: 'Drag-and-drop task management with real-time status tracking and smart workflows.', color: 'from-primary-500 to-primary-700' },
  { icon: GitBranch, title: 'CI/CD Monitoring', desc: 'Visualize your deployment pipelines, Docker containers, and build statuses.', color: 'from-cyan-500 to-cyan-700' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Rich analytics with interactive charts, team productivity insights, and reports.', color: 'from-violet-500 to-violet-700' },
  { icon: Users, title: 'Team Collaboration', desc: 'Assign tasks, share comments, track activity, and work together seamlessly.', color: 'from-emerald-500 to-emerald-700' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Admin, Manager, and Developer roles with secure JWT authentication.', color: 'from-amber-500 to-amber-700' },
  { icon: Zap, title: 'AI Assistant', desc: 'Smart task recommendations and AI-powered productivity insights.', color: 'from-rose-500 to-rose-700' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Engineering Lead at Vercel', text: 'ProManage transformed our workflow. The CI/CD visualization alone saved us hours every sprint.', rating: 5 },
  { name: 'Marcus Rivera', role: 'CTO at StartupX', text: 'Best project management tool we\'ve used. The Kanban board is incredibly intuitive.', rating: 5 },
  { name: 'Aisha Patel', role: 'DevOps Engineer at Stripe', text: 'Finally, a tool that understands developer workflows. The pipeline monitoring is top-notch.', rating: 5 },
];

const plans = [
  { name: 'Starter', price: 'Free', features: ['5 Projects', '10 Team Members', 'Basic Analytics', 'Kanban Board'], cta: 'Get Started', popular: false },
  { name: 'Pro', price: '$12', features: ['Unlimited Projects', '50 Team Members', 'Advanced Analytics', 'CI/CD Monitoring', 'Priority Support', 'API Access'], cta: 'Start Free Trial', popular: true },
  { name: 'Enterprise', price: '$49', features: ['Everything in Pro', 'Unlimited Members', 'SSO & SAML', 'Custom Integrations', 'Dedicated Support', 'SLA Guarantee'], cta: 'Contact Sales', popular: false },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">ProManage</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-dark-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-dark-400 hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-dark-400 hover:text-white transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-dark-300 hover:text-white transition-colors px-4 py-2">Sign In</Link>
            <Link to="/register" className="text-sm bg-gradient-to-r from-primary-500 to-cyan-500 text-white px-5 py-2 rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5" /> Now with AI-Powered Insights
            </div>
          </motion.div>

          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            Ship Faster with{' '}
            <span className="gradient-text">ProManage</span>
          </motion.h1>

          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The modern task management platform built for engineering teams. Kanban boards, CI/CD monitoring, and team collaboration — all in one beautiful dashboard.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="group flex items-center gap-2 bg-gradient-to-r from-primary-500 to-cyan-500 text-white px-8 py-3.5 rounded-2xl font-semibold text-lg hover:shadow-xl hover:shadow-primary-500/25 transition-all">
              Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="flex items-center gap-2 border border-dark-700 text-dark-300 px-8 py-3.5 rounded-2xl font-medium hover:bg-dark-800/50 hover:text-white transition-all">
              Live Demo <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 relative mx-auto max-w-4xl">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 via-cyan-500/20 to-primary-500/20 rounded-3xl blur-2xl" />
            <div className="relative bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Mock dashboard */}
              <div className="h-10 bg-dark-900 border-b border-dark-800 flex items-center gap-2 px-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <div className="flex-1 text-center text-xs text-dark-500">ProManage Dashboard</div>
              </div>
              <div className="p-6 grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Tasks', value: '247', change: '+12%', color: 'primary' },
                  { label: 'Completed', value: '189', change: '+8%', color: 'emerald' },
                  { label: 'In Progress', value: '38', change: '-3%', color: 'amber' },
                  { label: 'Productivity', value: '94%', change: '+5%', color: 'cyan' },
                ].map((card, i) => (
                  <div key={i} className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/50">
                    <p className="text-xs text-dark-500">{card.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                    <p className="text-xs text-emerald-400 mt-1">{card.change}</p>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6 grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-dark-800/30 rounded-xl p-4 border border-dark-700/30 h-32">
                  <p className="text-xs text-dark-500 mb-3">Task Completion Trend</p>
                  <div className="flex items-end gap-1 h-16">
                    {[40, 55, 35, 65, 50, 75, 85, 60, 90, 70, 80, 95].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-primary-500 to-cyan-500 rounded-sm opacity-80" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="bg-dark-800/30 rounded-xl p-4 border border-dark-700/30 h-32">
                  <p className="text-xs text-dark-500 mb-3">Priority</p>
                  <div className="space-y-2">
                    {[{ l: 'High', w: '30%', c: 'bg-red-500' }, { l: 'Medium', w: '45%', c: 'bg-amber-500' }, { l: 'Low', w: '25%', c: 'bg-emerald-500' }].map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${p.c}`} />
                        <span className="text-xs text-dark-400 w-12">{p.l}</span>
                        <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <div className={`h-full ${p.c} rounded-full`} style={{ width: p.w }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to <span className="gradient-text">ship faster</span></h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">Powerful features designed for modern engineering teams.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}
                  className="group p-6 rounded-2xl bg-dark-900/50 border border-dark-800/50 hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-dark-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by <span className="gradient-text">engineering teams</span></h2>
            <p className="text-dark-400 text-lg">See what our users have to say.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-dark-900/50 border border-dark-800/50">
                <div className="flex gap-1 mb-4">{[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}</div>
                <p className="text-dark-300 text-sm mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-dark-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, transparent <span className="gradient-text">pricing</span></h2>
            <p className="text-dark-400 text-lg">Start free, upgrade when you need.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-2xl border ${plan.popular ? 'bg-gradient-to-b from-primary-500/10 to-transparent border-primary-500/40 shadow-xl shadow-primary-500/10' : 'bg-dark-900/50 border-dark-800/50'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  {plan.price !== 'Free' && <span className="text-dark-500 text-sm">/month per user</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-dark-300">
                      <Check className="w-4 h-4 text-primary-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.popular ? 'bg-gradient-to-r from-primary-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-primary-500/25' : 'border border-dark-700 text-dark-300 hover:bg-dark-800/50 hover:text-white'}`}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-primary-500/10 to-cyan-500/10 border border-primary-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-cyan-500/5 animate-gradient" />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">Ready to transform your workflow?</h2>
              <p className="text-dark-400 mb-8">Join thousands of teams using ProManage to ship better software, faster.</p>
              <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-cyan-500 text-white px-8 py-3.5 rounded-2xl font-semibold hover:shadow-xl hover:shadow-primary-500/25 transition-all">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800/50 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">ProManage</span>
          </div>
          <div className="flex gap-8 text-sm text-dark-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-sm text-dark-600">© 2026 ProManage. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
