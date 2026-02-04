import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { ArrowLeft, BarChart3, Eye, MousePointer, Clock, Users, TrendingUp, Globe, Tag } from 'lucide-react';

const AdminAnalytics = () => {
  const { isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    if (isAdmin) {
      loadAnalytics();
    }
  }, [isAdmin, period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/analytics?days=${period}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('pp_token')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-campaign text-3xl tracking-wider text-pp-magenta flex items-center gap-2">
                <BarChart3 className="w-8 h-8" />
                ANALYTICS
              </h1>
              <p className="text-gray-500 font-primary">Site traffic and engagement</p>
            </div>
          </div>
          
          {/* Period selector */}
          <div className="flex gap-2">
            {[7, 30, 90].map((days) => (
              <Button
                key={days}
                variant={period === days ? 'default' : 'outline'}
                onClick={() => setPeriod(days)}
                className={`rounded-full ${period === days ? 'bg-pp-magenta' : ''}`}
              >
                {days}d
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="rounded-2xl border-2 border-gray-200">
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-10 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analytics ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,153,204,1)]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-5 h-5 text-pp-magenta" />
                    <span className="text-sm text-gray-500 font-primary">Page Views</span>
                  </div>
                  <p className="text-3xl font-bold font-primary">{analytics.total_pageviews.toLocaleString()}</p>
                </CardContent>
              </Card>
              
              <Card className="rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,153,204,1)]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-pp-magenta" />
                    <span className="text-sm text-gray-500 font-primary">Unique Sessions</span>
                  </div>
                  <p className="text-3xl font-bold font-primary">{analytics.unique_sessions.toLocaleString()}</p>
                </CardContent>
              </Card>
              
              <Card className="rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,153,204,1)]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <MousePointer className="w-5 h-5 text-pp-magenta" />
                    <span className="text-sm text-gray-500 font-primary">Button Clicks</span>
                  </div>
                  <p className="text-3xl font-bold font-primary">{analytics.total_clicks.toLocaleString()}</p>
                </CardContent>
              </Card>
              
              <Card className="rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,153,204,1)]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-pp-magenta" />
                    <span className="text-sm text-gray-500 font-primary">Avg. Time on Page</span>
                  </div>
                  <p className="text-3xl font-bold font-primary">{analytics.avg_time_on_page_seconds}s</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts/Lists Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Pages */}
              <Card className="rounded-2xl border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-campaign tracking-wider">
                    <TrendingUp className="w-5 h-5 text-pp-magenta" />
                    TOP PAGES
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.top_pages.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.top_pages.map((page, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="font-primary text-sm truncate max-w-[200px]">{page.path}</span>
                          <span className="font-bold text-pp-magenta">{page.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No data yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Clicks */}
              <Card className="rounded-2xl border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-campaign tracking-wider">
                    <MousePointer className="w-5 h-5 text-pp-magenta" />
                    TOP BUTTON CLICKS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.top_clicks.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.top_clicks.map((click, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="font-primary text-sm">{click.button_id}</span>
                          <span className="font-bold text-pp-magenta">{click.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No data yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Referrers */}
              <Card className="rounded-2xl border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-campaign tracking-wider">
                    <Globe className="w-5 h-5 text-pp-magenta" />
                    TOP REFERRERS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.top_referrers.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.top_referrers.map((ref, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="font-primary text-sm truncate max-w-[200px]">{ref.referrer}</span>
                          <span className="font-bold text-pp-magenta">{ref.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No data yet</p>
                  )}
                </CardContent>
              </Card>

              {/* UTM Sources */}
              <Card className="rounded-2xl border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-campaign tracking-wider">
                    <Tag className="w-5 h-5 text-pp-magenta" />
                    UTM SOURCES
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.top_utm_sources.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.top_utm_sources.map((utm, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="font-primary text-sm">{utm.source}</span>
                          <span className="font-bold text-pp-magenta">{utm.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No UTM data yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Daily Chart (simple bars) */}
            {analytics.daily_pageviews.length > 0 && (
              <Card className="rounded-2xl border-2 border-gray-200 mt-6">
                <CardHeader>
                  <CardTitle className="font-campaign tracking-wider">DAILY PAGEVIEWS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-1 h-32">
                    {analytics.daily_pageviews.slice(-30).map((day, idx) => {
                      const maxCount = Math.max(...analytics.daily_pageviews.map(d => d.count));
                      const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                      return (
                        <div
                          key={idx}
                          className="flex-1 bg-pp-magenta rounded-t hover:bg-pp-pink transition-colors"
                          style={{ height: `${Math.max(height, 2)}%` }}
                          title={`${day.date}: ${day.count} views`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{analytics.daily_pageviews[0]?.date}</span>
                    <span>{analytics.daily_pageviews[analytics.daily_pageviews.length - 1]?.date}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500">Failed to load analytics</p>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
