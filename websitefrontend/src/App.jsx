import React, { useState, createContext } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Loader from './components/Loader';
import Card from './components/Card';
import WhyChooseUs from './components/WhyChooseUs';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import ReportPage from './components/ReportPage';
import AIChatPage from './components/AIChatPage';
import RiskDashboard from './components/RiskDashboard';
import AppQR from './assets/appqr.png';
import WhatsAppIcon from './assets/whatsapp.png';
import TelegramIcon from './assets/telegram.png';
import Logo from './assets/logo.png';

// ── Auth Context ──────────────────────────────────────
export const AuthContext = createContext(null);

// ── Navbar Component ──────────────────────────────────
const Navbar = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  return (
    <NavWrapper>
      <LogoBox onClick={() => navigate('/')}>
        <LogoIcon src={Logo} alt="SevaSetu Logo" />
        <LogoText>Seva<LogoAccent>Setu</LogoAccent></LogoText>
      </LogoBox>
      <NavRight>
        {user ? (
          <>
            <NavAvatar src={user.photoURL} alt={user.displayName} />
            <NavButtonOutline onClick={() => navigate('/risk-dashboard')}>Live Risk Prediction</NavButtonOutline>
            <NavButton onClick={() => navigate('/dashboard')}>Dashboard</NavButton>
            <NavButtonOutline onClick={onSignOut}>Sign Out</NavButtonOutline>
          </>
        ) : (
          <>
            <NavButtonOutline onClick={() => navigate('/risk-dashboard')}>Live Risk Prediction</NavButtonOutline>
            <NavButton onClick={() => navigate('/auth')}>Sign In</NavButton>
          </>
        )}
      </NavRight>
    </NavWrapper>
  );
};

// ── Landing Page Component ────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <GlobalBackground />
      <GridPattern />
      <Blob />

      <HeroSection>
        <LeftPanel>
          <Badge>Community Service Platform</Badge>
          <ProjectName>
            Seva<br />
            <span>Setu</span>
          </ProjectName>
          <OneLiner>
            Bridge the gap between citizens and civic action. Monitor your inbox for survey emails and transform them into AI-powered structured reports — automatically.
          </OneLiner>
          <div style={{ display: 'flex', gap: '15px' }}>
            <ActionButton onClick={() => navigate('/auth')}>Get Started</ActionButton>
            <ActionButton style={{ background: 'transparent', color: '#F07B11', border: '2px solid rgba(240,123,17,0.3)', boxShadow: 'none' }} onClick={() => navigate('/risk-dashboard')}>Live Risk Prediction</ActionButton>
          </div>
        </LeftPanel>

        <RightPanel>
          <RightContentBox>
            <Tagline>AI-Powered Volunteer & NGO Coordination</Tagline>
            <LoaderWrapper>
              <Loader />
            </LoaderWrapper>
            <Pedestal />
          </RightContentBox>
        </RightPanel>
      </HeroSection>

      <FeaturesSectionContainer id="features">
        <FeaturesHeading>Our <span>Features</span></FeaturesHeading>
        <FeaturesSubHeading>
          From email inbox to structured civic reports — powered by AI, designed for communities.
        </FeaturesSubHeading>
        <Card />
      </FeaturesSectionContainer>

      <WhyChooseUs />

      <GrievanceSectionContainer id="grievance">
        <GrievanceHeading>Easy Citizen <span>Grievance</span></GrievanceHeading>
        <GrievanceSubHeading>
          Report issues instantly via our AI-powered bots. Choose your preferred platform to get started.
        </GrievanceSubHeading>
        <BotsGrid>
          <GrievanceBot
            brand="WhatsApp"
            primaryColor="#25D366"
            icon="💬"
            brandIcon={WhatsAppIcon}
            description="Instant reporting via our encrypted WhatsApp interface."
            placeholder="Report a grievance via WhatsApp..."
            link="https://wa.me/14155238886?text=join%20discover-brother"
            instruction="Send 'join' first, then send 'Hi' once registered."
          />
          <GrievanceBot
            brand="Telegram"
            primaryColor="#0088cc"
            icon="✈️"
            brandIcon={TelegramIcon}
            description="Fast, reliable grievance tracking on Telegram."
            placeholder="Start a report on Telegram..."
            link="https://t.me/zahidreporterbot?start=start"
          />
        </BotsGrid>
      </GrievanceSectionContainer>

      <DownloadSection id="download">
        <DownloadContent>
          <DownloadInfo>
            <DownloadTitle>Take SevaSetu <span>Anywhere</span></DownloadTitle>
            <DownloadDesc>
              Report civic issues, track progress, and coordinate with volunteers directly from your mobile device. Our AI-powered app makes community service simpler than ever.
            </DownloadDesc>
            <DownloadLink
              href="https://drive.google.com/drive/folders/1EI4LZyepn_OYs9qMIM_90EPV8Hc_dg5u?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download APK
            </DownloadLink>

            <CredentialsBox>
              <CredTitle>Walkthrough Credentials</CredTitle>
              <CredItem>
                <span className="label">Volunteer</span>
                <span className="value">hassan@gmail.com (pass123)</span>
              </CredItem>
              <CredItem>
                <span className="label">Supervisor</span>
                <span className="value">deepak@ngo.com (pass123)</span>
              </CredItem>
            </CredentialsBox>
          </DownloadInfo>
          <MobileMockupContainer>
            <MobileMockup />
          </MobileMockupContainer>
        </DownloadContent>
      </DownloadSection>

      <Footer>
        <FooterContent>
          <FooterLogo>
            <img src={Logo} alt="SevaSetu Logo" style={{ width: '40px', height: '40px', marginBottom: '10px' }} />
            <div>Seva<span>Setu</span></div>
          </FooterLogo>
          <FooterText>Bridging communities with intelligent civic engagement.</FooterText>
          <FooterCopyright>© 2026 SevaSetu. All rights reserved.</FooterCopyright>
        </FooterContent>
      </Footer>
    </>
  );
};

// ── Protected Route ───────────────────────────────────
const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

// ── App ───────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sevasetu_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [userRole, setUserRole] = useState(() => localStorage.getItem('sevasetu_role') || null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('sevasetu_token') || null);

  // Auto-save to localStorage whenever auth state changes
  React.useEffect(() => {
    if (user && accessToken) {
      localStorage.setItem('sevasetu_user', JSON.stringify(user));
      localStorage.setItem('sevasetu_role', userRole || '');
      localStorage.setItem('sevasetu_token', accessToken);
    }
  }, [user, userRole, accessToken]);

  const handleSignOut = () => {
    setUser(null);
    setUserRole(null);
    setAccessToken(null);
    localStorage.removeItem('sevasetu_user');
    localStorage.removeItem('sevasetu_role');
    localStorage.removeItem('sevasetu_token');
    localStorage.removeItem(`cache_${user?.email}_reports`);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, userRole, setUserRole, accessToken, setAccessToken }}>
      <MainWrapper>
        <Navbar user={user} onSignOut={handleSignOut} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={
            user ? <Navigate to="/dashboard" replace /> : <AuthPage />
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/report/:id" element={<ReportPage />} />
          <Route path="/ai-assistant" element={
            <ProtectedRoute user={user}>
              <AIChatPage />
            </ProtectedRoute>
          } />
          <Route path="/risk-dashboard" element={<RiskDashboard />} />
        </Routes>
      </MainWrapper>
    </AuthContext.Provider>
  );
}

// ── Styled Components ─────────────────────────────────
const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: hidden;
  background-color: #F5F5F5;
  position: relative;
  min-height: 100vh;
`;

// ── Navbar Styles ─────────────────────────────────────
const NavWrapper = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 6%;
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg, #F07B11 0%, #e06c09 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 15px rgba(240, 123, 17, 0.2);
`;

const LogoBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover { transform: scale(1.03); }
`;

const LogoIcon = styled.img`
  width: 42px;
  height: 42px;
  object-fit: contain;
`;

const LogoText = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: white;
  letter-spacing: -1px;
`;

const LogoAccent = styled.span`
  color: #ffe0c2;
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NavButton = styled.button`
  padding: 10px 24px;
  background: white;
  color: #F07B11;
  border: none;
  border-radius: 25px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    background: #fff8f2;
  }
`;

const NavButtonOutline = styled.button`
  padding: 9px 22px;
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 25px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: white;
  }
`;

const NavAvatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(240, 123, 17, 0.3);
  object-fit: cover;
`;

// ── Hero Section ──────────────────────────────────────
const HeroSection = styled.div`
  display: flex;
  min-height: auto;
  padding: 80px 0 40px 0;
  width: 100%;
  color: #333;
  margin: 0;
  font-family: 'Inter', sans-serif;
  position: relative;
  @media (max-width: 960px) {
    flex-direction: column;
    overflow-y: auto;
    padding: 60px 0 20px 0;
  }
`;

const GlobalBackground = styled.div`
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
  background: 
    radial-gradient(circle at 10% 20%, rgba(240, 123, 17, 0.04), transparent 35%),
    radial-gradient(circle at 90% 40%, rgba(240, 123, 17, 0.08), transparent 45%),
    linear-gradient(135deg, transparent 0%, rgba(240, 123, 17, 0.02) 100%);
`;

const Blob = styled.div`
  position: absolute;
  top: -10%; right: -10%;
  width: 70vw; height: 70vw;
  background: radial-gradient(circle, rgba(240,123,17,0.06) 0%, rgba(240,123,17,0) 70%);
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
`;

const GridPattern = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: 
    linear-gradient(to right, rgba(240, 123, 17, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(240, 123, 17, 0.08) 1px, transparent 1px);
  background-size: 40px 40px;
  z-index: 0;
  pointer-events: none;
`;

const LeftPanel = styled.div`
  flex: 0.4;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 0 2% 0 8%;
  z-index: 2;
  @media (max-width: 960px) {
    flex: 1;
    padding: 15% 5% 5% 5%;
    align-items: center;
    text-align: center;
  }
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(240, 123, 17, 0.08);
  color: #F07B11;
  border-radius: 30px;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 24px;
  box-shadow: 0 4px 15px rgba(240, 123, 17, 0.05);
  border: 1px solid rgba(240, 123, 17, 0.15);
  backdrop-filter: blur(5px);
`;

const ProjectName = styled.h1`
  font-size: clamp(3.5rem, 5vw, 6rem);
  font-weight: 900;
  color: #1a1a1a;
  margin-bottom: 24px;
  line-height: 1.05;
  letter-spacing: -2px;
  font-family: 'Outfit', sans-serif;
  span {
    background: linear-gradient(135deg, #F07B11 0%, #ff9838 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: block;
    padding-bottom: 5px;
  }
`;

const OneLiner = styled.p`
  font-size: clamp(1.1rem, 1.5vw, 1.35rem);
  color: #555;
  max-width: 90%;
  line-height: 1.6;
  font-weight: 400;
  @media (max-width: 960px) { max-width: 100%; }
`;

const ActionButton = styled.button`
  margin-top: 40px;
  padding: 16px 36px;
  background: linear-gradient(135deg, #F07B11 0%, #e06c09 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(240, 123, 17, 0.3);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  font-family: 'Inter', sans-serif;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(240, 123, 17, 0.4);
  }
`;

const RightPanel = styled.div`
  flex: 0.6;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
  @media (max-width: 960px) { flex: 1; min-height: 70vh; padding: 2rem 0; }
`;

const floatAnim = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const glow = keyframes`
  0% { text-shadow: 0 0 10px rgba(240,123,17,0.3); }
  50% { text-shadow: 0 0 25px rgba(240,123,17,0.6); }
  100% { text-shadow: 0 0 10px rgba(240,123,17,0.3); }
`;

const RightContentBox = styled.div`
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 32px;
  padding: 60px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  position: relative;
  animation: ${floatAnim} 6s ease-in-out infinite;
  @media (max-width: 480px) { padding: 40px 30px; }
`;

const Tagline = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #F07B11;
  margin-bottom: 20px;
  text-align: center;
  letter-spacing: 3px;
  text-transform: uppercase;
  animation: ${glow} 3s ease-in-out infinite;
  z-index: 10;
  font-family: 'Outfit', sans-serif;
`;

const Pedestal = styled.div`
  position: absolute;
  bottom: 40px;
  width: 250px;
  height: 40px;
  background: radial-gradient(ellipse at center, rgba(240,123,17,0.15) 0%, rgba(245,245,245,0) 70%);
  border-radius: 50%;
  filter: blur(8px);
  z-index: 1;
`;

const LoaderWrapper = styled.div`
  position: relative;
  z-index: 2;
  margin-top: 10px;
`;

const FeaturesSectionContainer = styled.div`
  width: 100%;
  padding: 40px 0 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: transparent;
  position: relative;
  z-index: 5;
`;

const FeaturesHeading = styled.h2`
  font-size: clamp(2.5rem, 4vw, 4rem);
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 10px;
  text-align: center;
  letter-spacing: -1px;
  z-index: 10;
  font-family: 'Outfit', sans-serif;
  span { color: #F07B11; }
`;

const FeaturesSubHeading = styled.p`
  color: #555;
  font-size: 1.15rem;
  max-width: 600px;
  text-align: center;
  margin-bottom: 15px;
  line-height: 1.6;
  z-index: 10;
`;

// ── Download Section ──────────────────────────────────
const DownloadSection = styled.div`
  width: 100%;
  padding: 100px 8%;
  background: transparent;
  position: relative;
  z-index: 1;
  overflow: hidden;
`;

const DownloadContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 120px;
  @media (max-width: 960px) {
    flex-direction: column;
    text-align: center;
  }
`;

const DownloadInfo = styled.div`
  flex: 1;
`;

const DownloadTitle = styled.h2`
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 24px;
  font-family: 'Outfit', sans-serif;
  span { color: #F07B11; }
`;

const DownloadDesc = styled.p`
  font-size: 1.2rem;
  color: #555;
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 500px;
  @media (max-width: 960px) { margin: 0 auto 40px auto; }
`;

const DownloadLink = styled.a`
  display: inline-block;
  padding: 16px 36px;
  background: linear-gradient(135deg, #F07B11 0%, #e06c09 100%);
  color: white;
  text-decoration: none;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 10px 25px rgba(240, 123, 17, 0.3);
  transition: all 0.3s;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(240, 123, 17, 0.4);
  }
`;

const MobileMockupContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// ── Mobile Mockup (User provided UI) ──────────────────
const MobileMockup = () => {
  return (
    <MockupWrapper>
      <div className="card">
        <div className="btn1" />
        <div className="btn2" />
        <div className="btn3" />
        <div className="btn4" />
        <div className="card-int">
          <div className="hello">
            SevaSetu
            <span className="hover-hint">Hover to get QR</span>
          </div>
          <div className="qr-overlay">
            <img src={AppQR} alt="App QR Code" />
            <p>Scan to Install</p>
          </div>
        </div>
        <div className="top">
          <div className="camera">
            <div className="int" />
          </div>
          <div className="speaker" />
        </div>
      </div>
    </MockupWrapper>
  );
};

const MockupWrapper = styled.div`
  .card {
    width: 210px;
    height: 400px;
    background: black;
    border-radius: 35px;
    border: 2px solid rgb(40, 40, 40);
    padding: 7px;
    position: relative;
    box-shadow: 2px 5px 15px rgba(0, 0, 0, 0.486);
  }

  .card-int {
    background-image: linear-gradient(to right bottom, #F07B11, #ff9838, #ffb36b, #ea00aa, #b81cd7);
    background-size: 200% 200%;
    background-position: 0% 0%;
    height: 100%;
    border-radius: 25px;
    transition: all 0.6s ease-out;
    overflow: hidden;
  }

  .card:hover .card-int {
    background-position: 100% 100%;
  }

  .top {
    position: absolute;
    top: 0px;
    right: 50%;
    transform: translate(50%, 0%);
    width: 35%;
    height: 18px;
    background-color: black;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }

  .speaker {
    position: absolute;
    top: 2px;
    right: 50%;
    transform: translate(50%, 0%);
    width: 40%;
    height: 2px;
    border-radius: 2px;
    background-color: rgb(20, 20, 20);
  }

  .camera {
    position: absolute;
    top: 6px;
    right: 84%;
    transform: translate(50%, 0%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.048);
  }

  .int {
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    top: 50%;
    right: 50%;
    transform: translate(50%, -50%);
    background-color: rgba(0, 0, 255, 0.212);
  }

  .btn1, .btn2, .btn3, .btn4 {
    position: absolute;
    width: 2px;
  }

  .btn1, .btn2, .btn3 {
    height: 45px;
    top: 30%;
    right: -4px;
    background-image: linear-gradient(to right, #111111, #222222, #333333, #464646, #595959);
  }

  .btn2, .btn3 {
    transform: scale(-1);
    left: -4px;
  }

  .btn2, .btn3 {
    transform: scale(-1);
    height: 30px;
  }

  .btn2 {
    top: 26%
  }

  .btn3 {
    top: 36%
  }

  .hello {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
    line-height: 1.2;
    height: 100%;
    padding: 20px;
    transition: 0.5s ease-in-out;
  }

  .hover-hint {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    margin-top: 10px;
    opacity: 0.8;
  }

  .card:hover .hidden {
    opacity: 1;
  }

  .card:hover .hello {
    transform: translateY(-20px);
    opacity: 0;
  }

  .qr-overlay {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(240, 123, 17, 0.95);
    opacity: 0;
    transition: all 0.4s ease-in-out;
    transform: scale(0.8);
    pointer-events: none;
    padding: 20px;
    text-align: center;
  }

  .card:hover .qr-overlay {
    opacity: 1;
    transform: scale(1);
  }

  .qr-overlay img {
    width: 80%;
    height: auto;
    border-radius: 12px;
    margin-bottom: 15px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  }

  .qr-overlay p {
    color: white;
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

// ── Grievance Section ──────────────────────────────────
const GrievanceSectionContainer = styled.div`
  width: 100%;
  padding: 80px 8% 220px 8%;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
`;

const GrievanceHeading = styled.h2`
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 16px;
  text-align: center;
  font-family: 'Outfit', sans-serif;
  span { color: #F07B11; }
`;

const GrievanceSubHeading = styled.p`
  color: #555;
  font-size: 1.2rem;
  max-width: 700px;
  text-align: center;
  margin-bottom: 40px;
  line-height: 1.6;
`;

const BotsGrid = styled.div`
  display: flex;
  gap: 300px;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  padding-top: 20px;
  @media (max-width: 1200px) { gap: 150px; }
  @media (max-width: 960px) { gap: 100px; padding-top: 100px; }
`;

// ── Grievance Bot Component (User provided UI) ────────
const GrievanceBot = ({ brand, primaryColor, icon, placeholder, brandIcon, description, link, instruction }) => {
  return (
    <BotWrapper primaryColor={primaryColor}>
      <BotContainer>
        <div className="container-ai-input">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="area" />
          ))}
          <label className="container-wrap">
            <input type="checkbox" />
            <div className="card">
              <div className="background-blur-balls">
                <div className="balls">
                  <span className="ball rosa" />
                  <span className="ball violet" />
                  <span className="ball green" />
                  <span className="ball cyan" />
                </div>
              </div>
              <div className="content-card">
                <div className="background-blur-card">
                  <div className="eyes">
                    <span className="eye" />
                    <span className="eye" />
                  </div>
                  <div className="eyes happy">
                    <svg fill="none" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M8.28386 16.2843C8.9917 15.7665 9.8765 14.731 12 14.731C14.1235 14.731 15.0083 15.7665 15.7161 16.2843C17.8397 17.8376 18.7542 16.4845 18.9014 15.7665C19.4323 13.1777 17.6627 11.1066 17.3088 10.5888C16.3844 9.23666 14.1235 8 12 8C9.87648 8 7.61556 9.23666 6.69122 10.5888C6.33728 11.1066 4.56771 13.1777 5.09858 15.7665C5.24582 16.4845 6.16034 17.8376 8.28386 16.2843Z" />
                    </svg>
                    <svg fill="none" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M8.28386 16.2843C8.9917 15.7665 9.8765 14.731 12 14.731C14.1235 14.731 15.0083 15.7665 15.7161 16.2843C17.8397 17.8376 18.7542 16.4845 18.9014 15.7665C19.4323 13.1777 17.6627 11.1066 17.3088 10.5888C16.3844 9.23666 14.1235 8 12 8C9.87648 8 7.61556 9.23666 6.69122 10.5888C6.33728 11.1066 4.56771 13.1777 5.09858 15.7665C5.24582 16.4845 6.16034 17.8376 8.28386 16.2843Z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="container-ai-chat">
                <div className="chat">
                  <div className="chat-bot">
                    <div className="brand-header">
                      <span className="brand-icon">{icon}</span>
                      <span className="brand-name">{brand} Bot</span>
                    </div>
                    <textarea placeholder={placeholder} name="chat_bot" id="chat_bot" />
                    <a href={link} target="_blank" rel="noopener noreferrer" className="download-link">
                      <span>⬇️</span> Download App
                    </a>
                  </div>
                  <div className="options">
                    <div className="btns-add">
                      <button>
                        <svg viewBox="0 0 24 24" height={20} width={20} xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 8v8a5 5 0 1 0 10 0V6.5a3.5 3.5 0 1 0-7 0V15a2 2 0 0 0 4 0V8" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" fill="none" />
                        </svg>
                      </button>
                      <button>
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24">
                          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm0 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zm0-8h6m-3-3v6" />
                        </svg>
                      </button>
                    </div>
                    <button className="btn-submit">
                      <i>
                        <svg viewBox="0 0 512 512">
                          <path d="M473 39.05a24 24 0 0 0-25.5-5.46L47.47 185h-.08a24 24 0 0 0 1 45.16l.41.13l137.3 58.63a16 16 0 0 0 15.54-3.59L422 80a7.07 7.07 0 0 1 10 10L226.66 310.26a16 16 0 0 0-3.59 15.54l58.65 137.38c.06.2.12.38.19.57c3.2 9.27 11.3 15.81 21.09 16.25h1a24.63 24.63 0 0 0 23-15.46L478.39 64.62A24 24 0 0 0 473 39.05" fill="currentColor" />
                        </svg>
                      </i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </label>
        </div>
      </BotContainer>
      <BotMeta primaryColor={primaryColor}>
        <BotAccessBtn primaryColor={primaryColor} onClick={() => window.open(link, '_blank')}>
          <img src={brandIcon} alt={brand} />
          Access {brand} Bot
        </BotAccessBtn>
        <BotDesc>{description}</BotDesc>
        {instruction && <BotInstruction color={primaryColor}><b>Note:</b> {instruction}</BotInstruction>}
      </BotMeta>
    </BotWrapper>
  );
};

const BotContainer = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
`;

const BotMeta = styled.div`
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 240px;
  text-align: center;
`;

const BotAccessBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  background: white;
  border: 2px solid ${props => props.primaryColor};
  color: ${props => props.primaryColor};
  border-radius: 20px;
  font-weight: 800;
  font-size: 0.9rem;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  &:hover {
    background: ${props => props.primaryColor};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${props => props.primaryColor}30;
    
    img {
      filter: brightness(0) invert(1);
    }
  }
`;

const BotDesc = styled.p`
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
  font-weight: 500;
  margin: 0;
  padding: 0 10px;
`;

const BotInstruction = styled.p`
  font-size: 0.75rem;
  color: ${props => props.color};
  background: ${props => props.color}10;
  padding: 6px 12px;
  border-radius: 8px;
  margin-top: 5px;
  border: 1px solid ${props => props.color}20;
  font-weight: 500;
  line-height: 1.4;
  b { font-weight: 800; text-transform: uppercase; font-size: 0.65rem; margin-right: 4px; }
`;

const BotWrapper = styled.div`
  position: relative;
  width: 200px;
  height: 200px;

  .container-ai-input {
    --perspective: 1000px;
    --translateY: 45px;
    position: absolute;
    left: 0;
    right: 0;
    top: -2.5rem;
    bottom: -2.5rem;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    transform-style: preserve-3d;
  }

  .container-wrap {
    display: flex;
    align-items: center;
    justify-items: center;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    z-index: 9;
    transform-style: preserve-3d;
    cursor: pointer;
    padding: 4px;
    transition: all 0.3s ease;
  }

  .container-wrap:hover { padding: 0; }
  .container-wrap:active { transform: translateX(-50%) translateY(-50%) scale(0.95); }

  .container-wrap:after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-55%);
    width: 12rem;
    height: 11rem;
    background-color: #ededed;
    border-radius: 3.2rem;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  }

  .container-wrap:hover:after {
    transform: translateX(-50%) translateY(-50%);
    height: 12rem;
  }

  .container-wrap input { opacity: 0; width: 0; height: 0; position: absolute; }
  .container-wrap:hover .card .eyes { opacity: 0; }
  .container-wrap:hover .card .content-card { width: 260px; height: 200px; }
  .container-wrap:hover .card .background-blur-balls { border-radius: 20px; }

  .container-wrap:hover .card .container-ai-chat {
    opacity: 1;
    visibility: visible;
    z-index: 99;
    pointer-events: visible;
  }

  .card {
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    will-change: transform;
    transition: all 0.6s ease;
    border-radius: 3rem;
    display: flex;
    align-items: center;
    transform: translateZ(50px);
    justify-content: center;
  }

  .card:hover {
    box-shadow: 0 10px 40px rgba(0, 0, 60, 0.15), inset 0 0 10px rgba(255, 255, 255, 0.5);
  }

  .background-blur-balls {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 100%;
    height: 100%;
    z-index: -10;
    border-radius: 3rem;
    transition: all 0.3s ease;
    background-color: rgba(255, 255, 255, 0.9);
    overflow: hidden;
  }

  .balls {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    animation: rotate-background-balls 10s linear infinite;
  }

  .container-wrap:hover .balls { animation-play-state: paused; }

  .background-blur-balls .ball {
    width: 6rem; height: 6rem;
    position: absolute; border-radius: 50%; filter: blur(30px);
  }

  .background-blur-balls .ball.violet { top: 0; left: 50%; transform: translateX(-50%); background-color: #9147ff; }
  .background-blur-balls .ball.green { bottom: 0; left: 50%; transform: translateX(-50%); background-color: ${props => props.primaryColor}; }
  .background-blur-balls .ball.rosa { top: 50%; left: 0; transform: translateY(-50%); background-color: #ec4899; }
  .background-blur-balls .ball.cyan { top: 50%; right: 0; transform: translateY(-50%); background-color: #05e0f5; }

  .content-card {
    width: 12rem; height: 12rem;
    display: flex; border-radius: 3rem;
    transition: all 0.3s ease; overflow: hidden;
  }

  .background-blur-card { width: 100%; height: 100%; backdrop-filter: blur(50px); }

  .eyes {
    position: absolute; left: 50%; bottom: 50%;
    transform: translateX(-50%); display: flex; align-items: center;
    justify-content: center; height: 52px; gap: 2rem; transition: all 0.3s ease;

    .eye {
      width: 26px; height: 52px; background-color: #fff;
      border-radius: 16px; animation: animate-eyes 10s infinite linear;
      transition: all 0.3s ease;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
  }

  .eyes.happy {
    display: none; color: #fff; gap: 0;
    svg { width: 60px; }
  }

  .container-wrap:hover .eyes .eye { display: none; }
  .container-wrap:hover .eyes.happy { display: flex; }

  .container-ai-chat {
    position: absolute; width: 100%; height: 100%;
    padding: 6px; opacity: 0; pointer-events: none;
    transition: all 0.4s ease;
  }

  .container-wrap .card .chat {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    border-radius: 20px;
    width: 100%; height: 100%;
    padding: 12px;
    overflow: hidden;
    background-color: #ffffff;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .brand-header {
    display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding: 0 5px;
    .brand-icon { font-size: 1.2rem; }
    .brand-name { font-weight: 800; font-size: 0.9rem; color: ${props => props.primaryColor}; font-family: 'Outfit'; }
  }

  .container-wrap .card .chat .chat-bot {
    position: relative; display: flex; flex-direction: column;
    height: 100%; transition: all 0.3s ease;
  }

  .card .chat .chat-bot textarea {
    background-color: #f8fafc;
    border-radius: 12px; border: 1px solid #edf2f7;
    width: 100%; height: 80px;
    color: #4a5568; font-family: 'Inter', sans-serif;
    font-size: 13px; font-weight: 500; padding: 12px;
    resize: none; outline: none; transition: all 0.2s;

    &:focus { border-color: ${props => props.primaryColor}; background-color: #fff; }
    &::placeholder { color: #cbd5e0; }
  }

  .download-link {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    padding: 8px 12px;
    background: ${props => props.primaryColor}15;
    color: ${props => props.primaryColor};
    text-decoration: none;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 700;
    transition: all 0.2s;
    border: 1px dashed ${props => props.primaryColor}40;
    
    &:hover {
      background: ${props => props.primaryColor}25;
      transform: translateY(-1px);
    }
  }

  .card .chat .options {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0 0 0;
  }

  .card .chat .options .btns-add {
    display: flex; gap: 12px;
    button {
      display: flex; color: #a0aec0; background-color: transparent; border: none; cursor: pointer; transition: all 0.2s;
      &:hover { transform: translateY(-2px); color: ${props => props.primaryColor}; }
    }
  }

  .card .chat .options .btn-submit {
    display: flex; padding: 2px;
    background: ${props => `linear-gradient(to top, ${props.primaryColor}, #9147ff, #3b82f6)`};
    border-radius: 10px; cursor: pointer; border: none; outline: none; transition: all 0.2s;

    i {
      width: 32px; height: 32px; padding: 7px; background: rgba(0, 0, 0, 0.05);
      border-radius: 9px; backdrop-filter: blur(3px); color: #fff;
    }
    &:hover { transform: scale(1.05); }
    &:active { transform: scale(0.95); }
  }

  /* Movement logic based on which area is hovered */
  ${[...Array(15)].map((_, i) => {
  const row = Math.floor(i / 5);
  const col = i % 5;
  const rotateX = (1 - row) * 15;
  const rotateY = (col - 2) * 15;
  return `
      .area:nth-child(${i + 1}):hover ~ .container-wrap .card,
      .area:nth-child(${i + 1}):hover ~ .container-wrap .eyes .eye {
        transform: perspective(var(--perspective)) rotateX(${rotateX}deg) rotateY(${rotateY}deg)
          translateZ(var(--translateY)) scale3d(1, 1, 1);
      }
    `;
}).join('')}

  @keyframes rotate-background-balls {
    from { transform: translateX(-50%) translateY(-50%) rotate(360deg); }
    to { transform: translateX(-50%) translateY(-50%) rotate(0); }
  }

  @keyframes animate-eyes {
    0%, 46%, 50%, 96%, 100% { height: 52px; }
    48%, 98% { height: 20px; }
  }
`;

const CredentialsBox = styled.div`
  margin-top: 30px;
  padding: 24px;
  background: rgba(240, 123, 17, 0.05);
  border: 1px dashed rgba(240, 123, 17, 0.3);
  border-radius: 20px;
  text-align: left;
  max-width: 500px;
  backdrop-filter: blur(10px);
  @media (max-width: 960px) { margin: 30px auto 0 auto; }
`;

const CredTitle = styled.h4`
  color: #F07B11;
  margin-bottom: 16px;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  &::before { content: '🔐'; font-size: 1.2rem; }
`;

const CredItem = styled.div`
  font-size: 0.95rem;
  color: #444;
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(240, 123, 17, 0.1);
  &:last-child { border-bottom: none; }
  
  span.label { 
    font-weight: 700; 
    color: #1a1a1a; 
    min-width: 100px;
    font-family: 'Outfit', sans-serif;
  }
  span.value { 
    font-family: 'Inter', sans-serif; 
    color: #555;
    background: white;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.85rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }
`;

// ── Footer ────────────────────────────────────────────
const Footer = styled.footer`
  width: 100%;
  padding: 60px 0 40px 0;
  background: linear-gradient(135deg, #F07B11 0%, #e06c09 100%);
  position: relative;
  z-index: 5;
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const FooterLogo = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffe0c2;
  display: flex;
  flex-direction: column;
  align-items: center;
  span { color: white; }
`;

const FooterText = styled.p`
  color: rgba(255,255,255,0.9);
  font-size: 1rem;
  text-align: center;
  font-weight: 500;
`;

const FooterCopyright = styled.p`
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  margin-top: 10px;
`;

export default App;
