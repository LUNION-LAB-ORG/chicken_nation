"use client";

import Motion from "@/lib/motion";
import { Button } from "@heroui/button";
import { useState } from "react";
// import { sendEmail } from "@/actions/send-contact.action";

export default function AddContact() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    message: "",
  });

  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFeedback("");

    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    setSending(false);

    if (result.success) {
      setFeedback("✅ Message envoyé avec succès !");
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        message: "",
      });
    } else {
      setFeedback("❌ Une erreur est survenue. Réessaie plus tard.");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 mt-8 mb-20">
      <Motion variant="verticalSlideIn">
        <h2 className="text-2xl font-title text-primary">
          POUR ENTRE EN CONTACT
        </h2>
      </Motion>
      <div className="p-0 md:p-24 w-full">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <Motion variant="verticalSlideIn">
              <input
                type="text"
                name="nom"
                placeholder="Ton nom"
                required
                className="w-full bg-gray-100 rounded-3xl p-4 focus:outline-none"
                value={formData.nom}
                onChange={handleChange}
              />
            </Motion>
            <Motion variant="verticalSlideIn">
              <input
                type="text"
                name="prenom"
                placeholder="Ton prénom"
                required
                className="w-full bg-gray-100 rounded-3xl p-4 focus:outline-none"
                value={formData.prenom}
                onChange={handleChange}
              />
            </Motion>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Motion variant="verticalSlideIn">
              <input
                type="email"
                name="email"
                placeholder="Ton mail"
                required
                className="w-full bg-gray-100 rounded-3xl p-4 focus:outline-none"
                value={formData.email}
                onChange={handleChange}
              />
            </Motion>
            <Motion variant="verticalSlideIn">
              <input
                type="tel"
                name="telephone"
                placeholder="Ton numéro de téléphone"
                required
                className="w-full bg-gray-100 rounded-3xl p-4 focus:outline-none"
                value={formData.telephone}
                onChange={handleChange}
              />
            </Motion>
          </div>

          <Motion variant="verticalSlideIn">
            <textarea
              name="message"
              placeholder="Rédige ton message"
              required
              className="w-full rounded-3xl p-4 focus:outline-none bg-gray-100 min-h-[200px]"
              value={formData.message}
              onChange={handleChange}
            />
          </Motion>

          <Motion variant="verticalSlideIn">
            <div className="flex justify-center">
              <Button
                type="submit"
                color="primary"
                className="text-white px-8 py-3 rounded-full"
                disabled={sending}
              >
                {sending ? "Envoi en cours..." : "Envoyer le message"}
              </Button>
            </div>
          </Motion>

          {feedback && (
            <p className="text-center mt-4 text-sm text-gray-700">{feedback}</p>
          )}
        </form>
      </div>
    </div>
  );
}
