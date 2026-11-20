import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  isSupabaseConfigured,
  supabase,
  uploadImageToSupabaseStorage,
} from '../lib/supabase';
import { Project, ScreenshotSource } from '../types';
import { SEED_PROJECTS } from '../data/seedProjects';

const STORAGE_KEY = 'sameerdev_projects';
const PROJECTS_COLLECTION = 'projects';

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
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
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
 * Validates and sanitizes a raw object (from Firestore, Supabase, or localStorage).
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

function buildFirestoreWritePayload(
  project: Project,
  ownerUid: string,
  isCreate: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: project.id,
    name: project.name.slice(0, 120),
    url: (project.url || '').slice(0, 500),
    isPublished: project.isPublished ?? true,
    ownerId: ownerUid.slice(0, 128),
  };

  if (isCreate) {
    payload.createdAt = serverTimestamp();
  }
  payload.updatedAt = serverTimestamp();

  const desc = clampString(project.description, 1000);
  if (desc) payload.description = desc;

  const shot = clampString(project.screenshot, 700000);
  if (shot) payload.screenshot = shot;

  if (project.screenshotSource) {
    payload.screenshotSource = project.screenshotSource;
  }

  const cat = clampString(project.category, 80);
  if (cat) payload.category = cat;

  const price = clampString(project.price, 40);
  if (price) payload.price = price;

  const techs = clampTechnologies(project.technologies);
  if (techs) payload.technologies = techs;

  return payload;
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
 * Project repository service layer.
 * Uses Supabase when VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY are configured,
 * otherwise uses Firebase Firestore with localStorage cache fallback.
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
   * Subscribes to real-time updates from Supabase (if configured) or Firestore.
   */
  subscribeProjects(
    onUpdate: (projects: Project[]) => void,
    onError?: (err: Error) => void,
    includeUnpublished = false
  ): Unsubscribe {
    if (isSupabaseConfigured() && supabase) {
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
          { event: '*', schema: 'public', table: PROJECTS_COLLECTION },
          () => {
            void loadSupabase();
          }
        )
        .subscribe();

      return () => {
        active = false;
        void client.removeChannel(channel);
      };
    }

    const colRef = collection(db, PROJECTS_COLLECTION);
    const q = includeUnpublished
      ? colRef
      : query(colRef, where('isPublished', '==', true));

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(this.getProjects());
          return;
        }
        const items: Project[] = [];
        snapshot.forEach((docSnap) => {
          const sanitized = sanitizeProject({ id: docSnap.id, ...docSnap.data() });
          if (sanitized) items.push(sanitized);
        });
        items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        this.saveProjects(items);
        onUpdate(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, PROJECTS_COLLECTION);
        } catch (wrapped) {
          if (onError && wrapped instanceof Error) {
            onError(wrapped);
          }
        }
      }
    );
  },

  /**
   * Fetches projects once from Supabase (if configured) or Firestore.
   */
  async fetchProjectsFromCloud(includeUnpublished = false): Promise<Project[]> {
    if (isSupabaseConfigured() && supabase) {
      let queryBuilder = supabase
        .from(PROJECTS_COLLECTION)
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
        return this.getProjects();
      }

      const items = data
        .map((row) => sanitizeProject(row))
        .filter((p): p is Project => Boolean(p));

      if (items.length > 0) {
        this.saveProjects(items);
      }
      return items.length > 0 ? items : this.getProjects();
    }

    try {
      const q = query(
        collection(db, PROJECTS_COLLECTION),
        where('isPublished', '==', true)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return this.getProjects();
      }
      const items: Project[] = [];
      snapshot.forEach((docSnap) => {
        const sanitized = sanitizeProject({ id: docSnap.id, ...docSnap.data() });
        if (sanitized) items.push(sanitized);
      });
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      this.saveProjects(items);
      return items;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, PROJECTS_COLLECTION);
    }
  },

  /**
   * Fetches a single project document by ID from Supabase or Firestore.
   */
  async fetchProjectByIdFromCloud(id: string): Promise<Project | null> {
    if (!id) return null;

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from(PROJECTS_COLLECTION)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return sanitizeProject(data);
      }
      return this.getProjectById(id);
    }

    const path = `${PROJECTS_COLLECTION}/${id}`;
    try {
      const snap = await getDoc(doc(db, PROJECTS_COLLECTION, id));
      if (snap.exists()) {
        return sanitizeProject({ id: snap.id, ...snap.data() });
      }
      return this.getProjectById(id);
    } catch (error) {
      const cached = this.getProjectById(id);
      if (cached) return cached;
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  /**
   * Adds a new project/product to Supabase (if configured) or Firestore.
   */
  async addProjectToCloud(
    data: Omit<Project, 'id' | 'createdAt'>,
    ownerUid: string
  ): Promise<Project> {
    const normalizedUrl = normalizeUrl(data.url || '');
    const rawName = data.name?.trim();
    const finalName = rawName || (normalizedUrl ? deriveProjectName(normalizedUrl) : 'New Product');
    const slug = sanitizeId(finalName);
    const id = `${slug}-${Date.now().toString().slice(-4)}`.slice(0, 128);

    let finalScreenshot = data.screenshot;
    let finalScreenshotSource = data.screenshotSource;

    if (isSupabaseConfigured() && supabase) {
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
        ownerId: ownerUid,
        createdAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from(PROJECTS_COLLECTION)
        .insert(buildSupabaseRowPayload(newProject));

      if (error) {
        throw new Error(error.message);
      }

      const current = this.getProjects();
      this.saveProjects([newProject, ...current.filter((p) => p.id !== id)]);
      return newProject;
    }

    const newProject: Project = {
      ...data,
      id,
      name: finalName.slice(0, 120),
      url: normalizedUrl.slice(0, 500),
      isPublished: data.isPublished ?? true,
      ownerId: ownerUid,
      createdAt: new Date().toISOString(),
    };

    const docPath = `${PROJECTS_COLLECTION}/${id}`;
    try {
      const payload = buildFirestoreWritePayload(newProject, ownerUid, true);
      await setDoc(doc(db, PROJECTS_COLLECTION, id), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }

    const current = this.getProjects();
    this.saveProjects([newProject, ...current.filter((p) => p.id !== id)]);
    return newProject;
  },

  /**
   * Updates an existing project/product in Supabase or Firestore.
   */
  async updateProjectInCloud(
    id: string,
    updates: Partial<Project>,
    ownerUid: string
  ): Promise<Project | null> {
    const current = this.getProjects();
    const existing = current.find((p) => p.id === id);

    let nextScreenshot =
      updates.screenshot !== undefined ? updates.screenshot : existing?.screenshot;
    let nextScreenshotSource =
      updates.screenshotSource ?? existing?.screenshotSource ?? 'automatic';

    if (isSupabaseConfigured() && supabase && nextScreenshot?.startsWith('data:image/')) {
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
      ownerId: existing?.ownerId || ownerUid,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from(PROJECTS_COLLECTION)
        .upsert(buildSupabaseRowPayload(merged), { onConflict: 'id' });

      if (error) {
        throw new Error(error.message);
      }

      const next = existing
        ? current.map((p) => (p.id === id ? merged : p))
        : [merged, ...current];
      this.saveProjects(next);
      return merged;
    }

    const docPath = `${PROJECTS_COLLECTION}/${id}`;
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        const createPayload = buildFirestoreWritePayload(merged, ownerUid, true);
        await setDoc(docRef, createPayload);
      } else {
        const existingData = snap.data() || {};
        const updatePayload: Record<string, unknown> = {
          name: merged.name.slice(0, 120),
          url: (merged.url || '').slice(0, 500),
          isPublished: merged.isPublished ?? true,
          updatedAt: serverTimestamp(),
        };
        const desc = clampString(merged.description, 1000);
        if (desc) updatePayload.description = desc;
        else if ('description' in existingData) updatePayload.description = deleteField();

        const shot = clampString(merged.screenshot, 700000);
        if (shot) updatePayload.screenshot = shot;
        else if ('screenshot' in existingData) updatePayload.screenshot = deleteField();

        if (merged.screenshotSource) updatePayload.screenshotSource = merged.screenshotSource;

        const cat = clampString(merged.category, 80);
        if (cat) updatePayload.category = cat;
        else if ('category' in existingData) updatePayload.category = deleteField();

        const price = clampString(merged.price, 40);
        if (price) updatePayload.price = price;
        else if ('price' in existingData) updatePayload.price = deleteField();

        const techs = clampTechnologies(merged.technologies);
        if (techs && techs.length > 0) updatePayload.technologies = techs;
        else if ('technologies' in existingData) updatePayload.technologies = deleteField();

        await updateDoc(docRef, updatePayload);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }

    const next = existing
      ? current.map((p) => (p.id === id ? merged : p))
      : [merged, ...current];
    this.saveProjects(next);
    return merged;
  },

  /**
   * Deletes a project/product from Supabase or Firestore.
   */
  async deleteProjectFromCloud(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from(PROJECTS_COLLECTION).delete().eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
      const current = this.getProjects();
      this.saveProjects(current.filter((p) => p.id !== id));
      return true;
    }

    const docPath = `${PROJECTS_COLLECTION}/${id}`;
    try {
      await deleteDoc(doc(db, PROJECTS_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }

    const current = this.getProjects();
    const filtered = current.filter((p) => p.id !== id);
    this.saveProjects(filtered);
    return true;
  },

  /**
   * Seeds the 7 initial projects into Supabase or Firestore.
   */
  async seedProjectsToCloud(ownerUid: string): Promise<Project[]> {
    if (isSupabaseConfigured() && supabase) {
      const rows = SEED_PROJECTS.map((item) =>
        buildSupabaseRowPayload({ ...item, isPublished: true, ownerId: ownerUid })
      );
      const { error } = await supabase
        .from(PROJECTS_COLLECTION)
        .upsert(rows, { onConflict: 'id' });

      if (error) {
        throw new Error(error.message);
      }

      this.saveProjects(SEED_PROJECTS);
      return [...SEED_PROJECTS];
    }

    try {
      const batch = writeBatch(db);
      for (const item of SEED_PROJECTS) {
        const docRef = doc(db, PROJECTS_COLLECTION, item.id);
        const payload = buildFirestoreWritePayload(
          { ...item, isPublished: true, ownerId: ownerUid },
          ownerUid,
          true
        );
        batch.set(docRef, payload);
      }
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, PROJECTS_COLLECTION);
    }

    this.saveProjects(SEED_PROJECTS);
    return [...SEED_PROJECTS];
  },

  async ensureCloudSeeded(ownerUid: string): Promise<void> {
    if (isSupabaseConfigured()) return;

    try {
      const snap = await getDocs(collection(db, PROJECTS_COLLECTION));
      if (snap.empty) {
        await this.seedProjectsToCloud(ownerUid);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, PROJECTS_COLLECTION);
    }
  },
};
