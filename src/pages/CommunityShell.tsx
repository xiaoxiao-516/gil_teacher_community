import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { CommunityFeedProvider, resetCommunityFeedSession } from '../context/CommunityFeedContext';
import { CommunityLikesProvider } from '../context/CommunityLikesContext';

export function CommunityShell() {
  useEffect(() => {
    return () => {
      resetCommunityFeedSession();
    };
  }, []);

  return (
    <CommunityLikesProvider>
      <CommunityFeedProvider>
        <Outlet />
      </CommunityFeedProvider>
    </CommunityLikesProvider>
  );
}
