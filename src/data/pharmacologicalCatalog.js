/**
 * Catálogo estructurado de clases farmacológicas Lazo
 * Permite identificar la clase de medicamentos actuales y futuros
 */
export const PHARMACOLOGICAL_CATALOG = {
  // Biguanidas
  'metformina': 'Biguanida',
  'metformina 850 mg': 'Biguanida',
  'metformina 500 mg': 'Biguanida',
  
  // Insulinas
  'insulina glargina': 'Insulina basal',
  'insulina degludec': 'Insulina basal',
  'insulina detemir': 'Insulina basal',
  'insulina nph': 'Insulina de acción intermedia',
  'insulina lispro': 'Insulina de acción rápida',
  'insulina aspart': 'Insulina de acción rápida',

  // ARA-II (Antagonistas del Receptor de Angiotensina II)
  'losartán': 'ARA-II',
  'losartan': 'ARA-II',
  'telmisartán': 'ARA-II',
  'telmisartan': 'ARA-II',
  'valsartán': 'ARA-II',
  'candesartán': 'ARA-II',

  // Combinaciones
  'metformina + glibenclamida': 'Biguanida + Sulfonilurea',
  'metformina/glibenclamida': 'Biguanida + Sulfonilurea',

  // iSGLT2 (Inhibidores de SGLT2)
  'empagliflozina': 'iSGLT2',
  'dapagliflozina': 'iSGLT2',
  'canagliflozina': 'iSGLT2',

  // IECA (Inhibidores de la ECA)
  'enalapril': 'IECA',
  'captopril': 'IECA',
  'lisinopril': 'IECA',
  'ramipril': 'IECA',

  // iDPP-4 (Inhibidores de DPP-4)
  'sitagliptina': 'iDPP-4',
  'linagliptina': 'iDPP-4',
  'vildagliptina': 'iDPP-4',
  'saxagliptina': 'iDPP-4',

  // Agonistas del receptor GLP-1
  'semaglutida': 'Agonista del receptor GLP-1',
  'liraglutida': 'Agonista del receptor GLP-1',
  'dulaglutida': 'Agonista del receptor GLP-1',

  // Estatinas
  'atorvastatina': 'Estatina',
  'pravastatina': 'Estatina',
  'rosuvastatina': 'Estatina',
  'simvastatina': 'Estatina'
};

/**
 * Obtiene la clase farmacológica normalizando el nombre del fármaco
 * Si no está registrada ni en el fármaco ni en el catálogo, retorna 'Clase no registrada'
 */
export function getClaseFarmacologica(med) {
  if (!med) return 'Clase no registrada';
  
  // 1. Si el medicamento ya trae el dato estructurado explícito
  if (med.claseFarmacologica && typeof med.claseFarmacologica === 'string' && med.claseFarmacologica.trim() !== '') {
    return med.claseFarmacologica.trim();
  }
  if (med.clase && typeof med.clase === 'string' && med.clase.trim() !== '') {
    return med.clase.trim();
  }

  // 2. Búsqueda en catálogo por nombre normalizado
  if (med.nombre && typeof med.nombre === 'string') {
    const cleanName = med.nombre.toLowerCase().trim();
    if (PHARMACOLOGICAL_CATALOG[cleanName]) {
      return PHARMACOLOGICAL_CATALOG[cleanName];
    }
    // Búsqueda por subcadena
    for (const [key, value] of Object.entries(PHARMACOLOGICAL_CATALOG)) {
      if (cleanName.includes(key)) {
        return value;
      }
    }
  }

  // 3. Si no está registrada, no inventar
  return 'Clase no registrada';
}
