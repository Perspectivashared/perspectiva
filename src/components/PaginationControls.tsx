import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  className?: string;
}

const getPageTokens = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "end-ellipsis", totalPages] as const;
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "start-ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ] as const;
  }

  return [
    1,
    "start-ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "end-ellipsis",
    totalPages,
  ] as const;
};

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationControlsProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const pageTokens = getPageTokens(currentPage, totalPages);
  const goToPage = (nextPage: number) =>
    onPageChange(Math.min(Math.max(nextPage, 1), totalPages));

  return (
    <Pagination className={cn("pt-6", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            className={cn(
              currentPage === 1 && "pointer-events-none opacity-50",
            )}
            onClick={(event) => {
              event.preventDefault();
              goToPage(currentPage - 1);
            }}
          />
        </PaginationItem>

        {pageTokens.map((token, index) =>
          typeof token === "number" ? (
            <PaginationItem key={token}>
              <PaginationLink
                href="#"
                isActive={token === currentPage}
                onClick={(event) => {
                  event.preventDefault();
                  goToPage(token);
                }}
              >
                {token}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={`${token}-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            className={cn(
              currentPage === totalPages && "pointer-events-none opacity-50",
            )}
            onClick={(event) => {
              event.preventDefault();
              goToPage(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationControls;
