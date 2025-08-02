// CSS animations and styles for admin components
export const spinnerAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Function to inject CSS animations into document head
export const injectSpinnerAnimation = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = spinnerAnimation;
    document.head.appendChild(style);
  }
};
