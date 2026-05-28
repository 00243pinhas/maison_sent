import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { RequireRole } from '@/components/layout/require-role';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductsPage } from '@/features/products/pages/products-page';
import { CategoriesPage } from '@/features/categories/pages/categories-page';
import { SuppliersPage } from '@/features/suppliers/pages/suppliers-page';
import { LocationsPage } from '@/features/locations/pages/locations-page';
import { InventoryPage } from '@/features/inventory/pages/inventory-page';
import { TransfersPage } from '@/features/transfers/pages/transfers-page';
import { NewTransferPage } from '@/features/transfers/pages/new-transfer-page';
import { TransferDetailPage } from '@/features/transfers/pages/transfer-detail-page';
import { ReportsLayout } from '@/features/reports/pages/reports-layout';
import { NotificationsPage } from '@/features/notifications/pages/notifications-page';
import { JobsPage } from '@/features/jobs/pages/jobs-page';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/transfers" element={<TransfersPage />} />
          <Route path="/transfers/new" element={<NewTransferPage />} />
          <Route path="/transfers/:id" element={<TransferDetailPage />} />
          <Route path="/reports" element={<ReportsLayout />} />
          <Route path="/reports/:slug" element={<ReportsLayout />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route
            path="/jobs"
            element={
              <RequireRole role="SUPER_ADMIN">
                <JobsPage />
              </RequireRole>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
