# Teacher Portal (Refactored)

This folder contains a humane, modular redesign of the Teacher Portal. The previous single 2000+ line page was split into focused components, shared types, and utilities without changing functionality.

## File Map

- `page.tsx`
  - Route container that orchestrates data fetching, role checks, and renders the UI.
  - Keeps existing APIs, auth, and behavior unchanged.
- `components/`
  - `DashboardHeader.tsx` – header bar with class selector, user greeting, and logout.
  - `QuickStats.tsx` – summary KPIs for the selected class.
  - `StudentRoster.tsx` – grid of students with details modal.
  - `CommunicationCenter.tsx` – messages, announcements, and compose tabs.
  - `AttendanceManagement.tsx` – centralized attendance UI hooked to `useAttendance`.
- `hooks/`
  - `useAttendance.ts` – shared state and API calls for attendance (already existed; unchanged API).
- `services/`
  - `api.ts` – centralized teacher attendance API helpers (already existed; unchanged API).
- `types.ts` – shared interfaces for classes, students, enrollments, and user.
- `utils.ts` – small pure helpers, e.g., converting Firestore classes to UI shapes.

## How It Works

1. Authentication and Role Guard
   - `page.tsx` uses `useAuth()` to get the Firebase user and custom claims.
   - Only users with `role === 'teacher'` can access the portal. Others see an access message.

2. Loading Teacher Classes
   - Tries the Teachers API (`manageTeachersNew`) to read assigned classes.
   - Falls back to a direct Firestore read on `teachers/{uid}` if needed.
   - Fetches all classes from `manageClasses`, then filters to the teacher’s classes.

3. Loading Enrollments
   - Attempts multiple academic-year formats to find matching enrollments via `listEnrollments`.
   - If none found, retries by teacher UID, then finally by matching class names.
   - Converts classes + enrollments to `ClassInfo` using `utils.convertFirestoreClassToClassInfo`.

4. Attendance
   - `AttendanceManagement` uses `useAttendance` which calls the centralized endpoints under `services/api.ts` (via Next API routes and Cloud Functions).
   - Save/load logic remains the same; only the UI moved into its own component.

5. UI Composition
   - `page.tsx` renders: `DashboardHeader`, `QuickStats`, `StudentRoster`, `AttendanceManagement`, `CommunicationCenter`.
   - All components are presentational and read data via props.

## Extending

- Add new UI modules in `components/`.
- Add new pure helpers in `utils.ts`.
- Add new shared types in `types.ts`.
- Keep data-fetching in `page.tsx` (or future `services/` files) to avoid coupling UI with IO.

## Notes

- RTL/locale labels are preserved where they were in the original.
- The refactor avoided changing network calls and data shapes to minimize risk.
- Comments were added in each component and helper to explain responsibilities.
