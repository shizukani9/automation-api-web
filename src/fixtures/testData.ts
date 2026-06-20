// src/fixtures/testData.ts
export class TestDataGenerator {
  /**
   * Genera un nombre válido para la API
   * REQUISITOS: 
   * - 4-25 caracteres
   * - SOLO letras y espacios
   */
  static getValidName(): string {
    // Lista de nombres 100% válidos (solo letras y espacios)
    const validNames = [
      'Ana Maria',
      'Carlos Alberto',
      'Maria Fernanda',
      'Jose Luis',
      'Laura Patricia',
      'Miguel Angel',
      'Sofia Isabel',
      'Juan Pablo',
      'Valentina',
      'Diego Alejandro',
      'Camila Andrea',
      'Andres Felipe',
      'Daniela',
      'Mateo',
      'Emilia',
      'Nicolas',
      'Isabella',
      'Sebastian',
      'Luciana',
      'Matias',
      'Gabriela',
      'Alejandro',
      'Paula',
      'Fernando',
      'Carolina',
      'Ricardo',
      'Monica',
      'Javier',
      'Patricia',
      'Alberto',
      'Teresa',
      'Manuel',
      'Rosa',
      'Antonio',
      'Martha',
      'Pedro',
      'Gloria',
      'Pablo',
      'Andrea'
    ];
    
    // Seleccionar un nombre aleatorio
    const name = validNames[Math.floor(Math.random() * validNames.length)];
    
    // Verificar que cumple con las reglas
    const isValid = /^[A-Za-z\s]+$/.test(name) && name.length >= 4 && name.length <= 25;
    
    if (isValid) {
      return name;
    }
    
    // Fallback seguro (siempre válido)
    const fallbackNames = [
      'Ana Maria',
      'Carlos Jose',
      'Maria Luz',
      'Juan Pablo',
      'Laura Sofia'
    ];
    return fallbackNames[Math.floor(Math.random() * fallbackNames.length)];
  }

  static getValidGender(): 'Male' | 'Female' {
    return Math.random() > 0.5 ? 'Male' : 'Female';
  }

  static getInvalidName(): string {
    return '';
  }

  static getInvalidGender(): string {
    return 'Invalid';
  }
}