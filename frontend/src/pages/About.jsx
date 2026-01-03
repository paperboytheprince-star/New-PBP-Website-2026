import { Heart, User, MapPin, Mic, Film, Music } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-pp-lavender">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Artist Photo Placeholder */}
            <div className="order-2 lg:order-1">
              <div 
                className="aspect-square max-w-md mx-auto bg-white rounded-3xl border-2 border-black shadow-[12px_12px_0px_0px_rgba(255,20,147,1)] flex items-center justify-center overflow-hidden"
                data-testid="artist-photo-placeholder"
              >
                <div className="text-center p-8">
                  <User className="w-24 h-24 text-pp-pink mx-auto mb-4" />
                  <p className="font-campaign text-xl text-muted-foreground tracking-wider">ARTIST PHOTO</p>
                  <p className="font-primary text-sm text-muted-foreground mt-2">Image placeholder</p>
                </div>
              </div>
            </div>

            {/* Bio Content */}
            <div className="order-1 lg:order-2">
              <Badge className="bg-pp-magenta text-white font-campaign text-sm px-4 py-1 mb-4">
                ARTIST • FILMMAKER • ACTIVIST
              </Badge>
              <h1 className="font-primary font-extrabold text-4xl md:text-6xl uppercase tracking-tight mb-6" data-testid="about-title">
                Paperboy<br />Prince
              </h1>
              <p className="font-primary text-lg text-muted-foreground mb-6 leading-relaxed">
                Paperboy Prince (Prince spelled P-R-I-N-C-E, like royalty) is a multidisciplinary artist, filmmaker, musician, and community organizer based in Brooklyn, New York.
              </p>
              <p className="font-primary text-lg text-muted-foreground mb-6 leading-relaxed">
                Known for their vibrant artistic expression and grassroots political activism, Paperboy Prince has become a cultural force advocating for love, community empowerment, and radical positive change.
              </p>
              <p className="font-primary text-lg text-muted-foreground leading-relaxed">
                Through art, music, film, and direct action, Paperboy Prince inspires communities to imagine and build a more loving, equitable world together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="font-campaign text-3xl tracking-wider text-pp-magenta mb-8 text-center" data-testid="what-i-do-title">
          WHAT I DO
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Mic,
              title: 'Music',
              description: 'Creating sounds that move bodies and minds. Music that celebrates life, love, and liberation.',
            },
            {
              icon: Film,
              title: 'Film',
              description: 'Telling visual stories that challenge perspectives and inspire action. Documentary and creative filmmaking.',
            },
            {
              icon: Heart,
              title: 'Activism',
              description: 'Building community through direct action, political engagement, and spreading love in every interaction.',
            },
          ].map((item, idx) => (
            <Card 
              key={idx}
              className="bg-white rounded-3xl border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(255,153,204,1)] hover:shadow-[12px_12px_0px_0px_rgba(255,20,147,1)] transition-all duration-300"
            >
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 bg-pp-magenta rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-primary font-bold text-xl mb-3">{item.title}</h3>
                <p className="font-primary text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MapPin className="w-12 h-12 text-pp-magenta mx-auto mb-4" />
          <h2 className="font-campaign text-2xl tracking-wider mb-4">BASED IN</h2>
          <p className="font-secondary text-4xl md:text-5xl text-pp-pink">Brooklyn, New York</p>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <Heart className="w-12 h-12 text-pp-magenta mx-auto mb-6 fill-pp-magenta" />
        <blockquote className="font-primary text-2xl md:text-3xl font-bold leading-relaxed mb-6">
          "Love is the revolution. Every act of kindness is an act of resistance."
        </blockquote>
        <cite className="font-campaign text-xl text-pp-magenta tracking-wider">— PAPERBOY PRINCE</cite>
      </section>
    </div>
  );
};

export default About;
