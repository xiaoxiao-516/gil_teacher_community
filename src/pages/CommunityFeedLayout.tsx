import { Outlet, useMatch, useNavigate, useParams } from 'react-router-dom';
import { ShareFeedbackModal } from '../components/ShareFeedbackModal';
import { ArticleDetailModal } from './ArticleDetailPage';
import { CommunityPage } from './CommunityPage';

/** 社区列表常驻；/community/submit 打投稿抽屉；带 postId 时叠详情弹窗 */
export function CommunityFeedLayout() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const submitMatch = useMatch({ path: '/community/submit', end: true });

  return (
    <>
      <CommunityPage />
      <Outlet />
      {submitMatch ? (
        <ShareFeedbackModal open onClose={() => navigate('/community', { replace: true })} />
      ) : null}
      {postId ? <ArticleDetailModal postId={postId} onClose={() => navigate('/community')} /> : null}
    </>
  );
}
