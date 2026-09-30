import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';

const BASE =
  'inline-flex items-center justify-center gap-3 min-h-[56px] px-8 text-[0.74rem] font-semibold uppercase tracking-[0.24em] transition-colors duration-200 select-none';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-gold text-ink hover:bg-gold-2 shadow-[0_18px_40px_-24px_rgba(201,162,75,0.9)]',
  outline:
    'border border-gold/45 text-parchment hover:border-gold hover:bg-gold/10',
  ghost: 'text-cool hover:text-parchment',
};

export function buttonClasses(variant: ButtonVariant = 'primary', extra = ''): string {
  return `${BASE} ${VARIANTS[variant]} ${extra}`;
}

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragEnter'
  | 'onDragExit'
  | 'onDragLeave'
  | 'onDragOver'
  | 'onDragStart'
  | 'onDrop'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onTransitionEnd'
>;

interface ButtonProps extends NativeButtonProps {
  variant?: ButtonVariant;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      className={`${buttonClasses(variant, className)}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export function ButtonLink({
  to,
  variant = 'primary',
  children,
  className = '',
  onClick,
}: {
  to: string;
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link to={to} onClick={onClick} className={buttonClasses(variant, className)}>
      {children}
    </Link>
  );
}
