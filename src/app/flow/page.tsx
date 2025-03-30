'use client';

import React from 'react';
import Link from 'next/link';

const FlowPage = () => {
  const steps = [
    {
      number: '01',
      title: '集合場所の確認',
      description: 'LINEで集合場所を確認します。',
      icon: (
        <div className="w-full h-80 bg-gradient-to-br from-primary/10 to-primary/30 rounded-xl flex items-center justify-center p-6 shadow-lg transform hover:scale-[1.02] transition-all duration-300">
          <div className="w-80 bg-white rounded-2xl shadow-xl p-5 transform -rotate-3 hover:rotate-0 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-[#00B900] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">L</span>
              </div>
              <div className="text-sm font-semibold text-gray-800">LINE</div>
              <div className="ml-auto text-xs text-gray-400">たった今</div>
            </div>
            <div className="bg-[#E5F4E2] rounded-lg p-4 relative">
              <div className="absolute w-3 h-3 bg-[#E5F4E2] transform rotate-45 -left-1 top-3"></div>
              <div className="text-sm text-gray-600 mb-2 font-medium">集合場所のご案内</div>
              <div className="text-lg font-medium text-gray-800">渋谷駅 ハチ公前広場</div>
              <div className="text-sm text-gray-500 mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                集合時間: 19:00
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <div className="text-xs text-[#00B900] font-medium">既読</div>
            </div>
          </div>
        </div>
      )
    },
    {
      number: '02',
      title: '集合時間の5分前に待機',
      description: '集合時間の5分前に指定された場所で待機します。',
      icon: (
        <div className="w-full h-80 bg-gradient-to-br from-primary/10 to-primary/30 rounded-xl flex items-center justify-center p-6 shadow-lg transform hover:scale-[1.02] transition-all duration-300">
          <div className="relative bg-white rounded-full w-56 h-56 shadow-xl flex items-center justify-center transform hover:rotate-12 transition-all duration-300">
            <div className="absolute w-full h-full rounded-full border-4 border-primary/20"></div>
            <div className="absolute w-3 h-16 bg-primary-dark origin-bottom transform -translate-x-[1px] -rotate-[30deg]" style={{transformOrigin: 'bottom center'}}></div>
            <div className="absolute w-2 h-24 bg-primary origin-bottom"></div>
            <div className="absolute w-full h-full flex items-center justify-center">
              <div className="text-2xl font-bold text-gray-800">5分前</div>
            </div>
            <div className="absolute top-5 text-xl font-bold text-gray-800">12</div>
            <div className="absolute right-5 text-xl font-bold text-gray-800">3</div>
            <div className="absolute bottom-5 text-xl font-bold text-gray-800">6</div>
            <div className="absolute left-5 text-xl font-bold text-gray-800">9</div>
          </div>
        </div>
      )
    },
    {
      number: '03',
      title: '合コン開始',
      description: 'マッチした相手と合コンをお楽しみください。',
      icon: (
        <div className="w-full h-80 bg-gradient-to-br from-primary/10 to-primary/30 rounded-xl flex items-center justify-center p-6 shadow-lg transform hover:scale-[1.02] transition-all duration-300">
          <div className="bg-white rounded-xl shadow-xl p-6 transform hover:-rotate-2 transition-all duration-300 max-w-xs">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                <span className="text-4xl">🥂</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-3">合コンスタート！</h3>
              <p className="text-gray-600 mb-4">マッチした素敵な相手と楽しい時間をお過ごしください</p>
              <div className="flex justify-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary-dark">
                  #出会い
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary-dark">
                  #素敵な時間
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 relative inline-block">
            合コンまでの流れ
            <div className="absolute -bottom-2 w-full h-1 bg-primary/40 transform -rotate-1"></div>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            簡単3ステップで素敵な出会いを
          </p>
        </div>

        <div className="space-y-24">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center gap-12`}
            >
              <div className="w-full lg:w-1/2">
                {step.icon}
              </div>
              <div className="w-full lg:w-1/2">
                <div className="bg-white p-8 rounded-xl shadow-xl border-l-4 border-primary">
                  <div className="inline-block text-4xl font-bold mb-6 bg-primary/10 text-primary px-6 py-2 rounded-full">
                    STEP {step.number}
                  </div>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-5">
                    {step.title}
                  </h2>
                  <p className="text-lg text-gray-600">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          {React.createElement(Link, {
            href: "/",
            className: "inline-flex items-center px-6 py-3 border border-primary/30 text-primary hover:text-white hover:bg-primary rounded-lg transition-all duration-300 text-lg font-medium"
          }, <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            トップページに戻る
          </>)}
        </div>
      </div>
    </div>
  );
};

export default FlowPage; 