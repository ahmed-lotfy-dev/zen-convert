import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './features/layout';
import { Home } from './features/home';
import { ImageConverter } from './features/image-converter';
import { VideoConverter } from './features/video-converter';
import { YouTubeDownloader } from './features/youtube-downloader';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/image" element={<ImageConverter />} />
          <Route path="/video" element={<VideoConverter />} />
          <Route path="/youtube" element={<YouTubeDownloader />} />
          <Route
            path="/history"
            element={<div className="text-2xl font-bold">History (Coming Soon)</div>}
          />
          <Route
            path="/settings"
            element={<div className="text-2xl font-bold">Settings (Coming Soon)</div>}
          />
        </Routes>
      </Layout>
    </Router>
  );
}
