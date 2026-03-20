export const SwipeControls = ({
  onLike,
  onDislike,
  onUndo,
  onViewLiked,
  likedCount,
  disabledDislike,
  disabledLike,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Main Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onDislike}
          disabled={disabledDislike}
          className="btn btn-lg btn-circle btn-outline border-red-400 text-red-600 hover:bg-red-50 flex items-center justify-center"
          title="Pass"
        >
          <span className="text-2xl">✕</span>
        </button>

        <button
          onClick={onUndo}
          className="btn btn-sm btn-outline"
          title="Undo last swipe"
        >
          Undo
        </button>

        <button
          onClick={onLike}
          disabled={disabledLike}
          className="btn btn-lg btn-circle btn-primary flex items-center justify-center"
          title="Save"
        >
          <span className="text-2xl">✓</span>
        </button>
      </div>

      {/* View Saved Button */}
      <button
        onClick={onViewLiked}
        className="btn btn-outline w-full"
      >
        View Saved ({likedCount})
      </button>
    </div>
  );
};
