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
 * Validates and sanitizes a raw object to ensure it conforms to Project structure.
 */
function sanitizeProject(item: unknown): Project | null {
  if (!item || typeof item !== 'object') return null;
  const p = item as Record<string, unknown>;

  if (typeof p.id !== 'string' || !p.id.trim()) return null;
  if (typeof p.name !== 'string' || !p.name.trim()) return null;

  const url = typeof p.url === 'string' ? p.url.trim() : '';

  return {
    id: p.id.trim(),
    name: p.name.trim(),
    url,
    description: typeof p.description === 'string' ? p.description : undefined,
    screenshot: typeof p.screenshot === 'string' ? p.screenshot : undefined,
    screenshotSource: ['automatic', 'uploaded', 'url', 'fallback'].includes(p.screenshotSource as string)
      ? (p.screenshotSource as ScreenshotSource)
      : 'automatic',
    category: typeof p.category === 'string' ? p.category : undefined,
    price: typeof p.price === 'string' ? p.price : undefined,
    technologies: Array.isArray(p.technologies)
      ? p.technologies.filter((t): t is string => typeof t === 'string' && Boolean(t.trim()))
      : undefined,
    isPublished: typeof p.isPublished === 'boolean' ? p.isPublished : true,
    ownerId: typeof p.ownerId === 'string' ? p.ownerId : undefined,
    createdAt: toIsoDate(p.createdAt),
    updatedAt: p.updatedAt ? toIsoDate(p.updatedAt) : undefined,
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

/**
 * Project repository service layer backed by Firebase Firestore with localStorage cache.
 */
export const projectService = {
  /**
   * Synchronous cache read for instant initial render.
   */
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

  /**
   * Retrieves a single project from local cache by its unique ID.
   */
  getProjectById(id: string): Project | null {
    if (!id) return null;
    const projects = this.getProjects();
    return projects.find((p) => p.id === id) || null;
  },

  /**
   * Updates localStorage cache.
   */
  saveProjects(projects: Project[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn('Unable to persist projects cache to localStorage:', e);
    }
  },

  /**
   * Real-time Firestore listener for published projects/products.
   */
  subscribeProjects(
    onUpdate: (projects: Project[]) => void,
    onError?: (err: Error) => void,
    includeUnpublished = false
  ): Unsubscribe {
    const colRef = collection(db, PROJECTS_COLLECTION);
    const q = includeUnpublished
      ? colRef
      : query(colRef, where('isPublished', '==', true));

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore collection is empty, keep showing seeded projects until admin writes
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
   * Fetches published projects from Firestore once.
   */
  async fetchProjectsFromCloud(): Promise<Project[]> {
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
   * Fetches a single project document from Firestore by ID.
   */
  async fetchProjectByIdFromCloud(id: string): Promise<Project | null> {
    if (!id) return null;
    const path = `${PROJECTS_COLLECTION}/${id}`;
    try {
      const snap = await getDoc(doc(db, PROJECTS_COLLECTION, id));
      if (snap.exists()) {
        return sanitizeProject({ id: snap.id, ...snap.data() });
      }
      return this.getProjectById(id);
    } catch (error) {
      // Fallback to local seed if offline or unavailable
      const cached = this.getProjectById(id);
      if (cached) return cached;
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  /**
   * Adds a new project or product locally and persists to Firestore.
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
   * Updates an existing project/product in Firestore and local cache.
   */
  async updateProjectInCloud(
    id: string,
    updates: Partial<Project>,
    ownerUid: string
  ): Promise<Project | null> {
    const current = this.getProjects();
    const existing = current.find((p) => p.id === id);

    const merged: Project = {
      id,
      name: (updates.name !== undefined ? updates.name.trim() : existing?.name) || 'Untitled Product',
      url: updates.url !== undefined ? normalizeUrl(updates.url) : existing?.url || '',
      description: updates.description !== undefined ? updates.description : existing?.description,
      screenshot: updates.screenshot !== undefined ? updates.screenshot : existing?.screenshot,
      screenshotSource: updates.screenshotSource ?? existing?.screenshotSource ?? 'automatic',
      category: updates.category !== undefined ? updates.category : existing?.category,
      price: updates.price !== undefined ? updates.price : existing?.price,
      technologies: updates.technologies !== undefined ? updates.technologies : existing?.technologies,
      isPublished: updates.isPublished ?? existing?.isPublished ?? true,
      ownerId: existing?.ownerId || ownerUid,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docPath = `${PROJECTS_COLLECTION}/${id}`;
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        // If it's one of the seed items not yet pushed to Firestore, create it cleanly
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
   * Deletes a project/product from Firestore and local cache.
   */
  async deleteProjectFromCloud(id: string): Promise<boolean> {
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
   * Seeds the 7 initial projects into Firestore (used on Reset to Seeds or initial cloud sync).
   */
  async seedProjectsToCloud(ownerUid: string): Promise<Project[]> {
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

  /**
   * Ensures cloud Firestore has the initial 7 projects if collection is empty when admin connects.
   */
  async ensureCloudSeeded(ownerUid: string): Promise<void> {
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
