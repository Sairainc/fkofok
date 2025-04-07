import React from 'react'

export const MenSubscriptionButton: React.FC = () => {
  return (
    <div style={{
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: '259px',
      background: '#FFFFFF',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '-2px 10px 5px rgba(0, 0, 0, 0)',
      borderRadius: '10px',
      fontFamily: 'SQ Market, SQ Market, Helvetica, Arial, sans-serif'
    }}>
      <div style={{ padding: '20px' }}>
        <p style={{
          fontSize: '18px',
          lineHeight: '20px',
          fontWeight: '600'
        }}>¥4,980</p>
        <a
          target="_blank"
          href="https://square.link/u/TnAY3XNt?src=embed"
          style={{
            display: 'inline-block',
            fontSize: '18px',
            lineHeight: '48px',
            height: '48px',
            color: '#ffffff',
            minWidth: '212px',
            backgroundColor: '#006aff',
            textAlign: 'center',
            boxShadow: '0 0 0 1px rgba(0,0,0,.1) inset',
            borderRadius: '50px'
          }}
        >
          今すぐ購入する
        </a>
      </div>
    </div>
  )
} 