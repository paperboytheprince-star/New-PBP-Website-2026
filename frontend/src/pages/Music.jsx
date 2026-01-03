import { Music2, Disc3, ListMusic, Play, Calendar } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const Music = () => {
  // Placeholder album data
  const albums = [
    {
      id: 1,
      title: 'Love Revolution',
      year: '2024',
      type: 'Album',
      trackCount: 12,
    },
    {
      id: 2,
      title: 'Brooklyn Anthems',
      year: '2023',
      type: 'EP',
      trackCount: 6,
    },
    {
      id: 3,
      title: 'Community Sounds',
      year: '2022',
      type: 'Album',
      trackCount: 10,
    },
  ];

  // Placeholder singles/tracks
  const singles = [
    {
      id: 1,
      title: 'Spread Love',
      year: '2024',
    },
    {
      id: 2,
      title: 'Brooklyn Rise',
      year: '2024',
    },
    {
      id: 3,
      title: 'We The People',
      year: '2023',
    },
    {
      id: 4,
      title: 'Garden Party',
      year: '2023',
    },
    {
      id: 5,
      title: 'Movement',
      year: '2022',
    },
    {
      id: 6,
      title: 'Love Is Free',
      year: '2022',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pp-magenta via-pp-pink to-pp-orange opacity-90" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <Music2 className="w-16 h-16 mx-auto mb-6" />
          <h1 className="font-primary font-extrabold text-4xl md:text-6xl uppercase tracking-tight mb-4" data-testid="music-title">
            Music by<br />Paperboy Prince
          </h1>
          <p className="font-primary text-lg text-white/90 max-w-2xl mx-auto">
            Sounds that move bodies, lift spirits, and inspire action. Music for the love revolution.
          </p>
        </div>
      </section>

      {/* Albums Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="font-campaign text-3xl tracking-wider text-pp-magenta mb-8" data-testid="albums-title">
          ALBUMS & EPS
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {albums.map((album) => (
            <Card 
              key={album.id}
              className="bg-white rounded-3xl border-2 border-black overflow-hidden card-shadow transition-all duration-300"
              data-testid={`album-card-${album.id}`}
            >
              {/* Spotify Album Embed Placeholder */}
              <div className="aspect-square bg-gray-900 flex items-center justify-center relative">
                <div className="text-center text-white p-6">
                  <Disc3 className="w-20 h-20 text-pp-pink mx-auto mb-4 animate-spin" style={{ animationDuration: '3s' }} />
                  <p className="font-campaign text-lg tracking-wider text-gray-400">SPOTIFY ALBUM EMBED</p>
                  <p className="font-primary text-sm text-gray-500 mt-1">Embed placeholder</p>
                </div>
                <Badge className="absolute top-4 right-4 bg-pp-magenta text-white font-campaign">
                  {album.type}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-primary font-bold text-xl mb-1">{album.title}</h3>
                    <p className="font-primary text-sm text-muted-foreground">
                      {album.trackCount} tracks
                    </p>
                  </div>
                  <Badge variant="outline" className="font-campaign">
                    <Calendar className="w-3 h-3 mr-1" />
                    {album.year}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Singles Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-muted rounded-3xl mx-4 mb-16">
        <h2 className="font-campaign text-3xl tracking-wider text-pp-magenta mb-8" data-testid="singles-title">
          SINGLES & TRACKS
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {singles.map((single) => (
            <Card 
              key={single.id}
              className="bg-white rounded-2xl border-2 border-black overflow-hidden hover:shadow-[4px_4px_0px_0px_rgba(255,20,147,1)] transition-all duration-300"
              data-testid={`single-card-${single.id}`}
            >
              <CardContent className="p-4 flex items-center gap-4">
                {/* Spotify Track Embed Placeholder */}
                <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
                  <Play className="w-6 h-6 text-pp-pink" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-primary font-bold truncate">{single.title}</h3>
                  <p className="font-primary text-sm text-muted-foreground">
                    <span className="font-campaign text-xs tracking-wider">SPOTIFY TRACK EMBED</span>
                  </p>
                </div>
                <Badge variant="outline" className="font-campaign text-xs shrink-0">
                  {single.year}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Streaming Info */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ListMusic className="w-12 h-12 text-pp-magenta mx-auto mb-4" />
          <h2 className="font-campaign text-2xl tracking-wider mb-4">STREAM EVERYWHERE</h2>
          <p className="font-primary text-gray-400 mb-8">
            All music by Paperboy Prince is available on major streaming platforms.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Spotify', 'Apple Music', 'YouTube Music', 'SoundCloud'].map((platform) => (
              <Badge 
                key={platform}
                className="bg-pp-magenta/20 text-pp-pink border border-pp-magenta font-primary px-4 py-2"
              >
                {platform}
              </Badge>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Music;
