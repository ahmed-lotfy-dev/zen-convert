import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import ImageConverter from './pages/ImageConverter';
import VideoConverter from './pages/VideoConverter';
import YouTubeDownloader from './pages/YouTubeDownloader';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/image" element={<ImageConverter />} />
          <Route path="/video" element={<VideoConverter />} />
          <Route path="/youtube" element={<YouTubeDownloader />} />
          <Route path="/history" element={<div className="text-2xl font-bold">History (Coming Soon)</div>} />
          <Route path="/settings" element={<div className="text-2xl font-bold">Settings (Coming Soon)</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
