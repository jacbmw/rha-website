import './globals.css';
import ExitIntentModal from './components/ExitIntentModal';
import SiteAnalytics from './components/SiteAnalytics';

export const metadata = {
  title: 'Ripehouse Advisory | Property investment, done differently',
  description: 'Build a property portfolio with a clear strategy, independent advice and a team invested in your long-term outcome.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-AU">
      <body>
        {children}
        <ExitIntentModal />
        <SiteAnalytics />
      </body>
    </html>
  );
}
