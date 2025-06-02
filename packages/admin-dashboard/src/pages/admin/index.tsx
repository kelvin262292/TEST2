import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  CurrencyDollarIcon, 
  ShoppingCartIcon, 
  UserGroupIcon, 
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@e3d/shared';
import AdminLayout from '../../components/Layout/AdminLayout';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Sample data for the dashboard
const revenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Revenue',
      data: [12500, 14200, 13800, 15400, 16800, 19200, 21500, 22300, 20100, 21400, 23500, 25800],
      borderColor: '#0066FF',
      backgroundColor: 'rgba(0, 102, 255, 0.1)',
      tension: 0.4,
      fill: true,
    },
    {
      label: 'Last Year',
      data: [10200, 11500, 12200, 13100, 14500, 16800, 18200, 19100, 17500, 18200, 19800, 21500],
      borderColor: 'rgba(160, 174, 192, 0.8)',
      backgroundColor: 'rgba(160, 174, 192, 0.1)',
      tension: 0.4,
      fill: true,
      borderDash: [5, 5],
    },
  ],
};

const categoryData = {
  labels: ['Furniture', 'Electronics', 'Clothing', 'Home Decor', 'Accessories'],
  datasets: [
    {
      label: 'Sales by Category',
      data: [35, 25, 15, 15, 10],
      backgroundColor: [
        '#0066FF',
        '#FF6600',
        '#2DB47D',
        '#A0AEC0',
        '#2D3748',
      ],
      borderWidth: 1,
    },
  ],
};

const visitorData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Visitors',
      data: [420, 380, 450, 520, 490, 680, 720],
      backgroundColor: 'rgba(0, 102, 255, 0.8)',
    },
  ],
};

const recentOrders = [
  { id: 'ORD-1234', customer: 'John Doe', date: new Date(2025, 5, 1), amount: 1299.99, status: 'Completed' },
  { id: 'ORD-1235', customer: 'Jane Smith', date: new Date(2025, 5, 1), amount: 349.99, status: 'Processing' },
  { id: 'ORD-1236', customer: 'Robert Johnson', date: new Date(2025, 4, 30), amount: 999.99, status: 'Processing' },
  { id: 'ORD-1237', customer: 'Emily Davis', date: new Date(2025, 4, 30), amount: 249.99, status: 'Completed' },
  { id: 'ORD-1238', customer: 'Michael Wilson', date: new Date(2025, 4, 29), amount: 1899.99, status: 'Shipped' },
];

const topProducts = [
  { name: 'Modern Comfort Sofa', sku: 'SOFA-001', sales: 42, revenue: 54599.58 },
  { name: 'Smartphone X Pro', sku: 'PHONE-001', sales: 38, revenue: 37999.62 },
  { name: 'Ergonomic Office Chair', sku: 'CHAIR-001', sales: 35, revenue: 12249.65 },
  { name: 'Ultrabook Pro 15', sku: 'LAPTOP-001', sales: 28, revenue: 53199.72 },
];

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card variant="stat" className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="absolute top-0 right-0 p-3">
              <CurrencyDollarIcon className="h-8 w-8 text-primary/20" />
            </div>
            <CardTitle className="text-sm font-medium text-neutral-500 mb-2">
              Total Revenue
            </CardTitle>
            <div className="text-3xl font-bold text-neutral-900">$258,420</div>
            <div className="flex items-center mt-2 text-xs">
              <span className="flex items-center text-success font-medium">
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                12.5%
              </span>
              <span className="text-neutral-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat" className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="absolute top-0 right-0 p-3">
              <ShoppingCartIcon className="h-8 w-8 text-secondary/20" />
            </div>
            <CardTitle className="text-sm font-medium text-neutral-500 mb-2">
              Total Orders
            </CardTitle>
            <div className="text-3xl font-bold text-neutral-900">1,845</div>
            <div className="flex items-center mt-2 text-xs">
              <span className="flex items-center text-success font-medium">
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                8.2%
              </span>
              <span className="text-neutral-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat" className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="absolute top-0 right-0 p-3">
              <UserGroupIcon className="h-8 w-8 text-primary/20" />
            </div>
            <CardTitle className="text-sm font-medium text-neutral-500 mb-2">
              Total Customers
            </CardTitle>
            <div className="text-3xl font-bold text-neutral-900">12,426</div>
            <div className="flex items-center mt-2 text-xs">
              <span className="flex items-center text-success font-medium">
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                4.3%
              </span>
              <span className="text-neutral-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card variant="stat" className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="absolute top-0 right-0 p-3">
              <EyeIcon className="h-8 w-8 text-secondary/20" />
            </div>
            <CardTitle className="text-sm font-medium text-neutral-500 mb-2">
              Total Visitors
            </CardTitle>
            <div className="text-3xl font-bold text-neutral-900">45,679</div>
            <div className="flex items-center mt-2 text-xs">
              <span className="flex items-center text-error font-medium">
                <ArrowDownIcon className="h-3 w-3 mr-1" />
                2.1%
              </span>
              <span className="text-neutral-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Monthly
              </Button>
              <Button variant="ghost" size="sm">
                Yearly
              </Button>
              <Button variant="ghost" size="sm" leftIcon={<ArrowPathIcon className="h-4 w-4" />}>
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line
                data={revenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `$${value.toLocaleString()}`,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                      align: 'end',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`,
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <Doughnut
                data={categoryData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.label}: ${context.parsed}%`,
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visitors Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Visitors Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Weekly Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <Bar
                data={visitorData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
            <Button variant="link" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="px-4 py-3 text-left font-medium text-neutral-500">Order ID</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-500">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-500">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-neutral-500">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-neutral-900 font-medium">{order.id}</td>
                      <td className="px-4 py-3 text-neutral-700">{order.customer}</td>
                      <td className="px-4 py-3 text-neutral-700">{format(order.date, 'MMM dd, yyyy')}</td>
                      <td className="px-4 py-3 text-neutral-900 font-medium text-right">
                        ${order.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'Completed'
                              ? 'bg-success/10 text-success'
                              : order.status === 'Processing'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-secondary/10 text-secondary'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Top Selling Products</CardTitle>
          <Button variant="link" size="sm">
            View All Products
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="px-4 py-3 text-left font-medium text-neutral-500">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-500">SKU</th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-500">Units Sold</th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-500">Revenue</th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.sku} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3 text-neutral-900 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-neutral-700">{product.sku}</td>
                    <td className="px-4 py-3 text-neutral-900 font-medium text-right">{product.sales}</td>
                    <td className="px-4 py-3 text-neutral-900 font-medium text-right">
                      ${product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
