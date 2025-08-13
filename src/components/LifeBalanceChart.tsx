import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

// Define the type for a single life sphere data point
interface LifeSphereData {
  sphere: string;
  load: number;
}

// Define the props for the LifeBalanceChart component
interface LifeBalanceChartProps {
  data: LifeSphereData[];
}

const LifeBalanceChart: React.FC<LifeBalanceChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="sphere" />
        <PolarRadiusAxis />
        <Radar
          name="Load"
          dataKey="load"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default LifeBalanceChart;