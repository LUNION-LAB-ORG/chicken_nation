"use client";

import { IPromotion } from "@/features/promotion/promotion.type";
import { useEffect, useState } from "react";
import { SpecialCard } from "./specialCard";
import { SpecialModal } from "./specialModal";
import { Pagination } from "@heroui/pagination";

export function SpecialContent({ promos }: { promos: IPromotion[] }) {
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(2);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setItemsPerPage(
        window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 4 : 6
      );
    }
  }, []);

  const totalPages = Math.ceil(promos.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDeals = promos.slice(startIndex, startIndex + itemsPerPage);
  return (
    <>
      {totalPages > 1 && (
        <div className="flex justify-center md:justify-end">
          <Pagination
            className="text-primary-900"
            size="sm"
            showControls
            page={currentPage}
            total={totalPages}
            radius="full"
            onChange={setCurrentPage}
          />
        </div>
      )}
      {/* Grille de cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {currentDeals.map((promo) => (
          <SpecialCard
            key={promo.id}
            promo={promo}
            onClick={setSelectedPromo}
          />
        ))}
      </div>

      {/* Modal */}
      {selectedPromo && (
        <SpecialModal
          promo={selectedPromo}
          onClose={() => setSelectedPromo(null)}
        />
      )}
    </>
  );
}
