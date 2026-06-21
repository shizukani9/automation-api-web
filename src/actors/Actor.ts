// src/actors/Actor.ts
export class Actor {
  private name: string;
  private abilities: Map<string, any> = new Map();
  private memory: Map<string, any> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  static called(name: string): Actor {
    return new Actor(name);
  }

  can(ability: any): this {
    this.abilities.set(ability.constructor.name, ability);
    return this;
  }

  abilityTo<T>(abilityClass: new (...args: any[]) => T): T {
    const ability = this.abilities.get(abilityClass.name);
    if (!ability) {
      throw new Error(`${this.name} no tiene la habilidad ${abilityClass.name}`);
    }
    return ability;
  }

  attemptsTo(...tasks: any[]): Promise<any> {
    return tasks.reduce(
      (promise, task) => promise.then(() => task.performAs(this)),
      Promise.resolve()
    );
  }

  async ask<T>(question: any): Promise<T> {
    return question.answeredBy(this);
  }

  remember(key: string, value: any): void {
    this.memory.set(key, value);
  }

  recall<T>(key: string): T | undefined {
    return this.memory.get(key);
  }

  getName(): string {
    return this.name;
  }
}