import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ConvertPage } from './pages/ConvertPage';
import { LibraryPage } from './pages/LibraryPage';
import { VolunteerPage } from './pages/VolunteerPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="convert" element={<ConvertPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="volunteer" element={<VolunteerPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
