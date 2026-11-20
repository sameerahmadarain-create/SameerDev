/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRouter } from './hooks/useRouter';
import { HomePage } from './pages/HomePage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export default function App() {
  const { currentPath, currentHash, navigate, isProjectDetail, projectId } = useRouter();

  let page: React.ReactNode = <NotFoundPage onNavigate={navigate} />;

  if (currentPath === '/' || currentPath === '') {
    page = <HomePage onNavigate={navigate} currentHash={currentHash} />;
  } else if (isProjectDetail && projectId) {
    page = <ProjectDetailPage projectId={projectId} onNavigate={navigate} />;
  } else if (currentPath === '/admin' || currentPath === '/admin/') {
    page = <AdminPage onNavigate={navigate} />;
  }

  return <ErrorBoundary>{page}</ErrorBoundary>;
}
