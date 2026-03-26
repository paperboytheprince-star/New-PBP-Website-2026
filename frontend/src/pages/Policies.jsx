import { Link } from 'react-router-dom';
import { trackClick } from '../lib/analytics';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Home, Heart, Briefcase, DollarSign, Sparkles, GraduationCap, 
  TreePine, Globe, ArrowRight, ChevronDown
} from 'lucide-react';

// Google Form URL for volunteer signup
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScZbG2bCzNGf6AAaYzV9y8d9aVOJxct7El-m1MT92IlkDOy0w/viewform?usp=preview';

// Standout policy categories with anchor links
const standoutPolicies = [
  { id: 'housing', label: 'Housing for All', icon: Home, color: 'bg-blue-500' },
  { id: 'healthcare', label: 'Healthcare for All', icon: Heart, color: 'bg-red-500' },
  { id: 'jobs', label: 'Jobs Guarantee', icon: Briefcase, color: 'bg-green-500' },
  { id: 'ubi', label: 'Universal Basic Income', icon: DollarSign, color: 'bg-yellow-500' },
  { id: 'love', label: 'Spread Love', icon: Sparkles, color: 'bg-pp-magenta' },
  { id: 'schools', label: 'Futuristic Schools', icon: GraduationCap, color: 'bg-purple-500' },
  { id: 'green', label: 'Greener New York', icon: TreePine, color: 'bg-teal-500' },
  { id: 'peace', label: 'End All Wars', icon: Globe, color: 'bg-orange-500' },
];

const Policies = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1728706613021-e447801e1ea6?w=1600)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-pp-magenta/90 via-pp-pink/80 to-pp-magenta/90" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-primary font-extrabold text-4xl md:text-6xl text-white uppercase tracking-tight mb-4" data-testid="policies-title">
            Policy Platform
          </h1>
          <p className="font-primary text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
            A deep platform for housing, healthcare, jobs, dignity, education, culture, peace, and a better future for everyone.
          </p>
          <button 
            onClick={() => scrollToSection('standout-policies')}
            className="animate-bounce"
            aria-label="Scroll to policies"
          >
            <ChevronDown className="w-8 h-8 text-white" />
          </button>
        </div>
      </section>

      {/* Standout Policy Pills */}
      <section id="standout-policies" className="py-12 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-campaign text-2xl md:text-3xl tracking-wider text-pp-magenta text-center mb-8">
            OUR PRIORITIES
          </h2>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {standoutPolicies.map((policy) => (
              <button
                key={policy.id}
                onClick={() => scrollToSection(policy.id)}
                className={`${policy.color} text-white font-primary font-semibold px-4 py-2 md:px-6 md:py-3 rounded-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2`}
                data-testid={`policy-pill-${policy.id}`}
              >
                <policy.icon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">{policy.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Full Policy Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        
        {/* Housing for All */}
        <div id="housing" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-campaign text-3xl md:text-4xl tracking-wider text-pp-magenta">
              HOUSING FOR ALL
            </h2>
          </div>
          <p className="font-primary text-lg text-muted-foreground mb-6">
            Everyone deserves a safe, affordable home. We fight for strong tenant protections, public housing expansion, and action against speculation.
          </p>
          <Card className="border-2 border-black rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-primary font-bold text-xl mb-4">Guaranteeing the Right to Housing</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Prohibit rental evictions without a proposal for public rehousing</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Implement a universal rent guarantee creating a safety net against unpaid rent for tenants and landlords alike</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Regulate rents everywhere on the territory and lower them in large cities, adopt a housing shield that limits the share of income spent on housing</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Build 200,000 public housing units per year for five years to the highest environmental standards</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Raise the minimum threshold of social housing per municipality to 30%, increase sanctions against municipalities that do not comply</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Impose a progressive tax on high speculative real estate transactions to finance the fight against substandard housing</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Protect private homeowners from excessive taxes with special emphasis on the elderly</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Make it mandatory to renovate "thermal apartments" before renting them out</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Fight against substandard and unhealthy housing: make a "rental permit" mandatory throughout the United States</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Use the right of requisition and surcharges to fight against vacant dwellings</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Impose in new constructions that 100% of the housing be accessible, as provided for in the 2005 law on disability</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Fight against speculation on housing by limiting short-term rentals (AirBnB type)</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Launch an emergency bed bug prevention and eradication plan</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Revise Flood Risk Prevention Plans and create a Fund to help relocate buildings threatened by floods and rising seas</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Revalue the personal housing subsidies (Section 8) in line with inflation</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Arts, Culture, and Creative Power */}
        <div id="arts" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-pp-magenta flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-campaign text-3xl md:text-4xl tracking-wider text-pp-magenta">
              ARTS, CULTURE & CREATIVE POWER
            </h2>
          </div>
          <Card className="border-2 border-black rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-primary font-bold text-xl mb-4">Develop a Public Service for the Arts and Culture</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Increase the budget dedicated to art, culture and creation to 1% of GDP per year</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Restore an ambitious public service of culture for the cultural actors and the public</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Start major cultural work to put an end to territorial inequalities in terms of structures for creation, teaching, dissemination</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Extend free admission to all museums and public monuments, and lower the prices of public and private services</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create a free online public media library with works in the public domain</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Support the creation and appropriation by all of cultural works and practices</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Improve the system of intermittent workers in the entertainment industry</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create a National Center for Artists and Authors</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Launch a training and recruitment plan for local cultural jobs</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Digital Rights and Public Technology */}
        <div id="digital" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-campaign text-3xl md:text-4xl tracking-wider text-pp-magenta">
              DIGITAL RIGHTS & PUBLIC TECHNOLOGY
            </h2>
          </div>
          <Card className="border-2 border-black rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-primary font-bold text-xl mb-4">Putting Digital Technology at the Service of the General Interest</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Guarantee the right to a minimum free access to the Internet and digital coverage of the whole country in very high speed at affordable cost</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Constitutionalize the right to data and communication encryption</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Systematize the publication of public information held by local authorities in open data</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Guarantee the maintenance of counters, personnel, and paper forms despite virtualization of public services</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Deploy a local public service to support the 20% of American people who have difficulty with digital technology</li>
              </ul>
              
              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Guaranteeing Digital Sovereignty</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Guarantee net neutrality, i.e. equal access and equal treatment for everyone</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Bringing digital and telecommunications infrastructures under public control</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create a public agency for open source software</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Generalize the use of open source software in public administrations and national education</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create a national video game center and develop a public training program</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create a national mission to master artificial intelligence</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Reduce the ecological impact of digital technology</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Jobs, Wages, and Worker Power */}
        <div id="jobs" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-campaign text-3xl md:text-4xl tracking-wider text-pp-magenta">
              JOBS, WAGES & WORKER POWER
            </h2>
          </div>
          <p className="font-primary text-lg text-muted-foreground mb-6">
            Anyone who wants to work should be able to get a meaningful job at fair pay, with training and public investment.
          </p>
          <Card className="border-2 border-black rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-primary font-bold text-xl mb-4">Establish the Job Guarantee</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create a job guarantee: any long-term unemployed person will be offered a useful job in an emergency sector, paid at least the minimum wage, financed by the State</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create job guarantee committees composed of representatives of the long-term unemployed, trade unions, uberized workers, and local authorities</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Ensuring Stable Employment for Everyone</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Introduce a maximum quota of precarious contracts in companies: 10% for SMEs, 5% for large companies</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Apply the presumption of salaried status to workers on digital platforms (Uber, etc.)</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Supervise subcontracting by guaranteeing responsibility and commitments of principals</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Increase Wages and Reduce Inequality</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Immediately raise the minimum wage</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Organize a general social conference on salaries</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Limit the gap of 1 to 20 between the lowest and highest wages in a company</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Ensure professional equality between women and men</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Revalue the salaries of civil servants and unfreeze the index point</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Putting an End to Suffering at Work</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Recognizing burn-out as an occupational disease</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Doubling the number of labor inspectors</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Strengthen occupational medicine, integrating it into the public health service</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Make the right to disconnect effective and provide a framework for teleworking</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Recognize Citizenship in the Company</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Increase employee representation in decision-making bodies of large companies to at least one third</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Establish new rights of intervention and decision-making for employees</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create a right of pre-emption to allow employees to take over their company in the form of a cooperative</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Give works councils a suspensive veto over redundancy plans</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Guaranteeing a Dignified Retirement</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Restore the right to full retirement at age 60 for all after 40 years of contributions</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Raise all pensions for a full career to at least the level of the revalued minimum wage</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Index pensions to wages</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Green Infrastructure and Climate Action */}
        <div id="green" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center">
              <TreePine className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-campaign text-3xl md:text-4xl tracking-wider text-pp-magenta">
              GREEN INFRASTRUCTURE & CLIMATE ACTION
            </h2>
          </div>
          <p className="font-primary text-lg text-muted-foreground mb-6">
            Invest in parks, trees, climate resilience, cleaner streets, healthier neighborhoods, and more public green space across the city.
          </p>
          <Card className="border-2 border-black rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-primary font-bold text-xl mb-4">Planning the Ecological Transition</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Plan the transition to 100% renewable energies with a double watchword: sobriety and efficiency</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Getting out of carbon-based energy: stop subsidizing fossil fuels</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Guarantee the first quantities of energy essential to a dignified life and introduce progressive pricing</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Re-insulating at least 700,000 homes per year and putting an end to energy poverty</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Launching Major Ecological Projects That Create Jobs</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create jobs through investment in ecological and social change</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Initiate a global plan to renovate our infrastructures to adapt them to climate change</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Renovate all water and sewerage systems to limit leaks</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Launching major renovation work on the railroads</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Develop an eco-construction sector using bio-sourced materials</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Consume Differently - A "Zero Waste" America</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Prohibit programmed obsolescence and extend the legal warranty periods for products</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Fight against the overproduction of waste: immediately ban single-use plastics</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create a public service for repair and reuse</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Generalize the durability index of products</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Saving the Ecosystem and Biodiversity</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Stop urban sprawl: renounce large, useless and ecologically harmful infrastructure projects</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Prohibit the patenting of living organisms</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Protect habitats and species in a concrete way: ban pesticides around inhabited areas</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Classify 30% of maritime territory as protected, including 10% under strong protection</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Breaking with Animal Abuse</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Banning factory farms</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Limiting the transport time of live animals</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Prohibit cruel practices: battery hens and rabbits, crushing of chicks, tail docking, etc.</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Direct research towards alternative and ethical methods</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Food, Water, and Public Health */}
        <div id="healthcare" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-campaign text-3xl md:text-4xl tracking-wider text-pp-magenta">
              FOOD, WATER & PUBLIC HEALTH
            </h2>
          </div>
          <p className="font-primary text-lg text-muted-foreground mb-6">
            Healthcare should be universal, public, affordable, and built around prevention, dignity, and access.
          </p>
          <Card className="border-2 border-black rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-primary font-bold text-xl mb-4">Making Water a Central Issue for Humanity</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create a high commissioner for water</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Organize 100% public management of water within the framework of a decentralized public service</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Establish a "blue rule" that applies the principle of the "green rule" to water</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Inscribe access to water, sanitation and the right to hygiene as a fundamental human right</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Crack down on illegal water shut-offs with deterrent penalties</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Provide free public water fountains, showers and toilets in the area</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Establishing Food Sovereignty</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create 300,000 agricultural jobs to establish a relocalized, diversified and ecological agriculture</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Guarantee remunerative prices for producers by setting minimum prices for farmers</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Reach 30% of agricultural surface in organic agriculture by 2030 and 100% by 2050</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Plan the gradual withdrawal of synthetic fertilizers and pesticides</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Develop short circuits to reduce the circulation of goods</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Putting an End to Junk Food</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Urgently ban the most controversial additives</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Set maximum levels of salt, sugar and saturated fatty acids in processed foods</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Prohibit food advertising aimed at children and adolescents</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Integrate nutrition education into school curricula</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Guarantee permanent access to five seasonal fruits and vegetables at blocked prices</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Gradually increase the food in collective catering to 100% local and organic</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Prevent and Fight Against Pollution</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Helping the victims of pollution and whistleblowers</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Manage industrial risks with the creation of an independent safety authority</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Train all citizens in the framework of mandatory annual civil security exercises</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Education and Futuristic Schools */}
        <div id="schools" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-campaign text-3xl md:text-4xl tracking-wider text-pp-magenta">
              EDUCATION & FUTURISTIC SCHOOLS
            </h2>
          </div>
          <p className="font-primary text-lg text-muted-foreground mb-6">
            Schools should prepare people for the future with creativity, technology, literacy, ecological thinking, and real support.
          </p>
          <Card className="border-2 border-black rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-primary font-bold text-xl mb-4">Rebuilding a Global School for Equality and Emancipation</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Ensure that public education is truly free, including transportation and extracurricular activities</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Move towards free school canteens</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Reduce class sizes everywhere to 19 students per class</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Allow schooling from the age of 2 for parents who wish</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Objective "zero dropout": strengthen remedial education systems</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Establish a new school districting that includes private schools</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Extend compulsory schooling to 18 years of age</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create a real public service for the support of students with disabilities</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Strengthen school medicine</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Making Schools the Lever of Ecological and Democratic Change</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Integrate the ecological issue in the programs from kindergarten to high school</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Introduce new practical lessons (repair, construction, cooking, gardening)</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Increase the food in school canteens to 100% organic and local</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Reinforce education on equality, against sexism and discrimination</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Making the Public Service of Early Childhood</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create a public service for Pre-K and adapted childcare facilities</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Plan the creation of nurseries with reduced number of children</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Move towards free public Pre-K facilities</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Eradicate Illiteracy and Develop Literacy</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Eradicate illiteracy for school leavers and adults by 2027</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Develop literacy structures for dual-language courses</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Initiate a plan to fight illiteracy in prisons</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Refounding Higher Education</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Make higher education free of charge, from the bachelor's degree to the doctorate</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Put an end to the precariousness of higher education personnel</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Establish a university health service with sufficient staff</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Launch a major plan for university real estate</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Investing in Research and Science</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Increase public research funding to 1.5% of GDP by 2027</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Building a protective status for young researchers</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create a public service of scientific publication with open licenses</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Dignity, Safety Net, and Economic Justice */}
        <div id="ubi" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-campaign text-3xl md:text-4xl tracking-wider text-pp-magenta">
              DIGNITY, SAFETY NET & ECONOMIC JUSTICE
            </h2>
          </div>
          <p className="font-primary text-lg text-muted-foreground mb-6">
            No one should be left below the floor. Economic security should be a right, not a privilege.
          </p>
          <Card className="border-2 border-black rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-primary font-bold text-xl mb-4">Eradicate Poverty</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Establish a dignity guarantee that leaves no individual below the poverty line with $1500</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Immediately freeze the prices of basic necessities (gasoline, food, energy)</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Achieve the goal of zero homelessness: double the number of shelter spaces</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Automate the payment of social assistance and benefits to fight against non-use</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Restructure the loans of over-indebted households</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Ensuring free access to sanitary protection</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Building the Autonomy of Young People</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create an autonomy allowance for young people set above the poverty line ($1000 for a single person)</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Introduce a five-year "youth employment" proposal in the non-market and public sector</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Increase internship allowances and negotiate with employer branches</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Restore Protective Unemployment Insurance</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Extend occupational medicine to the unemployed</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Compensate the unemployed from the first day of the end of their contract</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Give each employee the right to 36 hours of training per year</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Socializing the Fundamental Commons</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Guarantee public management of a list of common goods and essential services established by referendum</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create a Commons Advocate to produce and publish an annual report</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Prevent private property rights from prevailing over the protection of water, air, food, life, health and energy</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Equality, Disability Rights, and Liberation */}
        <div id="love" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-pp-magenta flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-campaign text-3xl md:text-4xl tracking-wider text-pp-magenta">
              EQUALITY, RIGHTS & LIBERATION
            </h2>
          </div>
          <p className="font-primary text-lg text-muted-foreground mb-6">
            Public policy should be rooted in care, creativity, community, safety, and mutual respect.
          </p>
          <Card className="border-2 border-black rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-primary font-bold text-xl mb-4">Achieving Equality Between Women and Men</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Adopt a law to fight sexism and violence against women, allocate one billion budget</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Impose and enforce parity between women and men in management of political and economic institutions</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Fight against forced part-time work, 80% of which involves women</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Extend the duration of parental leave, make it the same for both parents</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Strengthen the network of abortion centers by opening one center per hospital</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Guarantee New Rights</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Constitutionalize the non-commodification of the human body and the fundamental right to self-determination</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Add to the Constitution the right to contraception and abortion, the right to die with dignity</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Authorize a free change of civil status before a civil registrar</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Reimburse medically assisted procreation, make it accessible to trans people</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Implement a plan to eradicate violence against LGBTQIA+ people</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Fight Against Racism, Anti-Semitism and Discrimination</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Implement a global action plan against all forms of discrimination</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Guarantee the right to full citizenship for all children born in the United States</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create an Equality Commission with a Discrimination Observatory</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Implement the receipt for identity checks to fight against racial profiling</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Removing Barriers to the Autonomy of People with Disabilities</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Ensure the financial autonomy of disabled people by raising aids to the level of the minimum wage</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Increase the number of complete bilingual sign language (LSF) courses</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Universal accessibility objective: zero tolerance against obstacles</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Perpetuate the financing of the professional integration of people with disabilities</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Facing Collectively the Loss of Individual Autonomy</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Building a public service for dependency, to help seniors stay at home</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Develop a public network of retirement homes with harmonized and accessible rates</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Revalue the jobs and incomes of all professionals working with the elderly</li>
              </ul>

              <h3 className="font-primary font-bold text-xl mb-4 mt-8">Freeing Sports and Bodies from Money</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create a sports association in all primary schools to make free the practice of physical activity</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Move towards four hours of PE in the school curriculum</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Reimburse health sports thanks to Social Security</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Promote women's sports, establish parity in televising of major sporting events</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Strengthen the accessibility of sports facilities for people with disabilities</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Peace, Democracy, and Public Good */}
        <div id="peace" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-campaign text-3xl md:text-4xl tracking-wider text-pp-magenta">
              PEACE, DEMOCRACY & PUBLIC GOOD
            </h2>
          </div>
          <p className="font-primary text-lg text-muted-foreground mb-6">
            Invest in peace, diplomacy, care, and human needs, not endless violence and destruction.
          </p>
          <Card className="border-2 border-black rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-primary font-bold text-xl mb-4">Our Vision for Peace</h3>
              <ul className="space-y-3 font-primary text-muted-foreground">
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Create major public research institutes as guarantors of research of general interest instead of the Armed Forces</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Advocate for global Internet governance by establishing a dedicated agency at the UN</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Promote an international ethical charter for the use of technosciences</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Work towards the creation of an international law of marine biodiversity</li>
                <li className="flex gap-2"><span className="text-pp-magenta">•</span>Opening the archives on the wars of decolonization</li>
              </ul>
            </CardContent>
          </Card>
        </div>

      </section>

      {/* CTA Section */}
      <section className="py-20 bg-pp-lavender">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-primary font-extrabold text-3xl md:text-4xl uppercase tracking-tight mb-6">
            Help Build the Future
          </h2>
          <p className="font-primary text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the movement. Every volunteer, every donation, every voice brings us closer to a better future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={GOOGLE_FORM_URL}
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackClick('volunteer_policies', '/policies')}
              data-testid="policies-cta-volunteer"
            >
              <Button className="rounded-full bg-pp-magenta text-white font-bold px-8 py-6 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all border-2 border-black uppercase tracking-wider">
                Volunteer
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <a 
              href="https://secure.actblue.com/donate/paperboy-love-prince-2" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackClick('donate_policies', '/policies')}
              data-testid="policies-cta-donate"
            >
              <Button className="rounded-full bg-white text-pp-magenta font-bold px-8 py-6 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all border-2 border-black uppercase tracking-wider">
                <DollarSign className="mr-2 w-5 h-5" />
                Donate
              </Button>
            </a>
            <a 
              href={GOOGLE_FORM_URL}
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackClick('join_policies', '/policies')}
              data-testid="policies-cta-join"
            >
              <Button className="rounded-full bg-black text-white font-bold px-8 py-6 text-lg shadow-[4px_4px_0px_0px_rgba(255,20,147,1)] hover:translate-y-1 hover:shadow-none transition-all border-2 border-black uppercase tracking-wider">
                <Heart className="mr-2 w-5 h-5" />
                Join Us
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Policies;
