import { LandingPageProductView } from '@/components/views/landing-pages/product-view';

interface Props {
  params: Promise<{ productId: string }>;
}

export default async function LandingPageProductPage({ params }: Props) {
  const { productId } = await params;
  return <LandingPageProductView productId={productId} />;
}
