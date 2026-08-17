import { Injectable } from '@nestjs/common';

import { IntentType } from './types/intent.type';
import { ConversationState } from '../conversation/types/conversation-state.type';

@Injectable()
export class IntentService {

  detect(
    message: string,
    state?: ConversationState,
  ): IntentType {

    const text = message
      .toLowerCase()
      .trim();

    // ========================
    // SUPPRESSION
    // ========================

    if (
      text.includes('je ne prends plus') ||
      text.includes('je ne prend plus') ||
      text.includes('je prends plus') ||
      text.includes('je prend plus') ||
      text.includes('enlève') ||
      text.includes('enlevez') ||
      text.includes('enlever') ||
      text.includes('retire') ||
      text.includes('retirer') ||
      text.includes('supprime') ||
      text.includes('supprimer') ||
      text.includes('pas besoin')
    ) {
      return IntentType.REMOVE_QUOTE_ITEM;
    }

    // ========================
    // MODIFICATION QUANTITÉ
    // ========================
    //
    // Exemples :
    // "Passe l'alternateur à 2"
    // "Finalement, je vais en prendre deux"
    // "Vous pouvez m'en mettre deux ?"
    // "Mettez-moi deux alternateurs"
    //

    const hasQuantity =
      /\b\d+\b/.test(text) ||
      text.includes('une') ||
      text.includes('un') ||
      text.includes('deux') ||
      text.includes('trois') ||
      text.includes('quatre') ||
      text.includes('cinq') ||
      text.includes('six') ||
      text.includes('sept') ||
      text.includes('huit') ||
      text.includes('neuf') ||
      text.includes('dix');

    if (
      hasQuantity &&
      (
        text.includes('finalement') ||
        text.includes('plutôt') ||
        text.includes('plutot') ||
        text.includes('mettez-moi') ||
        text.includes('mettez moi') ||
        text.includes('mets-moi') ||
        text.includes('mets moi') ||
        text.includes('mettez') ||
        text.includes('mets') ||
        text.includes('passez') ||
        text.includes('passe') ||
        text.includes('en prendre') ||
        text.includes('en prends') ||
        text.includes("j'en prends") ||
        text.includes('j en prends') ||
        text.includes('en mettre') ||
        text.includes('en mets') ||
        text.includes("m'en mettre") ||
        text.includes('m en mettre') ||
        text.includes('m en mets')
      )
    ) {
      return IntentType.MODIFY_QUOTE_QUANTITY;
    }

    // ========================
    // AJOUT AU DEVIS
    // ========================

    if (
      text.includes('ajoute') ||
      text.includes('ajoutez') ||
      text.includes('ajouter') ||
      text.includes('rajoute') ||
      text.includes('rajoutez') ||
      text.includes('rajouter') ||
      text.includes('mets aussi') ||
      text.includes('mettez aussi') ||
      text.includes('mettre aussi') ||
      text.includes('je veux aussi') ||
      text.includes('je voudrais aussi')
    ) {
      return IntentType.ADD_QUOTE_ITEM;
    }

    // ========================
    // RÉCAPITULATIF
    // ========================

    if (
      text.includes("c'est quoi le total") ||
      text.includes('c est quoi le total') ||
      text.includes('ça fait combien') ||
      text.includes('ca fait combien') ||
      text.includes('combien au total') ||
      text.includes('quel est le total') ||
      text.includes('total du devis') ||
      text.includes('vous avez quoi sur mon devis') ||
      text.includes('qu est ce que j ai sur mon devis') ||
      text.includes("qu'est ce que j'ai sur mon devis") ||
      text.includes('il y a quoi sur mon devis') ||
      text.includes('détail du devis') ||
      text.includes('detail du devis') ||
      text.includes('récapitulatif') ||
      text.includes('recapitulatif')
    ) {
      return IntentType.QUOTE_SUMMARY;
    }

    // ========================
    // CONFIRMATION
    // ========================

    if (
      text.includes('je prends tout') ||
      text.includes('je prend tout') ||
      text.includes('c est bon pour moi') ||
      text.includes("c'est bon pour moi") ||
      text.includes('on part là-dessus') ||
      text.includes('on part la-dessus') ||
      text.includes('je valide') ||
      text.includes('je confirme') ||
      text.includes('c est validé') ||
      text.includes("c'est validé") ||
      text.includes('validez le devis') ||
      text.includes('valider le devis') ||
      text === 'je prends' ||
      text === 'je prend' ||
      text === 'je le prends' ||
      text === 'je le prend'
    ) {
      return IntentType.CONFIRM_QUOTE;
    }

    // ========================
    // CONFIRMATION STOCK
    // ========================

    if (
      text.includes('oui') &&
      (
        text.includes('devis') ||
        text.includes('faites') ||
        text.includes('fait') ||
        text.includes('pour')
      )
    ) {
      return IntentType.CONFIRM_STOCK_QUANTITY;
    }

    // ========================
    // ANNULATION STOCK
    // ========================

    if (
      text === 'non' ||
      text.includes('non merci') ||
      text.includes('laissez tomber') ||
      text.includes('laisse tomber') ||
      text.includes('annule') ||
      text.includes('annuler') ||
      text.includes('pas besoin')
    ) {
      return IntentType.CANCEL_STOCK_CONFIRMATION;
    }

    // ========================
    // CRÉATION DEVIS
    // ========================

    if (
      text.includes('je voudrais un devis') ||
      text.includes('je voudrais le devis') ||
      text.includes('je veux un devis') ||
      text.includes('j aimerais un devis') ||
      text.includes("j'aimerais un devis") ||
      text.includes('je peux avoir un devis') ||
      text.includes('faites-moi un devis') ||
      text.includes('faites moi un devis') ||
      text.includes('faire un devis') ||
      text.includes('faire le devis') ||
      text.includes('préparer un devis') ||
      text.includes('préparer le devis') ||
      text.includes('preparer un devis') ||
      text.includes('préparez-moi un devis') ||
      text.includes('préparez moi un devis') ||
      text.includes('pouvez-vous me faire un devis') ||
      text.includes('pouvez vous me faire un devis') ||
      text.includes('chiffrer') ||
      text.includes('chiffrage')
    ) {
      return IntentType.CREATE_QUOTE;
    }

    // ========================
    // STOCK
    // ========================

    if (
      text.includes('stock') ||
      text.includes('disponible') ||
      text.includes('disponibilité') ||
      text.includes('vous en avez') ||
      text.includes('il vous en reste') ||
      text.includes('il en reste')
    ) {
      return IntentType.CHECK_STOCK;
    }

    // ========================
    // VISITE MAGASIN
    // ========================

    if (
      text.includes('je passe') ||
      text.includes('je viendrai') ||
      text.includes('je viens') ||
      text.includes("cet après-midi") ||
      text.includes('cet apres-midi') ||
      text.includes('ce matin') ||
      text.includes('demain')
    ) {
      return IntentType.VISIT_STORE;
    }

    // ========================
    // MOINS CHER
    // ========================

    if (
      text.includes('moins cher') ||
      text.includes('moins chère') ||
      text.includes('le moins cher') ||
      text.includes('la moins chère')
    ) {
      return IntentType.CHEAPEST_RESULT;
    }

    // ========================
    // PLUS CHER
    // ========================

    if (
      text.includes('plus cher') ||
      text.includes('plus chère') ||
      text.includes('le plus cher') ||
      text.includes('la plus chère')
    ) {
      return IntentType.MOST_EXPENSIVE_RESULT;
    }

    // ========================
    // TRANSFERT HUMAIN
    // ========================

    if (
      text.includes('vendeur') ||
      text.includes('conseiller') ||
      text.includes('humain') ||
      text.includes('quelqu un') ||
      text.includes("quelqu'un") ||
      text.includes('personne')
    ) {
      return IntentType.HUMAN_TRANSFER;
    }

    // ========================
    // RECHERCHE
    // ========================

    if (
      state === ConversationState.WAITING_PRODUCT ||
      state === ConversationState.WAITING_VEHICLE
    ) {
      return IntentType.SEARCH_PART;
    }

    if (
      text.includes('cherche') ||
      text.includes('recherche') ||
      text.includes('besoin') ||
      text.includes('voudrais') ||
      text.includes('voudrait') ||
      text.includes('veux') ||
      text.includes('alternateur') ||
      text.includes('batterie') ||
      text.includes('filtre') ||
      text.includes('plaquette')
    ) {
      return IntentType.SEARCH_PART;
    }

    // ========================
    // SALUTATION
    // ========================

    if (
      text.includes('bonjour') ||
      text.includes('salut') ||
      text.includes('bonsoir')
    ) {
      return IntentType.GREETING;
    }

    // ========================
    // REMERCIEMENT
    // ========================

    if (
      text.includes('merci') ||
      text.includes('je vous remercie')
    ) {
      return IntentType.THANKS;
    }

    // ========================
    // AU REVOIR
    // ========================

    if (
      text.includes('au revoir') ||
      text.includes('à bientôt') ||
      text.includes('a bientôt') ||
      text.includes('bonne journée')
    ) {
      return IntentType.GOODBYE;
    }

    return IntentType.UNKNOWN;
  }
}
