import { Link } from 'react-router-dom';
import { FaMusic } from 'react-icons/fa6';

function EmptyState({
  title = 'Nothing found',
  message = 'There is no data to show right now.',
  actionText,
  actionTo,
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-8 text-center shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 mx-auto mb-5 flex items-center justify-center">
        <FaMusic className="text-2xl" />
      </div>

      <h3 className="text-2xl font-black text-slate-950 mb-3">{title}</h3>

      <p className="text-slate-500 max-w-xl mx-auto leading-7">{message}</p>

      {actionText && actionTo && (
        <Link
          to={actionTo}
          className="inline-block mt-6 px-5 py-3 rounded-full bg-slate-950 text-white hover:bg-slate-800 font-bold transition"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;