import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { Project } from '../../types';
import { projectService, authService } from '../../services';
import { ProjectForm, ProjectFormSubmitData } from './ProjectForm';
import { DeleteProjectDialog } from './DeleteProjectDialog';
import { Toast, ToastMessage } from './Toast';
import {
  Plus,
  ArrowLeft,
  LogOut,
  ExternalLink,
  Edit3,
  Trash2,
  Globe,
  RotateCcw,
  CheckCircle2,
  FolderOpen,
  Cloud,
  Tag,
  Image as ImageIcon,
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onNavigateHome,
}) => {
  const [projects, setProjects] = useState<Project[]>(() => projectService.getProjects());
  const [firebaseUser, setFirebaseUser] = useState<User | null>(() => authService.getFirebaseUser());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnectingCloud, setIsConnectingCloud] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const unsubAuth = authService.subscribeFirebaseAuth(async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          await projectService.ensureCloudSeeded(user.uid);
        } catch {
          // Handled via structured Firestore error if permission denied
        }
      }
    });

    const unsubProjects = projectService.subscribeProjects(
      (cloudProjects) => {
        setProjects(cloudProjects);
      },
      () => {
        // Fallback to local cache on listener error
        setProjects(projectService.getProjects());
      },
      Boolean(firebaseUser)
    );

    return () => {
      unsubAuth();
      unsubProjects();
    };
  }, [Boolean(firebaseUser)]);

  const ensureCloudSession = async (): Promise<User | null> => {
    const current = authService.getFirebaseUser();
    if (current) return current;

    setIsConnectingCloud(true);
    try {
      const user = await authService.connectCloudAdmin();
      await projectService.ensureCloudSeeded(user.uid);
      addToast('Cloud database authorized.', 'success');
      return user;
    } catch {
      addToast('Please sign in with your authorized Google account to save to the cloud database.', 'error');
      return null;
    } finally {
      setIsConnectingCloud(false);
    }
  };

  const handleConnectCloudClick = async () => {
    await ensureCloudSession();
  };

  const handleOpenAdd = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleSaveProject = async (data: ProjectFormSubmitData) => {
    setIsSaving(true);
    try {
      const user = await ensureCloudSession();
      if (!user) {
        return;
      }

      if (editingProject) {
        await projectService.updateProjectInCloud(editingProject.id, data, user.uid);
        addToast(`"${data.name}" updated in database.`, 'success');
      } else {
        await projectService.addProjectToCloud(data, user.uid);
        addToast(`"${data.name}" added to database.`, 'success');
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error('Save error:', err);
      addToast('Unable to save to database. Please verify your admin Google account.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    setIsSaving(true);
    try {
      const user = await ensureCloudSession();
      if (!user) return;

      await projectService.deleteProjectFromCloud(deletingProject.id);
      addToast(`"${deletingProject.name}" deleted from database.`, 'success');
    } catch {
      addToast('Unable to delete item from database.', 'error');
    } finally {
      setIsSaving(false);
      setDeletingProject(null);
    }
  };

  const handleResetToSeed = async () => {
    setIsSaving(true);
    try {
      const user = await ensureCloudSession();
      if (!user) return;

      const seeded = await projectService.seedProjectsToCloud(user.uid);
      setProjects(seeded);
      addToast('Restored original 7 portfolio projects in database.', 'info');
    } catch {
      addToast('Unable to restore projects in database.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutClick = () => {
    authService.logout();
    addToast('Logged out successfully.', 'info');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-[#0d0907] text-white flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-[#0d0907]/90 backdrop-blur-md border-b border-white/[0.08] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              title="Return to Public Portfolio"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-white">
                <span>
                  Sameer<span className="text-sky-400">Dev</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  Admin Panel
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Products, Pictures &amp; Portfolio Database Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors border border-white/[0.08]"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 transition-colors border border-rose-500/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        {/* Cloud Database Authorization Prompt (shown only until Google Admin is signed in) */}
        {!firebaseUser && (
          <div className="p-4 sm:p-5 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold text-white">Authorize Cloud Database Sync</h2>
                <p className="text-xs text-stone-300">
                  Connect your authorized Google account to save new products and pictures directly to Firestore.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleConnectCloudClick}
              disabled={isConnectingCloud}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-stone-950 bg-sky-400 hover:bg-sky-300 btn-micro-fx disabled:opacity-60"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{isConnectingCloud ? 'Connecting...' : 'Connect Google Account'}</span>
            </button>
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#140e0b]/80 border border-white/[0.08] shadow-xl">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Products &amp; Portfolio Manager
            </h1>
            <p className="text-xs sm:text-sm text-stone-400">
              Add products with pictures or manage live websites ({projects.length}{' '}
              {projects.length === 1 ? 'item' : 'items'} active)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleResetToSeed}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] btn-micro-fx disabled:opacity-50"
              title="Reset to 7 original seed projects"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              <span>Reset to Seeds</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 btn-micro-fx shadow-lg shadow-amber-400/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product / Project</span>
            </button>
          </div>
        </div>

        {/* Items Grid */}
        {projects.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-2xl bg-[#140e0b]/60 border border-white/[0.08] text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-800/60 border border-stone-700/60 flex items-center justify-center text-stone-400">
              <FolderOpen className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-white tracking-tight">No products or projects yet</h2>
              <p className="text-sm text-stone-400 leading-relaxed">
                Add a new product with its picture, or restore the 7 original portfolio projects.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-md shadow-amber-400/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Product</span>
              </button>

              <button
                type="button"
                onClick={handleResetToSeed}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore 7 Seed Projects</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              let domain = '';
              if (project.url) {
                try {
                  domain = new URL(project.url).hostname;
                } catch {
                  domain = project.url;
                }
              }

              return (
                <div
                  key={project.id}
                  className="rounded-2xl bg-[#140e0b]/85 border border-white/[0.08] hover:border-sky-400/35 hover:bg-[#18110d] overflow-hidden flex flex-col justify-between shadow-xl card-hover-fx"
                >
                  {/* Thumbnail Preview */}
                  <div className="relative h-40 bg-[#0d0907] border-b border-white/[0.06] overflow-hidden">
                    {project.screenshot ? (
                      <img
                        src={project.screenshot}
                        alt={project.name}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-stone-500 bg-grid-pattern">
                        <ImageIcon className="w-6 h-6 text-stone-600" />
                        <span className="text-[11px] font-mono">
                          {project.url ? 'Auto Website Preview' : 'No Picture Uploaded'}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[11px] font-mono text-stone-200 border border-white/[0.1]">
                      #{index + 1}
                    </div>

                    {project.price && (
                      <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[11px] font-bold shadow">
                        <Tag className="w-3 h-3" />
                        <span>{project.price}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        {project.category && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-sky-300 bg-sky-500/10 border border-sky-400/20 truncate">
                            {project.category}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white tracking-tight truncate">
                          {project.name}
                        </h3>
                        {project.url ? (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300/90 hover:text-amber-200 transition-colors truncate max-w-full"
                            title={project.url}
                          >
                            <Globe className="w-3 h-3 shrink-0 text-amber-400" />
                            <span className="truncate">{domain}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                          </a>
                        ) : (
                          <p className="text-xs font-mono text-stone-500">Product Showcase</p>
                        )}
                      </div>

                      {project.description && (
                        <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}

                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.technologies.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded bg-black/40 border border-white/[0.06] text-[10px] font-mono text-stone-400"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Published</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(project)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
                          aria-label={`Edit ${project.name}`}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingProject(project)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-colors"
                          aria-label={`Delete ${project.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add / Edit Product or Project Dialog */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProject}
        editingProject={editingProject}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteProjectDialog
        isOpen={Boolean(deletingProject)}
        project={deletingProject}
        onCancel={() => setDeletingProject(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
