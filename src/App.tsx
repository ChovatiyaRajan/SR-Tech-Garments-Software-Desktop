import React, { useState, useEffect } from 'react';
import { ERPLayout, NavModule } from './components/common/ERPLayout';
import { Toast } from './components/common/Toast';
import { authService, AuthUser } from './services/auth';
import { LoginView } from './components/modules/LoginView';

import { DashboardView } from './components/modules/DashboardView';
import { WholesalersView } from './components/modules/WholesalersView';
import { PurchasesView } from './components/modules/PurchasesView';
import { RawMaterialView } from './components/modules/RawMaterialView';
import { CuttingView } from './components/modules/CuttingView';
import { CutPiecesView } from './components/modules/CutPiecesView';
import { TailorsView } from './components/modules/TailorsView';
import { StitchingView } from './components/modules/StitchingView';
import { FinishedProductsView } from './components/modules/FinishedProductsView';
import { EmployeesView } from './components/modules/EmployeesView';
import { SalaryView } from './components/modules/SalaryView';
import { FinalInvoicesView } from './components/modules/FinalInvoicesView';
import { WholesalerPaymentsView } from './components/modules/WholesalerPaymentsView';
import { LotDetailView } from './components/modules/LotDetailView';
import { ReportsView } from './components/modules/ReportsView';
import { AllLotsView } from './components/modules/AllLotsView';

const VALID_PROTECTED_MODULES: NavModule[] = [
  'dashboard',
  'all_lots',
  'wholesalers',
  'tailors',
  'employees',
  'purchases',
  'raw_materials',
  'cutting',
  'cut_pieces',
  'stitching',
  'finished_products',
  'salary',
  'invoices',
  'wholesaler_payments',
  'reports',
  'lot_detail'
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [activeModule, setActiveModule] = useState<NavModule>(() => authService.isAuthenticated() ? 'dashboard' : 'login');
  const [activeLotNumber, setActiveLotNumber] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  // Synchronize route hash & protect unauthenticated/authenticated routes
  useEffect(() => {
    const syncRouteWithHash = () => {
      const rawHash = window.location.hash.replace('#', '').trim();

      if (!isAuthenticated) {
        if (rawHash !== 'login') {
          window.location.hash = 'login';
        }
        setActiveModule('login');
        return;
      }

      // Authenticated case
      if (!rawHash || rawHash === 'login') {
        window.location.hash = 'dashboard';
        setActiveModule('dashboard');
        return;
      }

      if (VALID_PROTECTED_MODULES.includes(rawHash as NavModule)) {
        setActiveModule(rawHash as NavModule);
      } else {
        window.location.hash = 'dashboard';
        setActiveModule('dashboard');
      }
    };

    syncRouteWithHash();
    window.addEventListener('hashchange', syncRouteWithHash);
    return () => window.removeEventListener('hashchange', syncRouteWithHash);
  }, [isAuthenticated]);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    window.location.hash = 'dashboard';
    setActiveModule('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    window.location.hash = 'login';
    setActiveModule('login');
    showToast('Logged out of SR Tech Garment Software successfully.');
  };

  const handleNavigate = (module: NavModule, lotNumParam?: string) => {
    if (!isAuthenticated) {
      window.location.hash = 'login';
      setActiveModule('login');
      return;
    }

    if (module === 'login') {
      window.location.hash = 'dashboard';
      setActiveModule('dashboard');
      return;
    }

    if (lotNumParam) {
      setActiveLotNumber(lotNumParam);
    } else if (module !== 'lot_detail') {
      setActiveLotNumber(null);
    }

    window.location.hash = module;
    setActiveModule(module);
  };

  const handleViewLot = (lotNum: string) => {
    if (!isAuthenticated) {
      window.location.hash = 'login';
      setActiveModule('login');
      return;
    }
    setActiveLotNumber(lotNum);
    window.location.hash = 'lot_detail';
    setActiveModule('lot_detail');
  };

  // Render Login View if not authenticated
  if (!isAuthenticated || activeModule === 'login') {
    return (
      <div className="min-h-screen bg-slate-950">
        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        )}
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          showToast={showToast}
        />
      </div>
    );
  }

  return (
    <ERPLayout
      activeModule={activeModule}
      onNavigate={handleNavigate}
      selectedLotNumber={activeLotNumber}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {activeModule === 'dashboard' && (
        <DashboardView
          onNavigate={handleNavigate}
          onViewLot={handleViewLot}
          showToast={showToast}
        />
      )}

      {activeModule === 'all_lots' && (
        <AllLotsView
          showToast={showToast}
          onViewLot={handleViewLot}
          onNavigate={handleNavigate}
        />
      )}

      {activeModule === 'wholesalers' && (
        <WholesalersView
          showToast={showToast}
          onViewLot={handleViewLot}
        />
      )}

      {activeModule === 'purchases' && (
        <PurchasesView
          showToast={showToast}
          onViewLot={handleViewLot}
          onNavigateToRawMaterial={() => handleNavigate('raw_materials')}
        />
      )}

      {activeModule === 'raw_materials' && (
        <RawMaterialView
          showToast={showToast}
          onViewLot={handleViewLot}
          onNavigateToCutting={() => handleNavigate('cutting')}
        />
      )}

      {activeModule === 'cutting' && (
        <CuttingView
          showToast={showToast}
          onViewLot={handleViewLot}
          onNavigateToCutPieces={() => handleNavigate('cut_pieces')}
        />
      )}

      {activeModule === 'cut_pieces' && (
        <CutPiecesView
          showToast={showToast}
          onViewLot={handleViewLot}
          onNavigateToStitching={() => handleNavigate('stitching')}
        />
      )}

      {activeModule === 'tailors' && (
        <TailorsView
          showToast={showToast}
          onViewLot={handleViewLot}
        />
      )}

      {activeModule === 'stitching' && (
        <StitchingView
          showToast={showToast}
          onViewLot={handleViewLot}
          onNavigateToFinishedGoods={() => handleNavigate('finished_products')}
        />
      )}

      {activeModule === 'finished_products' && (
        <FinishedProductsView
          showToast={showToast}
          onViewLot={handleViewLot}
          onNavigateToInvoice={() => handleNavigate('invoices')}
        />
      )}

      {activeModule === 'employees' && (
        <EmployeesView
          showToast={showToast}
          onViewLot={handleViewLot}
        />
      )}

      {activeModule === 'salary' && (
        <SalaryView
          showToast={showToast}
        />
      )}

      {activeModule === 'invoices' && (
        <FinalInvoicesView
          showToast={showToast}
          onViewLot={handleViewLot}
          onNavigateToPayments={() => handleNavigate('wholesaler_payments')}
        />
      )}

      {activeModule === 'wholesaler_payments' && (
        <WholesalerPaymentsView
          showToast={showToast}
          onViewLot={handleViewLot}
        />
      )}

      {activeModule === 'reports' && (
        <ReportsView />
      )}

      {activeModule === 'lot_detail' && activeLotNumber && (
        <LotDetailView
          lotNumber={activeLotNumber}
          onBack={() => handleNavigate('purchases')}
          onNavigate={handleNavigate}
        />
      )}
    </ERPLayout>
  );
}
