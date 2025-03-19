import Motion from "@/lib/motion";
import { Button } from "@heroui/react";
// import { sendEmail } from "@/actions/send-contact.action";

export default function AddContact() {
  return (
    <div className="flex flex-col items-center space-y-4 mt-8 mb-20">
      <Motion variant="verticalSlideIn">
      <h2 className="text-2xl font-title text-primary">POUR ENTRE EN CONTACT</h2>
      </Motion>
      <div className="p-0 md:p-24 w-full">
        <form
        // action={(formData) => {
        //   sendEmail(formData);
        // }} 
        className="space-y-6">
          {/* Nom et Prénom */}
          <Motion variant="verticalSlideIn">
          <div className="flex flex-col md:flex-row gap-6">
          
            <input
              type="text"
              name="nom"
              placeholder="Ton nom"
              className="w-full md:w-1/2 bg-gray-100 rounded-3xl p-4 focus:outline-none"
              required
            />
          

          
            <input
              type="text"
              name="prenom"
              placeholder="Ton prénom"
              className="w-full md:w-1/2 bg-gray-100 rounded-3xl p-4 focus:outline-none"
              required
            />
          
          </div>
          </Motion>

          {/* Email et Téléphone */}
          <Motion variant="verticalSlideIn">
          <div className="flex flex-col md:flex-row gap-6">
          
            <input
              type="email"
              name="email"
              placeholder="Ton mail"
              className="w-full md:w-1/2 bg-gray-100 rounded-3xl p-4 focus:outline-none"
              required
            />
            
            
            <input
              type="tel"
              name="telephone"
              placeholder="Ton numéro de téléphone"
              className="w-full md:w-1/2 bg-gray-100 rounded-3xl p-4 focus:outline-none"
              required
            />
            
          </div>
          </Motion>

          {/* Message */}
          <Motion variant="verticalSlideIn">
          <div>
          
            <textarea
              name="message"
              placeholder="Rédige ton message"
              className="w-full bg-gray-100 rounded-3xl p-4 focus:outline-none h-32 resize-none"
              required
            ></textarea>
            
          </div>
          </Motion>

          {/* Bouton Envoyer */}
          <Motion variant="verticalSlideIn">
          <div className="flex justify-center">
            <Button color="primary" type="submit" className="px-4 py-2">
              Envoyer le message
            </Button>
          </div>
          </Motion>
        </form>
      </div>
    </div>
  );
}
