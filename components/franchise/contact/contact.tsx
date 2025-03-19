import Motion from "@/lib/motion";
import { Button } from "@heroui/react";
import React from 'react';

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto p-6 my-4">
      <Motion variant="verticalSlideIn">
      <h1 className="text-4xl font-bold font-title text-center mb-8">NOUS CONTACTER</h1>
      </Motion>
      
      <form className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
        <Motion variant="verticalSlideIn">
          <input
            type="text"
            name="nom"
            placeholder="Ton nom"
            required
            className="w-full p-3 rounded-lg bg-gray-100"
          />
          </Motion>
          <Motion variant="verticalSlideIn">
          <input
            type="text"
            name="prenom"
            placeholder="Ton prénom"
            required
            className="w-full p-3 rounded-lg bg-gray-100"
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
          />
          </Motion>
          <Motion variant="verticalSlideIn">
          <input
            type="tel"
            name="telephone"
            placeholder="Ton numéro de téléphone"
            required
            className="w-full p-3 rounded-lg bg-gray-100"
          />
          </Motion>
        </div>
        
        <Motion variant="verticalSlideIn">
        <textarea
          name="message"
          placeholder="Rédige message"
          required
          className="w-full p-3 rounded-lg bg-gray-100 min-h-[200px]"
        />
        </Motion>
        <Motion variant="verticalSlideIn">
        <div className="flex justify-center">
          <Button
            type="submit"
            color="primary"
            className="text-white px-8 py-3 rounded-full s"
          >
            Envoyer le message
          </Button>
        </div>
        </Motion>
      </form>
    </div>
  );
}