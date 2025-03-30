'use client';

import React from 'react';

const FlowPage = () => {
  const steps = [
    {
      number: '01',
      title: '集合場所の確認',
      description: 'LINEで集合場所を確認します。',
      icon: (
        <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📍</div>
            <div className="text-2xl font-bold text-blue-800">集合場所</div>
          </div>
        </div>
      )
    },
    {
      number: '02',
      title: '集合時間の5分前に待機',
      description: '集合時間の5分前に指定された場所で待機します。',
      icon: (
        <div className="w-full h-64 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⏰</div>
            <div className="text-2xl font-bold text-green-800">5分前待機</div>
          </div>
        </div>
      )
    },
    {
      number: '03',
      title: '合コン開始',
      description: 'マッチした相手と合コンをお楽しみください。',
      icon: (
        <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-purple-800">合コン開始</div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            合コンまでの流れ
          </h1>
          <p className="text-xl text-gray-600">
            簡単3ステップで素敵な出会いを
          </p>
        </div>

        <div className="space-y-16">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center gap-8`}
            >
              <div className="w-full lg:w-1/2">
                {step.icon}
              </div>
              <div className="w-full lg:w-1/2">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <div className="text-4xl font-bold text-blue-600 mb-4">
                    {step.number}
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {step.title}
                  </h2>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors">
            無料で始める
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlowPage; 