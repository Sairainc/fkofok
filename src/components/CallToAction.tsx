// src/components/CallToAction.tsx
'use client'

export const CallToAction = () => {
  return (
    <button onClick={() => window.location.href = '/form'}>
      プロフィール登録
    </button>
  );
};
