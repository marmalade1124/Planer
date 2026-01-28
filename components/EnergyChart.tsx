"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", energy: 40 },
  { name: "Tue", energy: 30 },
  { name: "Wed", energy: 60 },
  { name: "Thu", energy: 45 },
  { name: "Fri", energy: 80 },
  { name: "Sat", energy: 20 },
  { name: "Sun", energy: 65 },
];

export const EnergyChart = ({ isDark }: { isDark?: boolean }) => {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: isDark ? '#ffffff60' : '#9CA3AF' }} 
            interval="preserveStartEnd"
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: isDark ? '#ffffff60' : '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Area
            type="monotone"
            dataKey="energy"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorEnergy)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
