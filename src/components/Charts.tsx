'use client'

import React from 'react'

interface ChartData {
  labels: string[]
  data: number[]
}

export const PieChart = ({ data }: { data: ChartData }) => {
  return (
    <div className="relative">
      {/* 仮のグラフ表示 - 後で実際のグラフライブラリに置き換え */}
      <div className="grid grid-cols-2 gap-4">
        {data.labels.map((label, index) => (
          <div key={label} className="text-center">
            <div className="font-bold">{label}</div>
            <div>{data.data[index]}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const BarChart = PieChart // 必要に応じて実装 