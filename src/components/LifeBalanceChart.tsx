import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

// Define the type for a single life sphere data point
interface LifeSphereData {
  sphere: string;
  load: number;
  target?: number; // Целевое значение баланса
  color?: string; // Цвет для визуализации
}

// Define the props for the LifeBalanceChart component
interface LifeBalanceChartProps {
  data: LifeSphereData[];
}

// Кастомный тултип для графика
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const currentLoad = payload[0].value;
    const targetLoad = payload[1]?.value;
    const difference = targetLoad !== undefined ? currentLoad - targetLoad : 0;
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-md shadow-lg">
        <p className="font-bold text-gray-800">{label}</p>
        <p className="text-blue-600">
          Текущая нагрузка: {currentLoad.toFixed(1)} часов
        </p>
        {targetLoad !== undefined && (
          <p className="text-green-600">
            Целевая нагрузка: {targetLoad.toFixed(1)} часов
          </p>
        )}
        {targetLoad !== undefined && (
          <p className={difference > 0 ? "text-red-600" : "text-green-600"}>
            {difference > 0
              ? `Превышение на ${difference.toFixed(1)} часов`
              : `Недогруз на ${Math.abs(difference).toFixed(1)} часов`}
          </p>
        )}
      </div>
    );
  }

  return null;
};

const LifeBalanceChart: React.FC<LifeBalanceChartProps> = ({ data }) => {
  // Подготавливаем данные для графика с целевыми значениями
  const chartData = data.map(item => ({
    sphere: item.sphere,
    load: item.load,
    target: item.target !== undefined ? item.target : 8, // По умолчанию 8 часов
    fullMark: Math.max(item.load, item.target || 8) * 1.5 // Максимальное значение для шкалы
  }));

  return (
    <ResponsiveContainer width="100%" height={500}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="sphere" />
        <PolarRadiusAxis angle={30} domain={[0, Math.max(...chartData.map(d => d.fullMark))]} />
        <Radar
          name="Текущая нагрузка"
          dataKey="load"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
        <Radar
          name="Целевая нагрузка"
          dataKey="target"
          stroke="#82ca9d"
          fill="#82ca9d"
          fillOpacity={0.3}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default LifeBalanceChart;