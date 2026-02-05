
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "rounded-full font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-yellow-400 text-blue-900 hover:bg-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)]",
    secondary: "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]",
    danger: "bg-red-600 text-white hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]",
    outline: "border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-3 text-base",
    lg: "px-10 py-4 text-xl"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
