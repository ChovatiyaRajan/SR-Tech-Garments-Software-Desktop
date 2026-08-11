export type LotStatus = 
  | 'PURCHASED'
  | 'RAW_MATERIAL'
  | 'CUTTING_IN_PROGRESS'
  | 'CUT_PIECES_READY'
  | 'TAILOR_ASSIGNED'
  | 'STITCHING_IN_PROGRESS'
  | 'FINISHED_GOODS'
  | 'EMPLOYEE_ASSIGNED'
  | 'READY_FOR_INVOICE'
  | 'INVOICED'
  | 'PAID';

export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

export type SalaryStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE';

// Wholesaler Master
export interface Wholesaler {
  id: string;
  name: string;
  phone: string;
  address: string;
  gstNumber?: string;
  createdAt: string;
}

// Purchase Record
export interface Purchase {
  id: string;
  wholesalerId: string;
  wholesalerName: string;
  purchaseDate: string;
  challanNumber: string;
  lotNumber: string;
  materialName: string;
  unit: string; // meters, kg, etc.
  ratePerUnit: number;
  totalQuantity: number;
  purchaseAmount: number;
  notes?: string;
  createdAt: string;
}

// Raw Material Inventory Record
export interface RawMaterial {
  id: string;
  purchaseId: string;
  lotNumber: string;
  wholesalerId: string;
  wholesalerName: string;
  materialName: string;
  totalQuantity: number;
  damagedQuantity: number;
  usedQuantity: number; // for cutting
  availableQuantity: number;
  unit: string;
  status: 'IN_STOCK' | 'PARTIALLY_USED' | 'FULLY_USED';
  createdAt: string;
}

// Raw Material Damage Log
export interface RawMaterialDamage {
  id: string;
  rawMaterialId: string;
  lotNumber: string;
  damageQuantity: number;
  reason: string;
  damageDate: string;
  createdAt: string;
}

// Cutting Process
export interface Cutting {
  id: string;
  lotNumber: string;
  cuttingDate: string;
  materialUsedMeters: number;
  totalCutPiecesProduced: number;
  pieceType: string; // e.g., Shirt Fronts, Trousers, S-M-L Kurti
  wasteMeters: number;
  cuttingMasterName?: string;
  notes?: string;
  createdAt: string;
}

// Cut Pieces Inventory
export interface CuttingHandoverLog {
  id: string;
  date: string;
  addedQty: number;
  totalReadyAfter: number;
  masterName?: string;
  notes?: string;
}

export interface CutPieces {
  id: string;
  cuttingId: string;
  lotNumber: string;
  totalCutPieces: number;
  readyCutPieces?: number;
  assignedToTailorQty: number;
  remainingCutPieces: number;
  pieceType: string;
  cuttingMasterName?: string;
  cuttingStatus?: 'CUTTING_IN_PROGRESS' | 'CUTTING_COMPLETED';
  cuttingNotes?: string;
  handoverLogs?: CuttingHandoverLog[];
  status: 'CUTTING_IN_PROGRESS' | 'READY' | 'PARTIALLY_ASSIGNED' | 'FULLY_ASSIGNED';
  createdAt: string;
}

// Tailor Master
export interface Tailor {
  id: string;
  name: string;
  phone: string;
  specialization?: string;
  ratePerPiece: number;
  createdAt: string;
}

// Tailor Assignment
export interface TailorAssignment {
  id: string;
  tailorId: string;
  tailorName: string;
  lotNumber: string;
  assignedPiecesQty: number;
  completedPiecesQty?: number;
  ratePerPiece: number;
  assignmentDate: string;
  targetCompletionDate?: string;
  status: 'ASSIGNED' | 'IN_STITCHING' | 'COMPLETED';
  notes?: string;
  createdAt: string;
}

// Stitching Log
export interface Stitching {
  id: string;
  tailorAssignmentId: string;
  tailorId: string;
  tailorName: string;
  lotNumber: string;
  stitchedGoodPiecesQty: number;
  defectivePiecesQty: number;
  ratePerPiece: number;
  totalWageAmount: number;
  stitchingDate: string;
  notes?: string;
  createdAt: string;
}

// Finished Products Inventory
export interface FinishedProduct {
  id: string;
  lotNumber: string;
  productName: string;
  tailorName?: string;
  tailorId?: string;
  tailorAssignmentId?: string;
  totalStitchedQty: number;
  damagedQuantity: number;
  assignedToEmployeeQty: number;
  availableForAssignmentQty: number;
  unitPriceEstimate?: number;
  status: 'AVAILABLE' | 'PARTIALLY_ASSIGNED' | 'FULLY_ASSIGNED' | 'READY_FOR_INVOICE';
  createdAt: string;
}

// Finished Product Damage Log
export interface FinishedProductDamage {
  id: string;
  finishedProductId: string;
  lotNumber: string;
  damageQuantity: number;
  reason: string;
  damageDate: string;
  createdAt: string;
}

// Employee Master
export interface Employee {
  id: string;
  name: string;
  phone: string;
  designation: string;
  baseSalary: number;
  joiningDate: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  upiId?: string;
  createdAt: string;
}

// Employee Finished Product Assignment
export interface EmployeeAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  lotNumber: string;
  finishedProductId?: string;
  productName?: string;
  tailorName?: string;
  assignedFinishedQty: number;
  assignmentDate: string;
  notes?: string;
  createdAt: string;
}

// Final Invoice
export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  wholesalerId: string;
  wholesalerName: string;
  lotNumber: string;
  totalItemsQuantity: number;
  ratePerItem: number;
  subtotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  finalNetPayableAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
}

// Wholesaler Payment Record
export interface WholesalerPayment {
  id: string;
  invoiceId: string;
  wholesalerId: string;
  wholesalerName: string;
  paymentDate: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

// Employee Upaad / Salary Advance
export interface UpaadRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  reason: string;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  createdAt: string;
}

// Monthly Salary Record
export interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // YYYY-MM
  baseSalary: number;
  totalUpaadDeducted: number;
  netPayableSalary: number;
  paidAmount: number;
  remainingAmount: number;
  status: SalaryStatus;
  generatedDate: string;
  createdAt: string;
}

// Salary Payment Log
export interface SalaryPayment {
  id: string;
  salaryRecordId: string;
  employeeId: string;
  employeeName: string;
  paymentDate: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

// Overall Lot Lifecycle Summary
export interface LotLifecycle {
  lotNumber: string;
  status: LotStatus;
  purchase?: Purchase;
  rawMaterial?: RawMaterial;
  rawMaterialDamages: RawMaterialDamage[];
  cuttings: Cutting[];
  cutPieces?: CutPieces;
  tailorAssignments: TailorAssignment[];
  stitchings: Stitching[];
  finishedProduct?: FinishedProduct;
  finishedProducts?: FinishedProduct[];
  finishedProductDamages: FinishedProductDamage[];
  employeeAssignments: EmployeeAssignment[];
  invoice?: Invoice;
  wholesalerPayments: WholesalerPayment[];
  isAllGoodFinishedAccountedFor: boolean;
}
