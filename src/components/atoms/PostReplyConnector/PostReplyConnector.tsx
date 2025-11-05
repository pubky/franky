function LineHorizontal() {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="fill-secondary"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 12V11C5.92487 11 1 6.07513 1 0H0C0 6.62742 5.37258 12 12 12Z"
      />
    </svg>
  );
}

export function PostReplyConnector() {
  return (
    <div>
      {/* Vertical line - 35px long from post card edge to horizontal connector */}
      <div className="absolute left-[-12px] top-[-13px] h-[35px] w-px border-l border-secondary" />
      {/* Horizontal connector at avatar level */}
      <div className="absolute left-[-12px] top-[22px]">
        <LineHorizontal />
      </div>
    </div>
  );
}
