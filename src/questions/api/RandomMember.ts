// src/questions/api/RandomMember.ts
import { Actor } from '../../actors/Actor';
import { GetAllMembers } from '../../tasks/api/GetAllMembers';
import { ResponseBody } from './ResponseBody';
import { RetryRequest } from '../../interactions/api/RetryRequest';

export interface Member {
  id: number;
  name: string;
  gender: 'Male' | 'Female';
}

export class RandomMember {
  static async fromAPI(actor: Actor): Promise<Member> {
    // ✅ Usar RetryRequest para obtener todos los miembros
    const response = await actor.attemptsTo(
      RetryRequest.of(GetAllMembers.fromAPI(), {
        maxAttempts: 3,
        waitBetweenAttempts: 5000,
        successStatuses: [200],
      })
    );
    
    const members = await ResponseBody.of(response).answeredBy(actor);
    
    if (!Array.isArray(members) || members.length === 0) {
      throw new Error('No hay miembros disponibles');
    }
    
    const randomIndex = Math.floor(Math.random() * members.length);
    return members[randomIndex];
  }
}