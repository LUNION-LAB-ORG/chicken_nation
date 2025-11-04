"use client";

import { Rating, RatingButton } from "@/components/kibo-ui/rating";
import Section from "@/components/primitives/Section";
import { getFullUrlFile } from "@/utils/getFullUrlFile";
import { Pagination } from "@heroui/pagination";
import Image from "next/image";
import { useState } from "react";

export function TestimonialsContent({
  testimonials,
}: {
  testimonials: ICommentaire[];
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Configuration responsive pour les items par page
  const itemsPerPage =
    typeof window !== "undefined" && window.innerWidth < 768
      ? 1
      : testimonials.length;

  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTestimonials = testimonials.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Section
      title="Témoignages"
      subtitle="Feedback des consommateurs"
      className="container px-10 mx-auto"
    >
      {/* Pagination - visible uniquement sur mobile */}
      <div className="md:hidden flex justify-center my-6">
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

      {/* Grille sur mobile, colonnes sur desktop */}
      <div className="py-10">
        {/* Vue mobile avec grille 2 colonnes */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {currentTestimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Vue desktop/tablette avec colonnes masonry */}
        <div className="hidden md:block columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </Section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: ICommentaire }) {
  return (
    <div className="bg-secondary/10 ring-1 ring-secondary overflow-hidden rounded-3xl flex flex-col h-fit break-inside-avoid">
      <div className="px-4 py-5 sm:p-6 flex-grow">
        <div className="flex items-center mb-4">
          <Image
            className="h-10 w-10 rounded-full object-cover"
            width={40}
            height={40}
            src={
              testimonial.customer.image
                ? getFullUrlFile(
                    testimonial.customer.image
                  )
                : "/assets/images/icons/avatar.png"
            }
            alt={testimonial.customer.first_name}
          />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-foreground">
              {testimonial.customer.first_name}
            </h3>
            <Rating readOnly defaultValue={testimonial.rating}>
              {Array.from({ length: 5 }).map((_, index) => (
                <RatingButton key={index} />
              ))}
            </Rating>
          </div>
        </div>
        <p className="text-foreground">{testimonial.message}</p>
      </div>
    </div>
  );
}
