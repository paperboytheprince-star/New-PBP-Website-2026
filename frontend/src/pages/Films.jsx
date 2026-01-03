import { Film, Play, Calendar } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const Films = () => {
  // Placeholder film data
  const films = [
    {
      id: 1,
      title: 'Love Revolution Documentary',
      year: '2024',
      description: 'A documentary exploring grassroots community organizing and the power of love-based activism in Brooklyn.',
    },
    {
      id: 2,
      title: 'Streets of Brooklyn',
      year: '2023',
      description: 'Visual journey through the neighborhoods that shaped Paperboy Prince, featuring local artists and community leaders.',
    },
    {
      id: 3,
      title: 'The Campaign',
      year: '2022',
      description: 'Behind-the-scenes look at running for office with love, art, and radical transparency.',
    },
    {
      id: 4,
      title: 'Art Is Activism',
      year: '2021',
      description: 'Short film exploring how creative expression becomes a tool for social change and community healing.',
    },
    {
      id: 5,
      title: 'Community Garden',
      year: '2021',
      description: 'Documentary following the transformation of an empty lot into a thriving community garden space.',
    },
    {
      id: 6,
      title: 'Youth Voices',
      year: '2020',
      description: 'Amplifying the perspectives of young activists and artists creating change in their communities.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-pp-magenta to-pp-orange" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Film className="w-16 h-16 text-pp-magenta mx-auto mb-6" />
          <h1 className="font-primary font-extrabold text-4xl md:text-6xl uppercase tracking-tight mb-4" data-testid="films-title">
            Films by<br />Paperboy Prince
          </h1>
          <p className="font-primary text-lg text-gray-300 max-w-2xl mx-auto">
            Visual storytelling that documents movements, amplifies voices, and inspires change.
          </p>
        </div>
      </section>

      {/* Films Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {films.map((film) => (
            <Card 
              key={film.id}
              className="bg-white rounded-3xl border-2 border-black overflow-hidden card-shadow transition-all duration-300 group"
              data-testid={`film-card-${film.id}`}
            >
              {/* YouTube Embed Placeholder */}
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 rounded-full bg-pp-magenta/80 flex items-center justify-center mx-auto mb-4 group-hover:bg-pp-magenta transition-colors cursor-pointer">
                    <Play className="w-10 h-10 text-white fill-white ml-1" />
                  </div>
                  <p className="font-campaign text-lg tracking-wider text-gray-400">YOUTUBE FILM EMBED</p>
                  <p className="font-primary text-sm text-gray-500 mt-1">Video placeholder</p>
                </div>
                <Badge className="absolute top-4 left-4 bg-pp-magenta text-white font-campaign">
                  <Calendar className="w-3 h-3 mr-1" />
                  {film.year}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <h3 className="font-primary font-bold text-xl mb-2">{film.title}</h3>
                <p className="font-primary text-muted-foreground">{film.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-pp-lavender">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-campaign text-2xl tracking-wider text-pp-magenta mb-4">MORE COMING SOON</h2>
          <p className="font-primary text-lg text-muted-foreground">
            New films and video content are in production. Check back for updates or follow on social media.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Films;
