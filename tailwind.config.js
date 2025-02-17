module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF4B91',
          dark: '#FF1F71',
        }
      },
      animation: {
        'progress': 'progress 0.4s ease-in-out',
        'fadeIn': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        progress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  // ... 他の設定
} 