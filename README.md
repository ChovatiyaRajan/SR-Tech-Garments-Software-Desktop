# SR Tech Garment Software

A comprehensive, desktop-ready **SR Tech Garment Operations Software Suite** built with React 18, TypeScript, and Tailwind CSS. Designed specifically for garment manufacturers, textile factories, cutting masters, tailors, and wholesalers to manage the entire lifecycle of garment production—from raw fabric purchase to final wholesaler invoicing and salary management.

---

## 🛠️ Tech Stack & System Architecture

- **Frontend Framework**: React 18 with TypeScript
- **Styling & UI**: Tailwind CSS, Lucide React Icons
- **State & Data Persistence**: Reactive `localStorage` Storage Engine (`src/services/storage.ts`) with automatic seed data
- **Authentication**: Custom Auth Service (`src/services/auth.ts`) with session persistence & route guards
- **Routing**: Single Page Application (SPA) hash-based router with strict route guards (`#login`, `#dashboard`, `#all_lots`, etc.)
- **Export & Printing**: Custom Print Helper Utility (`src/utils/printHelper.ts`) for generating GST-compliant invoices and pay slips

---

## 🔒 Authentication & Route Security

The software features strict, web-standard route protection to prevent unauthorized access and maintain security across sessions.

### Route Guarding Logic (`src/App.tsx` & `src/services/auth.ts`)

1. **Unauthenticated Users**:
   - Any attempt to access protected pages (e.g., `#dashboard`, `#invoices`, `#reports`) via URL modification or direct link will automatically redirect the user to `#login`.
   - Access token and user payload are securely verified from `localStorage`.

2. **Authenticated Users**:
   - If a user is already logged in and attempts to navigate to `#login`, the system automatically redirects them to `#dashboard`.
   - The user session persists across browser reloads until explicit logout.

3. **Session Management**:
   - **Login**: Validates username/email and password (min length 6 characters).
   - **Logout**: Clears auth tokens from `localStorage`, resets session state, and redirects safely to `#login`.

---

## 🔄 Core Textile Manufacturing Workflow (Lot Lifecycle)

The software is modeled around the real-world **Lot Lifecycle** in garment manufacturing:

```
[ Wholesaler Purchase ] ➔ [ Raw Material Stock ] ➔ [ Cutting Operations ]
                                                            │
[ Final Wholesaler Invoice ]  [ Finished Goods ]  [ Tailor Stitching ]
             │
[ Wholesaler Payment Ledger ]
```

---

### Module-by-Module Breakdown

#### 1. 🔐 Login View (`#login`)
- **Purpose**: Secure entry point for factory staff, plant managers, and accounts heads.
- **Features**:
  - Email/Username & Password fields with show/hide password toggle.
  - "Remember login on this browser" toggle.
  - Form validation with clear error messaging.
  - Automatic redirection to Dashboard upon authentication.

---

#### 2. 📊 Dashboard (`#dashboard`)
- **Purpose**: Command center providing real-time operational visibility into factory metrics.
- **KPI Cards**:
  - **Active Production Lots**: Total lots currently moving through cutting or stitching.
  - **Raw Fabric Stock**: Available fabric in meters.
  - **Finished Garments Ready**: Stitched garments waiting in warehouse.
  - **Monthly Sales Revenue**: Total invoiced revenue.
  - **Wholesaler Receivables**: Total outstanding payments due from wholesalers.
  - **Tailor Dues**: Pending payments owed to stitching tailors.
- **Quick Actions & Recent Activity**: Shortcuts to launch purchases, issue cut pieces, or create invoices.

---

#### 3. 🏢 Wholesalers Management (`#wholesalers`)
- **Purpose**: Directory of fabric suppliers and wholesale buyers.
- **Key Data**: Firm name, contact person, phone number, GSTIN, address, and opening balance.
- **Features**:
  - Add/Edit wholesaler records.
  - View individual wholesaler transaction ledgers and associated purchase lots.

---

#### 4. 🛒 Fabric Purchases (`#purchases`)
- **Purpose**: Record incoming raw fabric lots purchased from wholesalers.
- **Workflow**:
  1. Click **New Fabric Purchase**.
  2. Select **Wholesaler**, enter **Material Name** (e.g., Cotton Denim, Rayon 140G), **Lot Number** (e.g., `LOT-2026-001`), **Meters Purchased**, and **Rate per Meter**.
  3. System auto-calculates total fabric cost.
  4. Upon saving, the lot is automatically registered and added to **Raw Material Warehouse**.

---

#### 5. 🧵 Raw Material Warehouse (`#raw_materials`)
- **Purpose**: Track raw fabric stock levels per lot before cutting.
- **Features**:
  - Monitor available meters vs. issued meters per lot.
  - Dispatch raw fabric lot directly to **Cutting Master**.

---

#### 6. ✂️ Cutting Operations (`#cutting`)
- **Purpose**: Master Cutter unit for fabric lay planning and cutting.
- **Workflow**:
  1. Receive raw fabric lot.
  2. Input **Fabric Used (Meters)**, **Wastage (Meters)**, **Product Name** (e.g., Slim Fit Shirt, Cargo Pants), and **Total Cut Pieces Output**.
  3. System records fabric consumption efficiency and moves cut bundles into **Cut Pieces Inventory**.

---

#### 7. 🧩 Cut Pieces Inventory (`#cut_pieces`)
- **Purpose**: Intermediate storage for ready-to-stitch cut garment bundles.
- **Features**:
  - View total available cut pieces ready for allocation to tailors.
  - Dispatch cut pieces directly to **Tailor Stitching**.

---

#### 8. 🪡 Tailors Management (`#tailors`)
- **Purpose**: Roster of internal and contract stitching tailors.
- **Key Data**: Tailor name, phone, specialization (Shirts, Trousers, Jackets), default per-piece stitching rate, and pending payment balance.
- **Features**: Add new tailors, track historical piece-rate payouts and active assigned jobs.

---

#### 9. 🪡 Stitching & Tailor Allocation (`#stitching`)
- **Purpose**: Issue cut pieces to tailors and receive finished garments.
- **Workflow**:
  1. **Issue Job**: Select Lot Number, Tailor, Quantity of Cut Pieces, and Per-Piece Rate (₹/pc).
  2. **Receive Stitched Goods**: Record completed stitched quantity and damaged pieces.
  3. System updates tailor piece-rate earnings and transfers finished garments to **Finished Products Warehouse**.

---

#### 10. 📦 Finished Products Warehouse (`#finished_products`)
- **Purpose**: Quality check and stock management of completed garments.
- **Strict Quality & Invoicing Rule**:
  - Tracks total stitched pieces, damaged pieces, available pieces, and assigned pieces.
  - A lot is marked **100% READY** for invoicing when all finished items in the lot are fully accounted for (`availableForAssignmentQty === 0`).
  - Provides a direct **Generate Final Invoice** shortcut once 100% ready.

---

#### 11. 🧾 Final Invoices & Billing (`#invoices`)
- **Purpose**: Create and manage GST-compliant tax invoices for wholesalers.
- **Features**:
  - Select 100% completed lots for invoicing.
  - Auto-fills total stitched quantity and suggests wholesale selling price.
  - Displays Total Invoice Amount, Amount Paid, and Outstanding Due Balance.
  - **Action Controls**:
    - **Record Payment**: Modal to enter partial or full payments with bank/cash/UPI reference.
    - **Print / Download PDF**: Generates formatted printable GST invoice with itemized tax breakdown and authorized signature line.

---

#### 12. 💳 Wholesaler Payments & Ledger (`#wholesaler_payments`)
- **Purpose**: Finance module for recording incoming payments and advances from wholesalers.
- **Features**:
  - Record bank transfer, cash, or cheque payments against specific invoices or wholesaler accounts.
  - Automatically updates invoice payment status (`UNPAID`, `PARTIAL`, `PAID`) and recalculates wholesaler balance.

---

#### 13. 👥 Employees Management (`#employees`)
- **Purpose**: Human resources module for factory staff, cutter masters, and administrative personnel.
- **Features**:
  - Employee profile, joining date, role, base monthly salary, and bank details.
  - Record salary advances and deductions.

---

#### 14. 💰 Salary & Payroll (`#salary`)
- **Purpose**: Process monthly payroll for staff and piece-rate payouts for tailors.
- **Features**:
  - Calculate gross earnings, advance deductions, and net payable salary.
  - Generate and print formal Employee Salary Pay Slips.

---

#### 15. 🔍 Lot Detail Audit View (`#lot_detail`)
- **Purpose**: 360-degree comprehensive audit trail for any selected Lot Number.
- **Includes**:
  - Initial Fabric Purchase details & cost.
  - Cutting Master metrics (Meters used vs wastage).
  - Complete Tailor Allocation history (Tailor names, issued qty, stitched qty, damaged qty, stitching cost).
  - Finished Goods summary & Final Invoice status.
  - Overall Lot Profitability breakdown.

---

#### 16. 📋 All Production Lots (`#all_lots`)
- **Purpose**: Unified searchable and filterable master list of every production lot in the system with status badges (Purchased, Cutting, Stitching, Completed, Invoiced).

---

#### 17. 📈 Reports & Analytics (`#reports`)
- **Purpose**: Factory-wide financial and operational reporting.
- **Reports**:
  - Fabric Usage & Wastage Report
  - Tailor Productivity & Costing Report
  - Wholesaler Statement of Account
  - Profit & Loss Statement per Production Lot

---

## 🛠️ Data Storage Structure (`src/services/storage.ts`)

All application data is maintained reactively in local storage using structured keys:

| Storage Key | Entity Description |
| :--- | :--- |
| `textile_erp_wholesalers` | List of wholesalers and suppliers |
| `textile_erp_purchases` | Raw fabric purchase records |
| `textile_erp_raw_materials` | Warehouse fabric stock states |
| `textile_erp_cuttings` | Master cutter logs and wastage records |
| `textile_erp_cut_pieces` | Cut piece bundle inventory |
| `textile_erp_tailors` | Roster of stitching tailors |
| `textile_erp_stitchings` | Active and completed tailor stitching jobs |
| `textile_erp_finished_products` | Finished goods warehouse inventory |
| `textile_erp_employees` | Factory staff and employee profiles |
| `textile_erp_salaries` | Processed monthly salary slips |
| `textile_erp_invoices` | Generated wholesaler sales invoices |
| `textile_erp_wholesaler_payments` | Wholesaler payment receipts and transactions |

---

## 🚀 Getting Started Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

---

*© 2026 SR Tech Garment Software. Built for Precision Manufacturing & Operations.*
