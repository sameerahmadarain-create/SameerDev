import {
  getSupabaseConfigDiagnostics,
  isSupabaseConfigured,
  supabase,
  uploadImageToSupabaseStorage,
} from '../lib/supabase';
import { Project, ScreenshotSource } from '../types';
import { SEED_PROJECTS } from '../data/seedProjects';

const STORAGE_KEY = 'sameerdev_projects';
const PROJECTS_TABLE = 'projects';

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseConfigError';
  }
}

function assertSupabaseClient() {
  const diagnostics = getSupabaseConfigDiagnostics();
  if (!diagnostics.configured || !supabase) {
    throw new SupabaseConfigError(
      diagnostics.error ||
        'Supabase configuration is missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).'
    );
  }
  return supabase;
}

/**
 * Validates whether a string is a valid, secure HTTPS URL.
 */
export function isValidHttpsUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

/**
 * Normalizes an HTTPS URL.
 */
export function normalizeUrl(urlString: string): string {
  const trimmed = urlString.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    return parsed.href;
  } catch {
    return trimmed;
  }
}

/**
 * Derives a clean project name from a URL if none is provided.
 */
export function deriveProjectName(urlString: string): string {
  try {
    const parsed = new URL(urlString);
    const host = parsed.hostname.replace(/^www\./, '').split('.')[0];
    if (!host) return 'New Web Project';
    return host
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch {
    return 'New Web Project';
  }
}

function toIsoDate(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  return new Date().toISOString();
}

function sanitizeId(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 110);
  return cleaned || `item-${Date.now()}`;
}

function clampString(val: string | undefined, maxLen: number): string | undefined {
  if (typeof val !== 'string') return undefined;
  const trimmed = val.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLen);
}

function clampTechnologies(list: string[] | undefined): string[] | undefined {
  if (!Array.isArray(list)) return undefined;
  const cleaned = list
    .filter((t): t is string => typeof t === 'string' && Boolean(t.trim()))
    .map((t) => t.trim().slice(0, 50))
    .slice(0, 12);
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Validates and sanitizes a raw object (from Supabase or localStorage).
 */
function sanitizeProject(item: unknown): Project | null {
  if (!item || typeof item !== 'object') return null;
  const p = item as Record<string, unknown>;

  if (typeof p.id !== 'string' || !p.id.trim()) return null;
  if (typeof p.name !== 'string' || !p.name.trim()) return null;

  const url = typeof p.url === 'string' ? p.url.trim() : '';
  const rawSource = (p.screenshotSource ?? p.screenshot_source) as string | undefined;
  const rawPublished = p.isPublished ?? p.is_published;
  const rawOwner = (p.ownerId ?? p.owner_id) as string | undefined;
  const rawCreatedAt = p.createdAt ?? p.created_at;
  const rawUpdatedAt = p.updatedAt ?? p.updated_at;

  return {
    id: p.id.trim(),
    name: p.name.trim(),
    url,
    description: typeof p.description === 'string' ? p.description : undefined,
    screenshot: typeof p.screenshot === 'string' ? p.screenshot : undefined,
    screenshotSource:
      rawSource && ['automatic', 'uploaded', 'url', 'fallback'].includes(rawSource)
        ? (rawSource as ScreenshotSource)
        : 'automatic',
    category: typeof p.category === 'string' ? p.category : undefined,
    price: typeof p.price === 'string' ? p.price : undefined,
    technologies: Array.isArray(p.technologies)
      ? p.technologies.filter((t): t is string => typeof t === 'string' && Boolean(t.trim()))
      : undefined,
    isPublished: typeof rawPublished === 'boolean' ? rawPublished : true,
    ownerId: typeof rawOwner === 'string' ? rawOwner : undefined,
    createdAt: toIsoDate(rawCreatedAt),
    updatedAt: rawUpdatedAt ? toIsoDate(rawUpdatedAt) : undefined,
  };
}

function buildSupabaseRowPayload(project: Project): Record<string, unknown> {
  return {
    id: project.id,
    name: project.name.slice(0, 120),
    url: (project.url || '').slice(0, 500),
    description: clampString(project.description, 1000) ?? null,
    screenshot: project.screenshot ?? null,
    screenshot_source: project.screenshotSource ?? 'automatic',
    category: clampString(project.category, 80) ?? null,
    price: clampString(project.price, 40) ?? null,
    technologies: clampTechnologies(project.technologies) ?? [],
    is_published: project.isPublished ?? true,
  };
}

/**
 * Project repository service layer backed exclusively by Supabase (with local cache for initial render).
 * Never silently switches to an alternative database when Supabase environment variables are missing.
 */
export const projectService = {
  getProjects(): Project[] {
    if (typeof window === 'undefined') {
      return [...SEED_PROJECTS];
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveProjects(SEED_PROJECTS);
        return [...SEED_PROJECTS];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveProjects(SEED_PROJECTS);
        return [...SEED_PROJECTS];
      }

      const validated: Project[] = [];
      for (const item of parsed) {
        const sanitized = sanitizeProject(item);
        if (sanitized) validated.push(sanitized);
      }

      if (validated.length === 0) {
        this.saveProjects(SEED_PROJECTS);
        return [...SEED_PROJECTS];
      }

      return validated;
    } catch {
      this.saveProjects(SEED_PROJECTS);
      return [...SEED_PROJECTS];
    }
  },

  getProjectById(id: string): Project | null {
    if (!id) return null;
    const projects = this.getProjects();
    return projects.find((p) => p.id === id) || null;
  },

  saveProjects(projects: Project[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn('Unable to persist projects cache to localStorage:', e);
    }
  },

  /**
   * Subscribes to live project updates from Supabase.
   * Reports configuration diagnostics via onError if Supabase env vars are missing.
   */
  subscribeProjects(
    onUpdate: (projects: Project[]) => void,
    onError?: (err: Error) => void,
    includeUnpublished = false
  ): () => void {
    const diagnostics = getSupabaseConfigDiagnostics();
    if (!isSupabaseConfigured() || !supabase) {
      const err = new SupabaseConfigError(
        diagnostics.error ||
          'Supabase configuration is missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).'
      );
      console.warn('[SameerDev Supabase]', err.message);
      if (onError) onError(err);
      onUpdate(this.getProjects());
      return () => {};
    }

    const client = supabase;
    let active = true;

    const loadSupabase = async () => {
      try {
        const items = await this.fetchProjectsFromCloud(includeUnpublished);
        if (active) onUpdate(items);
      } catch (err) {
        if (active && onError && err instanceof Error) {
          onError(err);
        }
      }
    };

    void loadSupabase();

    const channel = client
      .channel(`projects-changes-${includeUnpublished ? 'all' : 'pub'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: PROJECTS_TABLE },
        () => {
          void loadSupabase();
        }
      )
      .subscribe();

    return () => {
      active = false;
      void client.removeChannel(channel);
    };
  },

  /**
   * Fetches projects once from Supabase.
   */
  async fetchProjectsFromCloud(includeUnpublished = false): Promise<Project[]> {
    const client = assertSupabaseClient();

    let queryBuilder = client
      .from(PROJECTS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      queryBuilder = queryBuilder.eq('is_published', true);
    }

    const { data, error } = await queryBuilder;
    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return [];
    }

    const items = data
      .map((row) => sanitizeProject(row))
      .filter((p): p is Project => Boolean(p));

    if (items.length > 0) {
      this.saveProjects(items);
    }
    return items;
  },

  /**
   * Fetches a single project row from Supabase by ID.
   */
  async fetchProjectByIdFromCloud(id: string): Promise<Project | null> {
    if (!id) return null;

    if (!isSupabaseConfigured() || !supabase) {
      return this.getProjectById(id);
    }

    const { data, error } = await supabase
      .from(PROJECTS_TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.warn('Unable to fetch project from Supabase:', error.message);
      return this.getProjectById(id);
    }

    if (data) {
      return sanitizeProject(data);
    }
    return this.getProjectById(id);
  },

  /**
   * Adds a new project/product directly to Supabase.
   */
  async addProjectToCloud(data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const client = assertSupabaseClient();

    const normalizedUrl = normalizeUrl(data.url || '');
    const rawName = data.name?.trim();
    const finalName = rawName || (normalizedUrl ? deriveProjectName(normalizedUrl) : 'New Product');
    const slug = sanitizeId(finalName);
    const id = `${slug}-${Date.now().toString().slice(-4)}`.slice(0, 128);

    let finalScreenshot = data.screenshot;
    let finalScreenshotSource = data.screenshotSource;

    if (finalScreenshot?.startsWith('data:image/')) {
      const uploadedUrl = await uploadImageToSupabaseStorage(finalScreenshot, id);
      if (uploadedUrl) {
        finalScreenshot = uploadedUrl;
        finalScreenshotSource = 'url';
      }
    }

    const newProject: Project = {
      ...data,
      id,
      name: finalName.slice(0, 120),
      url: normalizedUrl.slice(0, 500),
      screenshot: finalScreenshot,
      screenshotSource: finalScreenshotSource,
      isPublished: data.isPublished ?? true,
      createdAt: new Date().toISOString(),
    };

    const { error } = await client
      .from(PROJECTS_TABLE)
      .insert(buildSupabaseRowPayload(newProject));

    if (error) {
      throw new Error(error.message);
    }

    const current = this.getProjects();
    this.saveProjects([newProject, ...current.filter((p) => p.id !== id)]);
    return newProject;
  },

  /**
   * Updates an existing project/product in Supabase.
   */
  async updateProjectInCloud(
    id: string,
    updates: Partial<Project>
  ): Promise<Project | null> {
    const client = assertSupabaseClient();

    const current = this.getProjects();
    const existing = current.find((p) => p.id === id);

    let nextScreenshot =
      updates.screenshot !== undefined ? updates.screenshot : existing?.screenshot;
    let nextScreenshotSource =
      updates.screenshotSource ?? existing?.screenshotSource ?? 'automatic';

    if (nextScreenshot?.startsWith('data:image/')) {
      const uploadedUrl = await uploadImageToSupabaseStorage(nextScreenshot, id);
      if (uploadedUrl) {
        nextScreenshot = uploadedUrl;
        nextScreenshotSource = 'url';
      }
    }

    const merged: Project = {
      id,
      name: (updates.name !== undefined ? updates.name.trim() : existing?.name) || 'Untitled Product',
      url: updates.url !== undefined ? normalizeUrl(updates.url) : existing?.url || '',
      description: updates.description !== undefined ? updates.description : existing?.description,
      screenshot: nextScreenshot,
      screenshotSource: nextScreenshotSource,
      category: updates.category !== undefined ? updates.category : existing?.category,
      price: updates.price !== undefined ? updates.price : existing?.price,
      technologies: updates.technologies !== undefined ? updates.technologies : existing?.technologies,
      isPublished: updates.isPublished ?? existing?.isPublished ?? true,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { error } = await client
      .from(PROJECTS_TABLE)
      .upsert(buildSupabaseRowPayload(merged), { onConflict: 'id' });

    if (error) {
      throw new Error(error.message);
    }

    const next = existing
      ? current.map((p) => (p.id === id ? merged : p))
      : [merged, ...current];
    this.saveProjects(next);
    return merged;
  },

  /**
   * Deletes a project/product from Supabase.
   */
  async deleteProjectFromCloud(id: string): Promise<boolean> {
    const client = assertSupabaseClient();

    const { error } = await client.from(PROJECTS_TABLE).delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }

    const current = this.getProjects();
    this.saveProjects(current.filter((p) => p.id !== id));
    return true;
  },

  /**
   * Upserts the 7 initial projects into Supabase.
   */
  async seedProjectsToCloud(): Promise<Project[]> {
    const client = assertSupabaseClient();

    const rows = SEED_PROJECTS.map((item) =>
      buildSupabaseRowPayload({ ...item, isPublished: true })
    );
    const { error } = await client
      .from(PROJECTS_TABLE)
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      throw new Error(error.message);
    }

    this.saveProjects(SEED_PROJECTS);
    return [...SEED_PROJECTS];
  },
};
