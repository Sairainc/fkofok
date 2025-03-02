'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartData as _ChartJSData
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface CustomChartData {
  labels: string[]
  data: number[]
  colors?: string[]
}

interface ChartProps {
  data: CustomChartData
}

export const BarChart: React.FC<ChartProps> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.data,
        backgroundColor: data.data.map((_, index) => 
          // 20代後半と30代前半（インデックス1と2）を強調
          index === 1 || index === 2 
            ? 'rgba(255, 108, 180, 0.8)' // メインカラー
            : 'rgba(255, 108, 180, 0.3)' // 薄いカラー
        ),
        borderRadius: 8,
        maxBarThickness: 60,
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      },
      datalabels: {
        anchor: 'end' as const,
        align: 'top' as const,
        formatter: (value: number) => `${value}%`,
        color: '#666',
        font: {
          weight: 'bold' as const
        },
        padding: {
          top: 4
        }
      }
    },
    scales: {
      y: {
        display: false,
        beginAtZero: true,
        max: 50,
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#666'
        }
      }
    }
  }

  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center">
      <Bar data={chartData} options={options} plugins={[ChartDataLabels]} />
    </div>
  )
}

export const PieChart: React.FC<ChartProps> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.data,
        backgroundColor: data.colors || [
          'rgba(255, 108, 180, 0.3)',    // 薄い
          'rgba(255, 108, 180, 0.8)',      // 濃い
          'rgba(255, 108, 180, 0.4)',    // 薄い
          'rgba(255, 108, 180, 0.3)',    // 薄い
          'rgba(255, 108, 180, 0.1)',    // 薄い
        ],
        borderWidth: 0,                 // 境界線を削除
        offset: [0, 20, 0, 0, 0],      // 23-25歳の部分のみを外側に出す
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