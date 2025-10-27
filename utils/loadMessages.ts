import fs from "fs";
import path from "path";

// Charger les messages basé sur l'arborescence des dossiers
export async function loadMessages(locale: string) {
    const localeDir = path.join(process.cwd(), "i18n", "messages", locale);

    // Vérifier si le dossier de la locale existe, sinon renvoyer un objet vide
    if (!fs.existsSync(localeDir)) {
        return {};
    }

    // Fonction récursive pour parcourir les dossiers et les fichiers
    async function buildMessagesFromDir(dir: string): Promise<Record<string, any>> {
        const messages: Record<string, any> = {};
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        // Variables pour gérer le fichier index.json spécial
        let indexContent: any = null;
        const otherFiles: Array<{ key: string; content: any }> = [];

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                // Ignorer les dossiers avec parenthèses
                if (entry.name.startsWith('(') && entry.name.endsWith(')')) {
                    // Pour les dossiers avec parenthèses, on traite leur contenu
                    // mais on les "aplatit" dans la structure parente
                    const subMessages = await buildMessagesFromDir(fullPath);
                    Object.assign(messages, subMessages);
                } else {
                    // Appeler la fonction récursivement pour les sous-dossiers normaux
                    // et assigner le résultat à la clé correspondante
                    messages[entry.name] = await buildMessagesFromDir(fullPath);
                }
            } else if (entry.isFile() && entry.name.endsWith(".json")) {
                const key = path.basename(entry.name, '.json');
                try {
                    const content = await fs.promises.readFile(fullPath, "utf-8");
                    const json = JSON.parse(content);

                    if (key === 'index') {
                        // Stocker le contenu de index.json pour traitement spécial
                        indexContent = json;
                    } else {
                        // Stocker les autres fichiers pour traitement après
                        otherFiles.push({ key, content: json });
                    }
                } catch (err) {
                    console.error(`Erreur en lisant ${fullPath}:`, err);
                }
            }
        }

        // Traitement spécial pour index.json
        if (indexContent) {
            // Le contenu de index.json devient le contenu direct du dossier
            Object.assign(messages, indexContent);
        }

        // Ajouter les autres fichiers avec leur clé normale
        for (const file of otherFiles) {
            messages[file.key] = file.content;
        }

        return messages;
    }

    // Lancer la fonction récursive directement sur le dossier de locale
    // et retourner le résultat
    const messages = await buildMessagesFromDir(localeDir);
    return messages;
}