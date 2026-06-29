import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const features = [
  { 
    name: 'Volunteer App', 
    desc: 'Empowering volunteers to lead community action with AI coordination.', 
    color: '240, 123, 17',
    path: '/dashboard'
  },
  { 
    name: '3 Distinct Views', 
    desc: 'Tailored portals for Citizens, Volunteers, and Supervisors.', 
    color: '61, 169, 252',
    path: '/dashboard'
  },
  { 
    name: 'Google Sign-In', 
    desc: 'Seamless and secure authentication for your profile.', 
    color: '250, 140, 50',
    path: '/auth'
  },
  { 
    name: 'Live Surveys', 
    desc: 'Dynamic data gathering for real-time community impact.', 
    color: '14, 84, 163',
    path: '/dashboard'
  },
  { 
    name: 'Grievance Bots', 
    desc: 'Report issues instantly via our WhatsApp & Telegram bots.', 
    color: '37, 211, 102',
    anchor: '#grievance'
  },
  { 
    name: 'SevaSetu Mobile', 
    desc: 'Download our companion app for civic action on the go.', 
    color: '184, 28, 215',
    anchor: '#download'
  }
];

const Card = () => {
  const navigate = useNavigate();

  const handleLearnMore = (feat) => {
    if (feat.path) {
      navigate(feat.path);
    } else if (feat.anchor) {
      window.location.href = feat.anchor;
    }
  };

  return (
    <StyledWrapper>
      <div className="wrapper">
        <div className="inner" style={{ '--quantity': 6 }}>
          {features.map((feat, index) => (
            <div className="card" key={index} style={{ '--index': index, '--color-card': feat.color }}>
              <div className="img">
                <div className="content">
                  <h3>{feat.name}</h3>
                  <p>{feat.desc}</p>
                  <button onClick={() => handleLearnMore(feat)}>Learn More</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  height: 490px; 
  margin-top: 20px;

  .wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .inner {
    --w: 300px;
    --h: 340px;
    --translateZ: 360px; 
    --rotateX: -5deg;
    --perspective: 1200px;
    position: absolute;
    width: var(--w);
    height: var(--h);
    top: 5%;
    left: calc(50% - (var(--w) / 2));
    z-index: 2;
    transform-style: preserve-3d;
    transform: perspective(var(--perspective));
    animation: rotating 30s linear infinite;
  }

  .wrapper:hover .inner {
    animation-play-state: paused;
  }

  @keyframes rotating {
    from {
      transform: perspective(var(--perspective)) rotateX(var(--rotateX)) rotateY(0deg);
    }
    to {
      transform: perspective(var(--perspective)) rotateX(var(--rotateX)) rotateY(360deg);
    }
  }

  .card {
    position: absolute;
    border: 1.5px solid rgba(var(--color-card), 0.3);
    border-radius: 20px;
    overflow: hidden;
    inset: 0;
    transform: rotateY(calc((360deg / var(--quantity)) * var(--index))) translateZ(var(--translateZ));
    background-color: rgba(255, 255, 255, 0.85); 
    backdrop-filter: blur(15px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.05);
    transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
  }

  .card:hover {
    border-color: rgba(var(--color-card), 0.8);
    box-shadow: 0 10px 40px rgba(var(--color-card), 0.2);
  }

  .img {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(
      circle at top,
      rgba(var(--color-card), 0.15) 0%,
      rgba(var(--color-card), 0.05) 50%,
      transparent 100%
    );
  }

  .content {
    padding: 30px 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    color: #333;
    text-align: center;
  }

  .content h3 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 800;
    color: rgb(var(--color-card));
    letter-spacing: -0.5px;
    font-family: 'Outfit', sans-serif;
  }

  .content p {
    font-size: 1.15rem;
    line-height: 1.6;
    margin: 15px 0;
    flex-grow: 1;
    display: flex;
    align-items: center;
    color: #555;
    font-weight: 500;
  }

  .content button {
    padding: 14px 34px;
    border: none;
    border-radius: 25px;
    background: rgba(var(--color-card), 0.1);
    color: rgb(var(--color-card));
    font-size: 1.05rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    border: 1.5px solid rgba(var(--color-card), 0.4);
    margin-top: 10px;
  }

  .content button:hover {
    background: rgb(var(--color-card));
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(var(--color-card), 0.3);
  }
`;

export default Card;
