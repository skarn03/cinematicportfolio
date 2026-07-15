import { lazy, Suspense } from "react";
import GrainOverlay from "./components/GrainOverlay";
import CustomCursor from "./components/CustomCursor";
import SoundToggle from "./components/SoundToggle";
import { CursorProvider } from "./story/CursorContext";
import { ChapterThemeProvider } from "./story/ChapterTheme";

const Experience = lazy(() => import("./components/Experience"));

function App() {
  return (
    <ChapterThemeProvider>
      <CursorProvider>
        <GrainOverlay />
        <CustomCursor />

        <div className="pointer-events-auto fixed right-4 top-4 z-50 md:right-6 md:top-6">
          <SoundToggle />
        </div>

        <Suspense fallback={<div className="fixed inset-0 z-40 bg-ink" />}>
          <Experience />
        </Suspense>
      </CursorProvider>
    </ChapterThemeProvider>
  );
}

export default App;
