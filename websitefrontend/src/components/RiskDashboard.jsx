import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import ReactMarkdown from 'react-markdown';

const RiskDashboard = () => {
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [activeAccordion, setActiveAccordion] = useState('summary');

  const fetchRiskData = async (e) => {
    if (e) e.preventDefault();
    if (!location.trim()) return;
    
    setIsLoading(true);
    setError('');
    // We don't clear the report immediately to keep the UI stable during fetch
    
    try {
      const rawUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const baseUrl = (window.location.protocol === 'https:' && rawUrl.startsWith('http://'))
        ? rawUrl.replace('http://', 'https://') : rawUrl;
      const response = await fetch(`${baseUrl}/risk/analyze?location=${encodeURIComponent(location)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || 'Analysis failed');
      
      setReport(payload.data);
      setActiveAccordion('summary'); // Reset accordion on new search
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTierDetails = (tier) => {
    switch (tier) {
      case 'HIGH': 
        return { color: '#ef4444', label: 'CRITICAL RISK', desc: 'Immediate NGO intervention highly recommended.' };
      case 'WATCH': 
        return { color: '#f59e0b', label: 'ELEVATED RISK', desc: 'Moderate activity detected. Heightened monitoring required.' };
      default: 
        return { color: '#10b981', label: 'STABLE', desc: 'No immediate threat detection. Routine monitoring ongoing.' };
    }
  };

  // Helper to split markdown into sections for the accordion
  const getBriefSections = (markdown) => {
    if (!markdown) return {};
    const sections = {};
    const parts = markdown.split('###');
    parts.forEach(part => {
      if (part.includes('🚨 Executive Risk Summary')) sections.summary = part.replace('🚨 Executive Risk Summary', '').trim();
      if (part.includes('⛈️ Environmental & Climate Context')) sections.climate = part.replace('⛈️ Environmental & Climate Context', '').trim();
      if (part.includes('📰 Political & Media Sentiment')) sections.sentiment = part.replace('📰 Political & Media Sentiment', '').trim();
      if (part.includes('🛡️ Recommended NGO Posture')) sections.recommendations = part.replace('🛡️ Recommended NGO Posture', '').trim();
      if (part.includes('🔮 Predicted Operational Anomalies')) sections.predicted = part.replace('🔮 Predicted Operational Anomalies', '').trim();
    });
    return sections;
  };

  const briefSections = report ? getBriefSections(report.ai_brief) : {};

  return (
    <Container>
      <GlobalBackground />
      
      <ContentWrapper>
        <HeroSection>
          <Badge>Global Intelligence Engine</Badge>
          <Title>Predictive <span>Risk</span> Intelligence</Title>
          <Subtitle>
            Autonomous crisis detection platform synthesizing BigQuery GDELT signals, 
            meteorological stress, and AI-driven NGO operational posture.
          </Subtitle>
          
          <SearchBox onSubmit={fetchRiskData}>
            <div className="search-icon">🔍</div>
            <SearchInput 
              type="text" 
              placeholder="Search by City or Country (e.g. Sudan, Mumbai)..." 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <SearchButton type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : 'Analyze Risk'}
            </SearchButton>
          </SearchBox>
          {error && <ErrorMessage>⚠️ {error}</ErrorMessage>}
        </HeroSection>

        {report && (
          <DashboardGrid>
            {/* Left Column: Visual Metrics */}
            <MetricsColumn>
              <GlassCard style={{ gridColumn: 'span 1' }}>
                <CardHeader>
                  <div className="icon">🛡️</div>
                  <h4>Risk Assessment</h4>
                </CardHeader>
                <RiskDisplay>
                  <GaugeWrapper tier={report.tier}>
                    <svg viewBox="0 0 36 36">
                      <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="circle" strokeDasharray={`${report.probability * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="gauge-content">
                      <span className="value">{(report.probability * 100).toFixed(0)}%</span>
                      <span className="label">SCORE</span>
                    </div>
                  </GaugeWrapper>
                  <TierInfo tier={report.tier}>
                    <h3>{getTierDetails(report.tier).label}</h3>
                    <p>{getTierDetails(report.tier).desc}</p>
                  </TierInfo>
                </RiskDisplay>
              </GlassCard>

              <GlassCard>
                <CardHeader>
                  <div className="icon">⛈️</div>
                  <h4>Climate Stress</h4>
                  <div className="live-pill">LIVE</div>
                </CardHeader>
                {report.weather && report.weather.temp ? (
                  <WeatherContent>
                    <div className="temp-main">
                      <span className="val">{report.weather.temp}°</span>
                      <span className="unit">Celsius</span>
                    </div>
                    <WeatherGrid>
                      <div className="w-item">
                        <span>Precipitation</span>
                        <strong>{report.weather.precipitation}mm</strong>
                      </div>
                      <div className="w-item">
                        <span>Status</span>
                        <strong>{report.weather.temp > 35 ? 'Arid Stress' : 'Normal'}</strong>
                      </div>
                    </WeatherGrid>
                  </WeatherContent>
                ) : (
                  <p style={{ color: '#94a3b8' }}>Weather metrics unavailable</p>
                )}
              </GlassCard>

              <GlassCard>
                <CardHeader>
                  <div className="icon">📊</div>
                  <h4>BigQuery GDELT Events</h4>
                </CardHeader>
                <EventChipGrid>
                  {report.events && report.events.length > 0 ? report.events.map((ev, i) => {
                    const title = ev.desc.split('(')[0].trim();
                    let oneLiner = "Detected via Global GDELT Index.";
                    if (title.toLowerCase().includes('aid')) oneLiner = "Request/Distribution of humanitarian resources detected.";
                    if (title.toLowerCase().includes('statement')) oneLiner = "Public acknowledgment of localized crisis conditions.";
                    if (title.toLowerCase().includes('protest')) oneLiner = "Mass mobilization signal identifying civic unrest.";
                    if (title.toLowerCase().includes('military')) oneLiner = "Security movement requiring operational caution.";
                    if (title.toLowerCase().includes('assistance')) oneLiner = "Direct plea for emergency civic-level support.";

                    return (
                      <EventItem key={i}>
                        <div className="top-row">
                          <span className="count">{ev.count}</span>
                          <strong className="event-title">{title}</strong>
                        </div>
                        <p className="one-liner">{oneLiner}</p>
                      </EventItem>
                    );
                  }) : <p>No trending anomalies found.</p>}
                </EventChipGrid>
              </GlassCard>
            </MetricsColumn>

            {/* Right Column: AI Brief */}
            <BriefColumn>
              <IntelligenceCard>
                <BriefHeader>
                  <div className="ai-logo-container">
                    <AI_Icon src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" />
                  </div>
                  <div className="header-text">
                    <h3>Gemini 3.1 Specialist Brief</h3>
                    <p>Powered by Google Vertex AI • Real-time Synthesis</p>
                  </div>
                </BriefHeader>

                <AccordionContainer>
                  <AccordionItem active={activeAccordion === 'summary'} onClick={() => setActiveAccordion('summary')}>
                    <div className="acc-header">
                      <span>🚨 Executive Summary</span>
                      <div className="chevron"></div>
                    </div>
                    <div className="acc-content">
                      <ReactMarkdown>{briefSections.summary || 'Summary pending...'}</ReactMarkdown>
                    </div>
                  </AccordionItem>

                  <AccordionItem active={activeAccordion === 'climate'} onClick={() => setActiveAccordion('climate')}>
                    <div className="acc-header">
                      <span>⛈️ Environmental Context</span>
                      <div className="chevron"></div>
                    </div>
                    <div className="acc-content">
                      <ReactMarkdown>{briefSections.climate || 'Data pending...'}</ReactMarkdown>
                    </div>
                  </AccordionItem>

                  <AccordionItem active={activeAccordion === 'sentiment'} onClick={() => setActiveAccordion('sentiment')}>
                    <div className="acc-header">
                      <span>📰 Media Sentiment</span>
                      <div className="chevron"></div>
                    </div>
                    <div className="acc-content">
                      <ReactMarkdown>{briefSections.sentiment || 'Analysis pending...'}</ReactMarkdown>
                    </div>
                  </AccordionItem>

                  <AccordionItem active={activeAccordion === 'predicted'} onClick={() => setActiveAccordion('predicted')}>
                    <div className="acc-header">
                      <span>🔮 Predicted Operational Events</span>
                      <div className="chevron"></div>
                    </div>
                    <div className="acc-content">
                      <ReactMarkdown>{briefSections.predicted || 'Future forecasting pending...'}</ReactMarkdown>
                    </div>
                  </AccordionItem>

                  <AccordionItem active={activeAccordion === 'recommendations'} onClick={() => setActiveAccordion('recommendations')}>
                    <div className="acc-header">
                      <span>🛡️ NGO Recommendations</span>
                      <div className="chevron"></div>
                    </div>
                    <div className="acc-content">
                      <ReactMarkdown>{briefSections.recommendations || 'Guidelines pending...'}</ReactMarkdown>
                    </div>
                  </AccordionItem>
                </AccordionContainer>

                <ReportFooter>
                  <span>Validated by SevaSetu Model v2.4</span>
                  <button onClick={() => window.print()}>Print / Export</button>
                </ReportFooter>
              </IntelligenceCard>
            </BriefColumn>
          </DashboardGrid>
        )}
      </ContentWrapper>
    </Container>
  );
};

// ── Animations ── //
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;
const spin = keyframes`
  to { transform: rotate(360deg); }
`;
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(240, 123, 17, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(240, 123, 17, 0); }
  100% { box-shadow: 0 0 0 0 rgba(240, 123, 17, 0); }
`;

// ── Styled Components ── //
const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: #f8fafc;
  color: #1e293b;
  font-family: 'Inter', sans-serif;
`;

const GlobalBackground = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
  pointer-events: none;
  background: 
    radial-gradient(circle at 10% 10%, rgba(240, 123, 17, 0.04), transparent 30%),
    radial-gradient(circle at 90% 90%, rgba(30, 41, 59, 0.04), transparent 40%),
    #F8FAFC;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.01) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.01) 1px, transparent 1px);
  background-size: 40px 40px;
`;

// Navbar
const Navbar = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  height: 70px;
  display: flex;
  align-items: center;
`;

const NavContent = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-size: 1.5rem;
  color: #0f172a;
  .dot { width: 12px; height: 12px; background: #FF7A00; border-radius: 50%; }
`;

const NavRight = styled.div`
  display: flex;
  gap: 20px;
`;

const NavBtn = styled.button`
  padding: 10px 24px;
  border-radius: 40px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  &.primary {
    background: #0f172a; color: white; border: none;
    &:hover { background: #1e293b; transform: translateY(-1px); }
  }
  &.secondary {
    background: transparent; color: #475569; border: 1px solid #e2e8f0;
    &:hover { border-color: #cbd5e1; background: #f8fafc; }
  }
`;

// Hero
const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1300px;
  margin: 0 auto;
  padding: 40px 5% 100px;
`;

const HeroSection = styled.div`
  text-align: center;
  margin: 40px auto 80px;
  max-width: 800px;
`;

const Badge = styled.div`
  display: inline-block;
  padding: 6px 14px;
  background: rgba(255, 122, 0, 0.08);
  color: #FF7A00;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: clamp(2.8rem, 5vw, 4rem);
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 20px;
  font-family: 'Outfit', sans-serif;
  span { color: #FF7A00; }
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 1.15rem;
  line-height: 1.6;
  margin-bottom: 45px;
`;

const SearchBox = styled.form`
  display: flex;
  align-items: center;
  background: white;
  padding: 10px;
  border-radius: 60px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.06);
  border: 1px solid rgba(0,0,0,0.02);
  max-width: 650px;
  margin: 0 auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:focus-within {
    box-shadow: 0 25px 50px rgba(255, 122, 0, 0.12);
    transform: translateY(-2px);
  }
  .search-icon { margin-left: 20px; font-size: 1.2rem; }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  padding: 15px 20px;
  font-size: 1.1rem;
  outline: none;
  background: transparent;
  color: #1e293b;
  &::placeholder { color: #94a3b8; }
`;

const SearchButton = styled.button`
  background: #FF7A00;
  color: white;
  border: none;
  padding: 14px 35px;
  border-radius: 40px;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #e66e00; box-shadow: 0 5px 15px rgba(255,122,0,0.3); }
  &:disabled { opacity: 0.8; }
`;

// Dashboard Grid
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 40px;
  @media (max-width: 1000px) { grid-template-columns: 1fr; }
`;

const MetricsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  padding: 35px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.03);
  transition: transform 0.3s;
  &:hover { transform: translateY(-5px); }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
  .icon { background: #f1f5f9; padding: 10px; border-radius: 12px; font-size: 1.2rem; }
  h4 { font-size: 1.1rem; font-weight: 800; color: #1e293b; font-family: 'Outfit'; }
  .live-pill { 
    margin-left: auto; background: #ef4444; color: white; padding: 2px 8px; 
    border-radius: 10px; font-size: 0.65rem; font-weight: 900; animation: ${pulse} 2s infinite;
  }
`;

const RiskDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
`;

const GaugeWrapper = styled.div`
  width: 190px;
  height: 190px;
  position: relative;
  svg { transform: rotate(-90deg); }
  .circle-bg { fill: none; stroke: #f1f5f9; stroke-width: 3.5; }
  .circle {
    fill: none; stroke: ${props => 
      props.tier === 'HIGH' ? '#ef4444' : 
      props.tier === 'WATCH' ? '#f59e0b' : '#10b981'
    };
    stroke-width: 3.5; stroke-linecap: round;
    transition: stroke-dasharray 1.5s ease;
  }
  .gauge-content {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    text-align: center;
    .value { display: block; font-size: 3rem; font-weight: 900; color: #0f172a; line-height: 1; }
    .label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; letter-spacing: 1px; }
  }
`;

const TierInfo = styled.div`
  text-align: center;
  h3 { 
    font-size: 1.6rem; font-weight: 900; margin-bottom: 8px; font-family: 'Outfit'; 
    color: ${props => 
      props.tier === 'HIGH' ? '#ef4444' : 
      props.tier === 'WATCH' ? '#f59e0b' : '#10b981'
    };
  }
  p { color: #64748b; font-size: 0.95rem; line-height: 1.5; }
`;

const WeatherContent = styled.div`
  .temp-main { 
    margin-bottom: 25px; 
    .val { font-size: 3.5rem; font-weight: 900; color: #0f172a; font-family: 'Outfit'; }
    .unit { color: #94a3b8; font-weight: 600; font-size: 1rem; margin-left: 8px; }
  }
`;

const WeatherGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  .w-item {
    padding: 15px; background: rgba(0,0,0,0.02); border-radius: 15px;
    span { display: block; font-size: 0.75rem; color: #64748b; margin-bottom: 5px; }
    strong { font-size: 1rem; color: #1e293b; }
  }
`;

const EventChipGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const EventItem = styled.div`
  padding: 18px;
  background: white;
  border: 1px solid rgba(0,0,0,0.03);
  border-radius: 18px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .top-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .count { 
    background: rgba(255, 122, 0, 0.1);
    color: #FF7A00; 
    font-weight: 900; 
    font-size: 0.75rem; 
    padding: 2px 8px;
    border-radius: 8px;
  }
  
  .event-title { 
    font-size: 0.95rem; 
    color: #991b1b; /* Dark Red as requested */
    font-weight: 800;
    font-family: 'Outfit', sans-serif;
  }
  
  .one-liner { 
    font-size: 0.8rem; 
    color: #64748b; 
    margin-top: 2px;
    line-height: 1.4;
  }
`;

const BriefColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const IntelligenceCard = styled.div`
  background: white;
  border-radius: 35px;
  padding: 45px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.08);
  border: 1px solid rgba(255, 122, 0, 0.05);
  position: relative;
  overflow: hidden;
  &::after {
    content: ''; position: absolute; top: 0; right: 0; width: 200px; height: 200px;
    background: radial-gradient(circle at 100% 0%, rgba(255, 122, 0, 0.05), transparent 70%);
    pointer-events: none;
  }
`;

const BriefHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  .ai-logo-container {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    padding: 18px; border-radius: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.03);
  }
  .header-text {
    h3 { font-size: 1.6rem; font-weight: 900; color: #0f172a; font-family: 'Outfit'; margin-bottom: 4px; }
    p { color: #FF7A00; font-size: 0.85rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
  }
`;

const AI_Icon = styled.img`
  width: 45px; height: 45px;
`;

// Accordion
const AccordionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const AccordionItem = styled.div`
  border: 1px solid ${props => props.active ? 'rgba(255, 122, 0, 0.2)' : '#f1f5f9'};
  background: ${props => props.active ? 'rgba(255, 122, 0, 0.03)' : 'white'};
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  .acc-header {
    padding: 20px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    span { font-weight: 800; font-size: 1.1rem; color: #1e293b; font-family: 'Outfit'; }
    .chevron {
      width: 10px; height: 10px;
      border-right: 3px solid #64748b;
      border-bottom: 3px solid #64748b;
      transform: ${props => props.active ? 'rotate(-135deg)' : 'rotate(45deg)'};
      transition: transform 0.3s;
    }
  }

  .acc-content {
    max-height: ${props => props.active ? '1500px' : '0px'};
    padding: ${props => props.active ? '0 30px 30px 30px' : '0 30px'};
    opacity: ${props => props.active ? '1' : '0'};
    overflow: hidden;
    transition: all 0.5s ease-in-out;
    color: #475569;
    line-height: 1.8;
    
    p { margin-bottom: 20px; font-weight: 500; font-size: 0.95rem; color: #64748b; }
    
    ul { 
      padding-left: 0; list-style: none; margin: 0;
      display: flex; flex-direction: column; gap: 16px;
      
      li { 
        padding: 20px;
        background: #fff;
        border: 1px solid #f1f5f9;
        border-radius: 20px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.02);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &:hover {
          border-color: rgba(255, 122, 0, 0.2);
          transform: translateX(5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.04);
        }

        &::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
          background: #8d1f1f; opacity: 0.8;
        }

        strong { 
          color: #8d1f1f; display: flex; align-items: center; gap: 10px;
          margin-bottom: 8px; font-weight: 800; font-size: 1.05rem; font-family: 'Outfit';
          
          /* Dynamic Icon logic via CSS selectors targeting the text content if possible or just use a generic nice icon */
          &::before {
            content: '📋'; /* Default Icon */
            font-size: 1.2rem;
          }
        }
      } 
    }
  }
`;

const ReportFooter = styled.div`
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  span { font-size: 0.85rem; color: #94a3b8; font-weight: 600; }
  button {
    background: transparent; color: #FF7A00; border: 1.5px solid #FF7A00;
    padding: 8px 18px; border-radius: 12px; font-weight: 700; font-size: 0.85rem;
    cursor: pointer; transition: all 0.2s;
    &:hover { background: #FF7A00; color: white; }
  }
`;

const ErrorMessage = styled.div`
  margin: 30px auto 0;
  max-width: 500px;
  background: #fef2f2;
  color: #ef4444;
  padding: 12px 20px;
  border-radius: 15px;
  font-weight: 700;
  border: 1px solid rgba(239, 68, 68, 0.1);
`;

const Spinner = styled.div`
  width: 20px; height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export default RiskDashboard;
