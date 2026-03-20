export const ProfileSection = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="collapse collapse-arrow border border-gray-300 rounded-lg mb-4">
      <input
        type="checkbox"
        checked={isOpen}
        onChange={onToggle}
        className="cursor-pointer"
      />
      <div className="collapse-title text-xl font-semibold text-gray-900 bg-gray-50 hover:bg-gray-100">
        {title}
      </div>
      <div className="collapse-content bg-white">
        {children}
      </div>
    </div>
  );
};
