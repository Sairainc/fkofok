'use client'

import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData as ChartJSData,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface ChartData {
  labels: string[]
  data: number[]
}

export const PieChart = ({ data }: { data: ChartData }) => {
  const chartData: ChartJSData<'pie'> = {
    labels: data.labels,
    datasets: [
      {
        data: data.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Pie data={chartData} options={options} />
    </div>
  )
}

export const BarChart = PieChart // 必要に応じて実装 