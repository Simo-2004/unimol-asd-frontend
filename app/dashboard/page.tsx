"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  DoorOpen,
  Calendar,
  TrendingUp,
  Pizza,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  apiClient,
  Order,
  Table,
  Reservation,
  Product,
} from "@/lib/api-client";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  index: number;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  index,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp
                className={`h-3 w-3 ${
                  trend.isPositive
                    ? "text-green-500"
                    : "text-red-500 rotate-180"
                }`}
              />
              <span
                className={`text-xs ${
                  trend.isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {trend.value}% vs last week
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface RecentOrderProps {
  id: number;
  table: number;
  items: number;
  total: string;
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED";
  time: string;
}

function RecentOrder({
  id,
  table,
  items,
  total,
  status,
  time,
}: RecentOrderProps) {
  const statusColors = {
    PENDING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    PREPARING: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    READY: "bg-green-500/10 text-green-500 border-green-500/20",
    COMPLETED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  const statusLabels = {
    PENDING: "Da Fare",
    PREPARING: "In Cucina",
    READY: "Pronto",
    COMPLETED: "Completato",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-accent transition-colors"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="flex flex-col">
          <span className="text-sm font-medium">Ordine #{id}</span>
          <span className="text-xs text-muted-foreground">
            Tavolo {table} • {items} items • {time}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">{total}</span>
        <Badge variant="outline" className={statusColors[status]}>
          {statusLabels[status]}
        </Badge>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [tables, setTables] = React.useState<Table[]>([]);
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, tablesRes, reservationsRes, productsRes] =
          await Promise.all([
            apiClient.getOrders(),
            apiClient.getTables(),
            apiClient.getReservations(),
            apiClient.getProducts(),
          ]);

        setOrders(ordersRes.results);
        setTables(tablesRes.results);
        setReservations(reservationsRes.results);
        setProducts(productsRes.results);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh ogni 30 secondi
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calcoli statistiche reali
  const activeOrders = orders.filter(
    (o) =>
      o.status === "PENDING" ||
      o.status === "PREPARING" ||
      o.status === "READY",
  );

  // Per i tavoli occupati, contiamo quelli che hanno ordini attivi
  const occupiedTableNumbers = new Set(activeOrders.map((o) => o.table_number));
  const occupiedTables = occupiedTableNumbers.size;
  const totalTables = tables.length;
  const occupancyRate =
    totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

  const todayReservations = reservations.filter((r) => {
    const resDate = new Date(r.date);
    const today = new Date();
    return resDate.toDateString() === today.toDateString();
  });
  const confirmedReservations = todayReservations.filter(
    (r) => r.status === "CONFIRMED",
  ).length;
  const pendingReservations = todayReservations.filter(
    (r) => r.status === "PENDING",
  ).length;

  const activeProducts = products.filter((p) => p.is_active).length;

  // Calcolo revenue totale dagli ordini completati
  const totalRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;

  // Dati per il grafico degli ordini per stato (4 stati nuovi)
  const ordersByStatus = [
    {
      status: "Da Fare",
      count: orders.filter((o) => o.status === "PENDING").length,
      fill: "hsl(var(--chart-1))",
    },
    {
      status: "In Cucina",
      count: orders.filter((o) => o.status === "PREPARING").length,
      fill: "hsl(var(--chart-2))",
    },
    {
      status: "Pronti",
      count: orders.filter((o) => o.status === "READY").length,
      fill: "hsl(var(--chart-3))",
    },
    {
      status: "Completati",
      count: orders.filter((o) => o.status === "COMPLETED").length,
      fill: "hsl(var(--chart-4))",
    },
  ];

  // Dati per il grafico delle prenotazioni per stato
  const reservationsByStatus = [
    {
      status: "Confermate",
      count: reservations.filter((r) => r.status === "CONFIRMED").length,
      fill: "hsl(var(--chart-3))",
    },
    {
      status: "In Attesa",
      count: reservations.filter((r) => r.status === "PENDING").length,
      fill: "hsl(var(--chart-2))",
    },
    {
      status: "Annullate",
      count: reservations.filter((r) => r.status === "CANCELLED").length,
      fill: "hsl(var(--chart-5))",
    },
  ];

  const stats = [
    {
      title: "Ordini Attivi",
      value: loading ? "..." : activeOrders.length,
      description: "In preparazione o pronti",
      icon: ShoppingCart,
    },
    {
      title: "Tavoli Occupati",
      value: loading ? "..." : `${occupiedTables}/${totalTables}`,
      description: `${occupancyRate}% occupancy`,
      icon: DoorOpen,
    },
    {
      title: "Prenotazioni Oggi",
      value: loading ? "..." : todayReservations.length,
      description: `${confirmedReservations} confermate, ${pendingReservations} pending`,
      icon: Calendar,
    },
    {
      title: "Prodotti Attivi",
      value: loading ? "..." : activeProducts,
      description: "Menu disponibile",
      icon: Pizza,
    },
    {
      title: "Revenue Totale",
      value: loading ? "..." : `€${totalRevenue.toFixed(2)}`,
      description: `da ${completedOrders} ordini completati`,
      icon: TrendingUp,
    },
    {
      title: "Totale Ordini",
      value: loading ? "..." : orders.length,
      description: "in tutti gli stati",
      icon: Users,
    },
  ];

  const recentOrders = orders
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Benvenuto nella gestione della pizzeria da Simone&apos;s🍕
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Ordini per Stato */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Distribuzione Ordini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ordersByStatus.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-sm font-medium">{item.status}</span>
                    </div>
                    <span className="text-2xl font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Prenotazioni per Stato */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Stato Prenotazioni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reservationsByStatus.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-sm font-medium">{item.status}</span>
                    </div>
                    <span className="text-2xl font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Ordini Recenti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {loading ? (
              <p className="text-muted-foreground text-sm py-4">
                Caricamento ordini...
              </p>
            ) : recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">
                Nessun ordine presente
              </p>
            ) : (
              recentOrders.map((order) => (
                <RecentOrder
                  key={order.id}
                  id={order.id}
                  table={order.table_number}
                  items={order.items_count}
                  total={`€${parseFloat(order.total_amount).toFixed(2)}`}
                  status={order.status}
                  time={format(new Date(order.created_at), "HH:mm", {
                    locale: it,
                  })}
                />
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
