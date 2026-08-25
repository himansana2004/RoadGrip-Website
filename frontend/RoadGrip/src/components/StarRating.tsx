interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
}

export default function StarRating({ rating, max = 5, size = "md", showValue, reviewCount }: StarRatingProps) {
  const sizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };
  const stars = Array.from({ length: max }, (_, i) => {
    const filled = i + 1 <= Math.floor(rating);
    const partial = !filled && i < rating;
    return { filled, partial };
  });

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {stars.map((s, i) => (
          <span key={i} className={`${sizes[size]} relative`}>
            <span className="text-gray-200">★</span>
            {(s.filled || s.partial) && (
              <span
                className="absolute inset-0 overflow-hidden text-yellow-400"
                style={s.partial ? { width: `${(rating % 1) * 100}%` } : undefined}
              >
                ★
              </span>
            )}
          </span>
        ))}
      </div>
      {showValue && (
        <span className="text-xs text-gray-500 font-medium">
          {rating.toFixed(1)}{reviewCount !== undefined ? ` (${reviewCount})` : ""}
        </span>
      )}
    </div>
  );
}
