// src/questions/api/MemberList.ts
import { Actor } from '../../actors/Actor';
import { ResponseBody } from './ResponseBody';

export interface Member {
  id: number;
  name: string;
  gender: 'Male' | 'Female';
}

export class MemberList {
  private response: any;

  constructor(response: any) {
    this.response = response;
  }

  static fromResponse(response: any): MemberList {
    return new MemberList(response);
  }

  async answeredBy(actor: Actor): Promise<Member[]> {
    return await ResponseBody.of(this.response).answeredBy(actor);
  }

  async getRandomMember(actor: Actor): Promise<Member> {
    const members = await this.answeredBy(actor);
    if (members.length === 0) {
      throw new Error('No hay miembros disponibles para actualizar');
    }
    const randomIndex = Math.floor(Math.random() * members.length);
    return members[randomIndex];
  }

  async getMemberById(actor: Actor, id: number): Promise<Member | undefined> {
    const members = await this.answeredBy(actor);
    return members.find(m => m.id === id);
  }
}