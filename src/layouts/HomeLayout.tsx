import { Suspense, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { starryTheme } from '../styles/starryTheme';

interface HomeProps {
  children: ReactNode;
}

const HomeLayout: React.FC<HomeProps> = ({ children }) => {
  return (
    <>
      <nav style={{
        backgroundColor: 'rgba(10, 10, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <ul style={{
          display: 'flex',
          alignItems: 'center',
          margin: 0,
          padding: '0 1rem',
          listStyle: 'none'
        }}>
          <li style={{ padding: '0.5rem 1rem' }}>
            <Link to="/" className="nav-link">
              Welcome
            </Link>
          </li>
          {/* <li style={{ padding: '0.5rem 1rem' }}>
            <Link to="/pricing" className="nav-link">
              Pricing
            </Link>
          </li> */}
          <div style={{ marginLeft: 'auto', display: 'flex' }}>
            <li style={{ padding: '0.5rem 1rem' }}>
              <Link to="/terms" className="nav-link">
                Terms
              </Link>
            </li>
            <li style={{ padding: '0.5rem 1rem' }}>
              <Link to="/privacy" className="nav-link">
                Privacy
              </Link>
            </li>
          </div>
        </ul>
      </nav>

      <main>
        <Suspense fallback={<></>}>
        <div style={starryTheme.container}>
          <div style={starryTheme.starryBackground} />
          <div style={starryTheme.stars} />
            <div style={starryTheme.starLayer1} />
            <div style={starryTheme.starLayer2} />
            {children}
          </div>
        </Suspense>
        <style>
        {starryTheme.globalStyles}
      </style>
      </main>

      <style>
        {`
          .nav-link {
            color: #ffffff;
            text-decoration: none;
            text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
            transition: all 0.3s;
          }
          .nav-link:hover {
            text-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
          }
        `}
      </style>
    </>
  );
};

export default HomeLayout;
