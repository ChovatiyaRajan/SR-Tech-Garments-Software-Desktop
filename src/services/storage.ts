import {
  Wholesaler,
  Purchase,
  RawMaterial,
  RawMaterialDamage,
  Cutting,
  CutPieces,
  Tailor,
  TailorAssignment,
  Stitching,
  FinishedProduct,
  FinishedProductDamage,
  Employee,
  EmployeeAssignment,
  Invoice,
  WholesalerPayment,
  UpaadRecord,
  SalaryRecord,
  SalaryPayment,
  LotStatus,
  LotLifecycle
} from '../types/erp';

// Storage Keys
export const STORAGE_KEYS = {
  WHOLESALERS: 'erp_wholesalers',
  PURCHASES: 'erp_purchases',
  RAW_MATERIALS: 'erp_raw_materials',
  RAW_MATERIAL_DAMAGES: 'erp_raw_material_damages',
  CUTTINGS: 'erp_cuttings',
  CUT_PIECES: 'erp_cut_pieces',
  TAILORS: 'erp_tailors',
  TAILOR_ASSIGNMENTS: 'erp_tailor_assignments',
  STITCHINGS: 'erp_stitchings',
  FINISHED_PRODUCTS: 'erp_finished_products',
  FINISHED_PRODUCT_DAMAGES: 'erp_finished_product_damages',
  EMPLOYEES: 'erp_employees',
  EMPLOYEE_ASSIGNMENTS: 'erp_employee_assignments',
  INVOICES: 'erp_invoices',
  WHOLESALER_PAYMENTS: 'erp_wholesaler_payments',
  UPAAD_RECORDS: 'erp_upaad_records',
  SALARY_RECORDS: 'erp_salary_records',
  SALARY_PAYMENTS: 'erp_salary_payments'
};

// Generic getItem / setItem
function getStorage<T>(key: string, defaultValue: T[]): T[] {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
}

function setStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage`, error);
  }
}

// Pre-populate with realistic ERP seed data if completely empty
export function initializeSeedDataIfEmpty(): void {
  const existingWholesalers = getStorage<Wholesaler>(STORAGE_KEYS.WHOLESALERS, []);
  if (existingWholesalers.length > 0) {
    return; // Already initialized
  }

  const wholesalers: Wholesaler[] = [
    {
      id: 'ws_101',
      name: 'Vardhman Textiles & Fabrics',
      phone: '+91 98250 11223',
      address: 'Ring Road Fabric Market, Surat, Gujarat',
      gstNumber: '24AAAAA0000A1Z5',
      createdAt: '2026-08-01T09:00:00Z'
    },
    {
      id: 'ws_102',
      name: 'Reliance Cotton Mills',
      phone: '+91 98980 44556',
      address: 'Textile Tower, Ahmedabad, Gujarat',
      gstNumber: '24BBBBB1111B1Z2',
      createdAt: '2026-08-02T10:30:00Z'
    }
  ];

  const tailors: Tailor[] = [
    {
      id: 'tailor_1',
      name: 'Ramesh Tailors',
      phone: '+91 97123 45678',
      specialization: 'Gents Shirts & Kurtis',
      ratePerPiece: 45,
      createdAt: '2026-08-01T10:00:00Z'
    },
    {
      id: 'tailor_2',
      name: 'Suresh Master Works',
      phone: '+91 98234 56789',
      specialization: 'Designer Trousers & Suits',
      ratePerPiece: 60,
      createdAt: '2026-08-01T11:00:00Z'
    }
  ];

  const employees: Employee[] = [
    {
      id: 'emp_1',
      name: 'Rajesh Sharma',
      phone: '+91 98111 22233',
      designation: 'Sales & Dispatch Manager',
      baseSalary: 25000,
      joiningDate: '2025-01-15',
      bankName: 'State Bank of India',
      accountNumber: '30123456789',
      ifscCode: 'SBIN0001020',
      accountHolderName: 'Rajesh Sharma',
      upiId: 'rajesh98111@sbi',
      createdAt: '2026-08-01T08:00:00Z'
    },
    {
      id: 'emp_2',
      name: 'Priya Patel',
      phone: '+91 98222 33344',
      designation: 'Quality Check & Packing Inspector',
      baseSalary: 20000,
      joiningDate: '2025-03-01',
      bankName: 'HDFC Bank',
      accountNumber: '501001234567',
      ifscCode: 'HDFC0000123',
      accountHolderName: 'Priya Patel',
      upiId: 'priya98222@hdfcbank',
      createdAt: '2026-08-01T08:30:00Z'
    }
  ];

  // Seed Lot 1: LOT-2026-101 (Fully Processed & Invoiced, Partially Paid)
  const purchase1: Purchase = {
    id: 'pur_101',
    wholesalerId: 'ws_101',
    wholesalerName: 'Vardhman Textiles & Fabrics',
    purchaseDate: '2026-08-01',
    challanNumber: 'CH-8801',
    lotNumber: 'LOT-2026-101',
    materialName: '100% Pure Cotton Canvas',
    unit: 'meters',
    ratePerUnit: 120,
    totalQuantity: 1000,
    purchaseAmount: 120000,
    notes: 'Premium quality cotton roll',
    createdAt: '2026-08-01T10:00:00Z'
  };

  const rawMaterial1: RawMaterial = {
    id: 'rm_101',
    purchaseId: 'pur_101',
    lotNumber: 'LOT-2026-101',
    wholesalerId: 'ws_101',
    wholesalerName: 'Vardhman Textiles & Fabrics',
    materialName: '100% Pure Cotton Canvas',
    totalQuantity: 1000,
    damagedQuantity: 20,
    usedQuantity: 980,
    availableQuantity: 0,
    unit: 'meters',
    status: 'FULLY_USED',
    createdAt: '2026-08-01T10:05:00Z'
  };

  const rawDamage1: RawMaterialDamage = {
    id: 'rmd_101',
    rawMaterialId: 'rm_101',
    lotNumber: 'LOT-2026-101',
    damageQuantity: 20,
    reason: 'Water stain on roll outer layer',
    damageDate: '2026-08-02',
    createdAt: '2026-08-02T11:00:00Z'
  };

  const cutting1: Cutting = {
    id: 'cut_101',
    lotNumber: 'LOT-2026-101',
    cuttingDate: '2026-08-03',
    materialUsedMeters: 980,
    totalCutPiecesProduced: 480,
    pieceType: 'Standard Men Shirt',
    wasteMeters: 10,
    cuttingMasterName: 'Aslam Master',
    notes: 'Cut into 480 pieces',
    createdAt: '2026-08-03T14:00:00Z'
  };

  const cutPieces1: CutPieces = {
    id: 'cp_101',
    cuttingId: 'cut_101',
    lotNumber: 'LOT-2026-101',
    totalCutPieces: 480,
    readyCutPieces: 480,
    assignedToTailorQty: 480,
    remainingCutPieces: 0,
    pieceType: 'Standard Men Shirt',
    cuttingMasterName: 'Ramesh Master',
    cuttingStatus: 'CUTTING_COMPLETED',
    status: 'FULLY_ASSIGNED',
    createdAt: '2026-08-03T14:10:00Z'
  };

  const tailorAssign1: TailorAssignment = {
    id: 'ta_101',
    tailorId: 'tailor_1',
    tailorName: 'Ramesh Tailors',
    lotNumber: 'LOT-2026-101',
    assignedPiecesQty: 480,
    completedPiecesQty: 480,
    ratePerPiece: 45,
    assignmentDate: '2026-08-04',
    targetCompletionDate: '2026-08-07',
    status: 'COMPLETED',
    notes: 'Assigned for stitching',
    createdAt: '2026-08-04T09:00:00Z'
  };

  const stitching1: Stitching = {
    id: 'stit_101',
    tailorAssignmentId: 'ta_101',
    tailorId: 'tailor_1',
    tailorName: 'Ramesh Tailors',
    lotNumber: 'LOT-2026-101',
    stitchedGoodPiecesQty: 470,
    defectivePiecesQty: 10,
    ratePerPiece: 45,
    totalWageAmount: 21150,
    stitchingDate: '2026-08-07',
    notes: '470 good stitched, 10 defective',
    createdAt: '2026-08-07T17:00:00Z'
  };

  const finishedProduct1: FinishedProduct = {
    id: 'fp_101',
    lotNumber: 'LOT-2026-101',
    productName: 'Standard Men Shirt',
    tailorName: 'Ramesh Tailors',
    tailorId: 'tailor_1',
    tailorAssignmentId: 'ta_101',
    totalStitchedQty: 470,
    damagedQuantity: 10,
    assignedToEmployeeQty: 460,
    availableForAssignmentQty: 0,
    unitPriceEstimate: 350,
    status: 'READY_FOR_INVOICE',
    createdAt: '2026-08-07T17:30:00Z'
  };

  const fpDamage1: FinishedProductDamage = {
    id: 'fpd_101',
    finishedProductId: 'fp_101',
    lotNumber: 'LOT-2026-101',
    damageQuantity: 10,
    reason: 'Button alignment fault',
    damageDate: '2026-08-08',
    createdAt: '2026-08-08T10:00:00Z'
  };

  const empAssign1: EmployeeAssignment = {
    id: 'ea_101',
    employeeId: 'emp_1',
    employeeName: 'Rajesh Sharma',
    lotNumber: 'LOT-2026-101',
    finishedProductId: 'fp_101',
    productName: 'Standard Men Shirt',
    tailorName: 'Ramesh Tailors',
    assignedFinishedQty: 460,
    assignmentDate: '2026-08-08',
    notes: 'Dispatched to retail outlet',
    createdAt: '2026-08-08T11:00:00Z'
  };

  const invoice1: Invoice = {
    id: 'inv_101',
    invoiceNumber: 'INV-2026-001',
    invoiceDate: '2026-08-08',
    wholesalerId: 'ws_101',
    wholesalerName: 'Vardhman Textiles & Fabrics',
    lotNumber: 'LOT-2026-101',
    totalItemsQuantity: 460,
    ratePerItem: 350,
    subtotalAmount: 161000,
    taxAmount: 8050,
    discountAmount: 1050,
    finalNetPayableAmount: 168000,
    paidAmount: 100000,
    dueAmount: 68000,
    paymentStatus: 'PARTIALLY_PAID',
    notes: 'Settlement for LOT-2026-101',
    createdAt: '2026-08-08T12:00:00Z'
  };

  const wsPayment1: WholesalerPayment = {
    id: 'wsp_101',
    invoiceId: 'inv_101',
    wholesalerId: 'ws_101',
    wholesalerName: 'Vardhman Textiles & Fabrics',
    paymentDate: '2026-08-09',
    amountPaid: 100000,
    paymentMethod: 'BANK_TRANSFER',
    referenceNumber: 'AXIS12998341',
    notes: 'Part payment via RTGS',
    createdAt: '2026-08-09T14:00:00Z'
  };

  // Seed Lot 2: LOT-2026-102 (Active in Production - Raw Material In Stock)
  const purchase2: Purchase = {
    id: 'pur_102',
    wholesalerId: 'ws_102',
    wholesalerName: 'Reliance Cotton Mills',
    purchaseDate: '2026-08-05',
    challanNumber: 'CH-9920',
    lotNumber: 'LOT-2026-102',
    materialName: 'Soft Rayon Print Fabric',
    unit: 'meters',
    ratePerUnit: 95,
    totalQuantity: 800,
    purchaseAmount: 76000,
    notes: 'Printed floral roll',
    createdAt: '2026-08-05T11:00:00Z'
  };

  const rawMaterial2: RawMaterial = {
    id: 'rm_102',
    purchaseId: 'pur_102',
    lotNumber: 'LOT-2026-102',
    wholesalerId: 'ws_102',
    wholesalerName: 'Reliance Cotton Mills',
    materialName: 'Soft Rayon Print Fabric',
    totalQuantity: 800,
    damagedQuantity: 0,
    usedQuantity: 0,
    availableQuantity: 800,
    unit: 'meters',
    status: 'IN_STOCK',
    createdAt: '2026-08-05T11:05:00Z'
  };

  // Seed Employee Upaad & Salary
  const upaad1: UpaadRecord = {
    id: 'up_101',
    employeeId: 'emp_1',
    employeeName: 'Rajesh Sharma',
    amount: 3000,
    date: '2026-08-03',
    reason: 'Emergency medical advance',
    createdAt: '2026-08-03T10:00:00Z'
  };

  const salary1: SalaryRecord = {
    id: 'sal_101',
    employeeId: 'emp_1',
    employeeName: 'Rajesh Sharma',
    month: '2026-07',
    baseSalary: 25000,
    totalUpaadDeducted: 3000,
    netPayableSalary: 22000,
    paidAmount: 22000,
    remainingAmount: 0,
    status: 'PAID',
    generatedDate: '2026-08-01',
    createdAt: '2026-08-01T12:00:00Z'
  };

  const salPayment1: SalaryPayment = {
    id: 'sp_101',
    salaryRecordId: 'sal_101',
    employeeId: 'emp_1',
    employeeName: 'Rajesh Sharma',
    paymentDate: '2026-08-02',
    amountPaid: 22000,
    paymentMethod: 'BANK_TRANSFER',
    referenceNumber: 'HDFC98127391',
    notes: 'July salary cleared',
    createdAt: '2026-08-02T15:00:00Z'
  };

  setStorage(STORAGE_KEYS.WHOLESALERS, wholesalers);
  setStorage(STORAGE_KEYS.TAILORS, tailors);
  setStorage(STORAGE_KEYS.EMPLOYEES, employees);
  setStorage(STORAGE_KEYS.PURCHASES, [purchase1, purchase2]);
  setStorage(STORAGE_KEYS.RAW_MATERIALS, [rawMaterial1, rawMaterial2]);
  setStorage(STORAGE_KEYS.RAW_MATERIAL_DAMAGES, [rawDamage1]);
  setStorage(STORAGE_KEYS.CUTTINGS, [cutting1]);
  setStorage(STORAGE_KEYS.CUT_PIECES, [cutPieces1]);
  setStorage(STORAGE_KEYS.TAILOR_ASSIGNMENTS, [tailorAssign1]);
  setStorage(STORAGE_KEYS.STITCHINGS, [stitching1]);
  setStorage(STORAGE_KEYS.FINISHED_PRODUCTS, [finishedProduct1]);
  setStorage(STORAGE_KEYS.FINISHED_PRODUCT_DAMAGES, [fpDamage1]);
  setStorage(STORAGE_KEYS.EMPLOYEE_ASSIGNMENTS, [empAssign1]);
  setStorage(STORAGE_KEYS.INVOICES, [invoice1]);
  setStorage(STORAGE_KEYS.WHOLESALER_PAYMENTS, [wsPayment1]);
  setStorage(STORAGE_KEYS.UPAAD_RECORDS, [upaad1]);
  setStorage(STORAGE_KEYS.SALARY_RECORDS, [salary1]);
  setStorage(STORAGE_KEYS.SALARY_PAYMENTS, [salPayment1]);
}

// Ensure seed data is initialized on module import
initializeSeedDataIfEmpty();

// --- Repository Functions ---

export const erpService = {
  // Wholesalers
  getWholesalers: (): Wholesaler[] => getStorage<Wholesaler>(STORAGE_KEYS.WHOLESALERS, []),
  addWholesaler: (data: Omit<Wholesaler, 'id' | 'createdAt'>): Wholesaler => {
    const list = erpService.getWholesalers();
    const newItem: Wholesaler = {
      ...data,
      id: 'ws_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setStorage(STORAGE_KEYS.WHOLESALERS, [newItem, ...list]);
    return newItem;
  },
  updateWholesaler: (id: string, data: Partial<Wholesaler>): void => {
    const list = erpService.getWholesalers();
    const updated = list.map(item => item.id === id ? { ...item, ...data } : item);
    setStorage(STORAGE_KEYS.WHOLESALERS, updated);
  },

  // Tailors
  getTailors: (): Tailor[] => getStorage<Tailor>(STORAGE_KEYS.TAILORS, []),
  addTailor: (data: Omit<Tailor, 'id' | 'createdAt'>): Tailor => {
    const list = erpService.getTailors();
    const newItem: Tailor = {
      ...data,
      id: 'tailor_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setStorage(STORAGE_KEYS.TAILORS, [newItem, ...list]);
    return newItem;
  },

  // Employees
  getEmployees: (): Employee[] => getStorage<Employee>(STORAGE_KEYS.EMPLOYEES, []),
  addEmployee: (data: Omit<Employee, 'id' | 'createdAt'>): Employee => {
    const list = erpService.getEmployees();
    const newItem: Employee = {
      ...data,
      id: 'emp_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setStorage(STORAGE_KEYS.EMPLOYEES, [newItem, ...list]);
    return newItem;
  },
  updateEmployee: (id: string, data: Partial<Employee>): void => {
    const list = erpService.getEmployees();
    const updated = list.map(item => item.id === id ? { ...item, ...data } : item);
    setStorage(STORAGE_KEYS.EMPLOYEES, updated);
  },
  deleteEmployee: (id: string): void => {
    const list = erpService.getEmployees();
    setStorage(STORAGE_KEYS.EMPLOYEES, list.filter(item => item.id !== id));
  },

  // Purchases & Raw Material Initialization
  getPurchases: (): Purchase[] => getStorage<Purchase>(STORAGE_KEYS.PURCHASES, []),
  createPurchase: (data: Omit<Purchase, 'id' | 'createdAt'>): { purchase: Purchase; rawMaterial: RawMaterial } => {
    const purchases = erpService.getPurchases();
    const purchaseId = 'pur_' + Date.now();
    const now = new Date().toISOString();

    const newPurchase: Purchase = {
      ...data,
      id: purchaseId,
      createdAt: now
    };

    // Automatically create Raw Material inventory entry for this lot
    const rawMaterials = erpService.getRawMaterials();
    const newRawMaterial: RawMaterial = {
      id: 'rm_' + Date.now(),
      purchaseId: purchaseId,
      lotNumber: data.lotNumber,
      wholesalerId: data.wholesalerId,
      wholesalerName: data.wholesalerName,
      materialName: data.materialName,
      totalQuantity: Number(data.totalQuantity),
      damagedQuantity: 0,
      usedQuantity: 0,
      availableQuantity: Number(data.totalQuantity),
      unit: data.unit || 'meters',
      status: 'IN_STOCK',
      createdAt: now
    };

    setStorage(STORAGE_KEYS.PURCHASES, [newPurchase, ...purchases]);
    setStorage(STORAGE_KEYS.RAW_MATERIALS, [newRawMaterial, ...rawMaterials]);

    return { purchase: newPurchase, rawMaterial: newRawMaterial };
  },

  // Raw Materials & Damage
  getRawMaterials: (): RawMaterial[] => getStorage<RawMaterial>(STORAGE_KEYS.RAW_MATERIALS, []),
  getRawMaterialDamages: (): RawMaterialDamage[] => getStorage<RawMaterialDamage>(STORAGE_KEYS.RAW_MATERIAL_DAMAGES, []),
  addRawMaterialDamage: (data: Omit<RawMaterialDamage, 'id' | 'createdAt'>): RawMaterialDamage => {
    const damages = erpService.getRawMaterialDamages();
    const rawMaterials = erpService.getRawMaterials();

    const rm = rawMaterials.find(item => item.id === data.rawMaterialId || item.lotNumber === data.lotNumber);
    if (!rm) {
      throw new Error('Raw material record not found for this lot.');
    }

    const damageQty = Number(data.damageQuantity);
    if (damageQty > rm.availableQuantity) {
      throw new Error(`Damage quantity (${damageQty}) cannot exceed available raw material (${rm.availableQuantity}).`);
    }

    const now = new Date().toISOString();
    const newDamage: RawMaterialDamage = {
      ...data,
      damageQuantity: damageQty,
      id: 'rmd_' + Date.now(),
      createdAt: now
    };

    // Update raw material balances
    const updatedRawMaterials = rawMaterials.map(item => {
      if (item.id === rm.id) {
        const newDamaged = item.damagedQuantity + damageQty;
        const newAvailable = Math.max(0, item.totalQuantity - newDamaged - item.usedQuantity);
        return {
          ...item,
          damagedQuantity: newDamaged,
          availableQuantity: newAvailable
        };
      }
      return item;
    });

    setStorage(STORAGE_KEYS.RAW_MATERIAL_DAMAGES, [newDamage, ...damages]);
    setStorage(STORAGE_KEYS.RAW_MATERIALS, updatedRawMaterials);

    return newDamage;
  },

  // Cuttings & Cut Pieces
  getCuttings: (): Cutting[] => getStorage<Cutting>(STORAGE_KEYS.CUTTINGS, []),
  getCutPieces: (): CutPieces[] => getStorage<CutPieces>(STORAGE_KEYS.CUT_PIECES, []),
  startCutting: (data: Omit<Cutting, 'id' | 'createdAt'>): { cutting: Cutting; cutPieces: CutPieces } => {
    const rawMaterials = erpService.getRawMaterials();
    const rm = rawMaterials.find(item => item.lotNumber === data.lotNumber);
    if (!rm) {
      throw new Error('Raw material for lot ' + data.lotNumber + ' not found.');
    }

    const usedMeters = Number(data.materialUsedMeters);
    if (usedMeters > rm.availableQuantity) {
      throw new Error(`Material used for cutting (${usedMeters}m) exceeds available raw material (${rm.availableQuantity}m).`);
    }

    const now = new Date().toISOString();
    const cuttingId = 'cut_' + Date.now();
    const totalPiecesProduced = Number(data.totalCutPiecesProduced);

    const newCutting: Cutting = {
      ...data,
      materialUsedMeters: usedMeters,
      totalCutPiecesProduced: totalPiecesProduced,
      wasteMeters: Number(data.wasteMeters || 0),
      id: cuttingId,
      createdAt: now
    };

    // Update Raw Material balance
    const updatedRawMaterials = rawMaterials.map(item => {
      if (item.id === rm.id) {
        const newUsed = item.usedQuantity + usedMeters;
        const newAvailable = Math.max(0, item.totalQuantity - item.damagedQuantity - newUsed);
        const newStatus = newAvailable === 0 ? 'FULLY_USED' : 'PARTIALLY_USED';
        return {
          ...item,
          usedQuantity: newUsed,
          availableQuantity: newAvailable,
          status: newStatus as any
        };
      }
      return item;
    });

    // Create or update Cut Pieces inventory for this lot
    const cutPiecesList = erpService.getCutPieces();
    const existingCp = cutPiecesList.find(cp => cp.lotNumber === data.lotNumber);

    let updatedCutPiecesList: CutPieces[];
    let targetCp: CutPieces;

    if (existingCp) {
      const newTotal = existingCp.totalCutPieces + totalPiecesProduced;
      const newRemaining = newTotal - existingCp.assignedToTailorQty;
      targetCp = {
        ...existingCp,
        totalCutPieces: newTotal,
        remainingCutPieces: Math.max(0, newRemaining),
        pieceType: data.pieceType || existingCp.pieceType,
        cuttingMasterName: data.cuttingMasterName || existingCp.cuttingMasterName || 'Unassigned Master',
        cuttingStatus: 'CUTTING_IN_PROGRESS',
        status: 'CUTTING_IN_PROGRESS'
      };
      updatedCutPiecesList = cutPiecesList.map(cp => cp.id === existingCp.id ? targetCp : cp);
    } else {
      targetCp = {
        id: 'cp_' + Date.now(),
        cuttingId: cuttingId,
        lotNumber: data.lotNumber,
        totalCutPieces: totalPiecesProduced,
        readyCutPieces: 0, // initially in cutting process
        assignedToTailorQty: 0,
        remainingCutPieces: totalPiecesProduced,
        pieceType: data.pieceType,
        cuttingMasterName: data.cuttingMasterName || 'Unassigned Master',
        cuttingStatus: 'CUTTING_IN_PROGRESS',
        cuttingNotes: data.notes || '',
        status: 'CUTTING_IN_PROGRESS',
        createdAt: now
      };
      updatedCutPiecesList = [targetCp, ...cutPiecesList];
    }

    setStorage(STORAGE_KEYS.CUTTINGS, [newCutting, ...erpService.getCuttings()]);
    setStorage(STORAGE_KEYS.RAW_MATERIALS, updatedRawMaterials);
    setStorage(STORAGE_KEYS.CUT_PIECES, updatedCutPiecesList);

    return { cutting: newCutting, cutPieces: targetCp };
  },

  // Update Cutting Progress / Status in Cut Pieces Inventory
  updateCutPiecesProgress: (data: {
    lotNumber: string;
    addedCutPieces?: number;
    readyCutPieces?: number;
    totalCutPieces?: number;
    cuttingStatus: 'CUTTING_IN_PROGRESS' | 'CUTTING_COMPLETED';
    cuttingMasterName?: string;
    cuttingNotes?: string;
  }): CutPieces => {
    const cutPiecesList = erpService.getCutPieces();
    const cp = cutPiecesList.find(c => c.lotNumber === data.lotNumber);
    if (!cp) {
      throw new Error('Cut pieces record for lot ' + data.lotNumber + ' not found.');
    }

    const currentReady = cp.readyCutPieces !== undefined
      ? cp.readyCutPieces
      : (cp.cuttingStatus === 'CUTTING_COMPLETED' ? cp.totalCutPieces : 0);

    const finalTotal = data.totalCutPieces && Number(data.totalCutPieces) > 0
      ? Number(data.totalCutPieces)
      : cp.totalCutPieces;

    let finalReady = currentReady;
    if (data.addedCutPieces !== undefined) {
      const addedQty = Number(data.addedCutPieces);
      const remainingBalance = Math.max(0, finalTotal - currentReady);
      if (addedQty > remainingBalance) {
        throw new Error(`Real-Time Validation Failure: Cannot add ${addedQty} pieces. Only ${remainingBalance} pieces are remaining to be cut for Lot ${data.lotNumber} (Total: ${finalTotal}, Completed: ${currentReady}).`);
      }
      finalReady = currentReady + Math.max(0, addedQty);
    } else if (data.readyCutPieces !== undefined) {
      finalReady = Math.min(finalTotal, Math.max(0, Number(data.readyCutPieces)));
    }

    const isCompleted = data.cuttingStatus === 'CUTTING_COMPLETED' || finalReady >= finalTotal;
    if (isCompleted && data.cuttingStatus === 'CUTTING_COMPLETED' && finalReady < finalTotal && data.addedCutPieces === undefined) {
      finalReady = finalTotal;
    }
    const finalStatus: 'CUTTING_IN_PROGRESS' | 'CUTTING_COMPLETED' = isCompleted ? 'CUTTING_COMPLETED' : 'CUTTING_IN_PROGRESS';

    // Build handover log
    const addedQty = data.addedCutPieces !== undefined ? Number(data.addedCutPieces) : (finalReady - currentReady);
    let updatedLogs = cp.handoverLogs || [];
    if (addedQty !== 0 || data.cuttingNotes) {
      const nowFormatted = new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newLog = {
        id: 'log_' + Date.now(),
        date: nowFormatted,
        addedQty: Math.max(0, addedQty),
        totalReadyAfter: finalReady,
        masterName: data.cuttingMasterName || cp.cuttingMasterName || 'Cutting Master',
        notes: data.cuttingNotes || (addedQty > 0 ? `Handed over ${addedQty} cut pieces` : 'Progress updated')
      };
      updatedLogs = [newLog, ...updatedLogs];
    }

    let inventoryStatus: CutPieces['status'] = 'CUTTING_IN_PROGRESS';
    if (finalStatus === 'CUTTING_COMPLETED') {
      if (cp.assignedToTailorQty === 0) {
        inventoryStatus = 'READY';
      } else if (cp.assignedToTailorQty >= finalTotal) {
        inventoryStatus = 'FULLY_ASSIGNED';
      } else {
        inventoryStatus = 'PARTIALLY_ASSIGNED';
      }
    }

    const updatedCp: CutPieces = {
      ...cp,
      totalCutPieces: finalTotal,
      readyCutPieces: finalReady,
      cuttingStatus: finalStatus,
      cuttingMasterName: data.cuttingMasterName !== undefined ? data.cuttingMasterName : cp.cuttingMasterName,
      cuttingNotes: data.cuttingNotes !== undefined ? data.cuttingNotes : cp.cuttingNotes,
      handoverLogs: updatedLogs,
      status: inventoryStatus,
      remainingCutPieces: Math.max(0, finalTotal - cp.assignedToTailorQty)
    };

    const updatedList = cutPiecesList.map(c => c.id === cp.id ? updatedCp : c);
    setStorage(STORAGE_KEYS.CUT_PIECES, updatedList);

    return updatedCp;
  },

  // Tailor Assignments & Stitching
  getTailorAssignments: (): TailorAssignment[] => getStorage<TailorAssignment>(STORAGE_KEYS.TAILOR_ASSIGNMENTS, []),
  getStitchings: (): Stitching[] => getStorage<Stitching>(STORAGE_KEYS.STITCHINGS, []),
  assignToTailor: (data: Omit<TailorAssignment, 'id' | 'createdAt' | 'status'>): TailorAssignment => {
    const cutPiecesList = erpService.getCutPieces();
    const cp = cutPiecesList.find(item => item.lotNumber === data.lotNumber);
    if (!cp) {
      throw new Error('Cut pieces for lot ' + data.lotNumber + ' not found.');
    }

    const readyQty = cp.readyCutPieces !== undefined ? cp.readyCutPieces : (cp.cuttingStatus === 'CUTTING_IN_PROGRESS' ? 0 : cp.totalCutPieces);
    const unassignedReadyQty = Math.max(0, readyQty - cp.assignedToTailorQty);
    const assignQty = Number(data.assignedPiecesQty);

    if (unassignedReadyQty <= 0) {
      throw new Error(`Cannot assign to tailor: Cutting for Lot ${cp.lotNumber} is currently IN PROGRESS by Cutting Master (${cp.cuttingMasterName || 'Master'}). 0 cut pieces are ready for stitching. Please track cutting progress and mark pieces ready first.`);
    }

    if (assignQty > unassignedReadyQty) {
      throw new Error(`Assigned quantity (${assignQty} pcs) exceeds available ready cut pieces (${unassignedReadyQty} pcs). Cutting Master has only finished ${readyQty} of ${cp.totalCutPieces} pieces so far.`);
    }

    const now = new Date().toISOString();
    const newAssignment: TailorAssignment = {
      ...data,
      assignedPiecesQty: assignQty,
      completedPiecesQty: 0,
      ratePerPiece: Number(data.ratePerPiece),
      status: 'ASSIGNED',
      id: 'ta_' + Date.now(),
      createdAt: now
    };

    // Update Cut Pieces balance
    const updatedCutPieces = cutPiecesList.map(item => {
      if (item.id === cp.id) {
        const newAssigned = item.assignedToTailorQty + assignQty;
        const newRemaining = Math.max(0, item.totalCutPieces - newAssigned);
        return {
          ...item,
          assignedToTailorQty: newAssigned,
          remainingCutPieces: newRemaining,
          status: (newRemaining === 0 ? 'FULLY_ASSIGNED' : 'PARTIALLY_ASSIGNED') as any
        };
      }
      return item;
    });

    setStorage(STORAGE_KEYS.TAILOR_ASSIGNMENTS, [newAssignment, ...erpService.getTailorAssignments()]);
    setStorage(STORAGE_KEYS.CUT_PIECES, updatedCutPieces);

    return newAssignment;
  },

  recordStitching: (data: Omit<Stitching, 'id' | 'createdAt' | 'totalWageAmount'>): { stitching: Stitching; finishedProduct: FinishedProduct } => {
    const assignments = erpService.getTailorAssignments();
    const ta = assignments.find(a => a.id === data.tailorAssignmentId);
    if (!ta) {
      throw new Error('Tailor assignment record not found.');
    }

    const goodQty = Number(data.stitchedGoodPiecesQty);
    const defectQty = Number(data.defectivePiecesQty || 0);
    const currentBatchTotal = goodQty + defectQty;

    const prevCompleted = ta.completedPiecesQty !== undefined
      ? ta.completedPiecesQty
      : erpService.getStitchings()
          .filter(s => s.tailorAssignmentId === ta.id)
          .reduce((sum, s) => sum + s.stitchedGoodPiecesQty + s.defectivePiecesQty, 0);

    const remainingForTa = Math.max(0, ta.assignedPiecesQty - prevCompleted);

    if (currentBatchTotal > remainingForTa) {
      throw new Error(`Current entry output (${currentBatchTotal} pcs) exceeds remaining pending pieces (${remainingForTa} pcs) for tailor ${ta.tailorName}.`);
    }

    const now = new Date().toISOString();
    const rate = Number(data.ratePerPiece || ta.ratePerPiece);
    const totalWage = goodQty * rate;

    const newStitching: Stitching = {
      ...data,
      stitchedGoodPiecesQty: goodQty,
      defectivePiecesQty: defectQty,
      ratePerPiece: rate,
      totalWageAmount: totalWage,
      id: 'stit_' + Date.now(),
      createdAt: now
    };

    const newCumulativeCompleted = prevCompleted + currentBatchTotal;
    const newRemaining = Math.max(0, ta.assignedPiecesQty - newCumulativeCompleted);
    const newStatus: TailorAssignment['status'] = newRemaining === 0 ? 'COMPLETED' : 'IN_STITCHING';

    // Update assignment status and completed count
    const updatedAssignments = assignments.map(a => {
      if (a.id === ta.id) {
        return {
          ...a,
          completedPiecesQty: newCumulativeCompleted,
          status: newStatus
        };
      }
      return a;
    });

    // Create or update Finished Products inventory per lot, item type and tailor
    const cpList = erpService.getCutPieces();
    const lotCp = cpList.find(c => c.lotNumber === data.lotNumber);
    const garmentName = lotCp?.pieceType || `Garment Lot ${data.lotNumber}`;

    const fpList = erpService.getFinishedProducts();
    // Match existing FP by lotNumber, tailorName, and productName
    const existingFp = fpList.find(fp => 
      fp.lotNumber === data.lotNumber && 
      fp.tailorName === ta.tailorName && 
      fp.productName === garmentName
    ) || fpList.find(fp => fp.lotNumber === data.lotNumber && fp.tailorName === ta.tailorName)
      || fpList.find(fp => fp.lotNumber === data.lotNumber && !fp.tailorName);

    let updatedFpList: FinishedProduct[];
    let targetFp: FinishedProduct;

    if (existingFp) {
      const newGoodTotal = existingFp.totalStitchedQty + goodQty;
      const newAvail = newGoodTotal - existingFp.damagedQuantity - existingFp.assignedToEmployeeQty;
      targetFp = {
        ...existingFp,
        productName: garmentName,
        tailorName: ta.tailorName,
        tailorId: ta.tailorId,
        tailorAssignmentId: ta.id,
        totalStitchedQty: newGoodTotal,
        availableForAssignmentQty: Math.max(0, newAvail)
      };
      updatedFpList = fpList.map(fp => fp.id === existingFp.id ? targetFp : fp);
    } else {
      targetFp = {
        id: 'fp_' + Date.now(),
        lotNumber: data.lotNumber,
        productName: garmentName,
        tailorName: ta.tailorName,
        tailorId: ta.tailorId,
        tailorAssignmentId: ta.id,
        totalStitchedQty: goodQty,
        damagedQuantity: 0,
        assignedToEmployeeQty: 0,
        availableForAssignmentQty: goodQty,
        status: 'AVAILABLE',
        createdAt: now
      };
      updatedFpList = [targetFp, ...fpList];
    }

    setStorage(STORAGE_KEYS.STITCHINGS, [newStitching, ...erpService.getStitchings()]);
    setStorage(STORAGE_KEYS.TAILOR_ASSIGNMENTS, updatedAssignments);
    setStorage(STORAGE_KEYS.FINISHED_PRODUCTS, updatedFpList);

    return { stitching: newStitching, finishedProduct: targetFp };
  },

  // Finished Products & Damage & Employee Assignment
  getFinishedProducts: (): FinishedProduct[] => getStorage<FinishedProduct>(STORAGE_KEYS.FINISHED_PRODUCTS, []),
  getFinishedProductDamages: (): FinishedProductDamage[] => getStorage<FinishedProductDamage>(STORAGE_KEYS.FINISHED_PRODUCT_DAMAGES, []),
  addFinishedProductDamage: (data: Omit<FinishedProductDamage, 'id' | 'createdAt'>): FinishedProductDamage => {
    const fpList = erpService.getFinishedProducts();
    const fp = fpList.find(item => item.id === data.finishedProductId || item.lotNumber === data.lotNumber);
    if (!fp) {
      throw new Error('Finished product record for lot ' + data.lotNumber + ' not found.');
    }

    const damageQty = Number(data.damageQuantity);
    if (damageQty > fp.availableForAssignmentQty) {
      throw new Error(`Damage quantity (${damageQty}) cannot exceed available finished products (${fp.availableForAssignmentQty}).`);
    }

    const now = new Date().toISOString();
    const newDamage: FinishedProductDamage = {
      ...data,
      damageQuantity: damageQty,
      id: 'fpd_' + Date.now(),
      createdAt: now
    };

    const updatedFpList = fpList.map(item => {
      if (item.id === fp.id) {
        const newDamaged = item.damagedQuantity + damageQty;
        const newAvail = Math.max(0, item.totalStitchedQty - newDamaged - item.assignedToEmployeeQty);
        return {
          ...item,
          damagedQuantity: newDamaged,
          availableForAssignmentQty: newAvail
        };
      }
      return item;
    });

    setStorage(STORAGE_KEYS.FINISHED_PRODUCT_DAMAGES, [newDamage, ...erpService.getFinishedProductDamages()]);
    setStorage(STORAGE_KEYS.FINISHED_PRODUCTS, updatedFpList);

    return newDamage;
  },

  getEmployeeAssignments: (): EmployeeAssignment[] => getStorage<EmployeeAssignment>(STORAGE_KEYS.EMPLOYEE_ASSIGNMENTS, []),
  assignFinishedProductsToEmployee: (data: Omit<EmployeeAssignment, 'id' | 'createdAt'>): EmployeeAssignment => {
    const fpList = erpService.getFinishedProducts();
    const fp = data.finishedProductId
      ? fpList.find(item => item.id === data.finishedProductId)
      : fpList.find(item => item.lotNumber === data.lotNumber && item.availableForAssignmentQty >= Number(data.assignedFinishedQty))
        || fpList.find(item => item.lotNumber === data.lotNumber);

    if (!fp) {
      throw new Error('Finished product item record for lot ' + data.lotNumber + ' not found.');
    }

    const assignQty = Number(data.assignedFinishedQty);
    if (assignQty > fp.availableForAssignmentQty) {
      throw new Error(`Assigned quantity (${assignQty} pcs) exceeds available stock (${fp.availableForAssignmentQty} pcs) for ${fp.productName} stitched by ${fp.tailorName || 'tailor'}.`);
    }

    const now = new Date().toISOString();
    const newAssignment: EmployeeAssignment = {
      ...data,
      finishedProductId: fp.id,
      productName: fp.productName,
      tailorName: fp.tailorName || 'Unknown Tailor',
      assignedFinishedQty: assignQty,
      id: 'ea_' + Date.now(),
      createdAt: now
    };

    const updatedFpList = fpList.map(item => {
      if (item.id === fp.id) {
        const newAssigned = item.assignedToEmployeeQty + assignQty;
        const newAvail = Math.max(0, item.totalStitchedQty - item.damagedQuantity - newAssigned);
        const isAllGoodAccountedFor = newAvail === 0 && (newAssigned + item.damagedQuantity) === item.totalStitchedQty;
        return {
          ...item,
          assignedToEmployeeQty: newAssigned,
          availableForAssignmentQty: newAvail,
          status: (isAllGoodAccountedFor ? 'READY_FOR_INVOICE' : 'PARTIALLY_ASSIGNED') as any
        };
      }
      return item;
    });

    setStorage(STORAGE_KEYS.EMPLOYEE_ASSIGNMENTS, [newAssignment, ...erpService.getEmployeeAssignments()]);
    setStorage(STORAGE_KEYS.FINISHED_PRODUCTS, updatedFpList);

    // Auto-sync invoice generation if all finished goods for this lot are fully assigned to employees
    try {
      erpService.getInvoices();
    } catch (e) {
      // Ignore if sync error
    }

    return newAssignment;
  },

  // Final Invoices & Wholesaler Payments
  getInvoices: (): Invoice[] => {
    const invoices = getStorage<Invoice>(STORAGE_KEYS.INVOICES, []);
    const finishedProducts = erpService.getFinishedProducts();
    if (finishedProducts.length === 0) return invoices;

    const purchases = erpService.getPurchases();

    // Group finished products by lotNumber
    const lotMap = new Map<string, FinishedProduct[]>();
    finishedProducts.forEach(fp => {
      const list = lotMap.get(fp.lotNumber) || [];
      list.push(fp);
      lotMap.set(fp.lotNumber, list);
    });

    let addedNew = false;
    const updatedInvoices = [...invoices];

    for (const [lotNum, fps] of lotMap.entries()) {
      const totalStitched = fps.reduce((sum, fp) => sum + fp.totalStitchedQty, 0);
      const damaged = fps.reduce((sum, fp) => sum + fp.damagedQuantity, 0);
      const assigned = fps.reduce((sum, fp) => sum + fp.assignedToEmployeeQty, 0);
      const avail = fps.reduce((sum, fp) => sum + fp.availableForAssignmentQty, 0);

      // Rule: Auto-create final invoice IF AND ONLY IF all finished goods of the lot are assigned to employees
      const isFullyAssigned = totalStitched > 0 && (damaged + assigned === totalStitched) && avail === 0 && assigned > 0;
      const hasInvoice = updatedInvoices.some(inv => inv.lotNumber === lotNum);

      if (isFullyAssigned && !hasInvoice) {
        const pur = purchases.find(p => p.lotNumber === lotNum);
        const rate = fps[0]?.unitPriceEstimate || 350;
        const subtotal = assigned * rate;
        const tax = Math.round(subtotal * 0.05);
        const finalNet = subtotal + tax;
        const now = new Date().toISOString();

        const autoInvoice: Invoice = {
          id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
          invoiceNumber: `INV-${lotNum.replace(/[^A-Za-z0-9]/g, '')}`,
          invoiceDate: new Date().toISOString().split('T')[0],
          wholesalerId: pur?.wholesalerId || 'ws_101',
          wholesalerName: pur?.wholesalerName || 'Wholesaler',
          lotNumber: lotNum,
          totalItemsQuantity: assigned,
          ratePerItem: rate,
          subtotalAmount: subtotal,
          taxAmount: tax,
          discountAmount: 0,
          finalNetPayableAmount: finalNet,
          paidAmount: 0,
          dueAmount: finalNet,
          paymentStatus: 'UNPAID',
          notes: `Auto-generated final settlement invoice for ${lotNum} (All ${assigned} finished pcs assigned to employees)`,
          createdAt: now
        };

        updatedInvoices.unshift(autoInvoice);
        addedNew = true;
      }
    }

    if (addedNew) {
      setStorage(STORAGE_KEYS.INVOICES, updatedInvoices);
    }

    return updatedInvoices;
  },
  getWholesalerPayments: (): WholesalerPayment[] => getStorage<WholesalerPayment>(STORAGE_KEYS.WHOLESALER_PAYMENTS, []),
  generateFinalInvoice: (data: Omit<Invoice, 'id' | 'createdAt' | 'paidAmount' | 'dueAmount' | 'paymentStatus'> & { initialPaidAmount?: number }): Invoice => {
    const invoices = erpService.getInvoices();
    const existing = invoices.find(inv => inv.lotNumber === data.lotNumber);
    if (existing) {
      throw new Error(`An invoice (${existing.invoiceNumber}) already exists for Lot ${data.lotNumber}.`);
    }

    // Validation: Ensure ALL finished products of this lot are assigned to employees
    const fps = erpService.getFinishedProducts().filter(fp => fp.lotNumber === data.lotNumber);
    if (fps.length > 0) {
      const totalAvail = fps.reduce((sum, item) => sum + item.availableForAssignmentQty, 0);
      const totalAssigned = fps.reduce((sum, item) => sum + item.assignedToEmployeeQty, 0);
      if (totalAvail > 0 || totalAssigned === 0) {
        throw new Error(`Invoices can only be created IF AND ONLY IF ALL finished items from Lot ${data.lotNumber} are assigned to employees. Currently ${totalAvail} pcs are still unassigned.`);
      }
    }

    const subtotal = Number(data.subtotalAmount || (Number(data.totalItemsQuantity) * Number(data.ratePerItem)));
    const tax = Number(data.taxAmount || 0);
    const discount = Number(data.discountAmount || 0);
    const finalNet = Number(data.finalNetPayableAmount || (subtotal + tax - discount));

    const initialPaid = Math.min(finalNet, Math.max(0, Number(data.initialPaidAmount || 0)));
    const due = Math.max(0, finalNet - initialPaid);

    let status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' = 'UNPAID';
    if (due === 0) {
      status = 'PAID';
    } else if (initialPaid > 0) {
      status = 'PARTIALLY_PAID';
    }

    const now = new Date().toISOString();
    const newInvoice: Invoice = {
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      wholesalerId: data.wholesalerId,
      wholesalerName: data.wholesalerName,
      lotNumber: data.lotNumber,
      totalItemsQuantity: Number(data.totalItemsQuantity),
      ratePerItem: Number(data.ratePerItem),
      subtotalAmount: subtotal,
      taxAmount: tax,
      discountAmount: discount,
      finalNetPayableAmount: finalNet,
      paidAmount: initialPaid,
      dueAmount: due,
      paymentStatus: status,
      notes: data.notes,
      id: 'inv_' + Date.now(),
      createdAt: now
    };

    setStorage(STORAGE_KEYS.INVOICES, [newInvoice, ...invoices]);

    if (initialPaid > 0) {
      const newPayment: WholesalerPayment = {
        id: 'wsp_' + Date.now(),
        invoiceId: newInvoice.id,
        wholesalerId: newInvoice.wholesalerId,
        wholesalerName: newInvoice.wholesalerName,
        paymentDate: data.invoiceDate || new Date().toISOString().split('T')[0],
        amountPaid: initialPaid,
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: 'ADV-' + Math.floor(100000 + Math.random() * 900000),
        notes: `Advance / Initial payment recorded at invoice creation`,
        createdAt: now
      };
      setStorage(STORAGE_KEYS.WHOLESALER_PAYMENTS, [newPayment, ...erpService.getWholesalerPayments()]);
    }

    return newInvoice;
  },

  updateInvoice: (id: string, data: Partial<Invoice>): void => {
    const invoices = getStorage<Invoice>(STORAGE_KEYS.INVOICES, []);
    const updated = invoices.map(inv => {
      if (inv.id === id) {
        const subtotal = data.subtotalAmount !== undefined ? Number(data.subtotalAmount) : inv.subtotalAmount;
        const tax = data.taxAmount !== undefined ? Number(data.taxAmount) : inv.taxAmount;
        const discount = data.discountAmount !== undefined ? Number(data.discountAmount) : inv.discountAmount;
        const finalNet = data.finalNetPayableAmount !== undefined ? Number(data.finalNetPayableAmount) : (subtotal + tax - discount);
        const paid = data.paidAmount !== undefined ? Number(data.paidAmount) : inv.paidAmount;
        const due = Math.max(0, finalNet - paid);
        let status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' = inv.paymentStatus;
        if (due === 0) status = 'PAID';
        else if (paid > 0) status = 'PARTIALLY_PAID';
        else status = 'UNPAID';

        return {
          ...inv,
          ...data,
          subtotalAmount: subtotal,
          taxAmount: tax,
          discountAmount: discount,
          finalNetPayableAmount: finalNet,
          paidAmount: paid,
          dueAmount: due,
          paymentStatus: status
        };
      }
      return inv;
    });
    setStorage(STORAGE_KEYS.INVOICES, updated);
  },

  recordWholesalerPayment: (data: Omit<WholesalerPayment, 'id' | 'createdAt'>): WholesalerPayment => {
    const invoices = erpService.getInvoices();
    const inv = invoices.find(i => i.id === data.invoiceId);
    if (!inv) {
      throw new Error('Invoice not found.');
    }

    const payAmount = Number(data.amountPaid);
    if (payAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    if (payAmount > inv.dueAmount) {
      throw new Error(`Payment amount (₹${payAmount}) cannot exceed outstanding due amount (₹${inv.dueAmount}).`);
    }

    const now = new Date().toISOString();
    const newPayment: WholesalerPayment = {
      ...data,
      amountPaid: payAmount,
      id: 'wsp_' + Date.now(),
      createdAt: now
    };

    // Update Invoice payment state
    const updatedInvoices = invoices.map(item => {
      if (item.id === inv.id) {
        const newPaid = item.paidAmount + payAmount;
        const newDue = Math.max(0, item.finalNetPayableAmount - newPaid);
        let status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' = 'PARTIALLY_PAID';
        if (newDue === 0) status = 'PAID';
        else if (newPaid === 0) status = 'UNPAID';

        return {
          ...item,
          paidAmount: newPaid,
          dueAmount: newDue,
          paymentStatus: status
        };
      }
      return item;
    });

    setStorage(STORAGE_KEYS.WHOLESALER_PAYMENTS, [newPayment, ...erpService.getWholesalerPayments()]);
    setStorage(STORAGE_KEYS.INVOICES, updatedInvoices);

    return newPayment;
  },

  updateInvoicePaymentStatusDirectly: (
    invoiceId: string,
    status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID',
    customPaidAmount?: number
  ): Invoice => {
    const invoices = erpService.getInvoices();
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) {
      throw new Error('Invoice not found.');
    }

    let newPaid = inv.paidAmount;
    if (status === 'PAID') {
      newPaid = inv.finalNetPayableAmount;
    } else if (status === 'UNPAID') {
      newPaid = 0;
    } else if (customPaidAmount !== undefined) {
      newPaid = Math.min(inv.finalNetPayableAmount, Math.max(0, customPaidAmount));
    }

    const newDue = Math.max(0, inv.finalNetPayableAmount - newPaid);
    let finalStatus = status;
    if (newDue === 0) finalStatus = 'PAID';
    else if (newPaid === 0) finalStatus = 'UNPAID';
    else finalStatus = 'PARTIALLY_PAID';

    // If new payment occurred, create a wholesaler payment record if paid > prev paid
    if (newPaid > inv.paidAmount) {
      const addedPay = newPaid - inv.paidAmount;
      const now = new Date().toISOString();
      const newPayment: WholesalerPayment = {
        id: 'wsp_' + Date.now(),
        invoiceId: inv.id,
        wholesalerId: inv.wholesalerId,
        wholesalerName: inv.wholesalerName,
        paymentDate: new Date().toISOString().split('T')[0],
        amountPaid: addedPay,
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: 'SETTLEMENT-' + Math.floor(100000 + Math.random() * 900000),
        notes: `Direct status update to ${finalStatus}`,
        createdAt: now
      };
      setStorage(STORAGE_KEYS.WHOLESALER_PAYMENTS, [newPayment, ...erpService.getWholesalerPayments()]);
    }

    const updatedInvoices = invoices.map(item => {
      if (item.id === invoiceId) {
        return {
          ...item,
          paidAmount: newPaid,
          dueAmount: newDue,
          paymentStatus: finalStatus
        };
      }
      return item;
    });

    setStorage(STORAGE_KEYS.INVOICES, updatedInvoices);
    const updated = updatedInvoices.find(i => i.id === invoiceId);
    return updated!;
  },

  // Employee Salary & Upaad
  getUpaadRecords: (): UpaadRecord[] => getStorage<UpaadRecord>(STORAGE_KEYS.UPAAD_RECORDS, []),
  getSalaryRecords: (): SalaryRecord[] => getStorage<SalaryRecord>(STORAGE_KEYS.SALARY_RECORDS, []),
  getSalaryPayments: (): SalaryPayment[] => getStorage<SalaryPayment>(STORAGE_KEYS.SALARY_PAYMENTS, []),

  addUpaad: (data: Omit<UpaadRecord, 'id' | 'createdAt'>): UpaadRecord => {
    const list = erpService.getUpaadRecords();
    const newItem: UpaadRecord = {
      ...data,
      amount: Number(data.amount),
      id: 'up_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setStorage(STORAGE_KEYS.UPAAD_RECORDS, [newItem, ...list]);
    return newItem;
  },

  generateMonthlySalary: (employeeId: string, month: string): SalaryRecord => {
    const employees = erpService.getEmployees();
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) {
      throw new Error('Employee not found.');
    }

    const salaryRecords = erpService.getSalaryRecords();
    const existing = salaryRecords.find(s => s.employeeId === employeeId && s.month === month);
    if (existing) {
      return existing; // Return existing salary record
    }

    // Calculate total upaad taken in this month
    const upaadList = erpService.getUpaadRecords().filter(u => {
      if (u.employeeId !== employeeId) return false;
      return u.date.startsWith(month);
    });

    const totalUpaad = upaadList.reduce((sum, u) => sum + Number(u.amount), 0);
    const netSalary = Math.max(0, emp.baseSalary - totalUpaad);

    const now = new Date().toISOString();
    const newSalary: SalaryRecord = {
      id: 'sal_' + Date.now(),
      employeeId: emp.id,
      employeeName: emp.name,
      month: month,
      baseSalary: emp.baseSalary,
      totalUpaadDeducted: totalUpaad,
      netPayableSalary: netSalary,
      paidAmount: 0,
      remainingAmount: netSalary,
      status: 'PENDING',
      generatedDate: new Date().toISOString().split('T')[0],
      createdAt: now
    };

    setStorage(STORAGE_KEYS.SALARY_RECORDS, [newSalary, ...salaryRecords]);
    return newSalary;
  },

  recordSalaryPayment: (data: Omit<SalaryPayment, 'id' | 'createdAt'>): SalaryPayment => {
    const records = erpService.getSalaryRecords();
    const record = records.find(r => r.id === data.salaryRecordId);
    if (!record) {
      throw new Error('Salary record not found.');
    }

    const payAmount = Number(data.amountPaid);
    if (payAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }
    if (payAmount > record.remainingAmount) {
      throw new Error(`Payment amount (₹${payAmount}) exceeds remaining salary balance (₹${record.remainingAmount}).`);
    }

    const now = new Date().toISOString();
    const newPayment: SalaryPayment = {
      ...data,
      amountPaid: payAmount,
      id: 'sp_' + Date.now(),
      createdAt: now
    };

    const updatedRecords = records.map(r => {
      if (r.id === record.id) {
        const newPaid = r.paidAmount + payAmount;
        const newRem = Math.max(0, r.netPayableSalary - newPaid);
        let status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' = 'PARTIALLY_PAID';
        if (newRem === 0) status = 'PAID';
        else if (newPaid === 0) status = 'PENDING';

        return {
          ...r,
          paidAmount: newPaid,
          remainingAmount: newRem,
          status
        };
      }
      return r;
    });

    setStorage(STORAGE_KEYS.SALARY_PAYMENTS, [newPayment, ...erpService.getSalaryPayments()]);
    setStorage(STORAGE_KEYS.SALARY_RECORDS, updatedRecords);

    return newPayment;
  },

  // Calculate Comprehensive Lot Status & Lifecycle Details
  getLotLifecycle: (lotNumber: string): LotLifecycle | null => {
    const purchase = erpService.getPurchases().find(p => p.lotNumber === lotNumber);
    if (!purchase) return null;

    const rawMaterial = erpService.getRawMaterials().find(rm => rm.lotNumber === lotNumber);
    const rawMaterialDamages = erpService.getRawMaterialDamages().filter(rmd => rmd.lotNumber === lotNumber);
    const cuttings = erpService.getCuttings().filter(c => c.lotNumber === lotNumber);
    const cutPieces = erpService.getCutPieces().find(cp => cp.lotNumber === lotNumber);
    const tailorAssignments = erpService.getTailorAssignments().filter(ta => ta.lotNumber === lotNumber);
    const stitchings = erpService.getStitchings().filter(s => s.lotNumber === lotNumber);
    const finishedProducts = erpService.getFinishedProducts().filter(fp => fp.lotNumber === lotNumber);
    const finishedProduct = finishedProducts.length > 0 ? finishedProducts[0] : undefined;
    const finishedProductDamages = erpService.getFinishedProductDamages().filter(fpd => fpd.lotNumber === lotNumber);
    const employeeAssignments = erpService.getEmployeeAssignments().filter(ea => ea.lotNumber === lotNumber);
    const invoice = erpService.getInvoices().find(inv => inv.lotNumber === lotNumber);
    const wholesalerPayments = erpService.getWholesalerPayments().filter(p => {
      if (invoice) return p.invoiceId === invoice.id;
      return false;
    });

    // Accounted for check across all finished product entries for this lot
    const totalStitched = finishedProducts.reduce((sum, fp) => sum + fp.totalStitchedQty, 0);
    const damagedFP = finishedProducts.reduce((sum, fp) => sum + fp.damagedQuantity, 0);
    const assignedEmp = finishedProducts.reduce((sum, fp) => sum + fp.assignedToEmployeeQty, 0);
    const isAllGoodFinishedAccountedFor = totalStitched > 0 && (damagedFP + assignedEmp === totalStitched);

    // Calculate Status
    let status: LotStatus = 'PURCHASED';

    const hasIncompleteTailorAssignments = tailorAssignments.some(ta => {
      const completed = ta.completedPiecesQty !== undefined
        ? ta.completedPiecesQty
        : stitchings.filter(s => s.tailorAssignmentId === ta.id).reduce((sum, s) => sum + s.stitchedGoodPiecesQty + s.defectivePiecesQty, 0);
      return ta.assignedPiecesQty > completed;
    });

    if (invoice) {
      if (invoice.paymentStatus === 'PAID') {
        status = 'PAID';
      } else {
        status = 'INVOICED';
      }
    } else if (isAllGoodFinishedAccountedFor || (finishedProduct && finishedProduct.status === 'READY_FOR_INVOICE')) {
      status = 'READY_FOR_INVOICE';
    } else if (employeeAssignments.length > 0) {
      status = 'EMPLOYEE_ASSIGNED';
    } else if (finishedProduct && !hasIncompleteTailorAssignments) {
      status = 'FINISHED_GOODS';
    } else if (stitchings.length > 0 || hasIncompleteTailorAssignments) {
      status = 'STITCHING_IN_PROGRESS';
    } else if (tailorAssignments.length > 0) {
      status = 'TAILOR_ASSIGNED';
    } else if (cutPieces) {
      const isCuttingIncomplete = cutPieces.cuttingStatus === 'CUTTING_IN_PROGRESS' || (cutPieces.readyCutPieces !== undefined && cutPieces.readyCutPieces < cutPieces.totalCutPieces);
      status = isCuttingIncomplete ? 'CUTTING_IN_PROGRESS' : 'CUT_PIECES_READY';
    } else if (cuttings.length > 0) {
      status = 'CUTTING_IN_PROGRESS';
    } else if (rawMaterial) {
      status = 'RAW_MATERIAL';
    }

    return {
      lotNumber,
      status,
      purchase,
      rawMaterial,
      rawMaterialDamages,
      cuttings,
      cutPieces,
      tailorAssignments,
      stitchings,
      finishedProduct,
      finishedProducts,
      finishedProductDamages,
      employeeAssignments,
      invoice,
      wholesalerPayments,
      isAllGoodFinishedAccountedFor
    };
  },

  getAllLotNumbers: (): string[] => {
    const purchases = erpService.getPurchases();
    return Array.from(new Set(purchases.map(p => p.lotNumber)));
  },

  getAllLotLifecycles: (): LotLifecycle[] => {
    const lotNumbers = erpService.getAllLotNumbers();
    return lotNumbers
      .map(lotNum => erpService.getLotLifecycle(lotNum))
      .filter((lc): lc is LotLifecycle => lc !== null);
  }
};
