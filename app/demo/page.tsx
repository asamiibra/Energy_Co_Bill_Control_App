import type { Metadata } from 'next';

import { DemoLandingPage } from '@/components/demo-landing-page';

export const metadata: Metadata = {
  title: 'Bill Control Interactive Prototype | Energy Co',
  description:
    'A synthetic, read-only guided demonstration of the Bill Control MVP.',
};

export default function DemoPage() {
  return <DemoLandingPage />;
}
