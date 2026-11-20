# Firestore Security Specification — SameerDev

## 1. Data Invariants
1. **Projects & Products Catalog (`/projects/{projectId}`)**:
   - Every project/product document must have a valid slug ID (`^[a-zA-Z0-9_-]+$`, max 128 chars), non-empty `name` (1–120 chars), `url` (0–500 chars), boolean `isPublished`, valid `ownerId` matching `request.auth.uid`, and server-assigned `createdAt` (`request.time`).
   - Public visitors may only `get` or `list` documents where `isPublished == true`.
   - Only verified administrators (`isAdmin()`) may `create`, `update`, or `delete` project/product documents, and immutable fields (`id`, `ownerId`, `createdAt`) cannot be altered after creation.
   - Uploaded or linked images (`screenshot`) are capped at `700000` characters to stay safely below Firestore's 1 MiB document ceiling.
   - `technologies` arrays are strictly bounded to at most 12 string tags.

2. **Admin Registry (`/admins/{adminId}`)**:
   - Stores verified administrator UIDs and emails (`role == 'admin'`).
   - Readable only by the owner (`request.auth.uid == adminId`) or an existing verified administrator.
   - Writable only by an existing verified administrator (`isAdmin()`), preventing self-escalation.

## 2. The "Dirty Dozen" Adversarial Payloads (Expected: `PERMISSION_DENIED`)
1. Unauthenticated `create` on `/projects/hacked-item`.
2. Authenticated non-admin user attempting `create` on `/projects/unauthorized-item`.
3. Admin `create` with spoofed `ownerId` not equal to `request.auth.uid`.
4. Admin `create` with unverified email (`request.auth.token.email_verified == false`).
5. Admin `create` with an injected ghost field (`{ ..., isFeaturedHack: true }`) blocked by `hasOnly(...)`.
6. Admin `create` with oversized `id` (> 128 chars) or invalid characters (`../etc/passwd`).
7. Admin `create` with client-forged `createdAt` timestamp not equal to `request.time`.
8. Admin `create` with oversized `technologies` array (> 12 items) or non-string first item.
9. Admin `update` attempting to mutate immutable `ownerId` or `createdAt`.
10. Admin `update` passing invalid `screenshotSource` enum value (`"hacked"`).
11. Public `list` query attempting to read unpublished drafts (`isPublished == false`) without admin privileges.
12. Non-admin `create` on `/admins/{uid}` attempting privilege escalation (`role: "admin"`).
