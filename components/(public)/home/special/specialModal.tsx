"use client";
import { useRouter } from "@/i18n/navigation";
export const SpecialModal = ({
  promo,
  onClose,
}: {
  promo: any;
  onClose: any;
}) => {
  const router = useRouter();

  if (!promo) return null;

  const getDiscountDisplay = () => {
    if (promo.discount_type === "PERCENTAGE") {
      return `-${promo.discount_value}%`;
    } else if (promo.discount_type === "FIXED_AMOUNT") {
      return `-${promo.discount_value} FCFA`;
    }
    return "";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-slideUp">
        {/* En-tête */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-5xl font-black text-[#fd8127] mb-2">
              {getDiscountDisplay()}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{promo.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Détails */}
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-gray-600 mb-4">{promo.description}</p>
          </div>

          {promo.min_order_amount && (
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Commande minimum:</span>{" "}
                {promo.min_order_amount.toLocaleString()} FCFA
              </p>
            </div>
          )}

          {promo.max_usage_per_user && (
            <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Utilisation:</span>{" "}
                {promo.max_usage_per_user} fois par utilisateur
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
            <span>Valide du {formatDate(promo.start_date)}</span>
            <span className="text-right">
              au {formatDate(promo.expiration_date)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            className="flex-1 bg-[#fd8127] hover:bg-[#ff6000] cursor-pointer text-white py-4 rounded-2xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl"
            onClick={() => router.push(`/app-mobile`)}
          >
            Utiliser la promo
          </button>
          <button
            className="px-6 bg-gray-100 hover:bg-gray-200 cursor-pointer text-gray-700 py-4 rounded-2xl font-semibold transition-colors"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
