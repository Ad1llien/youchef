function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 1) return [];

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => ({
      type: "page",
      value: idx + 1,
    }));
  }

  const items = [];
  items.push({ type: "page", value: 1 });

  let left = currentPage - 1;
  let right = currentPage + 1;

  if (currentPage <= 3) {
    left = 2;
    right = 4;
  } else if (currentPage >= totalPages - 2) {
    left = totalPages - 3;
    right = totalPages - 1;
  }

  if (left > 2) {
    items.push({ type: "ellipsis", key: "left" });
  }

  for (let page = left; page <= right; page += 1) {
    if (page > 1 && page < totalPages) {
      items.push({ type: "page", value: page });
    }
  }

  if (right < totalPages - 1) {
    items.push({ type: "ellipsis", key: "right" });
  }

  items.push({ type: "page", value: totalPages });

  return items;
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const items = buildPageItems(currentPage, totalPages);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <div className="flex justify-center my-8">
      <div className="inline-flex items-center gap-3 rounded-full bg-[#FFFBEA] px-4 py-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
          className="min-w-9 h-9 rounded-lg border border-[#d0d5dd] bg-white text-[#242d96] text-sm font-medium flex items-center justify-center disabled:opacity-40 disabled:cursor-default hover:bg-[#f4f5ff] hover:border-[#242d96]"
        >
          «
        </button>

        {items.map((item) =>
          item.type === "page" ? (
            <button
              key={item.value}
              type="button"
              onClick={() => goToPage(item.value)}
              className={[
                "min-w-9 h-9 rounded-lg border text-sm font-medium flex items-center justify-center transition-colors",
                item.value === currentPage
                  ? "bg-[#242d96] text-white border-[#242d96] shadow-[0_0_0_1px_rgba(36,45,150,0.2)]"
                  : "bg-white text-[#242d96] border-[#d0d5dd] hover:bg-[#f4f5ff] hover:border-[#242d96]",
              ].join(" ")}
            >
              {item.value}
            </button>
          ) : (
            <span
              key={item.key}
              className="px-1 text-sm text-[#98a2b3] select-none"
            >
              ...
            </span>
          ),
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
          className="min-w-9 h-9 rounded-lg border border-[#d0d5dd] bg-white text-[#242d96] text-sm font-medium flex items-center justify-center disabled:opacity-40 disabled:cursor-default hover:bg-[#f4f5ff] hover:border-[#242d96]"
        >
          »
        </button>
      </div>
    </div>
  );
}

export default Pagination;

