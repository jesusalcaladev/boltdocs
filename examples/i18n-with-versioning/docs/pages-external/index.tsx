import { Navbar } from 'boltdocs/client';
import { Footer } from '../../src/components/footer';
import { HomePage } from '../../src/pages/home'

/**
 * Custom home page for the site.
 * This overrides any homePage set in boltdocs.config.ts.
 */
export const homePage = HomePage;

/**
 * Custom external routes.
 * Maps paths to React components.
 */
// export const pages = {
//  pricing: PricingPage
// };

export const layout = ({ children }: { children: React.ReactNode }) => <div className='pb-10'>
  <Navbar />
  {children}
  <Footer />
</div>;