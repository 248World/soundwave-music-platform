import { FaDownload } from 'react-icons/fa';

function DownloadButton({
  onClick,
  disabled = false,
  title = 'Download track',
  size = 'md',
}) {
  const sizeClass =
    size === 'sm'
      ? 'w-7 h-7 text-xs'
      : size === 'lg'
        ? 'w-10 h-10 text-sm'
        : 'w-8 h-8 text-xs';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`${sizeClass} rounded-full bg-slate-100 text-slate-500 hover:text-slate-950 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition shrink-0`}
    >
      <FaDownload />
    </button>
  );
}

export default DownloadButton;