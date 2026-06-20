// src/tasks/api/UpdateMember.ts
import { Actor } from '../../actors/Actor';
import { CallAnApi } from '../../actors/abilities/CallAnApi';
import { SendRequest } from '../../interactions/api/SendRequest';

// ✅ Permitir string para flexibilidad
interface UpdateMemberData {
  name: string;
  gender: 'Male' | 'Female' | string;  // ← Permitir string
}

export class UpdateMember {
  private memberId: number;
  private updateData: UpdateMemberData;

  constructor(memberId: number, updateData: UpdateMemberData) {
    this.memberId = memberId;
    this.updateData = updateData;
  }

  static withId(id: number, data: UpdateMemberData): UpdateMember {
    return new UpdateMember(id, data);
  }

  async performAs(actor: Actor): Promise<any> {
    const ability = actor.abilityTo(CallAnApi);
    const url = ability.getUrl(`/api/members/${this.memberId}`);

    return actor.attemptsTo(
      SendRequest.to(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          name: this.updateData.name,
          gender: this.updateData.gender
        },
      })
    );
  }
}