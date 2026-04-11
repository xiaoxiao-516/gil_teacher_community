import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { ArticleDetailFullPage } from './pages/ArticleDetailPage';
import { CommunityFeedLayout } from './pages/CommunityFeedLayout';
import { CommunityPadFeedLayout } from './pages/CommunityPadFeedLayout';
import { CommunityShell } from './pages/CommunityShell';
import { PlaceholderPage } from './pages/PlaceholderPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/community" replace />} />
        <Route path="assign" element={<PlaceholderPage title="布置" />} />
        <Route path="class" element={<PlaceholderPage title="上课" />} />
        <Route path="report" element={<PlaceholderPage title="报告" />} />
        <Route path="resources" element={<PlaceholderPage title="资源" />} />
        <Route path="situation" element={<PlaceholderPage title="学情" />} />
        <Route path="student-community" element={<PlaceholderPage title="学生社区" />} />
        <Route path="community" element={<CommunityShell />}>
          <Route element={<CommunityFeedLayout />}>
            <Route index element={null} />
            <Route path="submit" element={null} />
            <Route path=":postId" element={null} />
          </Route>
        </Route>
        <Route path="community-pad" element={<CommunityShell />}>
          <Route element={<CommunityPadFeedLayout />}>
            <Route index element={null} />
            <Route path="submit" element={null} />
            <Route path=":postId" element={<ArticleDetailFullPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/community" replace />} />
    </Routes>
  );
}
