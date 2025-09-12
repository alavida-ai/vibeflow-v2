import type { Metadata } from 'next';
import CampaignHeader from '../../components/open/CampaignHeader';
import LiveMetricsDashboard from '../../components/open/LiveMetricsDashboard';
import ActivityTracker from '../../components/open/ActivityTracker';
import StrategyTimeline from '../../components/open/StrategyTimeline';
import ContentPerformanceFeed from '../../components/open/ContentPerformanceFeed';
import MethodologySection from '../../components/open/MethodologySection';

export const metadata: Metadata = {
  title: 'Build in Open • Alavida × Vibeflow SF 2025',
  description:
    'Transparent, real-time dashboard for the Alavida × Vibeflow SF Campaign 2025: metrics, activity, strategy and performance.',
  openGraph: {
    title: 'Build in Open • Alavida × Vibeflow SF 2025',
    description:
      'Transparent, real-time dashboard for the Alavida × Vibeflow SF Campaign 2025: metrics, activity, strategy and performance.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build in Open • Alavida × Vibeflow SF 2025',
    description:
      'Transparent, real-time dashboard for the Alavida × Vibeflow SF Campaign 2025: metrics, activity, strategy and performance.',
  },
};

export default function OpenPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8 space-y-10 md:space-y-14 py-8 md:py-12">
      <CampaignHeader />
      <LiveMetricsDashboard />
      <ActivityTracker />
      <StrategyTimeline />
      <ContentPerformanceFeed />
      <MethodologySection />
    </main>
  );
}


