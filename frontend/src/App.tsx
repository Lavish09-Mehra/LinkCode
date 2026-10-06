import { LinkCodeApp } from './pages/app.tsx';
import { HomePage } from './pages/Home.tsx';
import { LoginUserInfo } from './pages/login.tsx';
import { SignUpPage } from './pages/signup.tsx';
import { NotFound } from './pages/NotFound.tsx';
import { PageGuard } from "./components/pageGuard";
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import './App.css';   // 👈 the CSS below

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="route-wrapper" key={location.pathname}>
      <Routes location={location}>

        <Route path="/" element={<HomePage />} />
        <Route path="/app" element={
          <PageGuard>
            <LinkCodeApp />
          </PageGuard>
        } />

        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<LoginUserInfo />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;