import { Button } from '@nextui-org/react';
import React from 'react';

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto p-6 my-4">
      <h1 className="text-4xl font-bold font-title text-center mb-8">POUR ENTRE EN CONTACT</h1>
      
      <form className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <input
            type="text"
            name="nom"
            placeholder="Ton nom"
            required
            className="w-full p-3 rounded-lg bg-gray-100"
          />
          
          <input
            type="text"
            name="prenom"
            placeholder="Ton prénom"
            required
            className="w-full p-3 rounded-lg bg-gray-100"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <input
            type="email"
            name="email"
            placeholder="Ton mail"
            required
            className="w-full p-3 rounded-lg bg-gray-100"
          />
          
          <input
            type="tel"
            name="telephone"
            placeholder="Ton numéro de téléphone"
            required
            className="w-full p-3 rounded-lg bg-gray-100"
          />
        </div>

        <textarea
          name="message"
          placeholder="Rédige message"
          required
          className="w-full p-3 rounded-lg bg-gray-100 min-h-[200px]"
        />

        <div className="flex justify-center">
          <Button
            type="submit"
            color="primary"
            className="text-white px-8 py-3 rounded-full s"
          >
            Envoyer le message
          </Button>
        </div>
      </form>
    </div>
  );
}