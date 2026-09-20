import { AppProvider, useApp } from "./state/AppContext.jsx";
import LoadingSplash from "./components/LoadingSplash.jsx";
import TitleBar from "./components/TitleBar.jsx";
import NotificationCenter from "./components/NotificationCenter.jsx";
import ActivityBar from "./components/ActivityBar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import EditorArea from "./components/EditorArea.jsx";
import TerminalPanel from "./components/TerminalPanel.jsx";
import StatusBar from "./components/StatusBar.jsx";
import ScrollTop from "./components/ScrollTop.jsx";
import Toasts from "./components/Toasts.jsx";
import CommandPalette from "./components/overlays/CommandPalette.jsx";
import SearchOverlay from "./components/overlays/SearchOverlay.jsx";
import SettingsModal from "./components/overlays/SettingsModal.jsx";
import ProjectModal from "./components/overlays/ProjectModal.jsx";
import MobileDrawer from "./components/overlays/MobileDrawer.jsx";

/* ═══════ Page shell ═══════
   Same DOM order as the legacy index.html: loading splash, title bar,
   notification centre, workbench (activity bar + explorer + editor), terminal
   panel, status bar and then the fixed overlays / toasts / floating buttons. */
function Portfolio() {
  const { loading } = useApp();

  return (
    <>
      <LoadingSplash loading={loading} />
      <TitleBar />
      <NotificationCenter />

      <div className="workbench">
        <ActivityBar />
        <Sidebar />
        <EditorArea />
      </div>

      <TerminalPanel />
      <StatusBar />

      <CommandPalette />
      <SearchOverlay />
      <SettingsModal />
      <ProjectModal />

      <Toasts />
      <ScrollTop />
      <MobileDrawer />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Portfolio />
    </AppProvider>
  );
}
