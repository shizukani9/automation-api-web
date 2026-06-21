// src/tasks/api/CreateMember.ts
import { Actor } from '../../actors/Actor';
import { CallAnApi } from '../../actors/abilities/CallAnApi';
import { SendRequest } from '../../interactions/api/SendRequest';

interface CreateMemberData {
  name: string;
  gender: 'Male' | 'Female' | string;
}

export class CreateMember {
  private memberData: CreateMemberData;

  constructor(memberData: CreateMemberData) {
    this.memberData = memberData;
  }

  static withData(data: CreateMemberData): CreateMember {
    return new CreateMember(data);
  }

  async performAs(actor: Actor): Promise<any> {
    const ability = actor.abilityTo(CallAnApi);
    const url = ability.getUrl('/api/members');

    const response = await actor.attemptsTo(
      SendRequest.to(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: this.memberData,
      })
    );

    const body = await response.json();
    if (body.id) {
      actor.remember('createdMemberId', body.id);
    }

    return response;
  }
}