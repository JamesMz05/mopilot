import Header from '@/components/Header'
import HeroChat from '@/components/HeroChat'
import CostCalculator from '@/components/CostCalculator'
import TransitMap from '@/components/TransitMap'
import RangeGuide from '@/components/RangeGuide'
import VehicleCards from '@/components/VehicleCards'
import OnboardingGuide from '@/components/OnboardingGuide'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroChat />
        <CostCalculator />
        <TransitMap />
        <RangeGuide />
        <VehicleCards />
        <OnboardingGuide />
      </main>
      <Footer />
    </>
  )
}
