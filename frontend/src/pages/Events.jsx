import { useState, useEffect } from 'react';
import { eventsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Calendar, MapPin, Users, Check, X, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO, isPast } from 'date-fns';

const Events = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [myRsvps, setMyRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
    if (isAuthenticated) {
      loadMyRsvps();
    }
  }, [isAuthenticated]);

  const loadEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const loadMyRsvps = async () => {
    try {
      const response = await eventsAPI.getMyRsvps();
      setMyRsvps(response.data.event_ids);
    } catch (error) {
      console.error('Error loading RSVPs:', error);
    }
  };

  const handleRsvp = async (eventId) => {
    if (!isAuthenticated) {
      toast.error('Please login to RSVP');
      return;
    }

    const isRsvped = myRsvps.includes(eventId);
    
    try {
      if (isRsvped) {
        await eventsAPI.cancelRsvp(eventId);
        setMyRsvps(myRsvps.filter(id => id !== eventId));
        toast.success('RSVP cancelled');
      } else {
        await eventsAPI.rsvp(eventId);
        setMyRsvps([...myRsvps, eventId]);
        toast.success('RSVP confirmed! See you there!');
      }
      await loadEvents();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update RSVP');
    }
  };

  const formatEventDate = (dateStr) => {
    try {
      const date = parseISO(dateStr);
      return {
        day: format(date, 'd'),
        month: format(date, 'MMM'),
        time: format(date, 'h:mm a'),
        full: format(date, 'EEEE, MMMM d, yyyy'),
        isPast: isPast(date)
      };
    } catch {
      return { day: '?', month: '???', time: '', full: dateStr, isPast: false };
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1759605034474-b143695762c5?w=1600)' }}
        />
        <div className="absolute inset-0 hero-gradient" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-primary font-extrabold text-4xl md:text-6xl text-white uppercase tracking-tight mb-4" data-testid="events-title">
            Community Events
          </h1>
          <p className="font-primary text-lg text-white/90 max-w-2xl mx-auto">
            Join us at our upcoming events. From town halls to art festivals, there's always something happening.
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-campaign text-3xl md:text-4xl tracking-wider text-pp-magenta" data-testid="upcoming-events-title">
            UPCOMING EVENTS
          </h2>
          <Badge className="bg-pp-pink text-black font-campaign text-sm px-4 py-1">
            {events.filter(e => !formatEventDate(e.date).isPast).length} Events
          </Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="rounded-3xl border-2 border-black overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <Skeleton className="h-48 md:w-48 md:h-auto" />
                  <div className="p-6 flex-1">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {events.map((event) => {
              const dateInfo = formatEventDate(event.date);
              const isRsvped = myRsvps.includes(event.id);
              
              return (
                <Card 
                  key={event.id} 
                  className={`bg-white rounded-3xl border-2 border-black overflow-hidden card-shadow transition-all duration-300 ${
                    dateInfo.isPast ? 'opacity-60' : ''
                  }`}
                  data-testid={`event-card-${event.id}`}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Date Badge */}
                    <div className="md:w-32 bg-pp-magenta text-white flex flex-col items-center justify-center p-6">
                      <span className="font-campaign text-5xl">{dateInfo.day}</span>
                      <span className="font-campaign text-xl tracking-wider">{dateInfo.month}</span>
                      {dateInfo.isPast && (
                        <Badge className="mt-2 bg-black/30 text-white text-xs">PAST</Badge>
                      )}
                    </div>
                    
                    {/* Event Image (Mobile) */}
                    {event.image_url && (
                      <div className="h-48 md:hidden overflow-hidden">
                        <img 
                          src={event.image_url} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 p-6">
                      <h3 className="font-primary font-bold text-xl mb-2">{event.title}</h3>
                      <p className="font-primary text-muted-foreground text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-pp-magenta" />
                          <span className="font-primary">{dateInfo.full} at {dateInfo.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-pp-magenta" />
                          <span className="font-primary">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-pp-magenta" />
                          <span className="font-primary font-semibold">{event.rsvp_count} attending</span>
                        </div>
                      </div>
                      
                      {!dateInfo.isPast && (
                        <Button
                          className={`rounded-full font-bold px-6 py-2 border-2 border-black transition-all ${
                            isRsvped 
                              ? 'bg-green-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500'
                              : 'bg-pp-magenta text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none'
                          }`}
                          onClick={() => handleRsvp(event.id)}
                          data-testid={`rsvp-button-${event.id}`}
                        >
                          {isRsvped ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              RSVPed
                            </>
                          ) : (
                            'RSVP Now'
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {/* Event Image (Desktop) */}
                    {event.image_url && (
                      <div className="hidden md:block w-48 overflow-hidden">
                        <img 
                          src={event.image_url} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {events.length === 0 && !loading && (
          <div className="text-center py-12 px-4 bg-muted rounded-3xl border-2 border-dashed border-gray-300">
            <Calendar className="w-16 h-16 text-pp-pink mx-auto mb-4" />
            <p className="font-primary text-lg text-muted-foreground">
              No events posted yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Events;
