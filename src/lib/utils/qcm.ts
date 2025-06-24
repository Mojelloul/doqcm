/**
 * Calcule le nombre de questions QCM à générer basé sur le nombre de destinataires
 * @param recipientCount - Nombre de destinataires
 * @returns Nombre de questions à générer
 */
export function calculateNumberOfQuestions(recipientCount: number): number {
  if (recipientCount <= 0) {
    return 6; // Valeur par défaut
  }
  
  if (recipientCount < 20) {
    return Math.max(3, Math.floor(recipientCount * 0.5)); // 50% du nombre de destinataires, minimum 3
  } else if (recipientCount < 50) {
    return Math.max(10, Math.floor(recipientCount * 0.4)); // 40% du nombre de destinataires, minimum 10
  } else if (recipientCount < 100) {
    return Math.max(20, Math.floor(recipientCount * 0.3)); // 30% du nombre de destinataires, minimum 20
  } else {
    return 30; // Maximum pour 100+ destinataires
  }
}

/**
 * Valide le nombre de destinataires pour la génération de QCM
 * @param recipientCount - Nombre de destinataires
 * @returns true si le nombre est valide
 */
export function validateRecipientCount(recipientCount: number): boolean {
  return recipientCount > 0 && recipientCount <= 20; // Maximum 20 destinataires
}

/**
 * Obtient un message descriptif pour le nombre de questions calculé
 * @param recipientCount - Nombre de destinataires
 * @returns Message descriptif
 */
export function getQuestionCountMessage(recipientCount: number): string {
  const questionCount = calculateNumberOfQuestions(recipientCount);
  
  if (recipientCount < 20) {
    return `${questionCount} questions (50% de ${recipientCount} destinataires)`;
  } else if (recipientCount < 50) {
    return `${questionCount} questions (40% de ${recipientCount} destinataires)`;
  } else if (recipientCount < 100) {
    return `${questionCount} questions (30% de ${recipientCount} destinataires)`;
  } else {
    return `${questionCount} questions (maximum pour ${recipientCount}+ destinataires)`;
  }
} 