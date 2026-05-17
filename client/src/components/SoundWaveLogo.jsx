import { Link } from 'react-router-dom';
import logo from '../assets/soundwave-logo.png';

function SoundWaveLogo({
  to = '/',
  size = 'md',
  variant = 'full',
  className = '',
}) {
  const fullSizeClass =
    size === 'xs'
      ? 'h-7 w-[130px]'
      : size === 'sm'
        ? 'h-9 w-[155px]'
        : size === 'lg'
          ? 'h-14 w-[220px]'
          : size === 'xl'
            ? 'h-16 w-[260px]'
            : 'h-11 w-[185px]';

  const iconSizeClass =
    size === 'xs'
      ? 'h-8 w-8'
      : size === 'sm'
        ? 'h-10 w-10'
        : size === 'lg'
          ? 'h-14 w-14'
          : size === 'xl'
            ? 'h-16 w-16'
            : 'h-12 w-12';

  const logoClass =
    variant === 'icon'
      ? `${iconSizeClass} object-cover object-left`
      : `${fullSizeClass} object-contain object-left`;

  const content = (
    <img
      src={logo}
      alt="SoundWave"
      className={`${logoClass} ${className}`}
    />
  );

  if (!to) {
    return content;
  }

  return (
    <Link to={to} className="inline-flex items-center shrink-0">
      {content}
    </Link>
  );
}

export default SoundWaveLogo;