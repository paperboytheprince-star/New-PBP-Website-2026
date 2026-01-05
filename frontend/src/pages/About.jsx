import { Heart, MapPin, Award, Users, Music2, Film, Building } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden bg-pp-lavender">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Artist Photo */}
            <div className="order-2 lg:order-1">
              <div 
                className="aspect-square max-w-md mx-auto bg-white rounded-3xl border-2 border-black shadow-[12px_12px_0px_0px_rgba(255,20,147,1)] overflow-hidden"
                data-testid="artist-photo"
              >
                <img 
                  src="https://customer-assets.emergentagent.com/job_prince-engage/artifacts/5yakqqao_paperboy%20prince%20bus%20pic.jpg"
                  alt="Paperboy Love Prince"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Bio Header */}
            <div className="order-1 lg:order-2">
              <Badge className="bg-pp-magenta text-white font-campaign text-sm px-4 py-1 mb-4">
                ARTIST • ACTIVIST • CANDIDATE
              </Badge>
              <h1 className="font-primary font-extrabold text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight mb-6" data-testid="about-title">
                Paperboy<br />Love Prince
              </h1>
              <p className="font-primary text-lg text-muted-foreground mb-6 leading-relaxed">
                Running for Congress and New York State Assembly District 54 — seeking to dismantle the establishment's grip on power and empower the people.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Full Bio */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none">
          <p className="font-primary text-lg leading-relaxed mb-6">
            Paperboy Love Prince is a remarkable individual who seamlessly blends the worlds of politics and artistry, leaving an indelible mark on both. It was in 1964 that their grandparents, recognizing the plight of the less fortunate, founded the Elim International Fellowship Church, a beacon of hope and support in their community.
          </p>
          <p className="font-primary text-lg leading-relaxed mb-6">
            With a thirst for knowledge, Paperboy Love Prince pursued their education at the University of Maryland College Park, where they earned their degree studying computer science and broadcast journalism. Seeking a broader understanding of the world, they later attended the Universidad de Alicante in Spain, immersing themselves in the study of international relations and government. Their two years living abroad in Spain opened their eyes to the interconnectedness of global issues and deepened their commitment to effecting positive change.
          </p>
          <p className="font-primary text-lg leading-relaxed mb-6">
            Even in high school, Paperboy Love Prince displayed an unwavering dedication to public service. They interned at the House of Representatives for Congress members in Washington, D.C. and served as a Supreme Court Marshal intern at the prestigious Supreme Court of the United States. These experiences laid the foundation for their future political endeavors.
          </p>
          <p className="font-primary text-lg leading-relaxed mb-6">
            As a prolific artist, Paperboy Love Prince has organized countless community events, shows, and concerts, hosting over a thousand performers. Their creativity knows no bounds, and their artistic endeavors have touched the lives of many. Their passion for the arts extends beyond their own talents, as they have mentored numerous young individuals in both arts and politics.
          </p>
        </div>
      </section>

      {/* Achievements Cards */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-campaign text-3xl tracking-wider text-pp-magenta mb-8 text-center">
            POLITICAL CAMPAIGNS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { year: '2020', title: 'Congress', stat: '20% of vote', note: 'Opponent spent $400,000' },
              { year: '2021', title: 'NYC Mayor', stat: '9% rank choice vote', note: 'Most votes per dollar spent' },
              { year: '2026', title: 'Congress', stat: 'Current Campaign', note: 'Running now' },
              { year: '2026', title: 'NY Assembly 54', stat: 'Current Campaign', note: 'Running now' },
            ].map((campaign, idx) => (
              <Card key={idx} className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,153,204,1)]">
                <CardContent className="p-6 text-center">
                  <Badge className="bg-pp-magenta text-white font-campaign mb-2">{campaign.year}</Badge>
                  <h3 className="font-primary font-bold text-xl mb-1">{campaign.title}</h3>
                  <p className="font-secondary text-2xl text-pp-magenta">{campaign.stat}</p>
                  <p className="font-primary text-sm text-muted-foreground mt-2">{campaign.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="font-primary text-center text-lg text-muted-foreground max-w-2xl mx-auto">
            Nearly <span className="font-bold text-pp-magenta">100,000 votes</span> received across political campaigns throughout New York City.
          </p>
        </div>
      </section>

      {/* More Bio */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none">
          <p className="font-primary text-lg leading-relaxed mb-6">
            Passionate about addressing societal inequalities, Paperboy Love Prince founded OurFoodNYC, a mutual aid food group that has distributed over $4 million worth of free food across the five boroughs. They also played a pivotal role in launching and filling over 50 community fridges in NYC, ensuring that those in need have access to essential resources. Their dedication to addressing homelessness led them to establish TinyHouseNYC, constructing free tiny homes for the unhoused and providing over 150 nights of free housing.
          </p>
          <p className="font-primary text-lg leading-relaxed mb-6">
            At the Paperboy Prince Love Gallery, located at 1254 Myrtle Avenue in Bushwick, Brooklyn, Paperboy Love Prince has created a futuristic mutual aid hub and community space. This transformative endeavor has facilitated the distribution of millions of pounds of food, clothing, and books, fostering a sense of unity and support within the community.
          </p>
          <p className="font-primary text-lg leading-relaxed mb-6">
            Recognized for their remarkable achievements, Paperboy Love Prince has been featured in prestigious publications such as Rolling Stone, The Wall Street Journal, The Harvard Political Review, and The New Yorker. They were recognized and awarded for their achievements by the Harvard University Shorenstein Center on Media, Politics and Public Policy. Brooklyn Magazine named them one of the 50 most influential people in Brooklyn, a testament to the profound impact they have had on their community.
          </p>
          <p className="font-primary text-lg leading-relaxed mb-6">
            Their vision extends beyond individual efforts, as Paperboy Love Prince has forged partnerships with notable entities like Meta, Target, Gucci, and McDonald's, leveraging these alliances to further their mission of empowering communities.
          </p>
          <p className="font-primary text-lg leading-relaxed mb-6">
            With an extensive discography comprising over 100 self-produced music videos, Paperboy Love Prince has become a force to be reckoned with in the world of music. Their groundbreaking 500-song album, created in collaboration with tech company "Boomy" and over 180 artists, showcases their ability to push boundaries and innovate.
          </p>
          <p className="font-primary text-lg leading-relaxed mb-6">
            Paperboy Love Prince's activism and dedication to grassroots organizing have led to the organization of some of the largest peaceful protests in NYC history during the pivotal years of 2020 and 2021. Their unwavering commitment to social justice has inspired activists and aspiring candidates for office around the world.
          </p>
          <p className="font-primary text-lg leading-relaxed mb-6">
            Sharing their wealth of knowledge and experiences, Paperboy Love Prince has lectured at esteemed institutions such as Columbia University, Pratt University, and SVA. They seize every opportunity to educate and motivate the next generation of changemakers.
          </p>
        </div>
      </section>

      {/* Community Impact */}
      <section className="py-16 bg-pp-lavender">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-campaign text-3xl tracking-wider text-pp-magenta mb-8 text-center">
            COMMUNITY IMPACT
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '$4M+', label: 'Free Food Distributed' },
              { value: '50+', label: 'Community Fridges' },
              { value: '150+', label: 'Nights Free Housing' },
              { value: '1000+', label: 'Performers Hosted' },
            ].map((stat, idx) => (
              <Card key={idx} className="bg-white rounded-2xl border-2 border-black text-center p-6">
                <p className="font-secondary text-3xl md:text-4xl text-pp-magenta">{stat.value}</p>
                <p className="font-primary text-sm text-muted-foreground mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured In */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <h2 className="font-campaign text-2xl tracking-wider text-muted-foreground mb-6">FEATURED IN</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {['Rolling Stone', 'Wall Street Journal', 'Harvard Political Review', 'The New Yorker', 'Brooklyn Magazine'].map((pub) => (
            <Badge key={pub} variant="outline" className="font-primary text-sm px-4 py-2 border-2 border-black">
              {pub}
            </Badge>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MapPin className="w-12 h-12 text-pp-magenta mx-auto mb-4" />
          <h2 className="font-campaign text-2xl tracking-wider mb-4">PAPERBOY PRINCE LOVE GALLERY</h2>
          <p className="font-primary text-gray-400 mb-2">1254 Myrtle Avenue</p>
          <p className="font-secondary text-3xl md:text-4xl text-pp-pink">Bushwick, Brooklyn</p>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <Heart className="w-12 h-12 text-pp-magenta mx-auto mb-6 fill-pp-magenta" />
        <blockquote className="font-primary text-2xl md:text-3xl font-bold leading-relaxed mb-6">
          "With visionary ideas and unwavering determination, Paperboy Love Prince is poised to revolutionize the political landscape, promoting equity, justice, and a better future for all."
        </blockquote>
        <cite className="font-campaign text-xl text-pp-magenta tracking-wider">— PAPERBOY LOVE PRINCE 2026</cite>
      </section>
    </div>
  );
};

export default About;
