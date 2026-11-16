import React from 'react';
import logoColor from '../../assets/logo-lazo-transparent.png';
import logoWhite from '../../assets/logo-lazo-white.png';
import logoOnWhite from '../../assets/logo-lazo-on-white.png';
import logoOriginal from '../../assets/logo-lazo.png';

/**
 * Logotipo oficial de Lazo ("Seguimiento que te acompaña")
 * 
 * Variantes:
 * - 'color': Versión a color con fondo transparente (ideal para fondos claros o tarjetas)
 * - 'white': Versión en blanco y menta luminosa con fondo transparente (ideal para fondos oscuros como verde primario)
 * - 'on-white': Versión a color sobre fondo blanco 100% puro
 * - 'original': Versión recortada original sobre fondo crema cálido
 */
export default function LazoLogo({ 
  variant = 'color', 
  className = 'h-10 w-auto',
  alt = 'Lazo — Seguimiento que te acompaña',
  ...props 
}) {
  let src = logoColor;
  if (variant === 'white') src = logoWhite;
  else if (variant === 'on-white') src = logoOnWhite;
  else if (variant === 'original') src = logoOriginal;

  return (
    <img 
      src={src} 
      alt={alt}
      className={`select-none object-contain ${className}`}
      {...props} 
    />
  );
}
