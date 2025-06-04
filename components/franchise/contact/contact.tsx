'use client';

import React, { useState } from 'react';
import Motion from "@/lib/motion";
import { Button } from "@heroui/react";

export default function Contact() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    message: '',
  });

  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFeedback('');

    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    setSending(false);

    if (result.success) {
      setFeedback('✅ Message envoyé avec succès !');
      setFormData({ nom: '', prenom: '', email: '', telephone: '', message: '' });
    } else {
      setFeedback('❌ Une erreur est survenue. Réessaie plus tard.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 my-4">
      <Motion variant="verticalSlideIn">
        <h1 className="text-4xl font-bold font-title text-center mb-8">NOUS CONTACTER</h1>
      </Motion>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6">
          <Motion variant="verticalSlideIn">
            <input
              type="text"
              name="nom"
              placeholder="Ton nom"
              required
              className="w-full p-3 rounded-lg bg-gray-100"
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
              className="w-full p-3 rounded-lg bg-gray-100"
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
              className="w-full p-3 rounded-lg bg-gray-100"
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
              className="w-full p-3 rounded-lg bg-gray-100"
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
            className="w-full p-3 rounded-lg bg-gray-100 min-h-[200px]"
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
              {sending ? 'Envoi en cours...' : 'Envoyer le message'}
            </Button>
          </div>
        </Motion>

        {feedback && (
          <p className="text-center mt-4 text-sm text-gray-700">{feedback}</p>
        )}
      </form>
    </div>
  );
}
