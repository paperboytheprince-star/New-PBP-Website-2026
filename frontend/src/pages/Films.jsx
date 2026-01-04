import { Film, Calendar } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const Films = () => {
  const films = [
    {
      id: 1,
      title: 'Paperboy Prince for Mayor 2025 Campaign Ad',
      year: '2025',
      youtubeId: 'dsrNNrxWG7A',
    },
    {
      id: 2,
      title: 'Paperboy Prince is Love',
      year: '2024',
      youtubeId: 'NAo_wuUpfx0',
    },
    {
      id: 3,
      title: 'Baddies For Paperboy Prince',
      year: '2024',
      youtubeId: 'h8LNbkXBXO8',
    },
    {
      id: 4,
      title: 'I just Beat Joe Biden',
      year: '2024',
      youtubeId: 'Aqe3h7XTr-E',
    },
    {
      id: 5,
      title: 'Paperboy Love Prince Runs For Mayor',
      year: '2022',
      youtubeId: 'AtRDdMcHo_M',
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {films.map((film) => (
            <Card 
              key={film.id}
              className="bg-white rounded-3xl border-2 border-black overflow-hidden card-shadow transition-all duration-300"
              data-testid={`film-card-${film.id}`}
            >
              {/* YouTube Embed */}
              <div className="relative aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${film.youtubeId}`}
                  title={film.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
                <Badge className="absolute top-4 left-4 bg-pp-magenta text-white font-campaign z-10">
                  <Calendar className="w-3 h-3 mr-1" />
                  {film.year}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <h3 className="font-primary font-bold text-xl">{film.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-pp-lavender">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-campaign text-2xl tracking-wider text-pp-magenta mb-4">MORE CONTENT</h2>
          <p className="font-primary text-lg text-muted-foreground mb-6">
            With over 100 self-produced music videos and counting, Paperboy Love Prince continues to create visual content that pushes boundaries.
          </p>
          <a 
            href="https://www.youtube.com/@PaperboyPrince" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-pp-magenta text-white font-bold px-8 py-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
          >
            Subscribe on YouTube
          </a>
        </div>
      </section>
    </div>
  );
};

export default Films;
