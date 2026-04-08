import { Navbar } from 'boltdocs/client';
import { Footer } from '../../src/footer';
import HomePage from '../../src/pages/home-page';
import RoadmapPage from '../../src/pages/roadmap';

/**
 * Custom home page for the site.
 * This overrides any homePage set in boltdocs.config.ts.
 */
export const homePage = HomePage;

/**
 * Custom external routes.
 * Maps paths to React components.
 */
export const pages = {
  '/roadmap': RoadmapPage,
};

export const layout = ({ children }: { children: React.ReactNode }) => <div className='pb-10'>
  <Navbar />
  {children}
  <Footer />
</div>;