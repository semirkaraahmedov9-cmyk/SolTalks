import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ConvertPage } from './pages/ConvertPage';
import { LibraryPage } from './pages/LibraryPage';
import { VolunteerPage } from './pages/VolunteerPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { TestPage } from './pages/TestPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="convert" element={<ConvertPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="volunteer" element={<VolunteerPage />} />
        <Route path="about" element={<AboutPage />} />
        {/* Temporary Phase 1 voice test; not linked in the navigation. */}
        <Route path="test" element={<TestPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
