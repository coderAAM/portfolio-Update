import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Eye } from "lucide-react";

interface DailyVisit {
  date: string;
  visits: number;
  uniqueVisitors: number;
}

export function VisitorGraph() {
  const [data, setData] = useState<DailyVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVisits, setTotalVisits] = useState(0);
  const [totalUniqueVisitors, setTotalUniqueVisitors] = useState(0);

  useEffect(() => {
    fetchVisitorData();

    // Set up real-time subscription
    const channel = supabase
      .channel("visitor-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "page_visits" },
        () => {
          fetchVisitorData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVisitorData = async () => {
    try {
      // Get visits from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const { data: visits, error } = await supabase
        .from("page_visits")
        .select("created_at, visitor_id")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Process data by day
      const dailyData: { [key: string]: { visits: number; visitors: Set<string> } } = {};
      
      // Initialize all 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateKey = date.toISOString().split("T")[0];
        dailyData[dateKey] = { visits: 0, visitors: new Set() };
      }

      // Count visits and unique visitors
      let totalV = 0;
      const allVisitors = new Set<string>();

      visits?.forEach((visit) => {
        const dateKey = new Date(visit.created_at).toISOString().split("T")[0];
        if (dailyData[dateKey]) {
          dailyData[dateKey].visits++;
          if (visit.visitor_id) {
            dailyData[dateKey].visitors.add(visit.visitor_id);
            allVisitors.add(visit.visitor_id);
          }
        }
        totalV++;
      });

      setTotalVisits(totalV);
      setTotalUniqueVisitors(allVisitors.size);

      // Convert to chart data
      const chartData: DailyVisit[] = Object.entries(dailyData).map(([date, stats]) => ({
        date: new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        visits: stats.visits,
        uniqueVisitors: stats.visitors.size,
      }));

      setData(chartData);
    } catch (error) {
      console.error("Error fetching visitor data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Visitor Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Visits (7 days)</p>
                <p className="text-2xl font-bold">{totalVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unique Visitors</p>
                <p className="text-2xl font-bold">{totalUniqueVisitors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Daily Visitors (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.every(d => d.visits === 0) ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-50" />
              <p>No visitor data yet</p>
              <p className="text-sm">Visits will appear here as users visit your site</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }} 
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    className="text-muted-foreground"
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                  />
                  <Bar 
                    dataKey="visits" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                    name="Page Views"
                  />
                  <Bar 
                    dataKey="uniqueVisitors" 
                    fill="hsl(var(--accent))" 
                    radius={[4, 4, 0, 0]} 
                    name="Unique Visitors"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
