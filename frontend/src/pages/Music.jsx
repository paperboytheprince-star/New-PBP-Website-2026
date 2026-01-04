import { Music2, Disc3, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const Music = () => {
  const albums = [
    {
      id: 1,
      title: 'Themsterhood of the Traveling Drip',
      year: '2025',
      spotifyId: '2hkzcv4MeNFlk8gUrNC7tF',
    },
    {
      id: 2,
      title: "God's Twin",
      year: '2023',
      spotifyId: null, // No Spotify link provided
    },
    {
      id: 3,
      title: "Shrek's Family Reunion",
      year: '2022',
      spotifyId: '18uDHkxBSh5xfX5EVseO9o',
    },
    {
      id: 4,
      title: 'Lil Dennis Rodman',
      year: '2018',
      spotifyId: '2NH2Zjc9CnIHNMfpYC9BOs',
    },
    {
      id: 5,
      title: 'Middle School Food Fight',
      year: '2017',
      spotifyId: '5QBMDsqtSrQzqF7sKJwmb3',
    },
    {
      id: 6,
      title: 'Holiday Love',
      year: '2016',
      spotifyId: '1YkzORZlHEIgb13iTtxkb7',
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
            With over 100 self-produced music videos and a groundbreaking 500-song album created with over 180 artists.
          </p>
        </div>
      </section>

      {/* Spotify Artist Embed */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="rounded-3xl border-2 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(255,153,204,1)]">
          <iframe
            src="https://open.spotify.com/embed/artist/4UFIo5bqbYIlqlP5zUQWnv?utm_source=generator&theme=0"
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Paperboy Prince on Spotify"
          />
        </div>
      </section>

      {/* Albums Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="font-campaign text-3xl tracking-wider text-pp-magenta mb-8" data-testid="albums-title">
          ALBUMS
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {albums.map((album) => (
            <Card 
              key={album.id}
              className="bg-white rounded-3xl border-2 border-black overflow-hidden card-shadow transition-all duration-300"
              data-testid={`album-card-${album.id}`}
            >
              {album.spotifyId ? (
                <div className="aspect-square bg-black">
                  <iframe
                    src={`https://open.spotify.com/embed/album/${album.spotifyId}?utm_source=generator&theme=0`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title={album.title}
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gray-900 flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <Disc3 className="w-20 h-20 text-pp-pink mx-auto mb-4" />
                    <p className="font-primary font-bold text-lg">{album.title}</p>
                    <p className="font-campaign text-sm text-gray-400 mt-2">Coming to Spotify</p>
                  </div>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-primary font-bold text-lg">{album.title}</h3>
                  </div>
                  <Badge variant="outline" className="font-campaign shrink-0">
                    {album.year}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Streaming Info */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Music2 className="w-12 h-12 text-pp-magenta mx-auto mb-4" />
          <h2 className="font-campaign text-2xl tracking-wider mb-4">STREAM EVERYWHERE</h2>
          <p className="font-primary text-gray-400 mb-8">
            All music by Paperboy Prince is available on major streaming platforms.
          </p>
          <a 
            href="https://open.spotify.com/artist/4UFIo5bqbYIlqlP5zUQWnv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#1DB954] text-white font-bold px-8 py-4 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:translate-y-1 hover:shadow-none transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            Open in Spotify
          </a>
        </div>
      </section>
    </div>
  );
};

export default Music;
