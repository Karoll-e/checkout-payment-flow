import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductPage from './pages/ProductPage';
import SummaryPage from './pages/SummaryPage';
// import StatusPage from './pages/StatusPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductPage />} />
        <Route path="/summary" element={<SummaryPage />} />
        {/* <Route path="/status" element={<StatusPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;