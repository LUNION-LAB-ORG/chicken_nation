import { getFullUrlFile } from "@/utils/getFullUrlFile";
import Image from "next/image";

export const SpecialCard = ({
  promo,
  onClick,
  className = "",
}: {
  promo: any;
  onClick: any;
  className?: string;
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(promo);
    }
  };

  const getStatusInfo = () => {
    switch (promo.status) {
      case "ACTIVE":
        return { label: "Actif", color: "bg-emerald-500" };
      case "EXPIRED":
        return { label: "Expiré", color: "bg-gray-400" };
      case "UPCOMING":
        return { label: "À venir", color: "bg-blue-500" };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDiscountDisplay = () => {
    if (promo.discount_type === "PERCENTAGE") {
      return `-${promo.discount_value}%`;
    } else if (promo.discount_type === "FIXED_AMOUNT") {
      return `-${promo.discount_value} FCFA`;
    } else if (promo.discount_type === "BUY_X_GET_Y") {
      return "Offre spéciale";
    }
    return "";
  };

  return (
    <div
      className={`
        relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300
        hover:scale-[1.02] hover:shadow-2xl min-h-60 md:min-h-72
        ${className}
      `}
      style={{
        backgroundColor: promo.background_color || "#fd8127",
      }}
      onClick={handleClick}
    >
      {/* Image en font à droit en bas*/}
      {promo.coupon_image_url && (
        <div className="absolute bottom-0 right-0">
          <Image
            src={getFullUrlFile(promo.coupon_image_url)}
            alt={promo.title}
            width={100}
            height={100}
            className="object-contain w-32 h-32 md:w-40 md:h-40"
          />
        </div>
      )}
      {/* Badge de statut */}
      {statusInfo && (
        <div
          className={`absolute top-3 right-3 ${statusInfo.color} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}
        >
          {statusInfo.label}
        </div>
      )}

      <div className="p-6 h-full flex flex-col justify-between">
        {/* Contenu principal */}
        <div>
          {/* Réduction */}
          <div
            className="text-4xl font-black mb-2 tracking-tight"
            style={{ color: promo.text_color || "#FFFFFF" }}
          >
            {getDiscountDisplay()}
          </div>

          {/* Titre */}
          {promo.title && (
            <h3
              className="text-lg font-bold mb-2 line-clamp-1"
              style={{ color: promo.text_color || "#FFFFFF" }}
            >
              {promo.title}
            </h3>
          )}

          {/* Description */}
          {promo.description && (
            <p
              className="text-sm opacity-90 line-clamp-2"
              style={{ color: promo.text_color || "#FFFFFF" }}
            >
              {promo.description}
            </p>
          )}

          {/* Conditions */}
          {promo.min_order_amount && (
            <div
              className="mt-3 text-xs font-medium opacity-80"
              style={{ color: promo.text_color || "#FFFFFF" }}
            >
              Minimum: {promo.min_order_amount.toLocaleString()} FCFA
            </div>
          )}
        </div>

        {/* Footer avec date et image */}
        <div className="flex items-end justify-between mt-4">
          {/* Date d'expiration */}
          {promo.expiration_date && (
            <div
              className="text-xs font-semibold opacity-75 bg-black/20 px-3 py-1.5 rounded-full"
              style={{ color: promo.text_color || "#FFFFFF" }}
            >
              Jusqu'au {formatDate(promo.expiration_date)}
            </div>
          )}
        </div>
      </div>

      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};
