# Product Requirements Document (PRD): Work OS Platform

## 1. Document Overview
*   **Project Name:** Work OS (Monday.com Clone)
*   **Version:** 1.0.0
*   **Status:** Draft / Technical Specification
*   **Author:** Antigravity AI
*   **Subject:** Full-stack migration and backend implementation strategy.

---

## 2. Product Vision
To build a highly flexible, collaborative work management platform that allows users to manage projects through customizable boards, track time, manage files, and automate recurring workflows in real-time.

---

## 3. Core Functional Modules

### 3.1 Workspace & Navigation (Organization)
*   **Multi-tenant Architecture:** Support for multiple workspaces (e.g., Main, AI Research, Marketing).
*   **Folder System:** Ability to group boards into folders within workspaces.
*   **Search Everything:** A global search engine capable of finding items, boards, and files across the entire application.
*   **Sidebar Favorites:** User-specific "Starring" functionality for quick access to frequent boards.

### 3.2 The Dynamic Board Engine (The Core)
*   **Board Structure:** Each board consists of Groups, which contain Items and Subitems.
*   **Dynamic Column System:** The backend must support diverse data types per column:
    *   **Status:** Multi-color labels with editable options.
    *   **Person:** Linked to real User IDs for notifications and assignment.
    *   **Date/Timeline:** Date selection and range tracking.
    *   **Numbers:** For tracking payments, deal values, or counts.
    *   **Progress:** Visual percentage trackers.
    *   **Time Tracking:** Real-time stopwatches per item.
*   **View Modes:**
    *   **Table View:** Spreadsheet-style grid.
    *   **Calendar View:** Date-basis visualization of items.
    *   **Dashboard View:** High-level widgets and statistics.

### 3.3 File Center (Resource Management)
*   **Global Repository:** A centralized list showing all files uploaded across all boards.
*   **Metadata Tracking:** Automatic extraction of file size, type (Image, PDF, Spreadsheet), and uploader.
*   **Preview System:** Direct viewing of images and document previews without downloading.

### 3.4 User & Role Management
*   **Role-Based Access Control (RBAC):**
    *   **Admin:** Full system control, user creation, global settings.
    *   **Manager:** Can create boards and manage teams.
    *   **User:** Can update items and participate in assigned tasks.
*   **User Profiles:** Avatars, phone numbers, addresses, and individual activity logs.

### 3.5 Forms Builder
*   **Canvas-based Design:** Drag-and-drop builder to create public forms.
*   **Board Integration:** Submitted forms automatically create new items in a specific board.

---

## 4. Technical Architecture (Proposed)

### 4.1 Technology Stack
*   **Frontend:** React (Existing), Lucide Icons, Framer Motion (Animations).
*   **Backend:** Node.js (Express) or Python (Django/FastAPI).
*   **Database:** PostgreSQL (Relational) with JSONB for dynamic item data.
*   **Real-time:** Socket.io for live board updates and notifications.
*   **Storage:** AWS S3 or MinIO for file uploads.

### 4.2 Data Flow Logic
1.  **Request:** UI requests a `boardId`.
2.  **Schema Fetch:** Backend fetches the `Board` definition and its `Columns`.
3.  **Data Fetch:** Backend fetches `Groups` and `Items` where the item data is mapped to column IDs.
4.  **Composition:** Backend joins this data and sends a "Composition Object" to the UI.
5.  **Synchronization:** When an item is updated, the backend broadcasts the change via WebSockets to all users viewing the same board.

### 4.3 Database Schema (High-Level)
*   **Users:** `id, name, email, password, role_id, profile_data`
*   **Boards:** `id, name, workspace_id, folder_id, columns_schema(JSONB)`
*   **Groups:** `id, board_id, title, color, position`
*   **Items:** `id, group_id, parent_item_id, values(JSONB), created_at`
*   **Files:** `id, entity_type(item/board), entity_id, file_path, meta_data`

---

## 5. UI Flow Analysis (Currently Implemented)
1.  **Login Flow:** Authenticated routes using `AuthContext`.
2.  **Navigation Flow:** Sidebar links → Route change in `App.jsx` → Page component render.
3.  **Board Context:** URL Search Params (e.g., `?item=123`) used to trigger the "Item Detail Panel".
4.  **File Upload Flow:** Native file picker → Blob URL generation (UI) → State update.

---

## 6. Roadmap for Backend Implementation
*   **Sprint 1:** Core Authentication (JWT) and User management.
*   **Sprint 2:** Workspace and Board CRUD operations.
*   **Sprint 3:** Dynamic Item management (JSONB handling for custom columns).
*   **Sprint 4:** File Upload service and Integration with File Center.
*   **Sprint 5:** Real-time board synchronization and Search indexing.

---

## 7. Success Metrics
*   **Zero-latency updates:** Board changes reflect in <200ms across clients.
*   **Data Integrity:** Dynamic columns maintain type safety (Numbers don't become text).
*   **Scalability:** Support for boards with 10k+ items without UI lag.
