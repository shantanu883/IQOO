import { useCallback, useState } from "react";
import { Outlet, useOutletContext, useNavigate } from "react-router-dom";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { PostComposerDialog } from "@/components/feed/PostComposerDialog";
import type { Post } from "@/types";

/** Context handed to routed pages via <Outlet />. */
export interface AppOutletContext {
  /** Bumps whenever a new post is created — feed pages refetch on change. */
  feedVersion: number;
  openComposer: () => void;
}

export function useAppOutlet() {
  return useOutletContext<AppOutletContext>();
}

export function AppLayout() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [feedVersion, setFeedVersion] = useState(0);
  const navigate = useNavigate();

  const openComposer = useCallback(() => setComposerOpen(true), []);

  const handleCreated = useCallback(
    (_post: Post) => {
      setFeedVersion((v) => v + 1);
      navigate("/");
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1360px]">
        <LeftSidebar onCreate={openComposer} />

        <div className="flex min-w-0 flex-1 flex-col border-x border-border/40">
          <TopBar onCreate={openComposer} />
          <main className="flex-1 px-4 pb-24 pt-5 md:px-6 lg:pb-10">
            <Outlet context={{ feedVersion, openComposer }} />
          </main>
        </div>

        <RightSidebar />
      </div>

      <MobileNav onCreate={openComposer} />

      <PostComposerDialog
        open={composerOpen}
        onOpenChange={setComposerOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
