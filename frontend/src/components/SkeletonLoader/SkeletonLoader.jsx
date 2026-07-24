import "./SkeletonLoader.css";

function SkeletonLoader({
  type = "card",
  count = 1,
}) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, index) => (
        <div
          key={index}
          className={`skeleton ${type}`}
        >
          {type === "card" && (
            <>
              <div className="skeleton-header"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-footer"></div>
            </>
          )}

          {type === "table" && (
            <>
              <div className="skeleton-row"></div>
              <div className="skeleton-row"></div>
              <div className="skeleton-row"></div>
              <div className="skeleton-row"></div>
            </>
          )}

          {type === "chart" && (
            <>
              <div className="skeleton-chart"></div>
            </>
          )}

          {type === "profile" && (
            <>
              <div className="skeleton-avatar"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </>
          )}

          {type === "job" && (
            <>
              <div className="skeleton-tag"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-footer"></div>
            </>
          )}
        </div>
      ))}
    </>
  );
}

export default SkeletonLoader;