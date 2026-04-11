import { Outlet, useMatch, useNavigate, useParams } from 'react-router-dom';
import { ShareFeedbackModal } from '../components/ShareFeedbackModal';
import { CommunityPage } from './CommunityPage';

const PAD_PREFIX = '/community-pad';

/** Pad 端社区：列表全屏；详情走子路由全屏页（非弹窗）；投稿仍为抽屉 */
export function CommunityPadFeedLayout() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const submitMatch = useMatch({ path: `${PAD_PREFIX}/submit`, end: true });

  return (
    <>
      {!postId ? <CommunityPage routePrefix={PAD_PREFIX} /> : null}
      <Outlet />
      {submitMatch ? (
        <ShareFeedbackModal open onClose={() => navigate(PAD_PREFIX, { replace: true })} />
      ) : null}
    </>
  );
}
