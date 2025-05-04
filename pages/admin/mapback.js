import dynamic from 'next/dynamic';

// LeafletMapback dynamisch laden – ohne SSR
const LeafletMapBack = dynamic(() => import('@/components/LeafletMapback'), {
  ssr: false,
});

export default function MapBackPage() {
  return <LeafletMapBack />;
}
